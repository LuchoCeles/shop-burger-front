import { useState, useEffect } from 'react';
import ApiService from '../../services/api';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';

const PedidosManager = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    try {
      const data = await ApiService.getPedidos();
      setPedidos(data);
    } catch (error) {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (id: number, estado: string) => {
    try {
      await ApiService.updatePedidoEstado(id, estado);
      toast.success('Estado actualizado');
      loadPedidos();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar');
    }
  };

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      pendiente: 'text-yellow-500',
      preparando: 'text-blue-500',
      enviado: 'text-purple-500',
      entregado: 'text-green-500',
      cancelado: 'text-red-500',
    };
    return colors[estado] || 'text-muted-foreground';
  };

  if (loading) {
    return <div className="text-foreground">Cargando pedidos...</div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-foreground">Pedidos</h1>

      <div className="space-y-4">
        {pedidos.length === 0 ? (
          <p className="text-muted-foreground">No hay pedidos aún</p>
        ) : (
          pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Pedido #{pedido.id}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(pedido.fecha_pedido).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${getEstadoColor(pedido.estado)}`}>
                    {pedido.estado}
                  </span>
                  <Select
                    value={pedido.estado}
                    onValueChange={(value) => handleEstadoChange(pedido.id, value)}
                  >
                    <SelectTrigger className="w-40 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="preparando">Preparando</SelectItem>
                      <SelectItem value="enviado">Enviado</SelectItem>
                      <SelectItem value="entregado">Entregado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-4 grid gap-2 text-sm">
                <p className="text-foreground">
                  <span className="font-medium">Cliente:</span> {pedido.nombre_cliente || 'N/A'}
                </p>
                <p className="text-foreground">
                  <span className="font-medium">Teléfono:</span> {pedido.telefono || 'N/A'}
                </p>
                <p className="text-foreground">
                  <span className="font-medium">Dirección:</span> {pedido.direccion || 'N/A'}
                </p>
                {pedido.descripcion && (
                  <p className="text-foreground">
                    <span className="font-medium">Notas:</span> {pedido.descripcion}
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <p className="mb-2 font-medium text-foreground">Productos:</p>
                <div className="space-y-1 text-sm">
                  {pedido.productos?.map((prod: any, idx: number) => (
                    <p key={idx} className="text-muted-foreground">
                      {prod.nombre} x{prod.cantidad} - ${prod.precio * prod.cantidad}
                    </p>
                  ))}
                </div>
                <p className="mt-4 text-right text-xl font-bold text-primary">
                  Total: ${pedido.total?.toFixed(2)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PedidosManager;
