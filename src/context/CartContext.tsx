import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CartContextType } from '../intefaces/interfaz';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    const savedTimestamp = localStorage.getItem('cartTimestamp');

    if (savedCart && savedTimestamp) {
      const now = Date.now();
      const timestamp = parseInt(savedTimestamp, 10);
      const oneHour = 60 * 60 * 1000; // 1 hora en milisegundos

      // Si pasó más de una hora, limpiar el carrito
      if (now - timestamp > oneHour) {
        localStorage.removeItem('cart');
        localStorage.removeItem('cartTimestamp');
        return [];
      }

      return JSON.parse(savedCart);
    }

    return [];
  });

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
      localStorage.setItem('cartTimestamp', Date.now().toString());
    } else {
      localStorage.removeItem('cart');
      localStorage.removeItem('cartTimestamp');
    }
  }, [cart]);

  const addToCart = (product: Omit<CartItem, 'cantidad'>) => {
    setCart((prev) => {
      // Buscar por cartId en lugar de solo id
      const existing = prev.find((item) => item.cartId === product.cartId);
      if (existing) {
        // Validar que no exceda el stock
        if (product.stock !== undefined && existing.cantidad >= product.stock) {
          return prev; // No agregar más si ya alcanzó el stock
        }
        return prev.map((item) =>
          item.cartId === product.cartId ? { ...item, cantidad: item.cantidad + 1, stock: product.stock } : item
        );
      }
      return [...prev, { ...product, cantidad: 1 }];
    });
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartId === cartId) {
          // Validar que no exceda el stock
          if (item.stock !== undefined && cantidad > item.stock) {
            return item; // No actualizar si excede el stock
          }
          return { ...item, cantidad };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };
  const updateAdicionales = (cartId: string, adicionales: CartItem['adicionales']) => {
    setCart((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, adicionales } : item))
    );
  };

  const total = cart.reduce((sum, item) => {
    const itemTotal = item.precio * item.cantidad;
    const adicionalesTotal = item.adicionales?.reduce((adicSum, adic) =>
      adicSum + (adic.precio * adic.cantidad * item.cantidad), 0) || 0;
    return sum + itemTotal + adicionalesTotal;
  }, 0);

  const itemCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount, updateAdicionales }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
