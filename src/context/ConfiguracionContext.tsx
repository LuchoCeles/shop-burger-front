import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import ApiService from '@/services/api'; // Asegúrate que la ruta sea correcta

// 1. Definir el Contexto
const ConfiguracionContext = createContext({
  config: null,
  loading: true,
  error: null,
  refetchConfig: () => {}, // Función para recargar manualmente
});

// 2. Crear el Provider
export const ConfiguracionProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.getConfiguracion();
      
      if (response.success && response.data) {
        setConfig(response.data);
      } else {
        throw new Error(response.message || "Fallo al cargar la configuración");
      }
    } catch (err) {
      setError(err);
      console.error("Error cargando la configuración global:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar el componente (al iniciar la app)
  useEffect(() => {
    fetchConfig();
  }, []);

  // useMemo optimiza el valor para que solo cambie si el estado cambia realmente
  const contextValue = useMemo(() => ({
    config,
    loading,
    error,
    refetchConfig: fetchConfig, // Exportamos la función de recarga
  }), [config, loading, error]);

  return (
    <ConfiguracionContext.Provider value={contextValue}>
      {children}
    </ConfiguracionContext.Provider>
  );
};

// 3. Crear un Hook personalizado para facilitar el consumo
export const useConfiguracion = () => {
  const context = useContext(ConfiguracionContext);
  if (context === undefined) {
    throw new Error('useConfiguracion debe usarse dentro de ConfiguracionProvider');
  }
  return context;
};