import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UtensilsCrossed as HamburgerIcon, LayoutDashboard, Package, FolderKanban, ShoppingBag, Settings, LogOut, Plus, Home, Timer, ChevronDown, UtensilsCrossed, Ruler, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { useConfiguracion } from '@/context/ConfiguracionContext';
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
  SidebarMenuSub,
  SidebarMenuSubButton,
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
  const { state, setOpen, setOpenMobile, isMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { config, loading, error } = useConfiguracion();
  const logoUrl = config?.url_logo || '/default-logo.png';
  const nombreLocal = config?.nombreLocal || 'Admin';

  const isCollapsed = state === 'collapsed' && !isMobile;

  const isInProductSection = productMenuItems.some(item => location.pathname === item.path);
  const [productMenuOpen, setProductMenuOpen] = useState(isInProductSection);

  useEffect(() => {
    if (isInProductSection) {
      setProductMenuOpen(true);
    }
  }, [isInProductSection]);

  const handleMobileClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const renderMenuItem = (item: { icon: any; label: string; path: string }) => {
    const Icon = item.icon;
    const isActive = decodeURIComponent(location.pathname) === item.path;
    
    return (
      <SidebarMenuItem key={item.path}>
        <SidebarMenuButton 
          asChild 
          isActive={isActive} 
          tooltip={isCollapsed ? item.label : undefined}
          className={cn(
            "transition-colors duration-150",
            isActive 
              ? "bg-primary text-primary-foreground hover:bg-primary/70 hover:text-primary-foreground" 
              : "hover:bg-primary/10 hover:text-primary"
          )}
        >
          <Link 
            to={item.path} 
            onClick={handleMobileClick}
          >
            <Icon className="size-5" />
            {!isCollapsed && (
                <span className="truncate">{item.label}</span>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="bg-secondary border-r border-border">
      <SidebarHeader className="bg-secondary">
        <div className="flex flex-row h-12 items-center px-2 justify-between">
            <div className={cn(
              "flex items-center gap-2 overflow-hidden transition-all",
              isCollapsed ? "justify-center w-full" : "px-2"
            )}>
               <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-primary-foreground">
                  <img className="size-4" src={logoUrl} />
               </div>
               {!isCollapsed && (
                  <span className="font-bold truncate">{nombreLocal}</span>
               )}
            </div>

            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setOpenMobile(false)}
                className="md:hidden"
              >
                <X className="size-5" />
              </Button>
            )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-secondary px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderMenuItem(otherMenuItems[0])}

              <Collapsible 
                open={productMenuOpen} 
                onOpenChange={setProductMenuOpen}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                        tooltip={isCollapsed ? "Gestión Items" : undefined}
                        isActive={isInProductSection}
                        // Estilo si un hijo es activo
                        className={cn(
                            "transition-colors duration-150",
                            isInProductSection && !productMenuOpen 
                                ? "bg-primary/10 text-primary" 
                                : "hover:bg-primary/10 hover:text-primary"
                        )}
                    >
                        <Package className="size-5" />
                        {!isCollapsed && (
                            <>
                                <span className="flex-1 truncate">Gestión Items</span>
                                <ChevronDown className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </>
                        )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>

                <CollapsibleContent>
                  <SidebarMenuSub>
                     {productMenuItems.map((item) => {
                        const isSubActive = decodeURIComponent(location.pathname) === item.path;
                        return (
                            <SidebarMenuItem key={item.path}>
                                <SidebarMenuSubButton 
                                    asChild 
                                    isActive={isSubActive} 
                                    size="md"
                                    // Estilos aplicados segun SubActivacion
                                    className={cn(
                                        "transition-colors duration-150",
                                        isSubActive 
                                            ? "bg-primary text-primary-foreground hover:bg-primary/70 hover:text-primary-foreground" 
                                            : "hover:bg-primary/10 hover:text-primary"
                                    )}
                                >
                                    <Link to={item.path} onClick={handleMobileClick}>
                                        <item.icon className="size-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuItem>
                        );
                     })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>

              {otherMenuItems.slice(1).map((item) => renderMenuItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-secondary p-2">
        {!isCollapsed ? (
            <div className="flex items-center gap-2 rounded-md bg-muted p-3 mb-2">
                <div className="flex flex-col items-center text-sm mx-auto">
                    <span className="font-semibold">{user?.nombre.toLocaleUpperCase()}</span>
                    <span className="text-xs text-muted-foreground">Panel de administración</span>
                </div>
            </div>
        ) : null}

        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Ir a la tienda">
                    <Button variant="ghost" onClick={() => navigate('/')} className="w-full justify-center pl-0 hover:bg-sidebar-accent  hover:bg-white/90 hover:text-black transition-colors duration-150 mx-auto text-center">
                         <Home className="size-5" />
                         {!isCollapsed && <span className='ml-2'>Volver a la Tienda</span>}
                    </Button>
                </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Cerrar Sesión">
                    <Button variant="outline" onClick={logout} className="w-full justify-center pl-0 hover:bg-white/90 hover:text-black transition-colors duration-150 mx-auto text-center">
                        <LogOut className={`size-5`} />
                        {!isCollapsed && <span className='ml-2'>Cerrar Sesión</span>}
                    </Button>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}