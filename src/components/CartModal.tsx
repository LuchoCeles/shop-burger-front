import { useState } from 'react';
import { Minus, Plus, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { CartModalProps, CartItem } from 'src/intefaces/interfaz';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import ProductConfigModal from './ProductConfigModal';

const CartModal: React.FC<CartModalProps> = ({ open, onOpenChange }) => {
  const { cart, removeFromCart, updateQuantity, total, updateItemConfig } = useCart();
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const navigate = useNavigate();

  const handleCheckout = () => {
    onOpenChange(false);
    navigate('/checkout');
  };

  const handleIncrement = (cartId: string, currentCantidad: number, stock?: number) => {
    if (stock !== undefined && currentCantidad >= stock) {
      toast.error(`Solo hay ${stock} unidades disponibles`);
      return;
    }
    updateQuantity(cartId, currentCantidad + 1);
  };

  const handleDecrement = (cartId: string, currentCantidad: number) => {
    if (currentCantidad > 1) {
      updateQuantity(cartId, currentCantidad - 1);
    } else {
      removeFromCart(cartId);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              Tu Carrito
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Tu carrito está vacío</p>
              </div>
            ) : (
              cart.map((item) => {
                const isMaxStock =
                  item.stock !== undefined && item.cantidad >= item.stock;

                return (
                  <div key={item.cartId} className="space-y-2">
                    <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                      {/* Imagen */}
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.url_imagen ? (
                          <img
                            src={item.url_imagen}
                            alt={item.nombre}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl">
                            🍽️
                          </div>
                        )}
                      </div>

                      {/* Información */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{item.nombre}</h4>
                        <p className="text-lg font-bold text-primary">
                          ${(typeof item.precio === 'number' ? item.precio.toFixed(2) : Number(item.precio || 0).toFixed(2))}
                        </p>

                        {/* Tamaño */}
                        {item.tam && item.tam.nombre ? (
                          <div className="mt-1">
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Tamaño:</span> {item.tam.nombre}
                              {item.tam.precio ? <span> (+${Number(item.tam.precio).toFixed(2)})</span> : null}
                            </p>
                          </div>
                        ) : null}

                        {/* Guarnición */}
                        {item.guarnicion && (
                          <div className="mt-1">
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Guarnición:</span>{' '}
                              {item.guarnicion.nombre}
                            </p>
                          </div>
                        )}

                        {/* Adicionales */}
                        {item.adicionales?.filter(adic => adic.cantidad > 0).map((adic) => (
                          <p key={adic.id} className="text-xs text-muted-foreground">
                            • {adic.nombre} x{adic.cantidad} (+${(Number(adic.precio || 0) * adic.cantidad).toFixed(2)})
                          </p>
                        ))}
                      </div>

                      {/* Controles */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDecrement(item.cartId, item.cantidad)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <span className="w-8 text-center font-semibold">
                            {item.cantidad}
                          </span>

                          <Button
                            variant={isMaxStock ? 'secondary' : 'outline'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleIncrement(item.cartId, item.cantidad, item.stock)
                            }
                            disabled={isMaxStock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => removeFromCart(item.cartId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => setEditingItem(item)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar producto
                        </Button>

                        {isMaxStock && (
                          <div className="text-center -mt-2">
                            <span className="text-xs text-destructive font-medium">
                              Stock máximo alcanzado
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );

              })
            )}
          </div>

          {/* Footer con total */}
          {cart.length > 0 && (
            <DialogFooter className="flex-col gap-4 sm:flex-col">
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-lg font-semibold text-foreground">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>

              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleCheckout}
              >
                Ir al Checkout
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {editingItem && (
        <ProductConfigModal
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          product={{
            ...editingItem,
            tam: editingItem.tam ? [editingItem.tam] : [],
            guarniciones: editingItem.guarnicion ? [editingItem.guarnicion] : [],
            adicionales: editingItem.adicionales?.map(adic => ({
              id: adic.id,
              nombre: adic.nombre,
              precio: Number(adic.precio),
              stock: 999,
              maxCantidad: adic.maxCantidad,
              estado: true,
            })) || []
          }}
          onConfirm={(config) => {
            // Calcular nuevo precio si cambió el tamaño
            let newPrice = editingItem.precio;

            if (editingItem.tam?.precio && config.tam?.precio) {
              // Ambos tienen precio, reemplazar
              newPrice = newPrice - editingItem.tam.precio + config.tam.precio;
            } else if (config.tam?.precio) {
              // Solo el nuevo tiene precio, agregar
              newPrice = newPrice + config.tam.precio;
            } else if (editingItem.tam?.precio) {
              // Solo el anterior tenía precio, quitar
              newPrice = newPrice - editingItem.tam.precio;
            }

            updateItemConfig(editingItem.cartId, {
              tam: config.tam,
              guarnicion: config.guarnicion,
              adicionales: config.adicionales,
              precio: newPrice,
            });

            setEditingItem(null);
            toast.success('Producto actualizado');
          }}
          initialConfig={{
            tam: editingItem.tam,
            guarnicion: editingItem.guarnicion,
            adicionales: editingItem.adicionales,
          }}
        />
      )}
    </>
  );
};

export default CartModal;