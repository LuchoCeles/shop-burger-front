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

  const handleIncrement = (cartId: string, currentCantidad: number, productoOriginal: any) => {
    const stock = productoOriginal.stock;
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
                const stock = item.productoOriginal.stock;
                const isMaxStock = stock !== undefined && item.cantidad >= stock;
                const precioBase = item.tamSeleccionado?.precioFinal + (item?.adicionalesSeleccionados.map(adic => adic.precio).reduce((a, b) => a + b, 0));

                return (
                  <div key={item.cartId} className="space-y-2">
                    <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                      {/* Imagen */}
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.productoOriginal.url_imagen ? (
                          <img
                            src={item.productoOriginal.url_imagen}
                            alt={item.productoOriginal.nombre}
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
                        <h4 className="font-semibold text-foreground">{item.productoOriginal.nombre}</h4>
                        <p className="text-lg font-bold text-primary">
                          ${precioBase.toFixed(2)}
                        </p>

                        {/* Tamaño */}
                        {item.tamSeleccionado && (
                          <div className="mt-1">
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Tamaño:</span> {item.tamSeleccionado.nombre}
                            </p>
                          </div>
                        )}

                        {/* Guarnición */}
                        {item.guarnicionSeleccionada && (
                          <div className="mt-1">
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Guarnición:</span>{' '}
                              {item.guarnicionSeleccionada.nombre}
                            </p>
                          </div>
                        )}

                        {/* Adicionales (solo mostrar los que tienen cantidad > 0) */}
                        {item.adicionalesSeleccionados.length > 0 && (<div className="mt-1">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Adicionales:</span>{' '}
                            {item.adicionalesSeleccionados
                              .filter(adic => adic.cantidad > 0)
                              .map(adic => `${adic.nombre} x ${adic.cantidad}`)
                              .join(", ")}
                          </p>
                        </div>
                        )}
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
                              handleIncrement(item.cartId, item.cantidad, item.productoOriginal)
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
                          Editar {item.productoOriginal.nombre}
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
          product={editingItem.productoOriginal}
          onConfirm={(config) => {
            updateItemConfig(editingItem.cartId, {
              tamSeleccionado: config.tam,
              guarnicionSeleccionada: config.guarnicion,
              adicionalesSeleccionados: config.adicionales || [],
            });

            setEditingItem(null);
            toast.success('Producto actualizado');
          }}
          initialConfig={{
            tam: editingItem.tamSeleccionado,
            guarnicion: editingItem.guarnicionSeleccionada,
            adicionales: editingItem.adicionalesSeleccionados,
          }}
        />
      )}
    </>
  );
};

export default CartModal;