import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, FolderKanban, ShoppingBag, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Productos', path: '/admin/productos' },
    { icon: FolderKanban, label: 'Categorías', path: '/admin/categorias' },
    { icon: ShoppingBag, label: 'Pedidos', path: '/admin/pedidos' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="flex h-16 items-center border-b border-border px-6">
          <h2 className="text-xl font-bold text-foreground">Admin Panel</h2>
        </div>

        <nav className="space-y-2 p-4 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start',
                    isActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="mb-2 rounded-lg bg-muted p-4">
            <p className="text-sm font-medium text-foreground">
              {user?.nombre?.toUpperCase()}
            </p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
          <Button
            onAuxClick={(e) => {
              if (e.button === 1) {
                window.open('/', '_blank');
              }
            }}
            onClick={() => navigate('/')}
            variant="ghost"
            className="w-full"
          >
            Volver a la tienda
          </Button>
        </div>

        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>

      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
