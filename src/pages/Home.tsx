import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import CategoryCarousel from '../components/CategoryCarousel';
import ProductCard from '../components/ProductCard';
import StoreClosedModal from '../components/StoreClosedModal';
import ApiService from '../services/api';
import { toast } from 'sonner';
import { Product, Category } from '../intefaces/interfaz';
import { MessageCircle, Instagram, Facebook } from 'lucide-react';
import { CategoryCarouselSkeleton, ProductGridSkeleton } from '../components/skeletons';
import { Skeleton } from '../components/ui/skeleton';
import { useStoreStatus } from '../hooks/useStoreStatus';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showClosedModal, setShowClosedModal] = useState(false);

  // Hook para verificar el estado de la tienda
  const { isOpen, nextOpenTime, currentDay, loading: statusLoading } = useStoreStatus();

  useEffect(() => {
    loadData();
  }, []);

  // Mostrar modal si la tienda está cerrada (solo la primera vez)
  useEffect(() => {
    if (!statusLoading && !isOpen && !sessionStorage.getItem('closedModalShown')) {
      setShowClosedModal(true);
      sessionStorage.setItem('closedModalShown', 'true');
    }
  }, [isOpen, statusLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        ApiService.getProducts(true),
        ApiService.getCategories(),
      ]);
      const prods = Array.isArray(productsData.data) ? productsData.data : [];
      const cats = Array.isArray(categoriesData.data) ? categoriesData.data : [];

      setProducts(prods);
      setCategories(cats);
      setInitialLoading(false);
    } catch (error) {
      toast.error('Error al cargar los datos');
      console.error('loadData error', error);
    } finally {
      setLoading(false);
    }
  };

  const normalizeNumber = (v: any) => {
    if (v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };

  const productosPorCategoria = useMemo(() => {
    const map = new Map<number | 'none', Product[]>();

    for (const rawP of products) {
      const idCat = normalizeNumber((rawP as any).idCategoria);
      const key = idCat === null ? 'none' : idCat;
      if (rawP.estado === false) continue;

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(rawP);
    }

    const result: Array<{ id: number | 'none'; nombre: string; estado: boolean; productos: Product[] }> = [];

    for (const cat of categories) {
      const catId = normalizeNumber(cat.id) ?? undefined;
      const productosParaEsta = catId != null ? map.get(catId) || [] : [];
      result.push({
        id: catId as number,
        nombre: cat.nombre ?? 'Sin nombre',
        estado: cat.estado !== false,
        productos: productosParaEsta,
      });
      if (catId != null) map.delete(catId);
    }

    if (map.has('none')) {
      result.push({
        id: 'none',
        nombre: 'Sin categoría',
        estado: true,
        productos: map.get('none') || [],
      });
      map.delete('none');
    }

    for (const [k, prods] of map.entries()) {
      if (typeof k === 'number') {
        result.push({
          id: k,
          nombre: `Categoría ${k}`,
          estado: true,
          productos: prods,
        });
      }
    }

    return result;
  }, [products, categories]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Modal de tienda cerrada */}
      <StoreClosedModal
        isOpen={showClosedModal}
        onClose={() => setShowClosedModal(false)}
        nextOpenTime={nextOpenTime}
        currentDay={currentDay}
      />

      {/* Banner de tienda cerrada (sticky) */}
      {!statusLoading && !isOpen && (
        <div className="sticky top-0 z-40 bg-destructive text-destructive-foreground py-3 px-4 text-center">
          <p className="text-sm font-medium">
            ⚠️ La tienda está cerrada. {nextOpenTime && `Volvemos ${nextOpenTime}`}
          </p>
        </div>
      )}

      <main className="container mx-auto px-4 py-8 select-none">
        <section className="mb-12">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              Bienvenido a{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Gourmet
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Descubre nuestra selección de productos premium
            </p>
          </div>

          <CategoryCarousel
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(val) => {
              if (val === selectedCategory) setSelectedCategory(null);
              else setSelectedCategory(val);
            }}
          />
        </section>

        <section>
          {initialLoading ? (
            <>
              <div className="mb-8">
                <CategoryCarouselSkeleton />
              </div>
              <Skeleton className="h-8 w-40 mb-4" />
              <ProductGridSkeleton count={8} />
            </>
          ) : (
            <>
              {selectedCategory ? (
                productosPorCategoria
                  .filter((cat) => cat.id === selectedCategory && cat.estado === true)
                  .map((cat) => (
                    <div key={String(cat.id)} className="mb-12">
                      <h2 className="mb-4 text-2xl font-bold text-foreground">{cat.nombre}</h2>

                      {cat.productos.length === 0 ? (
                        <p className="text-muted-foreground text-sm italic">Sin productos disponibles.</p>
                      ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
                          {cat.productos.map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              disabled={!isOpen}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                productosPorCategoria
                  .filter((cat) => cat.estado === true && cat.productos.length > 0)
                  .map((cat) => (
                    <div key={String(cat.id)} className="mb-12">
                      <h2 className="mb-4 text-2xl font-bold text-foreground">{cat.nombre}</h2>

                      {cat.productos.length === 0 ? (
                        <p className="text-muted-foreground text-sm italic">Sin productos disponibles.</p>
                      ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
                          {cat.productos.map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              disabled={!isOpen}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))
              )}
            </>
          )}
        </section>
      </main>

      <footer className="border-t border-border bg-card py-8 select-none">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:items-start">
            <div className="text-sm text-muted-foreground">
              <p>&copy; 2025 Gourmet. Todos los derechos reservados.</p>
            </div>
            <div className="flex items-center gap-9">
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                draggable={false}
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">WhatsApp</span>
              </a>
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                draggable={false}
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
                <span className="text-sm">Instagram</span>
              </a>
              <a
                href="https://facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                draggable={false}
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
                <span className="text-sm">Facebook</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;