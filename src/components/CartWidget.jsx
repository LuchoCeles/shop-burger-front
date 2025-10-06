import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const CartWidget = () => {
  const {
    items,
    isOpen,
    removeItem,
    updateQuantity,
    getTotal,
    getItemsCount,
    toggleCart,
    setIsOpen
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setIsOpen(false)}>
      <div 
        className="fixed right-0 top-0 h-screen w-full max-w-md bg-card border-l shadow-2xl z-[60]"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="h-full rounded-none border-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <h2 className="text-lg font-semibold">
                Carrito ({getItemsCount()})
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCart}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Cart Items */}
          <CardContent className="flex-1 p-0">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Tu carrito está vacío</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Agrega productos para comenzar tu pedido
                </p>
                <Button asChild onClick={() => setIsOpen(false)}>
                  <Link to="/menu">Ver Carta</Link>
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-6 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex space-x-4">
                      <img
                        src={item.image || '/api/placeholder/60/60'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg bg-muted"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {item.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          ${item.price?.toFixed(2)} c/u
                        </p>
                        
                        {/* Quantity controls */}
                        <div className="flex items-center space-x-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>

          {/* Footer */}
          {items.length > 0 && (
            <CardFooter className="border-t p-6 space-y-4">
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Total:</span>
                  <span className="text-xl font-bold text-primary">
                    ${getTotal().toFixed(2)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-[hsl(var(--burger-orange))] to-[hsl(var(--burger-yellow))] hover:shadow-[var(--shadow-burger)]"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to="/checkout">Ir a Comprar</Link>
                  </Button>
                  
                  <Button
                    variant="outline"
                    asChild
                    className="w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to="/cart">Ver Carrito Completo</Link>
                  </Button>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CartWidget;