export interface Product {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  url_imagen?: string;
  stock?: number;
  idCategoria?: number;
}

export interface Category {
  id: number;
  nombre: string;
}

export interface BankData {
  id: number;
  cuit: string;
  alias: string;
  cbu: string;
  apellido: string;
  nombre: string;
}

export interface Admin {
  id: number;
  name: string;
  password: string;
}
