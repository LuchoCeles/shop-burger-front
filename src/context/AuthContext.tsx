import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { nombre: string } | null;
  login: (token: string, nombre: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ nombre: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const nombre = localStorage.getItem('userName');
    if (token && nombre) {
      setIsAuthenticated(true);
      setUser({ nombre });
    }
  }, []);

  const login = (token: string, nombre: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userName', nombre);
    setIsAuthenticated(true);
    setUser({ nombre });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
