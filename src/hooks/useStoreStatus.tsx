import { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';

// Interfaces según estructura del backend
export interface HorarioRango {
  id: number;
  inicio: string; // "HH:MM"
  fin: string;    // "HH:MM"
  estado: number; // 1 = activo, 0 = inactivo
}

export interface HorarioDia {
  id: number;
  nombre: string; // "Lunes", "Martes", etc.
  estado: number; // 1 = abierto, 0 = cerrado
  rangos: HorarioRango[];
}

export interface StoreStatus {
  isOpen: boolean;
  nextOpenTime: string | null;
  currentDay: string;
  loading: boolean;
  error: string | null;
}

// Backend usa id 1-7 donde 1=Lunes, 7=Domingo
// JavaScript usa 0=Domingo, 1=Lunes, ..., 6=Sábado
const jsToBackendDay = (jsDay: number): number => {
  return jsDay === 0 ? 7 : jsDay; // Domingo JS (0) -> Backend (7)
};

const DIAS_NOMBRES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const useStoreStatus = () => {
  const [status, setStatus] = useState<StoreStatus>({
    isOpen: true,
    nextOpenTime: null,
    currentDay: '',
    loading: true,
    error: null
  });

  const [horarios, setHorarios] = useState<HorarioDia[]>([]);

  const checkIfOpen = useCallback((horariosData: HorarioDia[]): StoreStatus => {
    const now = new Date();
    const jsDayOfWeek = now.getDay(); // 0=Domingo, 1=Lunes, etc.
    const backendDayId = jsToBackendDay(jsDayOfWeek);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentDayName = DIAS_NOMBRES[jsDayOfWeek];

    // Buscar horario del día actual por ID del backend
    const todaySchedule = horariosData.find(h => h.id === backendDayId);

    // Si no hay horario o el día está cerrado
    if (!todaySchedule || todaySchedule.estado !== 1) {
      return {
        isOpen: false,
        nextOpenTime: findNextOpenTime(horariosData, backendDayId, currentMinutes),
        currentDay: currentDayName,
        loading: false,
        error: null
      };
    }

    // Verificar si estamos dentro de algún rango activo
    const isInActiveRange = todaySchedule.rangos.some(rango => {
      if (rango.estado !== 1) return false;

      const [startHour, startMin] = rango.inicio.split(':').map(Number);
      const [endHour, endMin] = rango.fin.split(':').map(Number);
      
      const startTime = startHour * 60 + startMin;
      let endTime = endHour * 60 + endMin;

      // Si cruza medianoche
      if (endTime <= startTime) {
        endTime += 24 * 60;
      }

      return currentMinutes >= startTime && currentMinutes < endTime;
    });

    if (isInActiveRange) {
      return {
        isOpen: true,
        nextOpenTime: null,
        currentDay: currentDayName,
        loading: false,
        error: null
      };
    }

    // Cerrado pero puede abrir más tarde hoy o próximamente
    return {
      isOpen: false,
      nextOpenTime: findNextOpenTime(horariosData, backendDayId, currentMinutes),
      currentDay: currentDayName,
      loading: false,
      error: null
    };
  }, []);

  const findNextOpenTime = (horariosData: HorarioDia[], currentBackendDay: number, currentMinutes: number): string | null => {
    // Buscar en el día actual si hay rangos futuros
    const todaySchedule = horariosData.find(h => h.id === currentBackendDay);
    
    if (todaySchedule?.estado === 1) {
      const futureRangos = todaySchedule.rangos
        .filter(r => r.estado === 1)
        .map(r => {
          const [h, m] = r.inicio.split(':').map(Number);
          return { time: h * 60 + m, text: r.inicio };
        })
        .filter(r => r.time > currentMinutes)
        .sort((a, b) => a.time - b.time);

      if (futureRangos.length > 0) {
        return `Hoy a las ${futureRangos[0].text}`;
      }
    }

    // Buscar en los próximos 7 días
    for (let i = 1; i <= 7; i++) {
      // Calcular siguiente día en formato backend (1-7)
      let nextBackendDay = currentBackendDay + i;
      if (nextBackendDay > 7) nextBackendDay -= 7;

      const schedule = horariosData.find(h => h.id === nextBackendDay);

      if (schedule?.estado === 1 && schedule.rangos.some(r => r.estado === 1)) {
        const firstRango = schedule.rangos
          .filter(r => r.estado === 1)
          .sort((a, b) => {
            const [ah, am] = a.inicio.split(':').map(Number);
            const [bh, bm] = b.inicio.split(':').map(Number);
            return (ah * 60 + am) - (bh * 60 + bm);
          })[0];

        const dayLabel = i === 1 ? 'Mañana' : schedule.nombre;
        return `${dayLabel} a las ${firstRango.inicio}`;
      }
    }

    return 'Próximamente';
  };

  const loadHorarios = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));
      const response = await ApiService.getHorarios();
      
      if (response.success && Array.isArray(response.data)) {
        setHorarios(response.data);
        const newStatus = checkIfOpen(response.data);
        setStatus(newStatus);
      } else {
        // Sin horarios = abierto por defecto
        setStatus({
          isOpen: true,
          nextOpenTime: null,
          currentDay: DIAS_NOMBRES[new Date().getDay()],
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error loading horarios:', error);
      // En error = abierto para no bloquear
      setStatus({
        isOpen: true,
        nextOpenTime: null,
        currentDay: DIAS_NOMBRES[new Date().getDay()],
        loading: false,
        error: 'Error al cargar horarios'
      });
    }
  }, [checkIfOpen]);

  useEffect(() => {
    loadHorarios();
  }, [loadHorarios]);

  // Verificar cada minuto
  useEffect(() => {
    if (horarios.length === 0) return;

    const interval = setInterval(() => {
      const newStatus = checkIfOpen(horarios);
      setStatus(newStatus);
    }, 60000);

    return () => clearInterval(interval);
  }, [horarios, checkIfOpen]);

  return { ...status, refresh: loadHorarios };
};

export default useStoreStatus;
