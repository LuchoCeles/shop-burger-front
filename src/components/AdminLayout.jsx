import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ChefHat, 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Tags, 
  LogOut, 
  Menu, 
  X,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({
      title: "Sesión cerrada",
      description: "Has salido del panel administrativo",
    });
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Gestionar Menú', path: '/admin/menu', icon: Package },
    { name: 'Pedidos', path: '/admin/ordenes', icon: ShoppingCart },
    { name: 'Categorías', path: '/admin/categorias', icon: Tags }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen bg-background flex overflow-hidden fixed inset-0">
      {/* Sidebar - Ocupa todo el alto de la pantalla sin scroll */}
      {sidebarOpen && (
        <div className="w-64 bg-card border-r flex-shrink-0 h-full overflow-hidden">
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-6 border-b flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <ChefHat className="w-8 h-8 text-primary" />
                <span className="font-bold text-lg">Admin Panel</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* User info */}
            <div className="px-6 py-4 border-b flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.name || 'Administrador'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || 'admin@burger.com'}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive(item.path) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-foreground/60 hover:text-foreground hover:bg-accent'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer actions */}
            <div className="p-4 border-t space-y-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full justify-start"
              >
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Ver Sitio Web
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-destructive hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content - Se expande cuando la sidebar está cerrada */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 flex-shrink-0">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          
          <div className="flex-1" />
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Panel Administrativo
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;