import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ProductCard = ({ product, onAddToCart }) => {
  const isOutOfStock = product.stock === 0;

  return (
    <Card className="group overflow-hidden hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-video relative overflow-hidden bg-muted">
        <img
          src={product.url_imagen}
          alt={product.nombre}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />

        {/* Stock badge */}
        {isOutOfStock && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Sin Stock
          </Badge>
        )}

        {/* Category badge */}
        {product.categoria && (
          <Badge variant="secondary" className="absolute top-2 left-2">
            {product.categoria}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">
          {product.nombre}
        </h3>

        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {product.descripcion}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">
            ${product.precio}
          </div>

          {product.stock > 0 && (
            <div className="text-xs text-muted-foreground">
              {product.stock} disponibles
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          size="lg"
          onClick={onAddToCart}
          disabled={isOutOfStock}
          className="w-full bg-gradient-to-r from-[hsl(var(--burger-orange))] to-[hsl(var(--burger-yellow))] hover:shadow-[var(--shadow-burger)]"
        >
          {isOutOfStock ? 'Sin Stock' : 'Agregar al Carrito'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;