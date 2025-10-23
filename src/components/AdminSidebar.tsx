import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, FolderKanban, ShoppingBag, Settings, LogOut, Plus, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
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
    <Sidebar collapsible="icon" className="bg-secondary">
      <SidebarHeader className="bg-secondary">
        <div className="flex h-16 items-center px-4 border-b border-border">
          <h2 className={cn(
            "font-bold text-foreground transition-all duration-300",
            isCollapsed ? "text-sm text-left" : "text-xl"
          )}>
            {isCollapsed ? 'AP' : 'Admin Panel'}
          </h2>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-secondary">
        <SidebarGroup className="bg-secondary">
          <SidebarGroupContent className="bg-secondary">
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.path}>
                        <Button
                          variant="ghost"
                          className={cn(
                            isCollapsed
                              ? 'justify-center px-2'
                              : 'w-full justify-start px-4',
                            isActive && 'bg-primary text-primary-foreground hover:bg-primary/90',
                            'transition-all duration-300'
                          )}
                        >
                          <Icon className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "h-5 w-5 mr-2")} />
                          {!isCollapsed && (
                            <span className="truncate">{item.label}</span>
                          )}
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

      <SidebarFooter className="bg-secondary">
        <div className="space-y-2 bg-secondary">
          <div className={cn(
            "border-t border-border space-y-2 flex-shrink-0 transition-all duration-300",
            isCollapsed ? "p-2" : "p-4"
          )}>
            {!isCollapsed && (
              <div className={cn("rounded-lg bg-muted transition-all duration-200", isCollapsed ? "p-2" : "p-3")}>
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.nombre?.toUpperCase()}
                </p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </div>)}
            <Button
              variant="ghost"
              className={cn("w-full transition-all duration-200", isCollapsed ? "justify-center px-0" : "justify-start")}
              onClick={() => navigate('/')}
              onAuxClick={(e) => {
                if (e.button === 1) {
                  window.open('/', '_blank');
                }
              }}
            >
              {!isCollapsed && 'Volver a la tienda'}
              {isCollapsed && <Home className="h-4 w-4" />}
            </Button>
          </div>

          <div className={cn("border-t border-border transition-all duration-500", isCollapsed ? "p-2" : "p-4")}>
            <Button
              variant="outline"
              className={cn(
                "w-full transition-all duration-200",
                isCollapsed ? "justify-center px-0" : "justify-start"
              )}
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Cerrar Sesión</span>}
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
