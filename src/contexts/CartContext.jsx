import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe utilizarse dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Cargar el carrito desde localStorage al iniciar la aplicación
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Guardar el carrito en localStorage cada vez que cambien los artículos.
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id);
      
      if (existingItem) {
        toast({
          title: "Producto actualizado",
          description: `${product.nombre} - cantidad: ${existingItem.quantity + quantity}`,
        });
        
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        toast({
          title: "Producto agregado",
          description: `${product.nombre} agregado al carrito`,
        });
        
        return [...currentItems, { ...product, quantity }];
      }
    });
  };

  const removeItem = (productId) => {
    setItems(currentItems => {
      const item = currentItems.find(item => item.id === productId);
      if (item) {
        toast({
          title: "Producto eliminado",
          description: `${item.nombre} eliminado del carrito`,
        });
      }
      return currentItems.filter(item => item.id !== productId);
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Carrito vacío",
      description: "Todos los productos han sido eliminados",
    });
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.precio * item.quantity), 0);
  };

  const getItemsCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  const value = {
    items,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemsCount,
    toggleCart,
    setIsOpen
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};