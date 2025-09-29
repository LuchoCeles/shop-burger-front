import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MessageCircle, CreditCard } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.email) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customer: formData,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: getTotal(),
        status: 'pending'
      };

      await apiService.createOrder(orderData);
      
      toast({
        title: "Pedido confirmado",
        description: "Tu pedido ha sido recibido correctamente",
      });

      setShowPaymentInfo(true);
    } catch (error) {
      console.error('Error creating order:', error);
      setShowPaymentInfo(true); // Show payment info anyway for demo
    } finally {
      setLoading(false);
    }
  };

  const generateWhatsAppMessage = () => {
    const itemsList = items.map(item => 
      `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const message = `🍔 *NUEVO PEDIDO* 🍔

👤 *Cliente:* ${formData.name}
📞 *Teléfono:* ${formData.phone}
📧 *Email:* ${formData.email}
${formData.address ? `📍 *Dirección:* ${formData.address}` : ''}

📋 *Pedido:*
${itemsList}

💰 *Total: $${getTotal().toFixed(2)}*

${formData.notes ? `📝 *Notas:* ${formData.notes}` : ''}

¡Adjunto comprobante de pago!`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppSend = () => {
    const phone = "1234567890"; // Replace with restaurant's WhatsApp number
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Clear cart and redirect after a delay
    setTimeout(() => {
      clearCart();
      navigate('/', { 
        state: { 
          message: 'Pedido enviado por WhatsApp. ¡Te contactaremos pronto!' 
        }
      });
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-32 pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center py-12">
              <h1 className="text-3xl font-bold mb-4">No hay productos en el carrito</h1>
              <p className="text-muted-foreground mb-8">
                Agrega productos a tu carrito antes de proceder al checkout.
              </p>
              <Button asChild>
                <Link to="/menu">Ver Carta</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (showPaymentInfo) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-32 pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="text-2xl">Información de Pago</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-4">Datos para transferencia:</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Alias:</span> burger.house.2024
                      </div>
                      <div>
                        <span className="font-medium">CBU:</span> 0123456789012345678901
                      </div>
                      <div>
                        <span className="font-medium">Titular:</span> Burger House S.A.
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                    <h3 className="font-semibold mb-2 text-primary">Total a pagar:</h3>
                    <div className="text-3xl font-bold text-primary">
                      ${getTotal().toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-muted-foreground mb-6">
                      Realiza la transferencia y envía el comprobante por WhatsApp para confirmar tu pedido.
                    </p>
                    
                    <Button
                      onClick={handleWhatsAppSend}
                      size="lg"
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Enviar Comprobante por WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center mb-8">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-3xl font-bold">Checkout</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Customer Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Información del Cliente</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nombre completo *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Tu nombre completo"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Teléfono *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          placeholder="+54 9 11 1234-5678"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="tu@email.com"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Dirección (opcional)</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Dirección para entrega"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Notas adicionales</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Instrucciones especiales, alergias, etc."
                        rows={3}
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[hsl(var(--burger-orange))] to-[hsl(var(--burger-yellow))] hover:shadow-[var(--shadow-burger)]"
                      size="lg"
                    >
                      {loading ? 'Procesando...' : 'Confirmar Pedido'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img
                          src={item.image || '/api/placeholder/60/60'}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg bg-muted"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            ${item.price?.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        
                        <div className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${getTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Envío:</span>
                      <span className="text-green-600">Gratis</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">${getTotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground pt-4 space-y-1">
                    <p>• Tiempo estimado: 30-45 minutos</p>
                    <p>• Pago por transferencia bancaria</p>
                    <p>• Confirmación por WhatsApp</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;