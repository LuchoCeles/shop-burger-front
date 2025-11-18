import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ApiService from '../services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import { Cliente, BankData, Category } from '@/intefaces/interfaz';
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
  const [tipoEntrega, setTipoEntrega] = useState<'retiro' | 'domicilio'>('retiro');
  const [metodoDePago, setMetodoDePago] = useState<'Efectivo' | 'Transferencia' | 'Mercado Pago'>('Efectivo');
  const [mpLink, setMpLink] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [mpReady, setMpReady] = useState(false);
  const location = useLocation();

  // ---------------------------
  // Restaurar pedido MP pendiente o limpiar aprobado
  // ---------------------------
  useEffect(() => {
    const mpStatus = sessionStorage.getItem("mp_status");

    if (mpStatus === "pending") {
      const data = sessionStorage.getItem("pedido_mp_temp");
      if (data) {
        const parsed = JSON.parse(data);
        setMpLink(parsed.mpLink);
        setMpReady(true);
      }
    }
  }, []);

  // ---------------------------
  // Cleanup: salir del checkout sin pagar
  // ---------------------------
  useEffect(() => {
    return () => {
      const mpStatus = sessionStorage.getItem("mp_status");

      if (location.pathname === "/checkout" && mpStatus === "pending") {
        clearCartMp();
      }
    };
  }, [location.pathname]);

  // ---------------------------
  // Fetch inicial
  // ---------------------------
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

  // ---------------------------
  // Handle submit
  // ---------------------------
  const cargarPedido = () => {
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
    return pedido;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tipoEntrega === 'domicilio' && (!cliente.telefono || !cliente.direccion)) {
      toast.error('Completa teléfono y dirección');
      return;
    }

    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    setSubmitting(true);

    try {
      const pedido = cargarPedido();

      const response = await ApiService.createOrder(pedido);

      sessionStorage.setItem("mp_status", "pending");

      toast.success('Pedido creado exitosamente');

      setSubmitting(false);
      setMpReady(true);
      setOrderId(response.data.id);
      cargarPedidoMP(response.data, pedido);

    } catch (error: any) {
      toast.error(error.message || 'Error al crear el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  const cargarPedidoMP = (data, pedido) => {
    if (data.init_point) {
      setMpLink(data.init_point);
    }
    sessionStorage.setItem(
      "pedido_mp_temp",
      JSON.stringify({
        pedido,
        orderId: data.id,
        mpLink: data.init_point || null,
      })
    );
    return;
  }

  // ---------------------------
  // Funciones de pago
  // ---------------------------
  const pagarConEfectivo = () => {
    const whatsappMessage = encodeURIComponent(
      `¡Hola! Tengo que pagar en efectivo mi pedido #${orderId}.`
    );
    return `https://wa.me/${Numero_Whatsapp}?text=${whatsappMessage}`;
  };

  const pagarConTransferencia = () => {
    const whatsappMessage = encodeURIComponent(
      `¡Hola! Te paso el comprobante de mi pedido #${orderId}.`
    );
    return `https://wa.me/${Numero_Whatsapp}?text=${whatsappMessage}`;
  }

  // ---------------------------
  // Pago → abrir link y limpiar
  // ---------------------------
  const Payment = () => {
    let url = "";

    if (metodoDePago === "Mercado Pago" && mpLink) {
      url = mpLink;
    }

    if (metodoDePago === "Transferencia") {
      url = pagarConTransferencia();
    }

    if (metodoDePago === "Efectivo") {
      url = pagarConEfectivo();
    }

    if (url) {
      window.open(url, "_blank");
    }

    // Limpiar todo
    clearCartMp();
  };

  const clearCartMp = () => {
    clearCart();
    sessionStorage.removeItem("pedido_mp_temp");
    sessionStorage.removeItem("mp_status");
    setMpReady(false);
    setMpLink(null);
    setSubmitting(false);
  };

  // ---------------------------
  // UI: carrito vacío
  // ---------------------------
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

  // ---------------------------
  // Loading screen
  // ---------------------------
  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p>Cargando datos...</p>
      </div>
    );
  }

  // ---------------------------
  // Render principal
  // ---------------------------
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
                <Select
                  value={tipoEntrega}
                  onValueChange={(value: 'retiro' | 'domicilio') => {
                    setTipoEntrega(value);

                    if (value === 'retiro') {
                      setCliente({ telefono: "N/A", direccion: "Retira en local" });
                    } else {
                      setCliente({ telefono: "", direccion: "" });
                    }
                  }}
                >
                  <SelectTrigger className="w-full bg-background border border-border [&>svg:last-child]:hidden">
                    <SelectValue placeholder="Tipo de entrega" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="retiro">Para retirar</SelectItem>
                    <SelectItem value="domicilio">Entrega a domicilio</SelectItem>
                  </SelectContent>
                </Select>

                <AnimatePresence mode="wait">
                  {tipoEntrega === 'domicilio' && (
                    <motion.div
                      key="domicilio-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >

                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                          Teléfono
                        </label>
                        <Input
                          type="tel"
                          placeholder="+54 9 11 1234-5678"
                          value={cliente.telefono}
                          disabled={submitting}
                          onChange={(e) =>
                            setCliente({ ...cliente, telefono: e.target.value })
                          }
                          required={tipoEntrega === 'domicilio'}
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
                          disabled={submitting}
                          onChange={(e) =>
                            setCliente({ ...cliente, direccion: e.target.value })
                          }
                          required={tipoEntrega === 'domicilio'}
                          className="bg-background"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>


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
                        disabled={submitting}
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
                        disabled={submitting}
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
                          disabled={submitting}
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
                    disabled={submitting}
                    className="bg-background"
                  />
                </div>

                <Button
                  type={!mpReady ? "submit" : "button"}
                  className={`w-full text-primary-foreground hover:bg-primary/90 ${mpReady ? "bg-[rgb(99,159,236)] hover:bg-[rgb(127,180,248)]" : "bg-primary"
                    }`}
                  disabled={submitting}
                  onClick={() => {
                    if (mpReady) {
                      Payment();
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

          {/* --------------------------- */}
          {/* RESUMEN DEL PEDIDO */}
          {/* --------------------------- */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">

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
                              <p>{item.nombre} x{item.cantidad}</p>

                              {item.adicionales && item.adicionales.filter(ad => ad.cantidad > 0).length > 0 && (
                                <ul className="ml-4 list-disc text-sm text-muted-foreground">
                                  {item.adicionales
                                    .filter(ad => ad.cantidad > 0)
                                    .map((ad) => (
                                      <li key={ad.id}>{ad.nombre} x{ad.cantidad}</li>
                                    ))}
                                </ul>
                              )}
                            </div>

                            <div className="text-foreground text-xl text-right">
                              <span className="font-semibold text-foreground text-xl">
                                ${(item.precio * item.cantidad).toFixed(2)}
                              </span>

                              {item.adicionales && item.adicionales.filter(ad => ad.cantidad > 0).length > 0 && (
                                <ul className="text-sm text-muted-foreground text-right">
                                  {item.adicionales.map(
                                    (ad) =>
                                      ad.cantidad > 0 && (
                                        <li key={ad.id}>${(ad.precio * ad.cantidad).toFixed(2)}</li>
                                      )
                                  )}
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
                    <p className="mb-2 font-semibold text-foreground">Datos de pago:</p>
                    <p>Nombre: {bankData.nombre}</p>
                    <p>Apellido: {bankData.apellido}</p>
                    <p>CUIT / DNI: {bankData.cuit}</p>
                    <p>Alias: {bankData.alias}</p>
                    <p>CBU: {bankData.cbu}</p>
                    <p className="mt-2 text-xs">
                      Después de confirmar, recibirás un mensaje para enviarnos el comprobante por WhatsApp.
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