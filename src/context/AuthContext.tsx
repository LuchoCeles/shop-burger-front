import { set } from 'node_modules/date-fns/set';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, BankData } from 'src/intefaces/interfaz';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    if (!payload.exp) {
      return true; // Si no tiene exp, considerarlo expirado
    }
    // Comparar con el timestamp actual (en segundos)
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return true; // Si hay error al decodificar, considerarlo expirado
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBankAuthenticated, setIsBankAuthenticated] = useState(false);
  const [user, setUser] = useState<{ nombre: string } | null>(null);
  const [bankData, setBankData] = useState<BankData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const nombre = localStorage.getItem('userName');
    const bancoToken = localStorage.getItem('bancoToken');
    const bancoData = localStorage.getItem('bancoData');


    if (bancoToken) {
      if (isTokenExpired(bancoToken)) {
        localStorage.removeItem('bancoToken');
        setIsBankAuthenticated(false);
      } else {
        setIsBankAuthenticated(true);
        if(bancoData){
          setBankData(JSON.parse(bancoData));
        }
      }
    }

    if (token && nombre) {
      if (isTokenExpired(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        setIsAuthenticated(false);
        setUser(null);
      } else {
        setIsAuthenticated(true);
        setUser({ nombre });
      }
    }

    setLoading(false);
  }, []);

  const login = (token: string, nombre: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userName', nombre);
    setIsAuthenticated(true);
    setUser({ nombre });
  };

  const loginBanco = (token: string, data: BankData) => {
    localStorage.setItem('bancoToken', token);
    localStorage.setItem('bancoData', JSON.stringify(data));
    setBankData(data);
    setIsBankAuthenticated(true);
  };

  const logoutBanco = () => {
    localStorage.removeItem('bancoToken');
    localStorage.removeItem('bancoData');
    setBankData(null);
    setIsBankAuthenticated(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('bancoToken');
    localStorage.removeItem('bancoData');
    setIsAuthenticated(false);
    setIsBankAuthenticated(false);
    setUser(null);
    setBankData(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, loginBanco, isBankAuthenticated, logoutBanco, bankData, setBankData }}>
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
