import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Phone, MapPin } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

const Orders = () => {
  const [orders] = useState([
    {
      id: 1001,
      customerName: 'Juan Pérez',
      phone: '+54 9 11 1234-5678',
      email: 'juan@email.com',
      address: 'Av. Corrientes 1234',
      items: [
        { name: 'Hamburguesa Clásica', quantity: 2, price: 12.99 },
        { name: 'Papas Fritas', quantity: 1, price: 4.99 }
      ],
      total: 30.97,
      status: 'pending',
      createdAt: '2024-01-15 14:30'
    },
    {
      id: 1002,
      customerName: 'María García',
      phone: '+54 9 11 9876-5432',
      email: 'maria@email.com',
      items: [
        { name: 'Burger Premium', quantity: 1, price: 18.99 }
      ],
      total: 18.99,
      status: 'completed',
      createdAt: '2024-01-15 13:15'
    }
  ]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Pedidos</h1>
        
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                  <Badge variant={order.status === 'pending' ? 'default' : 'secondary'}>
                    {order.status === 'pending' ? 'Pendiente' : 'Completado'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{order.customerName}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{order.phone}</span>
                    </div>
                    {order.address && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>{order.address}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{order.createdAt}</span>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      Total: ${order.total.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Items:</h4>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Orders;