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
import { Cliente, BankData, Category } from '@/intefaces/interfaz';
const Numero_Whatsapp = import.meta.env.VITE_NUM_WHATSAPP;

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bankData, setBankData] = useState<BankData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cliente, setCliente] = useState<Cliente>({
    telefono: '',
    direccion: '',
  });
  const [descripcion, setDescripcion] = useState('');
  const [metodoDePago, setMetodoDePago] = useState<'Efectivo' | 'Transferencia' | 'Mercado Pago'>('Efectivo');
  const [mpLink, setMpLink] = useState<string | null>(null);
  const [waitingMp, setWaitingMp] = useState(false);
  const [mpReady, setMpReady] = useState(false);

  useEffect(() => {
    fetchBankData();
  }, []);

  const fetchBankData = async () => {
    try {
      const [bankDataRes, categoriesRes] = await Promise.all([
        ApiService.getBancos(),
        ApiService.getCategories(),
      ]);
      setBankData(bankDataRes.data);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch (error) {
      toast.error('Error al obtener datos bancarios');
    } finally {
      setLoadingData(false);
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

    setSubmitting(true);

    if (metodoDePago === "Mercado Pago") {
      setWaitingMp(true);
    }

    try {
      const pedido = {
        cliente: {
          telefono: cliente.telefono,
          direccion: cliente.direccion,
        },
        descripcion,
        metodoDePago,
        productos: cart.map((item) => ({
          id: item.id,
          cantidad: item.cantidad,
          adicionales: item.adicionales?.map((ad) => ({
            id: ad.id,
            cantidad: ad.cantidad,
          })) || [],
        })),
      };

      const response = await ApiService.createOrder(pedido);

      if (metodoDePago !== "Mercado Pago") {
        clearCart();
      }

      toast.success('Pedido creado exitosamente');

      if (metodoDePago === 'Mercado Pago') {
        if (response.data.init_point) {
          setMpLink(response.data.init_point);
          setWaitingMp(false);
          setMpReady(true);
          return;
        } else {
          toast.error('No se recibió el link de pago de Mercado Pago');
        }
      } else {
        const whatsappMessage = encodeURIComponent(
          `¡Hola! Te paso el comprobante de mi pedido #${response.data.id}.`
        );

        setTimeout(() => {
          window.open(
            `https://wa.me/${Numero_Whatsapp}?text=${whatsappMessage}`,
            '_blank'
          );
          navigate('/');
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  const clearCartMp = () => {
    window.open(mpLink, "_blank");
    clearCart();
  }

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

  if (loadingData) {
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

        <div className="grid gap-6 lg:grid-cols-2 items-start">
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
                    Método de pago
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 rounded-lg border border-border bg-background p-3 cursor-pointer hover:bg-accent transition-colors">
                      <input
                        type="radio"
                        name="metodoDePago"
                        value="Efectivo"
                        checked={metodoDePago === 'Efectivo'}
                        onChange={(e) => setMetodoDePago(e.target.value as 'Efectivo')}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-foreground">Efectivo</span>
                    </label>
                    <label className="flex items-center space-x-3 rounded-lg border border-border bg-background p-3 cursor-pointer hover:bg-accent transition-colors">
                      <input
                        type="radio"
                        name="metodoDePago"
                        value="Transferencia"
                        checked={metodoDePago === 'Transferencia'}
                        onChange={(e) => setMetodoDePago(e.target.value as 'Transferencia')}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-foreground">Transferencia</span>
                    </label>
                    {Boolean(bankData?.mpEstado) && (
                      <label className="flex items-center space-x-3 rounded-lg border border-border bg-background p-3 cursor-pointer hover:bg-accent transition-colors">
                        <input
                          type="radio"
                          name="metodoDePago"
                          value="Mercado Pago"
                          checked={metodoDePago === 'Mercado Pago'}
                          onChange={(e) => setMetodoDePago(e.target.value as 'Mercado Pago')}
                          className="h-4 w-4 text-primary"
                        />
                        <span className="text-foreground">Mercado Pago</span>
                      </label>
                    )}
                  </div>
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
                  type={!mpReady ? "submit" : "button"}
                  className={`w-full text-primary-foreground hover:bg-primary/90 ${mpReady ? "bg-[rgb(50,111,190)] hover:bg-[rgb(67,129,209)]" : "bg-primary"}`}
                  disabled={submitting || waitingMp}
                  onClick={() => {
                    if (mpReady && mpLink) {
                      clearCartMp();
                    }
                  }}
                >
                  {mpReady
                    ? "Pagar"
                    : submitting
                      ? "Cargando..."
                      : "Confirmar Pedido"}
                </Button>

              </form>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Agrupar productos por categoría */}
                {Object.entries(
                  cart.reduce((acc, item) => {
                    const categoryId = item.idCategoria || 0;
                    if (!acc[categoryId]) {
                      acc[categoryId] = [];
                    }
                    acc[categoryId].push(item);
                    return acc;
                  }, {} as Record<number, typeof cart>)
                ).map(([categoryId, items]) => {
                  const category = categories.find(c => c.id === Number(categoryId));
                  const categoryName = category?.nombre || 'Sin categoría';

                  return (
                    <div key={categoryId} className="space-y-3">
                      <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">
                        {categoryName}
                      </h3>
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.cartId} className="flex justify-between">
                            <div className="text-foreground text-xl">
                              <p>
                                {item.nombre} x{item.cantidad}
                              </p>
                              {/* Mostrar adicionales si existen */}
                              {item.adicionales && item.adicionales.filter(adicional => adicional.cantidad > 0).length > 0 && (
                                <ul className="ml-4 list-disc text-sm text-muted-foreground">
                                  {item.adicionales
                                    .filter(adicional => adicional.cantidad > 0)
                                    .map((adicional) => (
                                      <li key={adicional.id}>
                                        {adicional.nombre} x{adicional.cantidad}
                                      </li>
                                    ))}
                                </ul>
                              )}
                            </div>
                            <div className="text-foreground text-xl text-right">
                              <span className="font-semibold text-foreground text-xl">
                                ${(item.precio * item.cantidad).toFixed(2)}
                              </span>

                              {item.adicionales && item.adicionales.filter(adicional => adicional.cantidad > 0).length > 0 && (
                                <ul className="text-sm text-muted-foreground text-right">
                                  {item.adicionales
                                    .filter(adicional => adicional.cantidad > 0)
                                    .map((adicional) => (
                                      <li key={adicional.id}>${(adicional.precio * adicional.cantidad).toFixed(2)}</li>
                                    ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-foreground">Total:</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
                {metodoDePago === 'Transferencia' && bankData && (
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