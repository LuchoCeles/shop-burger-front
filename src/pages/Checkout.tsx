import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ApiService from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import { Cliente, BankData } from '@/intefaces/interfaz';

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bankData, setBankData] = useState<BankData | null>(null);
  const [cliente, setCliente] = useState<Cliente>({
    telefono: '',
    direccion: '',
  });
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    fetchBankData();
  }, []);

  const fetchBankData = async () => {
    try {
      const rsp = await ApiService.getBancos();
      setBankData(rsp.data);
    } catch (error) {
      toast.error('Error al obtener datos bancarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cliente.telefono || !cliente.direccion) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    setLoading(true);

    try {
      const pedido = {
        cliente: {
          telefono: cliente.telefono,
          direccion: cliente.direccion,
        },
        descripcion,
        productos: cart.map((item) => ({
          id: item.id,
          cantidad: item.cantidad,
        })),
        adicional: cart.flatMap((item) =>
          item.adicionales?.map((adicional) => ({
            id: adicional.id,
            cantidad: adicional.cantidad,
          })) || []
        ),
      };

      const response = await ApiService.createOrder(pedido);
      clearCart();

      const whatsappMessage = encodeURIComponent(
        `¡Hola! Te paso el comprobante de mi pedido #${response.data.id}.\n\n` +
        `Nombre: ${bankData?.nombre}\n` +
        `Apellido: ${bankData?.apellido}\n` +
        `CUIT / DNI: ${bankData?.cuit}\n` +
        `Alias: ${bankData?.alias}\n` +
        `CBU: ${bankData?.cbu}\n\n` +
        `Total: $${total.toFixed(2)}\n` +
        `Productos:\n${cart
          .map((item) => `- ${item.nombre} x${item.cantidad}`)
          .join('\n')}`
      );

      toast.success('Pedido creado exitosamente');

      setTimeout(() => {
        window.open(
          `https://wa.me/5491122334455?text=${whatsappMessage}`,
          '_blank'
        );
        navigate('/');
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el pedido');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Tu carrito está vacío
          </h2>
          <Button onClick={() => navigate('/')}>Volver a la tienda</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground">
          Finalizar Compra
        </h1>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Datos de entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    placeholder="+54 9 11 1234-5678"
                    value={cliente.telefono}
                    onChange={(e) =>
                      setCliente({ ...cliente, telefono: e.target.value })
                    }
                    required
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Dirección
                  </label>
                  <Input
                    type="text"
                    placeholder="Calle 123, Ciudad"
                    value={cliente.direccion}
                    onChange={(e) =>
                      setCliente({ ...cliente, direccion: e.target.value })
                    }
                    required
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Notas adicionales (Opcional)
                  </label>
                  <Textarea
                    placeholder="Agregar instrucciones de entrega o notas adicionales..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Confirmar Pedido'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-foreground">
                      {item.nombre} x{item.cantidad}
                    </span>
                    <span className="font-semibold text-foreground">
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-foreground">Total:</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
                {bankData && (
                  <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                    <p className="mb-2 font-semibold text-foreground">
                      Datos de pago:
                    </p>
                    <p>Nombre: {bankData.nombre}</p>
                    <p>Apellido: {bankData.apellido}</p>
                    <p>CUIT / DNI: {bankData.cuit}</p>
                    <p>Alias: {bankData.alias}</p>
                    <p>CBU: {bankData.cbu}</p>
                    <p className="mt-2 text-xs">
                      Después de confirmar, recibirás un mensaje para enviarnos el
                      comprobante por WhatsApp.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
