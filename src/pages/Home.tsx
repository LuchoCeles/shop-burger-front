import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import CategoryCarousel from '../components/CategoryCarousel';
import ProductCard from '../components/ProductCard';
import ApiService from '../services/api';
import { toast } from 'sonner';
import { Product, Category } from '../intefaces/interfaz';
import { MessageCircle, Instagram, Facebook } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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
    } catch (error) {
      toast.error('Error al cargar los datos');
      console.error('loadData error', error);
    } finally {
      setLoading(false);
    }
  };

  // Normaliza números (id string -> number) y evita undefined
  const normalizeNumber = (v: any) => {
    if (v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };

  // Agrupar productos por categoría con reglas simples y robustas
  const productosPorCategoria = useMemo(() => {
    // Map idCategoria -> productos
    const map = new Map<number | 'none', Product[]>();

    for (const rawP of products) {
      // normalizar idCategoria (puede venir string o number)
      const idCat = normalizeNumber((rawP as any).idCategoria);
      const key = idCat === null ? 'none' : idCat;
      // solo productos con estado true (si backend no filtra, lo controlamos)
      if (rawP.estado === false) continue;

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(rawP);
    }

    // Resultado: para cada categoría oficial (orden de categories), sacamos sus productos
    const result: Array<{ id: number | 'none'; nombre: string; estado: boolean; productos: Product[] }> = [];

    // recorrer categorías en el orden que vino el backend
    for (const cat of categories) {
      const catId = normalizeNumber(cat.id) ?? undefined;
      // si category.id no es number, lo saltamos (pero raro)
      const productosParaEsta = catId != null ? map.get(catId) || [] : [];
      result.push({
        id: catId as number,
        nombre: cat.nombre ?? 'Sin nombre',
        estado: cat.estado !== false, // undefined -> true, false -> false
        productos: productosParaEsta,
      });
      // quitamos del mapa la key para no duplicar
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

      <main className="container mx-auto px-4 py-8">
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
              // si se hace toggle: volver a null
              if (val === selectedCategory) setSelectedCategory(null);
              else setSelectedCategory(val);
            }}
          />
        </section>

        <section>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-lg bg-card" />
              ))}
            </div>
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
                            <ProductCard key={product.id} product={product} />
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
                            <ProductCard key={product.id} product={product} />
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

      <footer className="border-t border-border bg-card py-8">
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
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">WhatsApp</span>
              </a>
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
                <span className="text-sm">Instagram</span>
              </a>
              <a
                href="https://facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
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