import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { ShoppingBag } from 'lucide-react';

const OrderNotification: React.FC = () => {
  const { socket, newOrderCount, newPaymentCount, clearNewOrderCount } = useSocket();
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

      // Sonido más agudo y corto como "tin"
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.type = 'sine'; // O 'sine' para más suave

      // Frecuencia más alta para sonido agudo
      oscillator.frequency.setValueAtTime(100, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, context.currentTime + 0.08);

      // Envolvente muy corta y rápida
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, context.currentTime + 0.02); // Attack rápido
      gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.15); // Decay rápido

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);

    } catch (error) {
      console.error('Error al reproducir sonido:', error);
    }
  };

  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const handleNuevoPedido = (data: any) => {
      console.log('Notificación nuevo pedido:', data);
      playNotificationSound();

      if (!isOnPedidosPage) {
        toast.info('Nuevo pedido recibido', {
          description: data?.message || 'Haz click aquí para ver los pedidos',
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

    const handleNuevoPago = () => {
      playNotificationSound();

      if (!isOnPedidosPage) {
        toast.success('Nuevo pago recibido', {
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

    const handlePagoRechazado = () => {
      playNotificationSound();
      if (!isOnPedidosPage) {
        toast.error('Pago rechazado', {
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

    const handlePagoExpirado = () => {
      playNotificationSound();
      if (!isOnPedidosPage) {
        toast.error('Pago expirado', {
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
    }

    socket.on('nuevoPedido', handleNuevoPedido);
    socket.on('pagoAprobado', handleNuevoPago);
    socket.on('pagoRechazado', handlePagoRechazado);
    socket.on('pagoExpirado', handlePagoExpirado);

    return () => {
      socket.off('nuevoPedido', handleNuevoPedido);
      socket.off('pagoAprobado', handleNuevoPago);
      socket.off('pagoRechazado', handlePagoRechazado);
      socket.off('pagoExpirado', handlePagoExpirado);
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
