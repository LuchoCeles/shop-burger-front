import React, { useEffect, useRef } from 'react';
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
  const audioContextRef = useRef<AudioContext | null>(null);

  const playNotificationSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // Configuración del sonido de campana
      oscillator.frequency.setValueAtTime(800, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, context.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);
    } catch (error) {
      console.error('Error al reproducir sonido:', error);
    }
  };

  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const handleNuevoPedido = () => {
      playNotificationSound();
      
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
