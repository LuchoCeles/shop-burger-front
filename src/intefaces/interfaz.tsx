import { Socket } from 'socket.io-client';

/**+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  +                                                                                              +
  +                                         MODELOS BACKEND                                      +
  +                                                                                              +
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
export interface Product {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  url_imagen?: string;
  imagen?: File | null;
  stock?: number;
  idCategoria?: number;
  descuento?: number;
  isPromocion?: boolean;
  estado?: boolean;
  adicionales?: Adicional[];
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
  mpEstado?: boolean;
}

export interface Cliente {
  id?: number;
  telefono: string;
  direccion: string;
}

export interface Admin {
  id: number;
  name: string;
  password: string;
}

export interface Adicional {
  id?: number;
  nombre: string;
  precio: number;
  stock: number;
  maxCantidad: number;
  estado?: boolean;
  idAxp?: number;
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
/**+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  +                                                                                              +
  +                                         MODELOS CARRITO                                      +
  +                                                                                              +
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
export interface CartItem {
  id: number;
  cartId: string; // ID único para el carrito (producto + adicionales)
  nombre: string;
  precio: number;
  cantidad: number;
  descuento?: number;
  url_imagen?: string;
  stock?: number;
  adicionales?: CartItemAdicional[];
  metodoDePago: string;
}

export interface CartItemAdicional {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  maxCantidad: number;
}

export interface CartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ProductoAdicional {
  idProducto: number;
  idAdicional: number;
  adicional?: Adicional;
}
/**+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  +                                                                                              +
  +                                     MODELOS COMPONENTES                                      +
  +                                                                                              +
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
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
/**+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  +                                                                                              +
  +                                         MODELOS CONTEXT                                      +
  +                                                                                              +
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
export interface AuthContextType {
  isAuthenticated: boolean;
  user: { nombre: string } | null;
  loading: boolean;
  login: (token: string, nombre: string) => void;
  logout: () => void;
  logoutBanco: () => void;
  loginBanco: (token: string, data: BankData) => void;
  bankData: BankData | null;
  setBankData: (data: BankData | null) => void;
  isBankAuthenticated: boolean;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, 'cantidad'>) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, cantidad: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  updateAdicionales: (cartId: string, adicionales: CartItem['adicionales']) => void;
}
/**+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  +                                                                                              +
  +                                        WEBSOCKET CONTEXT                                     +
  +                                                                                              +
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
export interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  newOrderCount: number;
  clearNewOrderCount: () => void;
}