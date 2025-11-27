import { useState, useEffect } from 'react';
import ApiService from '../../services/api';
import { Orders } from 'src/intefaces/interfaz';
import { useSocket } from '../../context/SocketContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { toast } from 'sonner';

const PedidosManager = () => {
  const [pedidos, setPedidos] = useState<Orders[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<'Todos' | 'Pendiente' | 'Entregado' | 'Cancelado'>('Todos');
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; pedidoId: number; nuevoEstado: string }>({
    open: false,
    pedidoId: 0,
    nuevoEstado: '',
  });
  const { socket } = useSocket();
  const [estadoManual, setEstadoManual] = useState<Record<number, string>>({});


  useEffect(() => {
    loadPedidos();
  }, []);

  useEffect(() => {
    if (pedidos.length > 0) {
      const inicial: Record<number, string> = {};

      pedidos.forEach(p => {
        inicial[p.id] = p.Pago?.estado || "Pendiente";
      });

      setEstadoManual(inicial);
    }
  }, [pedidos]);

  useEffect(() => {
    if (socket) {
      const handleNuevoPedido = (data: any) => {
        loadPedidos();
        toast.success(data?.message || '¡Nuevo pedido recibido!');
      };

      const handlePagoAprobado = (data: any) => {
        loadPedidos();
        toast.success(data?.message || 'Pago Aprobado');
      };

      const handlePagoRechazado = (data: any) => {
        loadPedidos();
        toast.error(data?.message || 'Pago Rechazado');
      };

      const handlePagoExpirado = (data: any) => {
        loadPedidos();
        toast.warning(data?.message || 'Pago expirado automáticamente');
      };

      socket.on('nuevoPedido', handleNuevoPedido);
      socket.on('pagoAprobado', handlePagoAprobado);
      socket.on('pagoRechazado', handlePagoRechazado);
      socket.on('pagoExpirado', handlePagoExpirado);


      return () => {
        socket.off('nuevoPedido', handleNuevoPedido);
        socket.off('pagoAprobado', handlePagoAprobado);
        socket.off('pagoRechazado', handlePagoRechazado);
        socket.off('pagoExpirado', handlePagoExpirado);
      };
    }
  }, [socket]);

  const loadPedidos = async () => {
    try {
      const pedido = await ApiService.getOrders();
      setPedidos((pedido.data) || []);
    } catch (error) {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = (id: number, estado: string) => {
    if (estado === 'entregado' || estado === 'cancelado') {
      setConfirmDialog({ open: true, pedidoId: id, nuevoEstado: estado });
    } else {
      confirmarCambioEstado(id, estado);
    }
  };

  const handleEstadoPagoChange = async (idPedido: number, nuevoEstado: string) => {
    try {
      await ApiService.updateEstadoPago(idPedido, nuevoEstado);
      toast.success("Estado de pago actualizado");
      loadPedidos();
    } catch (error) {
      toast.error("Error al actualizar el estado del pago");
    }
  };

  const confirmarCambioEstado = async (id: number, estado: string) => {
    try {
      const r = await ApiService.updateOrder({ id: id, estado: estado });
      if (r.suscess) {
        toast.success('Estado actualizado');
        loadPedidos();
      } else {
        toast.error(r.error || 'Error al actualizar');
      }
    } catch (error) {
      toast.error(error.message || 'Error al actualizar');
    }
  };

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      pendiente: 'text-yellow-500',
      entregado: 'text-green-500',
      cancelado: 'text-red-500',
      pagado: 'text-green-500',
      rechazado: 'text-red-500',
      expirado: 'text-red-500',
    };
    return colors[estado] || 'text-muted-foreground';
  };

  if (loading) {
    return <div className="text-foreground">Cargando pedidos...</div>;
  }

  const renderPedidos = (pedidosLista: Orders[]) => (
    <div className="space-y-4">
      {pedidosLista.length === 0 ? (
        <p className="text-muted-foreground">No hay pedidos en esta categoría</p>
      ) : (
        pedidosLista.map((pedido) => (
          <div
            key={pedido.id}
            className="rounded-lg border border-border bg-card p-6"
          >
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  PEDIDO #{pedido.id}
                </h3>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                {/* SELECT 1 - Estado real (si es MP) */}
                {pedido.Pago?.metodoDePago === "Mercado Pago" && (
                  <div className="flex items-center justify-between sm:justify-start gap-2 w-full">
                    <span className={`font-medium ${getEstadoColor(pedido.Pago.estado.toLowerCase())}`}>
                      Estado MP:
                    </span>

                    <Select value={pedido.Pago.estado} disabled>
                      <SelectTrigger className="w-full sm:w-40 bg-background opacity-70 cursor-not-allowed">
                        <SelectValue placeholder="Estado de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="Pagado">Pagado</SelectItem>
                        <SelectItem value="Rechazado">Rechazado</SelectItem>
                        <SelectItem value="Expirado">Expirado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* SELECT 2 - Estado manual editable */}
                <div className="flex items-center justify-between sm:justify-start gap-2 w-full">
                  <span className={`font-medium ${getEstadoColor(estadoManual[pedido.id]?.toLowerCase?.())}`}>
                    Estado Manual:
                  </span>

                  <Select
                    value={estadoManual[pedido.id]}
                    onValueChange={(value) => {
                      setEstadoManual(prev => ({ ...prev, [pedido.id]: value }));
                      handleEstadoPagoChange(pedido.id, value);
                    }}
                    disabled={
                      ["Pagado", "Cancelado"].includes(estadoManual[pedido.id]) ||
                      ["Pagado", "Rechazado", "Expirado"].includes(pedido.Pago?.estado)
                    }
                  >
                    <SelectTrigger
                      className={`w-full sm:w-40 bg-background ${["Pagado", "Cancelado"].includes(estadoManual[pedido.id])
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                        }`}
                    >
                      <SelectValue placeholder="Seleccionar estado manual" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Pagado">Pagado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between sm:justify-start gap-2 w-full">
                  <span className={`font-medium ${getEstadoColor(pedido.estado)}`}>
                    Estado del Pedido:
                  </span>

                  <Select
                    value={pedido.estado}
                    onValueChange={(value) => handleEstadoChange(pedido.id, value)}
                    disabled={pedido.estado === "Entregado" || pedido.estado === "Cancelado"}
                  >
                    <SelectTrigger className="w-full sm:w-40 bg-background">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Entregado">Entregado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>


            <div className="mb-4 grid gap-2 text-sm">
              <p className="text-foreground">
                <span className="font-medium">Metodo De Pago:</span> {pedido.Pago?.metodoDePago || 'N/A'}
              </p>
              <p className="text-foreground">
                <span className="font-medium">Teléfono:</span> {pedido.cliente.telefono || 'N/A'}
              </p>
              <p className="text-foreground">
                <span className="font-medium">Dirección:</span> {pedido.cliente.direccion.toUpperCase() || 'N/A'}
              </p>
              <p className="text-foreground font-bold">
                <span className="font-medium">Notas:</span> {pedido?.descripcion.toUpperCase() || 'N/A'}
              </p>
            </div>

            <div className="border-t border-border pt-4">
              <p className="mb-3 text-lg font-semibold text-foreground">Productos del Pedido:</p>
              <div className="space-y-3">
                {pedido.productos?.map((prod, idx: number) => (
                  <div key={idx} className="rounded-md border border-border bg-muted/30 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-base font-semibold text-foreground">
                          {prod.nombre}
                        </p>
                        <div className="mt-2 space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground">Adicionales:</p>
                          {Array.isArray(prod.adicionales) && (
                            (() => {
                              const adicionalesValidos = prod.adicionales.filter(a => a.cantidad > 0);

                              if (adicionalesValidos.length === 0) return null;
                              return (
                                <>
                                  {adicionalesValidos.map((adicional, adIdx) => (
                                    <div
                                      key={adIdx}
                                      className="flex items-center gap-2 rounded-sm bg-background/50 px-2 py-1"
                                    >
                                      <span className="text-xs text-foreground">+ {adicional.nombre}</span>

                                      <span className="text-xs font-medium text-muted-foreground">
                                        x{adicional.cantidad}
                                      </span>

                                      <span className="ml-auto text-xs font-semibold text-primary">
                                        ${adicional.precio * adicional.cantidad}
                                      </span>
                                    </div>
                                  ))}
                                </>
                              );
                            })()
                          )}
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm font-medium text-muted-foreground">Cantidad</p>
                        <p className="text-2xl font-bold text-foreground">{prod.cantidad}</p>
                        <p className="mt-1 text-lg font-bold text-primary">${prod.precio * prod.cantidad}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-md bg-primary/10 p-4">
                <p className="text-right text-2xl font-bold text-primary">
                  Total: ${pedido.precioTotal}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-foreground">Pedidos</h1>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cambio de estado</AlertDialogTitle>
            <AlertDialogDescription>
              <div>
                ¿Estás seguro de que quieres marcar este pedido como "{confirmDialog.nuevoEstado}"?
              </div>
              <div>
                Esta acción cambiará el estado del pedido #{confirmDialog.pedidoId}.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDialog({ open: false, pedidoId: 0, nuevoEstado: '' })}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                confirmarCambioEstado(confirmDialog.pedidoId, confirmDialog.nuevoEstado);
                setConfirmDialog({ open: false, pedidoId: 0, nuevoEstado: '' });
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Tabs value={filtroEstado} onValueChange={(value) => setFiltroEstado(value as any)} className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="Todos">Todos</TabsTrigger>
          <TabsTrigger value="Pendiente">Pendiente</TabsTrigger>
          <TabsTrigger value="Entregado">Entregado</TabsTrigger>
          <TabsTrigger value="Cancelado">Cancelado</TabsTrigger>
        </TabsList>

        <TabsContent value="Todos">
          {renderPedidos(pedidos)}
        </TabsContent>
        <TabsContent value="Pendiente">
          {renderPedidos(pedidos.filter(p => p.estado === 'Pendiente').sort((a, b) => a.id - b.id))}
        </TabsContent>
        <TabsContent value="Entregado">
          {renderPedidos(pedidos.filter(p => p.estado === 'Entregado'))}
        </TabsContent>
        <TabsContent value="Cancelado">
          {renderPedidos(pedidos.filter(p => p.estado === 'Cancelado'))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PedidosManager;
