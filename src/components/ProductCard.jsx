import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
  const isOutOfStock = product.stock === 0;

  return (
    <Card className="group overflow-hidden hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-video relative overflow-hidden bg-muted">
        <img
          src={product.image || '/api/placeholder/300/200'}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Stock badge */}
        {isOutOfStock && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Sin Stock
          </Badge>
        )}
        
        {/* Category badge */}
        {product.category && (
          <Badge variant="secondary" className="absolute top-2 left-2">
            {product.category}
          </Badge>
        )}

        {/* Quick actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              asChild
              className="bg-white/90 hover:bg-white text-black"
            >
              <Link to={`/product/${product.id}`}>
                <Eye className="w-4 h-4 mr-1" />
                Ver
              </Link>
            </Button>
            
            {!isOutOfStock && (
              <Button
                size="sm"
                onClick={onAddToCart}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">
          {product.name}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">
            ${product.price?.toFixed(2)}
          </div>
          
          {product.stock > 0 && (
            <div className="text-xs text-muted-foreground">
              {product.stock} disponibles
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex space-x-2 w-full">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1"
          >
            <Link to={`/product/${product.id}`}>
              Ver Detalles
            </Link>
          </Button>
          
          <Button
            size="sm"
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className="flex-1 bg-gradient-to-r from-[hsl(var(--burger-orange))] to-[hsl(var(--burger-yellow))] hover:shadow-[var(--shadow-burger)]"
          >
            {isOutOfStock ? 'Sin Stock' : 'Agregar'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;