import { Socket } from 'socket.io-client';

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
  adicionales?: Adicional[];
}

export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  url_imagen?: string;
  stock?: number;
  adicionales?: CartItemAdicional[];
}

export interface CartItemAdicional {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  maxCantidad: number;
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

export interface Adicional {
  id?: number;
  nombre: string;
  precio: number;
  stock: number;
  maxCantidad: number;
  estado?: boolean;
  idAxP?: number;
}

export interface ProductoAdicional {
  idProducto: number;
  idAdicional: number;
  adicional?: Adicional;
}

export interface AsignarAdicionalesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  Product?: Product;
}

export interface AdicionalesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  Product: Product;
  onConfirm: (adicionales: CartItemAdicional[]) => void;
  initialAdicionales?: CartItemAdicional[];
}

export interface CategoryCarouselProps {
  categories: Category[];
  selectedCategory: number | null;
  onSelectCategory: (id: number | null) => void;
}

export interface ImageEditorProps {
  file: File | null;
  onSave: (croppedImage: File) => void;
  onCancel: () => void;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, 'cantidad'>) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, cantidad: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  updateAdicionales: (id: number, adicionales: CartItem['adicionales']) => void;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: { nombre: string } | null;
  loading: boolean;
  login: (token: string, nombre: string) => void;
  logout: () => void;
}