import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, FolderKanban, ShoppingBag, Settings, LogOut, Plus, Home, Timer, ChevronDown, UtensilsCrossed, Ruler } from 'lucide-react';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { cn } from '@/lib/utils';

const productMenuItems = [
  { icon: Package, label: 'Productos', path: '/admin/productos' },
  { icon: FolderKanban, label: 'Categorías', path: '/admin/categorias' },
  { icon: Ruler, label: 'Tamaños', path: '/admin/tamaños' },
  { icon: UtensilsCrossed, label: 'Guarniciones', path: '/admin/guarniciones' },
  { icon: Plus, label: 'Adicionales', path: '/admin/adicionales' },
];

const otherMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: ShoppingBag, label: 'Pedidos', path: '/admin/pedidos' },
  { icon: Timer, label: 'Horarios', path: '/admin/horarios' },
  { icon: Settings, label: 'Configuración', path: '/admin/configuracion' },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isCollapsed = state === 'collapsed';

  // Check if current path is in product section
  const isInProductSection = productMenuItems.some(item => location.pathname === item.path);
  const [productMenuOpen, setProductMenuOpen] = useState(isInProductSection);

  const renderMenuItem = (item: { icon: any; label: string; path: string }, nested = false) => {
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
                nested && !isCollapsed && 'pl-8',
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
  };

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
              {/* Dashboard */}
              {renderMenuItem(otherMenuItems[0])}

              {/* Products Collapsible Group */}
              <Collapsible open={productMenuOpen} onOpenChange={setProductMenuOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full transition-all duration-300",
                        isCollapsed ? 'justify-center px-2' : 'justify-start px-4',
                        isInProductSection && !productMenuOpen && 'bg-primary/20'
                      )}
                    >
                      <Package className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "h-5 w-5 mr-2")} />
                      {!isCollapsed && (
                        <>
                          <span className="truncate flex-1 text-left">Items</span>
                          <ChevronDown className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            productMenuOpen && "rotate-90"
                          )} />
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </SidebarMenuItem>

                <CollapsibleContent className="space-y-1">
                  {productMenuItems.map((item) => renderMenuItem(item, true))}
                </CollapsibleContent>
              </Collapsible>

              {/* Other menu items (Pedidos, Horarios, Configuración) */}
              {otherMenuItems.slice(1).map((item) => renderMenuItem(item))}
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