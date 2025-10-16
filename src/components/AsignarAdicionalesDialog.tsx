import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Adicional, ProductoAdicional } from '@/intefaces/interfaz';
import ApiService from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface AsignarAdicionalesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  productName: string;
}

export default function AsignarAdicionalesDialog({ open, onOpenChange, productId, productName }: AsignarAdicionalesDialogProps) {
  const [adicionales, setAdicionales] = useState<Adicional[]>([]);
  const [asignados, setAsignados] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, productId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allAdicionales, productoAdicionales] = await Promise.all([
        ApiService.getAdicionales(),
        ApiService.getProductoAdicionales(productId),
      ]);

      setAdicionales(allAdicionales.data.filter((a: Adicional) => a.estado !== false));
      setAsignados(productoAdicionales.data.map((pa: ProductoAdicional) => pa.idAdicional));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los adicionales',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdicional = async (adicionalId: number) => {
    try {
      if (asignados.includes(adicionalId)) {
        await ApiService.removeAdicionalFromProducto(productId, adicionalId);
        setAsignados(asignados.filter((id) => id !== adicionalId));
        toast({
          title: 'Adicional removido',
        });
      } else {
        await ApiService.addAdicionalToProducto(productId, adicionalId);
        setAsignados([...asignados, adicionalId]);
        toast({
          title: 'Adicional agregado',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el adicional',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Asignar Adicionales a "{productName}"</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Cargando...</div>
        ) : adicionales.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No hay adicionales disponibles</p>
            <p className="text-sm mt-1">Crea adicionales primero en la sección correspondiente</p>
          </div>
        ) : (
          <div className="grid gap-3 py-4">
            {adicionales.map((adicional) => {
              const isAsignado = asignados.includes(adicional.id);
              return (
                <div
                  key={adicional.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{adicional.nombre}</h4>
                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                      <span>Precio: ${adicional.precio}</span>
                      <span>Stock: {adicional.stock}</span>
                      <span>Máx: {adicional.maxCantidad}</span>
                    </div>
                  </div>
                  <Button
                    variant={isAsignado ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => handleToggleAdicional(adicional.id)}
                  >
                    {isAsignado ? (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Quitar
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}