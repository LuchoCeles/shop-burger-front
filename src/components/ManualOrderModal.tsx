import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Search, ShoppingCart, X } from 'lucide-react';
import { toast } from 'sonner';
import ApiService from '@/services/api';
import { Product, Category, CartItem, Cliente } from '@/intefaces/interfaz';
import ProductCard from './ProductCard';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ManualOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: () => void;
}

const ManualOrderModal = ({ open, onOpenChange, onOrderCreated }: ManualOrderModalProps) => {
  const { cart, total, clearCart, removeFromCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Datos del cliente
  const [cliente, setCliente] = useState<Cliente>({
    telefono: '',
    direccion: '',
  });
  const [descripcion, setDescripcion] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState<'Retiro' | 'Domicilio'>('Retiro');
  const [metodoDePago, setMetodoDePago] = useState<'Efectivo' | 'Transferencia'>('Efectivo');

  // Step: 'products' o 'checkout'
  const [step, setStep] = useState<'products' | 'checkout'>('products');

  useEffect(() => {
    if (open) {
      loadData();
      setStep('products');

      // Reset INICIAL del cliente según tipo actual:
      if (tipoEntrega === 'Retiro') {
        setCliente({ telefono: 'N/A', direccion: 'Retira en local' });
      } else {
        setCliente({ telefono: '', direccion: '' });
      }
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (tipoEntrega === 'Retiro') {
      setCliente({ telefono: 'N/A', direccion: 'Retira en local' });
    } else {
      setCliente({ telefono: '', direccion: '' });
    }
  }, [tipoEntrega]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        ApiService.getProducts(),
        ApiService.getCategories(),
      ]);
      const prods = productsData.data ? productsData.data : [];
      const cats = categoriesData.data ? categoriesData.data : [];
      setProducts(prods);
      setCategories(cats);
    } catch (error) {
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const normalizeNumber = (v: any) => {
    if (v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };

  // Filtrar productos por categoría y búsqueda
  const filteredProducts = useMemo(() => {
    // Convertir estado numérico/string a boolean
    let filtered = products.filter((p) => {
      const est = p.estado;
      const enabled = est === true || est === 1 || est === "1";
      return enabled;
    });

    // Filtro por categoría
    if (selectedCategory !== null) {
      filtered = filtered.filter(
        (p) => normalizeNumber(p.idCategoria) === selectedCategory
      );
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) =>
        p.nombre.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  // Agrupar productos por categoría
  const productosPorCategoria = useMemo(() => {
    const map = new Map<number | 'none', Product[]>();

    for (const rawP of filteredProducts) {
      const idCat = normalizeNumber(rawP.idCategoria);
      const key = idCat === null ? 'none' : idCat;

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(rawP);
    }

    const result: Array<{ id: number | 'none'; nombre: string; productos: Product[] }> = [];

    for (const cat of categories) {
      const catId = normalizeNumber(cat.id);
      const productosParaEsta = catId != null ? map.get(catId) || [] : [];

      if (productosParaEsta.length > 0) {
        result.push({
          id: catId as number,
          nombre: cat.nombre ?? 'Sin nombre',
          productos: productosParaEsta,
        });
      }
      if (catId != null) map.delete(catId);
    }

    if (map.has('none') && map.get('none')!.length > 0) {
      result.push({
        id: 'none',
        nombre: 'Sin categoría',
        productos: map.get('none') || [],
      });
    }

    return result;
  }, [filteredProducts, categories]);

  const handleSubmit = async () => {
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
            .filter((ad) => ad.cantidad > 0 && ad.id !== null && ad.id !== undefined)
            .map((ad) => ({
              id: ad.id!,
              cantidad: ad.cantidad,
            })),
          idGuarnicion: item?.guarnicionSeleccionada?.id,
          idTam: item.tamSeleccionado?.id,
        })),
      };

      const response = await ApiService.createOrder(pedido);

      if (response.success) {
        toast.success('Pedido creado exitosamente');
        clearCart();
        onOrderCreated();
        onOpenChange(false);
        // Reset estados
        setStep('products');
        setCliente({ telefono: '', direccion: '' });
        setDescripcion('');
        setSelectedCategory(null);
        setSearchQuery('');
      } else {
        toast.error(response.message || 'Error al crear el pedido');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (cart.length > 0) {
      const confirm = window.confirm('Tienes productos en el carrito. ¿Estás seguro de cancelar?');
      if (!confirm) return;
      clearCart();
    }
    setStep('products');
    setCliente({ telefono: '', direccion: '' });
    setDescripcion('');
    setSelectedCategory(null);
    setSearchQuery('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">
              {step === 'products' ? 'Nuevo Pedido Manual' : 'Finalizar Pedido'}
            </DialogTitle>
            <div className="flex items-center gap-4">
              {step === 'products' && cart.length > 0 && (
                <Button
                  variant="default"
                  onClick={() => setStep('checkout')}
                  className="gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Ver Carrito ({cart.length})
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          {step === 'products' ? (
            <div className="py-6 space-y-6">
              {/* Filtros */}
              <div className="space-y-4">
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Categorías */}
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedCategory === null ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Todas
                  </Badge>
                  {categories.map((cat) => (
                    <Badge
                      key={cat.id}
                      variant={selectedCategory === cat.id ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {cat.nombre}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Productos */}
              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-96 animate-pulse rounded-lg bg-card" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No se encontraron productos</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {productosPorCategoria.map((cat) => (
                    <div key={String(cat.id)} className="space-y-4">
                      <h3 className="text-xl font-bold text-foreground">{cat.nombre}</h3>
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
                        {cat.productos.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Formulario */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Datos de entrega</h3>

                  <Tabs
                    value={tipoEntrega}
                    onValueChange={(v) => {
                      setTipoEntrega(v as 'Retiro' | 'Domicilio');
                      if (v === 'Retiro') {
                        setCliente({ telefono: 'N/A', direccion: 'Retira en local' });
                      } else {
                        setCliente({ telefono: '', direccion: '' });
                      }
                    }}
                  >
                    <TabsList className="w-full">
                      <TabsTrigger value="Retiro" className="flex-1">
                        Para retirar
                      </TabsTrigger>
                      <TabsTrigger value="Domicilio" className="flex-1">
                        Entrega a domicilio
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <AnimatePresence mode="wait">
                    {tipoEntrega === 'Domicilio' && (
                      <motion.div
                        key="domicilio-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="mb-2 block text-sm font-medium">Teléfono</label>
                          <Input
                            type="tel"
                            placeholder="+54 9 11 1234-5678"
                            value={cliente.telefono}
                            onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">Dirección</label>
                          <Input
                            type="text"
                            placeholder="Calle 123, Ciudad"
                            value={cliente.direccion}
                            onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Método de pago</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-accent">
                        <input
                          type="radio"
                          name="metodoDePago"
                          value="Efectivo"
                          checked={metodoDePago === 'Efectivo'}
                          onChange={(e) => setMetodoDePago(e.target.value as 'Efectivo')}
                          className="h-4 w-4"
                        />
                        <span>Efectivo</span>
                      </label>
                      <label className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-accent">
                        <input
                          type="radio"
                          name="metodoDePago"
                          value="Transferencia"
                          checked={metodoDePago === 'Transferencia'}
                          onChange={(e) => setMetodoDePago(e.target.value as 'Transferencia')}
                          className="h-4 w-4"
                        />
                        <span>Transferencia</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Notas adicionales (Opcional)</label>
                    <Textarea
                      placeholder="Instrucciones especiales..."
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                    />
                  </div>
                </div>

                {/* Resumen del carrito */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Resumen del pedido</h3>
                    <p className="text-sm text-muted-foreground">{cart.length} productos</p>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto border rounded-lg p-4">
                    {cart.map((item) => (
                      <div key={item.cartId} className="flex gap-3 pb-3 border-b last:border-0">
                        <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
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
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.productoOriginal.nombre}</p>
                          <p className="text-xs text-muted-foreground">Cantidad: {item.cantidad}</p>
                          {item.tamSeleccionado && (
                            <p className="text-xs text-muted-foreground">
                              Tamaño: {item.tamSeleccionado.nombre}
                            </p>
                          )}
                          {item.guarnicionSeleccionada && (
                            <p className="text-xs text-muted-foreground">
                              Guarnición: {item.guarnicionSeleccionada.nombre}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <p className="font-semibold text-sm">${item.tamSeleccionado?.precioFinal || item.productoOriginal.precio}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeFromCart(item.cartId)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg bg-primary/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t flex-row justify-between">
          {step === 'checkout' && (
            <Button variant="outline" onClick={() => setStep('products')}>
              Volver a productos
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            {step === 'checkout' && (
              <Button onClick={handleSubmit} disabled={submitting || cart.length === 0}>
                {submitting ? 'Creando...' : 'Crear Pedido'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManualOrderModal;