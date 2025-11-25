import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CartContextType, CartItemAdicional, Product, Tamaños, Guarniciones } from '../intefaces/interfaz';

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


  const areItemsEqual = (item1: CartItem, item2: CartItem) => {
    // 1. mismo producto
    if (item1.productoOriginal.id !== item2.productoOriginal.id) return false;

    // 2. mismo tamaño
    const t1Id = item1.tamSeleccionado?.id || null;
    const t2Id = item2.tamSeleccionado?.id || null;
    if (t1Id !== t2Id) return false;

    // 3. misma guarnición
    const g1Id = item1.guarnicionSeleccionada?.id || null;
    const g2Id = item2.guarnicionSeleccionada?.id || null;
    if (g1Id !== g2Id) return false;

    // 4. mismos adicionales (solo comparar los que tienen cantidad > 0)
    const a1 = item1.adicionalesSeleccionados.filter(a => a.cantidad > 0);
    const a2 = item2.adicionalesSeleccionados.filter(a => a.cantidad > 0);

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

  const addToCart = (config: {
    productoOriginal: Product;
    tamSeleccionado?: Tamaños;
    guarnicionSeleccionada?: Guarniciones;
    adicionalesSeleccionados: CartItemAdicional[];
    metodoDePago: string;
  }) => {
    setCart((prev) => {
      const newItem: CartItem = {
        id: config.productoOriginal.id,
        cartId: `${config.productoOriginal.id}-${Date.now()}`,
        productoOriginal: config.productoOriginal,
        cantidad: 1,
        tamSeleccionado: config.tamSeleccionado,
        guarnicionSeleccionada: config.guarnicionSeleccionada,
        adicionalesSeleccionados: config.adicionalesSeleccionados,
        metodoDePago: config.metodoDePago,
      };

      // Buscamos item igual por contenido
      const existing = prev.find((item) => areItemsEqual(item, newItem));

      if (existing) {
        // Validar stock
        const stock = config.productoOriginal.stock;
        if (stock !== undefined && existing.cantidad >= stock) {
          return prev;
        }

        // Merge: sumar cantidad
        return prev.map((item) =>
          areItemsEqual(item, newItem)
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      // Crear ítem nuevo
      return [...prev, newItem];
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
          const stock = item.productoOriginal.stock;
          if (stock !== undefined && cantidad > stock) {
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

  const updateAdicionales = (cartId: string, adicionales: CartItemAdicional[]) => {
    setCart((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, adicionalesSeleccionados: adicionales } : item))
    );
  };

  const updateItemConfig = (
    cartId: string,
    config: {
      tamSeleccionado?: Tamaños;
      guarnicionSeleccionada?: Guarniciones;
      adicionalesSeleccionados?: CartItemAdicional[];
    }
  ) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartId === cartId) {
          return {
            ...item,
            ...(config.tamSeleccionado !== undefined && { tamSeleccionado: config.tamSeleccionado }),
            ...(config.guarnicionSeleccionada !== undefined && { guarnicionSeleccionada: config.guarnicionSeleccionada }),
            ...(config.adicionalesSeleccionados !== undefined && { adicionalesSeleccionados: config.adicionalesSeleccionados }),
          };
        }
        return item;
      })
    );
  };

  const total = cart.reduce((sum, item) => {
    // Precio base es el precioFinal del tamaño seleccionado
    const precioBase = item.tamSeleccionado?.precioFinal || item.productoOriginal.precio || 0;
    const itemTotal = precioBase * item.cantidad;
    
    // Solo sumar adicionales con cantidad > 0
    const adicionalesTotal = item.adicionalesSeleccionados
      .filter(a => a.cantidad > 0)
      .reduce((adicSum, adic) => adicSum + (adic.precio * adic.cantidad * item.cantidad), 0);
    
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
