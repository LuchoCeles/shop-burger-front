import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { Product, CartItemAdicional } from "../intefaces/interfaz";
import AdicionalesModal from "./AdicionalesModal";

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const [showAdicionalesModal, setShowAdicionalesModal] = useState(false);
  const hasAdicionales = product.adicionales && product.adicionales.length > 0;

  const handleAddToCart = () => {
    if (product.stock !== undefined && product.stock <= 0) {
      toast.error("Producto sin stock");
      return;
    }

    if (hasAdicionales) {
      setShowAdicionalesModal(true);
    } else {
      const cartId = `${product.id}-${Date.now()}`;
      addToCart({
        id: product.id,
        cartId,
        nombre: product.nombre,
        precio: product.precio * (1 - product.descuento / 100),
        descuento: product.descuento,
        url_imagen: product.url_imagen,
        stock: product.stock,
        metodoDePago: "",
      });
      toast.success("Agregado al carrito");
    }
  };

  const handleAdicionalesConfirm = (adicionales: CartItemAdicional[]) => {
    const cartId = `${product.id}-${Date.now()}`;
    addToCart({
      id: product.id,
      cartId,
      nombre: product.nombre,
      precio: product.precio * (1 - product.descuento / 100),
      descuento: product.descuento,
      url_imagen: product.url_imagen,
      stock: product.stock,
      adicionales,
      metodoDePago: "",
    });
    toast.success("Agregado al carrito con adicionales");
  };

  return (
    <Card className="group flex flex-col border-border bg-card transition-all hover:shadow-xl hover:shadow-primary/10 min-h-[460px]">

      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden bg-muted rounded-t-xl">
        {product.url_imagen ? (
          <img
            src={product.url_imagen}
            alt={product.nombre}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-card">
            <span className="text-4xl text-muted-foreground">🍽️</span>
          </div>
        )}

        {product.descuento && Number(product.descuento) > 0 && (
          <div className="absolute top-4 -right-8 w-32 origin-center transform rotate-45 bg-red-500 text-white text-center shadow-lg">
            <span>-{Math.round(product.descuento)}%</span>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <CardContent className="flex flex-col justify-between flex-1 p-4">
        <div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            {product.nombre}
          </h3>

          {product.descripcion && (
            <p
              title={product.descripcion}
              className="relative mb-3 text-sm text-muted-foreground line-clamp-2 group-hover:line-clamp-none group-hover:h-auto min-h-[40px] h-[40px] overflow-hidden transition-all duration-300"
            >
              {product.descripcion}
            </p>
          )}
        </div>

        <p className="text-2xl font-bold text-primary mt-auto">
          $
          {new Intl.NumberFormat("es-AR", {
            style: "decimal",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(product.precio * (1 - product.descuento / 100))}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto flex flex-col items-start gap-1 min-h-[79px]">
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Agregar al carrito
        </Button>

        {product.stock !== undefined && product.stock <= 5 && (
          <p className="text-xs text-destructive mt-auto">
            {product.stock === 0
              ? "Sin stock"
              : `Últimas ${product.stock} unidades`}
          </p>
        )}
      </CardFooter>

      <AdicionalesModal
        open={showAdicionalesModal}
        onOpenChange={setShowAdicionalesModal}
        Product={product}
        onConfirm={handleAdicionalesConfirm}
      />
    </Card>
  );
};

export default ProductCard;
