import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { toast } from 'sonner';
import { ShoppingBag } from 'lucide-react';

const OrderNotification: React.FC = () => {
  const { newOrderCount, clearNewOrderCount } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const isOnPedidosPage = location.pathname === '/admin/pedidos';

  useEffect(() => {
    if (newOrderCount > 0 && !isOnPedidosPage) {
      toast.info(
        `${newOrderCount === 1 ? 'Nuevo pedido' : `${newOrderCount} nuevos pedidos`}`,
        {
          description: 'Haz click aquí para ver los pedidos',
          icon: <ShoppingBag className="h-5 w-5" />,
          duration: 10000,
          action: {
            label: 'Ver pedidos',
            onClick: () => {
              navigate('/admin/pedidos');
              clearNewOrderCount();
            },
          },
        }
      );
    }
  }, [newOrderCount, isOnPedidosPage, navigate, clearNewOrderCount]);

  useEffect(() => {
    if (isOnPedidosPage) {
      clearNewOrderCount();
    }
  }, [isOnPedidosPage, clearNewOrderCount]);

  return null;
};

export default OrderNotification;
