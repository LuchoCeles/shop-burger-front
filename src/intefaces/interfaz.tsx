import { io, Socket } from 'socket.io-client';

export interface Product {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  url_imagen?: string;
  imagen?: File | null;
  stock?: number;
  idCategoria?: number;
  estado?: boolean;
}

export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  url_imagen?: string;
  stock?: number;
}

export interface Category {
  id: number;
  nombre: string;
  estado?: boolean;
}

export interface BankData {
  id: number;
  cuit: string;
  alias: string;
  cbu: string;
  apellido: string;
  nombre: string;
}

export interface Cliente {
  id?: number;
  telefono: string;
  direccion: string;
}

export interface Orders {
  id: number;
  estado: 'pendiente' | 'entregado' | 'cancelado';
  precioTotal: number;
  descripcion?: string;
  cliente: {
    id: number;
    telefono: string;
    direccion: string;
  }
  productos: {
    nombre: string;
    precio: number;
    cantidad: number;
  }[];
}


export interface Admin {
  id: number;
  name: string;
  password: string;
}

export interface CartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  newOrderCount: number;
  clearNewOrderCount: () => void;
}