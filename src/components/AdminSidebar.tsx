import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, FolderKanban, ShoppingBag, Settings, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from './ui/sidebar';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Productos', path: '/admin/productos' },
  { icon: FolderKanban, label: 'Categorías', path: '/admin/categorias' },
  { icon: Plus, label: 'Adicionales', path: '/admin/adicionales' },
  { icon: ShoppingBag, label: 'Pedidos', path: '/admin/pedidos' },
  { icon: Settings, label: 'Configuración', path: '/admin/configuracion' },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-16 items-center px-4 border-b border-border">
          <h2 className={cn(
            "font-bold text-foreground transition-all",
            isCollapsed ? "text-sm" : "text-xl"
          )}>
            {isCollapsed ? 'AP' : 'Admin Panel'}
          </h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive}>
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
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="space-y-2 p-2">
          <div className="rounded-lg bg-muted p-3">
            {!isCollapsed && (
              <>
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.nombre?.toUpperCase()}
                </p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </>
            )}
            {isCollapsed && (
              <p className="text-xs font-medium text-foreground text-center">
                {user?.nombre?.charAt(0).toUpperCase()}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate('/')}
            onAuxClick={(e) => {
              if (e.button === 1) {
                window.open('/', '_blank');
              }
            }}
          >
            {!isCollapsed && 'Volver a la tienda'}
            {isCollapsed && '🏪'}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Cerrar Sesión</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
