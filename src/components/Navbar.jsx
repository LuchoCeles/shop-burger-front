import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { ChefHat, ShoppingCart } from 'lucide-react';

const Navbar = () => {
  const { getItemsCount, toggleCart } = useCart();
  const itemsCount = getItemsCount();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - No clickable */}
          <div className="flex items-center space-x-2 font-bold text-xl">
            <ChefHat className="w-8 h-8 text-primary" />
            <span>Burger House</span>
          </div>

          {/* Cart Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleCart}
            className="relative"
          >
            <ShoppingCart className="w-4 h-4" />
            {itemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {itemsCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;