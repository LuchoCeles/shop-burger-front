import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CartContextType, CartItemAdicional } from '../intefaces/interfaz';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    const savedTimestamp = localStorage.getItem('cartTimestamp');

    if (savedCart && savedTimestamp) {
      const now = Date.now();
      const timestamp = parseInt(savedTimestamp, 10);
      const oneHour = 5 * 30 * 1000; // 1 hora en milisegundos

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

  const sortExtras = (extras: CartItemAdicional[] = []) => {
    return [...extras].sort((a, b) => {
      const idA = Number(a.id) || 0;
      const idB = Number(b.id) || 0;
      return idA - idB;
    });
  };


  const areItemsEqual = (item1: CartItem, item2: Omit<CartItem, 'cantidad'>) => {
    // 1. mismo producto
    if (item1.id !== item2.id) return false;

    // 2. mismo tamaño
    const t1Id = item1.tamaño?.id || null;
    const t2Id = item2.tamaño?.id || null;
    if (t1Id !== t2Id) return false;

    // 3. mismas guarniciones
    const g1 = item1.guarniciones || [];
    const g2 = item2.guarniciones || [];
    if (g1.length !== g2.length) return false;
    
    const g1Ids = g1.map(g => g.id).sort();
    const g2Ids = g2.map(g => g.id).sort();
    for (let i = 0; i < g1Ids.length; i++) {
      if (g1Ids[i] !== g2Ids[i]) return false;
    }

    // 4. mismos adicionales
    const a1 = item1.adicionales || [];
    const a2 = item2.adicionales || [];

    if (a1.length !== a2.length) return false;

    // ordenar por id para comparar sin importar el orden
    const s1 = sortExtras(a1);
    const s2 = sortExtras(a2);

    // comparar cada adicional
    for (let i = 0; i < s1.length; i++) {
      if (s1[i].id !== s2[i].id) return false;
      if (s1[i].cantidad !== s2[i].cantidad) return false;
    }

    return true;
  }


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
      // Buscamos item igual por contenido
      const existing = prev.find((item) => areItemsEqual(item, product));

      if (existing) {
        // Validar stock
        if (product.stock !== undefined && existing.cantidad >= product.stock) {
          return prev;
        }

        // Merge: sumar cantidad
        return prev.map((item) =>
          areItemsEqual(item, product)
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      // Crear ítem nuevo
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

  const updateItemConfig = (
    cartId: string, 
    config: { 
      tamaño?: CartItem['tamaño'];
      guarniciones?: CartItem['guarniciones'];
      adicionales?: CartItem['adicionales'];
      precio?: number;
    }
  ) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartId === cartId) {
          return {
            ...item,
            ...(config.tamaño !== undefined && { tamaño: config.tamaño }),
            ...(config.guarniciones !== undefined && { guarniciones: config.guarniciones }),
            ...(config.adicionales !== undefined && { adicionales: config.adicionales }),
            ...(config.precio !== undefined && { precio: config.precio }),
          };
        }
        return item;
      })
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
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount, updateAdicionales, updateItemConfig }}
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
