import { useEffect, useState } from 'react';
import { Package, FolderKanban, ShoppingBag } from 'lucide-react';
import ApiService from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    productos: 0,
    categorias: 0,
    pedidos: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [productos, categorias, pedidos] = await Promise.all([
        ApiService.getProducts(),
        ApiService.getCategories(),
        ApiService.getOrders(),
      ]);
      setStats({
        productos: productos.data.length,
        categorias: categorias.data.length,
        pedidos: pedidos.data.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-foreground">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Productos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.productos}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categorías
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.categorias}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pedidos Totales
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.pedidos}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Bienvenido al Panel Admin</h2>
        <p className="text-muted-foreground">
          Usa el menú lateral para gestionar productos, categorías y pedidos.
        </p>
      </div>
    </div>
  );
};

export default DashboardHome;
