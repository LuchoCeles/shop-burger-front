import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { Product } from '../intefaces/interfaz';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, cart } = useCart();

  const handleAddToCart = () => {
    if (product.stock !== undefined && product.stock <= 0) {
      toast.error('Producto sin stock');
      return;
    }
    // Verificar si ya está en el carrito y validar stock
    const itemInCart = cart.find(item => item.id === product.id);
    if (itemInCart && product.stock !== undefined && itemInCart.cantidad >= product.stock) {
      toast.error(`Solo hay ${product.stock} unidades disponibles`);
      return;
    }
    addToCart({
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      url_imagen: product.url_imagen,
      stock: product.stock,
    });
    toast.success('Agregado al carrito');
  };

  return (
    <Card className="group overflow-hidden border-border bg-card transition-all hover:shadow-xl hover:shadow-primary/10">
      <div className="aspect-square overflow-hidden bg-muted">
        {product.url_imagen ? (
          <img
            src={product.url_imagen}
            alt={product.nombre}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-card">
            <span className="text-4xl text-muted-foreground">🍽️</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="mb-2 text-lg font-semibold text-foreground">{product.nombre}</h3>
        {product.descripcion && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{product.descripcion}</p>
        )}
        <p className="text-2xl font-bold text-primary">${product.precio}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Agregar al carrito
        </Button>
      </CardFooter>
      <div className="ml-4 mb-4 flex">
        {product.stock !== undefined && product.stock <= 5 && (
          <p className="mt-1 text-xs text-destructive">
            {product.stock === 0 ? 'Sin stock' : `Últimas ${product.stock} unidades`}
          </p>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;
