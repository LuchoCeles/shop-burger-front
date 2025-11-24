import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { Product, Tamaños, Guarniciones, CartItemAdicional } from "../intefaces/interfaz";
import ProductConfigModal from "./ProductConfigModal";

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const [showConfigModal, setShowConfigModal] = useState(false);

  // 🔥 NUEVO: función que decide si abrir modal
  const shouldOpenModal = (product: Product) => {
    const hasTamaños = product.tam && product.tam.length > 0;
    const hasGuarniciones = product.guarniciones && product.guarniciones.length > 0;
    const hasAdicionales = product.adicionales && product.adicionales.length > 0;

    // No tiene nada
    if (!hasTamaños && !hasGuarniciones && !hasAdicionales) return false;

    // Solo 1 tamaño y nada más
    if (hasTamaños && product.tam.length === 1 && !hasGuarniciones && !hasAdicionales) {
      return false;
    }

    return true;
  };

  const handleAddToCart = () => {
    if (product.stock !== undefined && product.stock <= 0) {
      toast.error("Producto sin stock");
      return;
    }

    // 🔥 Evitar modal si no corresponde
    if (!shouldOpenModal(product)) {
      const cartId = `${product.id}-${Date.now()}`;

      // autoConfig si tiene 1 tamaño
      const autoConfigTamaño = product.tam?.length === 1 ? product.tam[0] : undefined;

      const precioBase = product.precio * (1 - (product.descuento || 0) / 100);
      const precioFinal = autoConfigTamaño?.precio
        ? precioBase + autoConfigTamaño.precio
        : precioBase;

      addToCart({
        id: product.id,
        cartId,
        nombre: product.nombre,
        precio: precioFinal,
        descuento: product.descuento,
        idCategoria: product.idCategoria,
        url_imagen: product.url_imagen,
        stock: product.stock,
        tam: autoConfigTamaño,
        guarnicion: undefined,
        adicionales: [],
        metodoDePago: "",
      });

      toast.success("Agregado al carrito");
      return;
    }

    // 🔥 Si tiene opciones: abrir modal
    setShowConfigModal(true);
  };

  const handleConfigConfirm = (config: {
    tam?: Tamaños;
    guarnicion?: Guarniciones;
    adicionales: CartItemAdicional[];
  }) => {
    const cartId = `${product.id}-${Date.now()}`;

    let precioFinal = product.precio * (1 - (product.descuento || 0) / 100);

    if (config.tam?.precio) precioFinal += config.tam.precio;

    addToCart({
      id: product.id,
      cartId,
      nombre: product.nombre,
      precio: precioFinal,
      descuento: product.descuento,
      stock: product.stock,
      idCategoria: product.idCategoria,
      url_imagen: product.url_imagen,
      tam: config.tam,
      guarnicion: config.guarnicion,
      adicionales: config.adicionales,
      metodoDePago: "",
    });

    toast.success("Agregado al carrito");
  };

  const previewPrice = (() => {
    const base = Number(product.precio || 0) * (1 - (Number(product.descuento || 0) / 100));
    const tamPrecio = product.tam && product.tam.length > 0 ? Number(product.tam[0].precio || 0) : 0;
    return base + tamPrecio;
  })();

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

      {/* Contenido */}
      <CardContent className="flex flex-col justify-between flex-1 p-4">
        <div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">{product.nombre}</h3>

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

          {new Intl.NumberFormat('es-AR', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(previewPrice)}

        </p>
      </CardContent>

      {/* Footer */}
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
            {product.stock === 0 ? "Sin stock" : `Últimas ${product.stock} unidades`}
          </p>
        )}
      </CardFooter>

      {/* Modal */}
      <ProductConfigModal
        open={showConfigModal}
        onOpenChange={setShowConfigModal}
        product={product}
        onConfirm={handleConfigConfirm}
      />
    </Card>
  );
};

export default ProductCard;