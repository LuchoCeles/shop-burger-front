import { ShoppingCart, User, DoorOpen, KeyRound, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { useState } from 'react';
import CartModal from './CartModal';

const Navbar = () => {
  const { itemCount } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const [showCart, setShowCart] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg select-none">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2" draggable={false}>
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Gourmet
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <div className="btn-container">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setShowCart(true)}
                >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {itemCount}
                  </span>
                )}
              </Button>
              <span className="tooltip">Carrito</span>
              </div>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link to="/admin" >
                    <div className="btn-container">
                      <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                      </Button>
                      <span className="tooltip">Panel de administración</span>
                    </div>
                  </Link>
                  <div className="btn-container">
                  <Button variant="ghost" onClick={logout} className="text-sm">
                    <DoorOpen className="h-5 w-5" />
                  </Button>
                  <span className="tooltip">Cerrar Sesión</span>
                  </div>
                </div>
              ) : (
                <Link to="/login">
                  <div className="btn-container">
                  <Button variant="ghost" size="icon">
                      <KeyRound className="h-5 w-5" />
                  </Button>
                  <span className="tooltip">Iniciar Sesión</span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <CartModal open={showCart} onOpenChange={setShowCart} />
    </>
  );
};

export default Navbar;
