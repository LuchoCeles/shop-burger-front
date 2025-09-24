import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChefHat, 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import apiService from '@/services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
    popularProducts: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [orders, products] = await Promise.all([
        apiService.getOrders(),
        apiService.getProducts()
      ]);

      // Calculate stats
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const totalProducts = products?.products?.length || 0;
      const pendingOrders = orders?.filter(order => order.status === 'pending')?.length || 0;

      setStats({
        totalOrders,
        totalRevenue,
        totalProducts,
        pendingOrders,
        popularProducts: products?.products?.slice(0, 5) || mockPopularProducts,
        recentOrders: orders?.slice(0, 5) || mockRecentOrders
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Use mock data for development
      setStats({
        totalOrders: 156,
        totalRevenue: 2840.50,
        totalProducts: 12,
        pendingOrders: 8,
        popularProducts: mockPopularProducts,
        recentOrders: mockRecentOrders
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general de tu hamburguería
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pedidos Totales
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                +12% desde el mes pasado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ingresos Totales
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                +8% desde el mes pasado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Productos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                2 nuevos esta semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pedidos Pendientes
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.pendingOrders}
              </div>
              <p className="text-xs text-muted-foreground">
                Requieren atención
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Productos Más Populares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.popularProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <img
                      src={product.image || '/api/placeholder/40/40'}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded-lg bg-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${product.price?.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm">
                        {product.popularity || 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Pedidos Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">#{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customerName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.total?.toFixed(2)}</p>
                      <Badge 
                        variant={order.status === 'pending' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {order.status === 'pending' ? 'Pendiente' : 
                         order.status === 'completed' ? 'Completado' : 
                         order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/admin/menu"
                className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
              >
                <ChefHat className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">Gestionar Menú</h3>
                <p className="text-sm text-muted-foreground">
                  Agregar/editar productos
                </p>
              </Link>

              <Link
                to="/admin/orders"
                className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
              >
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">Ver Pedidos</h3>
                <p className="text-sm text-muted-foreground">
                  Gestionar pedidos
                </p>
              </Link>

              <Link
                to="/admin/categories"
                className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
              >
                <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">Categorías</h3>
                <p className="text-sm text-muted-foreground">
                  Organizar productos
                </p>
              </Link>

              <Link
                to="/admin/theme"
                className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
              >
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">Configuración</h3>
                <p className="text-sm text-muted-foreground">
                  Personalizar tema
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

// Mock data for development
const mockPopularProducts = [
  { id: 1, name: 'Hamburguesa Clásica', price: 12.99, popularity: 95, image: '/api/placeholder/40/40' },
  { id: 2, name: 'Burger Bacon Cheese', price: 15.99, popularity: 88, image: '/api/placeholder/40/40' },
  { id: 3, name: 'Veggie Deluxe', price: 11.99, popularity: 75, image: '/api/placeholder/40/40' },
  { id: 4, name: 'BBQ Monster', price: 18.99, popularity: 82, image: '/api/placeholder/40/40' },
  { id: 5, name: 'Chicken Supreme', price: 14.99, popularity: 79, image: '/api/placeholder/40/40' }
];

const mockRecentOrders = [
  { id: 1001, customerName: 'Juan Pérez', total: 25.99, status: 'pending' },
  { id: 1002, customerName: 'María García', total: 32.50, status: 'completed' },
  { id: 1003, customerName: 'Carlos López', total: 18.99, status: 'pending' },
  { id: 1004, customerName: 'Ana Martínez', total: 41.25, status: 'completed' },
  { id: 1005, customerName: 'Luis Rodríguez', total: 15.99, status: 'pending' }
];

export default Dashboard;