import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  newOrderCount: number;
  clearNewOrderCount: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const { isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && !socketRef.current) {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const newSocket = io(API_URL, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket.IO conectado');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket.IO desconectado');
        setConnected(false);
      });

      newSocket.on('nuevoPedido', (data) => {
        console.log('Nuevo pedido recibido:', data);
        setNewOrderCount(prev => prev + 1);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Error de conexión Socket.IO:', error);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    } else if (!isAuthenticated && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
      setNewOrderCount(0);
    }
  }, [isAuthenticated]);

  const clearNewOrderCount = () => {
    setNewOrderCount(0);
  };

  return (
    <SocketContext.Provider value={{ socket, connected, newOrderCount, clearNewOrderCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
