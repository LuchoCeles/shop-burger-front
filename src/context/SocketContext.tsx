import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SocketContextType } from '../intefaces/interfaz';

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [newPaymentCount, setNewPaymentCount] = useState(0);
  const { isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
      setNewOrderCount(0);
      setNewPaymentCount(0);
      return;
    }

    if (!socketRef.current) {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");

      const newSocket = io(API_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // conexión
      newSocket.on("connect", () => setConnected(true));
      newSocket.on("disconnect", () => setConnected(false));

      // listeners
      newSocket.on("nuevoPedido", (data) => {
        console.log("nuevoPedido:", data);
        setNewOrderCount((prev) => prev + 1);
      });

      newSocket.on("pagoAprobado", (data) => {
        console.log("pagoAprobado:", data);
        setNewPaymentCount((prev) => prev + 1);
      });

      newSocket.on("pagoRechazado", (data) => {
        console.log("pagoRechazado:", data);
        setNewPaymentCount((prev) => prev + 1);
      });

      newSocket.on("pagoExpirado", (data) => {
        console.log("pagoExpirado:", data);
        setNewPaymentCount((prev) => prev + 1);
      });

      newSocket.on("connect_error", (err) =>
        console.error("Socket error:", err)
      );

      return () => {
        if (socketRef.current) socketRef.current.disconnect();
        socketRef.current = null;
      };
    }
  }, [isAuthenticated]);


  const clearNewOrderCount = () => {
    setNewOrderCount(0);
  };

  return (
    <SocketContext.Provider value={{ socket, connected, newOrderCount, newPaymentCount, clearNewOrderCount }}>
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
