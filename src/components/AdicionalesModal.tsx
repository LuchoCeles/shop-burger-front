import { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Adicional, CartItemAdicional, AdicionalesModalProps } from '@/intefaces/interfaz';
import ApiService from '@/services/api';
import { toast } from '@/hooks/use-toast';

export default function AdicionalesModal({
  open,
  onOpenChange,
  Product,
  onConfirm,
  initialAdicionales = [],
}: AdicionalesModalProps) {
  const [adicionales, setAdicionales] = useState<Adicional[]>([]);
  const [selectedAdicionales, setSelectedAdicionales] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadAdicionales();
      // Inicializar con adicionales previos si existen
      const initial = new Map<number, number>();
      initialAdicionales.forEach(adic => {
        initial.set(adic.id, adic.cantidad);
      });
      setSelectedAdicionales(initial);
    }
  }, [open, Product.id]);

  const loadAdicionales = async () => {
    setLoading(true);
    try {
      const allAdicionales = await ApiService.getAdicionales();
      const adicionalesIds = Product.adicionales.map((pa: Adicional) => pa.id);
      const filtered = allAdicionales.data?.filter((a: Adicional) =>
        adicionalesIds.includes(a.id) && a.stock > 0
      );

      setAdicionales(filtered);
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

  const handleIncrement = (adicional: Adicional) => {
    const current = selectedAdicionales.get(adicional.id) || 0;
    if (current < adicional.maxCantidad && current < adicional.stock) {
      const newMap = new Map(selectedAdicionales);
      newMap.set(adicional.id, current + 1);
      setSelectedAdicionales(newMap);
    } else if (current >= adicional.maxCantidad) {
      toast({
        title: 'Límite alcanzado',
        description: `Máximo ${adicional.maxCantidad} unidades de ${adicional.nombre}`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Sin stock',
        description: `Solo hay ${adicional.stock} unidades disponibles`,
        variant: 'destructive',
      });
    }
  };

  const handleDecrement = (adicionalId: number) => {
    const current = selectedAdicionales.get(adicionalId) || 0;
    if (current > 0) {
      const newMap = new Map(selectedAdicionales);
      if (current === 1) {
        newMap.delete(adicionalId);
      } else {
        newMap.set(adicionalId, current - 1);
      }
      setSelectedAdicionales(newMap);
    }
  };

  const handleConfirm = () => {
    // Guardar TODOS los adicionales del producto, incluyendo los que tienen cantidad 0
    const result: CartItemAdicional[] = adicionales.map(adicional => ({
      id: adicional.id!,
      nombre: adicional.nombre,
      precio: adicional.precio,
      cantidad: selectedAdicionales.get(adicional.id!) || 0,
      maxCantidad: adicional.maxCantidad,
    }));
    
    onConfirm(result);
    onOpenChange(false);
  };

  const calcularTotal = () => {
    let total = 0;
    selectedAdicionales.forEach((cantidad, id) => {
      const adicional = adicionales.find(a => a.id === id);
      if (adicional) {
        total += adicional.precio * cantidad;
      }
    });
    return total;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Adicionales{Product?.nombre ? ` a "${Product.nombre}"` : ''}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Cargando...</div>
        ) : adicionales.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No hay adicionales disponibles</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 py-4">
              {adicionales.map((adicional) => {
                const cantidad = selectedAdicionales.get(adicional.id) || 0;
                return (
                  <div
                    key={adicional.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg bg-card"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{adicional.nombre}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${adicional.precio} - Máx: {adicional.maxCantidad}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDecrement(adicional.id)}
                        disabled={cantidad === 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{cantidad}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleIncrement(adicional)}
                        disabled={cantidad >= adicional.maxCantidad || cantidad >= adicional.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedAdicionales.size > 0 && (
              <div className="pt-3 border-t border-border">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal adicionales:</span>
                  <span className="font-bold text-primary">
                    ${calcularTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}