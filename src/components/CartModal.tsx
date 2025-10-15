import { Minus, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { CartModalProps } from 'src/intefaces/interfaz';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';

const CartModal: React.FC<CartModalProps> = ({ open, onOpenChange }) => {
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onOpenChange(false);
    navigate('/checkout');
  };

  const handleIncrement = (id: number, currentCantidad: number, stock?: number) => {
    if (stock !== undefined && currentCantidad >= stock) {
      toast.error(`Solo hay ${stock} unidades disponibles`);
      return;
    }
    updateQuantity(id, currentCantidad + 1);
  };

  const handleDecrement = (id: number, currentCantidad: number) => {
    if (currentCantidad > 1) {
      updateQuantity(id, currentCantidad - 1);
    } else {
      removeFromCart(id);
    }
  };

  return (
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
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
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
                      <p className="text-lg font-bold text-primary">${item.precio}</p>
                      {item.adicionales && item.adicionales.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-muted-foreground font-medium">Adicionales:</p>
                          {item.adicionales.map((adic) => (
                            <p key={adic.id} className="text-xs text-muted-foreground">
                              • {adic.nombre} x{adic.cantidad} (+${(adic.precio * adic.cantidad).toFixed(2)})
                            </p>
                          ))}
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
                          onClick={() => handleDecrement(item.id, item.cantidad)}
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
                            handleIncrement(item.id, item.cantidad, item.stock)
                          }
                          disabled={isMaxStock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

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
  );
};

export default CartModal;