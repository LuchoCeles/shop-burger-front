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
import StoreClosedModal from '../components/StoreClosedModal';
import { Cliente, BankData, Category } from '@/intefaces/interfaz';
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckoutSkeleton } from '../components/skeletons';
import { useStoreStatus } from '../hooks/useStoreStatus';
import { AlertCircle } from 'lucide-react';

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
  const [tipoEntrega, setTipoEntrega] = useState<'Retiro' | 'Domicilio'>('Retiro');
  const [metodoDePago, setMetodoDePago] = useState<'Efectivo' | 'Transferencia' | 'Mercado Pago'>('Efectivo');
  const [mpLink, setMpLink] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [mpReady, setMpReady] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showClosedModal, setShowClosedModal] = useState(false);
  const location = useLocation();

  // Hook para verificar el estado de la tienda
  const { isOpen, nextOpenTime, currentDay, loading: statusLoading } = useStoreStatus();

  // Mostrar modal si la tienda está cerrada
  useEffect(() => {
    if (!statusLoading && !isOpen) {
      setShowClosedModal(true);
    }
  }, [isOpen, statusLoading]);

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

  useEffect(() => {
    return () => {
      const mpStatus = sessionStorage.getItem("mp_status");

      if (location.pathname === "/checkout" && mpStatus === "pending") {
        clearCartMp();
      }
    };
  }, [location.pathname]);

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
      setInitialLoading(false);
    } catch (error) {
      toast.error('Error al obtener datos bancarios');
    } finally {
      setLoadingData(false);
    }
  };

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
        adicionales: item.adicionalesSeleccionados
          .filter(ad => ad.cantidad > 0 && ad.id !== null && ad.id !== undefined)
          .map((ad) => ({
            id: ad.id!,
            cantidad: ad.cantidad,
          })),
        idGuarnicion: item?.guarnicionSeleccionada?.id,
        idTam: item.tamSeleccionado?.id
      })),
    };
    return pedido;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar si la tienda está cerrada
    if (!isOpen) {
      toast.error('La tienda está cerrada. No se pueden realizar pedidos.');
      setShowClosedModal(true);
      return;
    }

    if (tipoEntrega === 'Domicilio' && (!cliente.telefono || !cliente.direccion)) {
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
      if (response.success) {
        toast.success('Pedido creado exitosamente');

        setSubmitting(false);
        setMpReady(true);
        setOrderId(response.data.id);
        cargarPedidoMP(response.data, pedido);
      } else {
        toast.error(response.message);
      }
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

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8">
            <div className="h-9 w-48 bg-muted animate-pulse rounded" />
          </div>
          <CheckoutSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Modal de tienda cerrada */}
      <StoreClosedModal
        isOpen={showClosedModal}
        onClose={() => {
          setShowClosedModal(false);
          navigate('/');
        }}
        nextOpenTime={nextOpenTime}
        currentDay={currentDay}
        showCloseButton={true}
      />

      {/* Banner de advertencia si está cerrada */}
      {!statusLoading && !isOpen && (
        <div className="bg-destructive text-destructive-foreground py-4 px-4">
          <div className="container mx-auto max-w-4xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">La tienda está cerrada</p>
              <p className="text-sm opacity-90">
                No puedes completar pedidos en este momento. {nextOpenTime && `Volvemos ${nextOpenTime}`}
              </p>
            </div>
          </div>
        </div>
      )}

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
              <div className="space-y-4">
                <Tabs
                  value={tipoEntrega}
                  onValueChange={(v) => {
                    setTipoEntrega(v as "Retiro" | "Domicilio");

                    if (v === "Retiro") {
                      setCliente({ telefono: "N/A", direccion: "Retira en local" });
                    } else {
                      setCliente({ telefono: "", direccion: "" });
                    }
                  }}
                >
                  <TabsList className="w-full bg-[#1b1b1b] rounded-xl p-1 flex">
                    <TabsTrigger
                      value="Retiro"
                      className="flex-1 data-[state=active]:bg-black data-[state=active]:text-white text-gray-400"
                    >
                      Para retirar
                    </TabsTrigger>

                    <TabsTrigger
                      value="Domicilio"
                      className="flex-1 data-[state=active]:bg-black data-[state=active]:text-white text-gray-400"
                    >
                      Entrega a domicilio
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <AnimatePresence mode="wait">
                  {tipoEntrega === 'Domicilio' && (
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
                          disabled={submitting || !isOpen}
                          onChange={(e) =>
                            setCliente({ ...cliente, telefono: e.target.value })
                          }
                          required={tipoEntrega === 'Domicilio'}
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
                          disabled={submitting || !isOpen}
                          onChange={(e) =>
                            setCliente({ ...cliente, direccion: e.target.value })
                          }
                          required={tipoEntrega === 'Domicilio'}
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
                        disabled={submitting || !isOpen}
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
                        disabled={submitting || !isOpen}
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
                          disabled={submitting || !isOpen}
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
                    disabled={submitting || !isOpen}
                    className="bg-background"
                  />
                </div>

                <Button
                  type={!mpReady ? "button" : "button"}
                  className={`w-full text-primary-foreground ${mpReady ? "bg-[rgb(99,159,236)] hover:bg-[rgb(127,180,248)]" : "bg-primary hover:bg-primary/90"
                    }`}
                  disabled={submitting || !isOpen}
                  onClick={(e) => {
                    if (mpReady) {
                      Payment();
                    } else {
                      handleSubmit(e);
                    }
                  }}
                >
                  {!isOpen
                    ? "Tienda Cerrada"
                    : mpReady
                      ? "Pagar"
                      : submitting
                        ? "Cargando..."
                        : "Confirmar Pedido"}
                </Button>


              </div>
            </CardContent>
          </Card>

          {/* Resumen del pedido (sin cambios) */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">

                {Object.entries(
                  cart.reduce((acc, item) => {
                    const categoryId = item.productoOriginal.idCategoria || 0;
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

                      <div className="space-y-6">
                        {items.map((item) => {
                          const adicionalesFiltrados = item.adicionalesSeleccionados?.filter(a => a.cantidad > 0) || [];

                          return (
                            <div key={item.cartId} className="grid grid-cols-[56px_1fr_auto] gap-x-4 gap-y-1 items-start">
                              <div className="row-span-4">
                                <div className="h-14 w-14 overflow-hidden rounded-md bg-muted">
                                  {item.productoOriginal.url_imagen ? (
                                    <img
                                      src={item.productoOriginal.url_imagen}
                                      alt={item.productoOriginal.nombre}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-2xl">🍽️</div>
                                  )}
                                </div>
                              </div>

                              <p className="text-xl font-medium text-foreground">
                                {item.productoOriginal.nombre}
                              </p>
                              <div></div>

                              {item.guarnicionSeleccionada && (
                                <>
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">Guarnición:</span>{" "}
                                    {item.guarnicionSeleccionada.nombre}
                                  </p>
                                  <div></div>
                                </>
                              )}

                              <p className="text-base text-muted-foreground">
                                {item.tamSeleccionado?.nombre ?? "Sin tamaño"} x{item.cantidad}
                              </p>
                              <p className="text-right text-base text-muted-foreground">
                                ${item.tamSeleccionado?.precioFinal?.toFixed(2) ?? "0.00"}
                              </p>

                              {adicionalesFiltrados.length > 0 && (
                                <>
                                  <ul className="ml-4 list-disc text-sm text-muted-foreground space-y-0.5">
                                    {adicionalesFiltrados.map((ad) => (
                                      <li key={ad.id}>{ad.nombre} x{ad.cantidad}</li>
                                    ))}
                                  </ul>

                                  <ul className="text-right text-sm text-muted-foreground space-y-0.5">
                                    {adicionalesFiltrados.map((ad) => (
                                      <li key={ad.id}>${(ad.precio * ad.cantidad).toFixed(2)}</li>
                                    ))}
                                  </ul>
                                </>
                              )}
                            </div>
                          );
                        })}
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