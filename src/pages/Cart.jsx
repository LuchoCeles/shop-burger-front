import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/contexts/CartContext';

const Cart = () => {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemsCount
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
              <h1 className="text-3xl font-bold mb-4">Tu carrito está vacío</h1>
              <p className="text-muted-foreground mb-8">
                Parece que aún no has agregado ningún producto a tu carrito.
                ¡Explora nuestra deliciosa carta!
              </p>
              <Button asChild size="lg">
                <Link to="/menu" className="group">
                  Ver Nuestra Carta
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Tu Carrito</h1>
                <p className="text-muted-foreground">
                  {getItemsCount()} producto{getItemsCount() !== 1 ? 's' : ''} en tu carrito
                </p>
              </div>
              
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Vaciar Carrito
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex space-x-4">
                        <img
                          src={item.image || '/api/placeholder/120/120'}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg bg-muted"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1">
                            {item.name}
                          </h3>
                          
                          {item.category && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.category}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-primary">
                              ${item.price?.toFixed(2)} c/u
                            </div>
                            
                            {/* Quantity controls */}
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              
                              <span className="font-medium w-8 text-center">
                                {item.quantity}
                              </span>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive ml-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <div className="text-right font-semibold">
                              Subtotal: ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Resumen del Pedido</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="truncate mr-2">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-base font-semibold">
                      <span>Total:</span>
                      <span className="text-primary text-xl">
                        ${getTotal().toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="space-y-3 pt-4">
                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-[hsl(var(--burger-orange))] to-[hsl(var(--burger-yellow))] hover:shadow-[var(--shadow-burger)]"
                        size="lg"
                      >
                        <Link to="/checkout">
                          Proceder al Checkout
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <Button
                        variant="outline"
                        asChild
                        className="w-full"
                      >
                        <Link to="/menu">Seguir Comprando</Link>
                      </Button>
                    </div>
                    
                    <div className="text-xs text-muted-foreground pt-4 border-t">
                      <p>• Envío gratis en pedidos superiores a $25</p>
                      <p>• Tiempo estimado de entrega: 30-45 min</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;