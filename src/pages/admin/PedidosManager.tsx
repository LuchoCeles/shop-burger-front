import { useState, useEffect } from 'react';
import ApiService from '../../services/api';
import { Orders } from 'src/intefaces/interfaz';
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
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendiente' | 'entregado' | 'cancelado'>('todos');
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; pedidoId: number; nuevoEstado: string }>({
    open: false,
    pedidoId: 0,
    nuevoEstado: '',
  });

  useEffect(() => {
    loadPedidos();
  }, []);

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
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  PEDIDO #{pedido.id}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${getEstadoColor(pedido.estado)}`}>
                  {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                </span>

                <Select
                  value={pedido.estado}
                  onValueChange={(value) => handleEstadoChange(pedido.id, value)}
                  disabled={pedido.estado === "entregado" || pedido.estado === "cancelado"}
                >
                  <SelectTrigger className="w-40 bg-background">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="entregado">Entregado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mb-4 grid gap-2 text-sm">
              <p className="text-foreground">
                <span className="font-medium">Cliente:</span> {pedido.cliente.id || 'N/A'}
              </p>
              <p className="text-foreground">
                <span className="font-medium">Teléfono:</span> {pedido.cliente.telefono || 'N/A'}
              </p>
              <p className="text-foreground">
                <span className="font-medium">Dirección:</span> {pedido.cliente.direccion.toUpperCase() || 'N/A'}
              </p>
              {pedido.descripcion && (
                <p className="text-foreground font-bold">
                  <span className="font-medium">Notas:</span> {pedido.descripcion.toUpperCase() || 'N/A'}
                </p>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <p className="mb-2 font-medium text-foreground">Productos:</p>
              <div className="space-y-1 text-sm">
                {pedido.productos?.map((prod, idx: number) => (
                  <p key={idx} className="text-muted-foreground">
                    {prod.nombre} x{prod.cantidad} - ${prod.precio * prod.cantidad}
                  </p>
                ))}
              </div>
              <p className="mt-4 text-right text-xl font-bold text-primary">
                Total: ${pedido.precioTotal}
              </p>
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
              <p>
                ¿Estás seguro de que quieres marcar este pedido como "{confirmDialog.nuevoEstado}"?
              </p>
              <p>
                Esta acción cambiará el estado del pedido #{confirmDialog.pedidoId}.
              </p>
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
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="pendiente">Pendiente</TabsTrigger>
          <TabsTrigger value="entregado">Entregado</TabsTrigger>
          <TabsTrigger value="cancelado">Cancelado</TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          {renderPedidos(pedidos)}
        </TabsContent>
        <TabsContent value="pendiente">
          {renderPedidos(pedidos.filter(p => p.estado === 'pendiente').sort((a, b) => a.id - b.id))}
        </TabsContent>
        <TabsContent value="entregado">
          {renderPedidos(pedidos.filter(p => p.estado === 'entregado'))}
        </TabsContent>
        <TabsContent value="cancelado">
          {renderPedidos(pedidos.filter(p => p.estado === 'cancelado'))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PedidosManager;
