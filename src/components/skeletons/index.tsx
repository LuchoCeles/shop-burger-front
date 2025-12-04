import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// ==================== HOME PAGE SKELETONS ====================

export const CategoryCarouselSkeleton = () => (
  <div className="flex gap-3 overflow-hidden">
    {[...Array(6)].map((_, i) => (
      <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
    ))}
  </div>
);

export const ProductCardSkeleton = () => (
  <div className="overflow-hidden rounded-lg border border-border bg-card flex flex-col">
    <Skeleton className="h-48 w-full rounded-none" />
    <div className="p-4 flex flex-col flex-1 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="mt-auto pt-4 flex items-center justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {[...Array(count)].map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const HomeSkeleton = () => (
  <>
    <div className="mb-8">
      <CategoryCarouselSkeleton />
    </div>
    <div className="mb-6">
      <Skeleton className="h-8 w-40 mb-4" />
      <ProductGridSkeleton count={8} />
    </div>
  </>
);

// ==================== CHECKOUT PAGE SKELETONS ====================

export const CheckoutFormSkeleton = () => (
  <Card className="bg-card">
    <CardHeader>
      <Skeleton className="h-6 w-40" />
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-10 w-full rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
);

export const CheckoutSummarySkeleton = () => (
  <Card className="bg-card">
    <CardHeader>
      <Skeleton className="h-6 w-48" />
    </CardHeader>
    <CardContent className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-14 w-14 rounded-md flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
      <div className="border-t pt-4">
        <Skeleton className="h-8 w-32 ml-auto" />
      </div>
    </CardContent>
  </Card>
);

export const CheckoutSkeleton = () => (
  <div className="grid gap-6 lg:grid-cols-2 items-start">
    <CheckoutFormSkeleton />
    <CheckoutSummarySkeleton />
  </div>
);

// ==================== ADMIN DASHBOARD SKELETONS ====================

export const DashboardCardSkeleton = () => (
  <Card className="bg-card">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-16" />
    </CardContent>
  </Card>
);

export const DashboardHomeSkeleton = () => (
  <div>
    <h1 className="mb-6 text-3xl font-bold text-foreground">Dashboard</h1>
    <div className="grid gap-6 md:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <DashboardCardSkeleton key={i} />
      ))}
    </div>
    <div className="mt-8 space-y-4">
      <Skeleton className="h-7 w-64" />
      <Skeleton className="h-5 w-96" />
    </div>
  </div>
);

// ==================== ADMIN PRODUCTS SKELETONS ====================

export const AdminProductCardSkeleton = () => (
  <div className="overflow-hidden rounded-lg border border-border bg-card flex flex-col">
    <Skeleton className="h-48 w-full rounded-none" />
    <div className="p-4 flex flex-col flex-1 space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-4 w-16" />
      <div className="mt-auto pt-2 flex gap-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </div>
  </div>
);

export const ProductosManagerSkeleton = () => (
  <div className="space-y-4 md:space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Productos</h1>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <AdminProductCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ==================== ADMIN CATEGORIES SKELETONS ====================

export const CategoryCardSkeleton = () => (
  <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
    <Skeleton className="h-5 w-24" />
    <div className="flex items-center gap-2 mt-2">
      <Skeleton className="h-9 w-9" />
      <Skeleton className="h-9 flex-1" />
      <Skeleton className="h-9 w-9" />
    </div>
  </div>
);

export const CategoriasManagerSkeleton = () => (
  <div className="space-y-4 md:space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Categorías</h1>
      <Skeleton className="h-10 w-40" />
    </div>
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
      {[...Array(5)].map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ==================== ADMIN ADICIONALES SKELETONS ====================

export const AdicionalCardSkeleton = () => (
  <div className="border border-border rounded-lg p-4 bg-card space-y-3">
    <div className="flex justify-between items-start">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
    <div className="space-y-1">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-40" />
    </div>
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-8 flex-1" />
      <Skeleton className="h-8 w-8" />
    </div>
  </div>
);

export const AdicionalesManagerSkeleton = () => (
  <div className="space-y-4 md:space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Adicionales</h1>
      <Skeleton className="h-10 w-40" />
    </div>
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <AdicionalCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ==================== ADMIN PEDIDOS SKELETONS ====================

export const PedidoCardSkeleton = () => (
  <div className="rounded-lg border border-border bg-card p-6 space-y-4">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <Skeleton className="h-6 w-32" />
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
    <div className="grid gap-2">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-4 w-64" />
    </div>
    <div className="border-t border-border pt-4 space-y-3">
      <Skeleton className="h-5 w-40" />
      {[...Array(2)].map((_, i) => (
        <div key={i} className="rounded-md border border-border bg-muted/30 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
        </div>
      ))}
      <div className="mt-4 rounded-md bg-primary/10 p-4">
        <Skeleton className="h-8 w-32 ml-auto" />
      </div>
    </div>
  </div>
);

export const PedidosManagerSkeleton = () => (
  <div>
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-3xl font-bold text-foreground">Pedidos</h1>
      <Skeleton className="h-10 w-36" />
    </div>
    <Skeleton className="h-10 w-full max-w-md mb-6" />
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <PedidoCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ==================== ADMIN TAMAÑOS SKELETONS ====================

export const TamañoCardSkeleton = () => (
  <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
    <div className="space-y-1">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-4 w-24" />
    </div>
    <div className="flex items-center gap-2 mt-2">
      <Skeleton className="h-9 w-9" />
      <Skeleton className="h-9 flex-1" />
      <Skeleton className="h-9 w-9" />
    </div>
  </div>
);

export const TamañosManagerSkeleton = () => (
  <div className="space-y-4 md:space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Tamaños</h1>
      <Skeleton className="h-10 w-36" />
    </div>
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(5)].map((_, i) => (
        <TamañoCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ==================== ADMIN GUARNICIONES SKELETONS ====================

export const GuarnicionCardSkeleton = () => (
  <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
    <div className="space-y-1">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-4 w-16" />
    </div>
    <div className="flex items-center gap-2 mt-2">
      <Skeleton className="h-9 w-9" />
      <Skeleton className="h-9 flex-1" />
      <Skeleton className="h-9 w-9" />
    </div>
  </div>
);

export const GuarnicionesManagerSkeleton = () => (
  <div className="space-y-4 md:space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Guarniciones</h1>
      <Skeleton className="h-10 w-40" />
    </div>
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(4)].map((_, i) => (
        <GuarnicionCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ==================== ADMIN HORARIOS SKELETONS ====================

export const HorarioCardSkeleton = () => (
  <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
    <div className="space-y-1">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-20" />
    </div>
    <div className="flex items-center gap-2 mt-2">
      <Skeleton className="h-9 w-9" />
      <Skeleton className="h-9 flex-1" />
      <Skeleton className="h-9 w-9" />
    </div>
  </div>
);

export const HorariosManagerSkeleton = () => (
  <div className="space-y-4 md:space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold md:text-3xl">Horarios</h1>
      <Skeleton className="h-10 w-36" />
    </div>
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(4)].map((_, i) => (
        <HorarioCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ==================== ADMIN CONFIGURACION SKELETONS ====================

export const ConfiguracionManagerSkeleton = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold">Configuración</h1>
      <p className="text-muted-foreground">Gestionar datos bancarios y métodos de pago</p>
    </div>
    <Skeleton className="h-10 w-full max-w-md" />
    <Card className="bg-card">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);
