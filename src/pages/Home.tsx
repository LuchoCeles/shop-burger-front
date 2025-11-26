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
    try {
      const [productsData, categoriesData] = await Promise.all([
        ApiService.getProducts(true),
        ApiService.getCategories(),
      ]);
      setProducts(Array.isArray(productsData.data) ? productsData.data : []);
      setCategories(Array.isArray(categoriesData.data) ? categoriesData.data : []);
    } catch (error) {
      toast.error('Error al cargar los datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Mapa de categorías por id para lookup rápido
  const categoriesById = useMemo(() => {
    const map = new Map<number, Category>();
    categories.forEach((c) => {
      if (c?.id != null) map.set(Number(c.id), c);
    });
    return map;
  }, [categories]);

  // Normaliza la condición "activo": undefined => true, false => false
  const isActive = (flag?: boolean) => (flag === undefined ? true : Boolean(flag));

  // Agrupar productos por categoría (incluye "Sin categoría" si corresponde)
  const productosPorCategoria = useMemo(() => {
    // Filtramos primero los productos activos
    const activeProducts = products.filter((p) => isActive(p.estado));

    // Construyo un map idCategoria -> productos
    const map = new Map<number | 'none', Product[]>();

    for (const p of activeProducts) {
      const catId = p.idCategoria != null ? Number(p.idCategoria) : 'none';
      // Ignoro productos cuyo objeto categoria indique que está desactivada (si existe)
      if (p.categoria && !isActive(p.categoria.estado)) continue;

      if (!map.has(catId)) map.set(catId, []);
      map.get(catId)!.push(p);
    }

    // Convertir a array con orden: las categorías existentes primero (según categories),
    // luego la sección "Sin categoría" si existe.
    const result: Array<{ id: number | 'none'; nombre: string; productos: Product[] }> = [];

    // Añadir cada categoría (solo si corresponde) manteniendo orden de categories
    for (const cat of categories) {
      const catProducts = map.get(Number(cat.id)) || [];
      result.push({
        id: Number(cat.id),
        nombre: cat.nombre,
        productos: catProducts,
      });
      // quitar del map para no duplicar
      map.delete(Number(cat.id));
    }

    // Si quedaron productos con categoría inexistente / null -> los agrupamos en 'Sin categoría'
    if (map.has('none')) {
      result.push({
        id: 'none',
        nombre: 'Sin categoría',
        productos: map.get('none') || [],
      });
      map.delete('none');
    }

    // Si quedaron productos con category ids que no estaban en categories (map keys numéricas),
    // agruparlos por su id (nombre fallback)
    for (const [key, prods] of map.entries()) {
      if (typeof key === 'number') {
        const cat = categoriesById.get(key);
        result.push({
          id: key,
          nombre: cat ? cat.nombre : `Categoría ${key}`,
          productos: prods,
        });
      }
    }

    return result;
  }, [products, categories, categoriesById]);

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
            onSelectCategory={setSelectedCategory}
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
              {/* Si hay una categoría seleccionada, mostramos solo esa sección */}
              {selectedCategory ? (
                productosPorCategoria
                  .filter((cat) => cat.id === selectedCategory)
                  .map((cat) => (
                    <div key={String(cat.id)} className="mb-12">
                      <h2 className="mb-4 text-2xl font-bold text-foreground">
                        {cat.nombre}
                      </h2>

                      {cat.productos.length === 0 ? (
                        <p className="text-muted-foreground">
                          No hay productos disponibles en esta categoría.
                        </p>
                      ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {cat.productos.map((product) => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                // Si NO hay categoría seleccionada → mostramos todas las secciones
                productosPorCategoria.map((cat) => (
                  <div key={String(cat.id)} className="mb-12">
                    <h2 className="mb-4 text-2xl font-bold text-foreground">
                      {cat.nombre}
                    </h2>

                    {cat.productos.length === 0 ? (
                      <p className="text-muted-foreground text-sm italic">
                        Sin productos disponibles.
                      </p>
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