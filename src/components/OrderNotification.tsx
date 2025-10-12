import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { ShoppingBag } from 'lucide-react';

const OrderNotification: React.FC = () => {
  const { socket, newOrderCount, clearNewOrderCount } = useSocket();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isOnPedidosPage = location.pathname === '/admin/pedidos';

  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const handleNuevoPedido = () => {
      if (!isOnPedidosPage) {
        toast.info('Nuevo pedido recibido', {
          description: 'Haz click aquí para ver los pedidos',
          icon: <ShoppingBag className="h-5 w-5" />,
          duration: 10000,
          action: {
            label: 'Ver pedidos',
            onClick: () => {
              navigate('/admin/pedidos');
            },
          },
        });
      }
    };

    socket.on('nuevoPedido', handleNuevoPedido);

    return () => {
      socket.off('nuevoPedido', handleNuevoPedido);
    };
  }, [socket, isAuthenticated, isOnPedidosPage, navigate]);

  useEffect(() => {
    if (isOnPedidosPage) {
      clearNewOrderCount();
    }
  }, [isOnPedidosPage, clearNewOrderCount]);

  return null;
};

export default OrderNotification;
