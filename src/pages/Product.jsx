import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Minus, ShoppingCart, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CartWidget from '@/components/CartWidget';
import { useCart } from '@/contexts/CartContext';
import apiService from '@/services/api';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await apiService.getProduct(id);
      setProduct(data.product);
    } catch (error) {
      console.error('Error loading product:', error);
      // Mock data for development
      setProduct(mockProduct);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      setQuantity(1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
            <Button asChild>
              <Link to="/menu">Volver a la carta</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const images = [product.url_imagen];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartWidget />
      
      <main className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                <img
                  src={images[selectedImage]}
                  alt={product.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                        selectedImage === index
                          ? 'border-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.nombre} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.categoria && (
                    <Badge variant="secondary">{product.categoria}</Badge>
                  )}
                  {isOutOfStock && (
                    <Badge variant="destructive">Sin Stock</Badge>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold mb-4">{product.nombre}</h1>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl font-bold text-primary">
                    ${product.precio?.toFixed(2)}
                  </div>
                  
                  {product.rating && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                  )}
                </div>
              </div>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Descripción</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.descripcion}
                  </p>
                </CardContent>
              </Card>

              {/* Add to Cart */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {!isOutOfStock && (
                      <div className="flex items-center space-x-4">
                        <span className="font-medium">Cantidad:</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          
                          <span className="font-medium w-12 text-center">
                            {quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                            disabled={quantity >= product.stock}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {product.stock > 0 && (
                          <span className="text-sm text-muted-foreground">
                            ({product.stock} disponibles)
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <Button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className="flex-1 bg-gradient-to-r from-[hsl(var(--burger-orange))] to-[hsl(var(--burger-yellow))] hover:shadow-[var(--shadow-burger)]"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {isOutOfStock ? 'Sin Stock' : `Agregar al carrito - $${(product.price * quantity).toFixed(2)}`}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Mock data for development
const mockProduct = {
  id: 1,
  name: 'Hamburguesa Clásica',
  description: 'Nuestra hamburguesa clásica con carne de res 100% argentina, lechuga fresca, tomate, cebolla, pickles y nuestra salsa especial en pan brioche artesanal. Una combinación perfecta de sabores tradicionales que te transportará al sabor auténtico de las hamburguesas caseras.',
  price: 12.99,
  category: 'Clásicas',
  image: '/api/placeholder/600/400',
  images: [
    '/api/placeholder/600/400',
    '/api/placeholder/600/401',
    '/api/placeholder/600/402'
  ],
  stock: 10,
  rating: 4.8,
  reviews: 124,
  ingredients: ['Carne de res', 'Pan brioche', 'Lechuga', 'Tomate', 'Cebolla', 'Pickles', 'Salsa especial']
};

export default Product;