import { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';

export interface HorarioRango {
  id?: number;
  inicio: string; // formato "HH:MM"
  fin: string;    // formato "HH:MM"
  estado: boolean;
}

export interface HorarioDia {
  id?: number;
  diaSemana: number; // 0=Domingo, 1=Lunes, ..., 6=Sábado
  abierto: boolean;
  rangos: HorarioRango[];
}

export interface StoreStatus {
  isOpen: boolean;
  nextOpenTime: string | null; // "Mañana a las 11:00", "Hoy a las 20:00"
  currentDay: string;
  loading: boolean;
  error: string | null;
}

const DIAS_SEMANA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
];

export const useStoreStatus = () => {
  const [status, setStatus] = useState<StoreStatus>({
    isOpen: true, // Por defecto abierto hasta verificar
    nextOpenTime: null,
    currentDay: '',
    loading: true,
    error: null
  });

  const [horarios, setHorarios] = useState<HorarioDia[]>([]);

  // Función para verificar si la tienda está abierta ahora
  const checkIfOpen = useCallback((horariosData: HorarioDia[]): StoreStatus => {
    const now = new Date();
    const currentDay = now.getDay(); // 0=Domingo, 1=Lunes, etc.
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutos desde medianoche

    // Buscar horarios del día actual
    const todaySchedule = horariosData.find(h => h.diaSemana === currentDay);

    if (!todaySchedule || !todaySchedule.abierto) {
      // La tienda no abre hoy, buscar próximo día disponible
      const nextOpen = findNextOpenTime(horariosData, currentDay, currentTime);
      return {
        isOpen: false,
        nextOpenTime: nextOpen,
        currentDay: DIAS_SEMANA[currentDay],
        loading: false,
        error: null
      };
    }

    // Verificar si estamos dentro de algún rango horario activo
    const isInActiveRange = todaySchedule.rangos.some(rango => {
      if (!rango.estado) return false;

      const [startHour, startMin] = rango.inicio.split(':').map(Number);
      const [endHour, endMin] = rango.fin.split(':').map(Number);
      
      const startTime = startHour * 60 + startMin;
      let endTime = endHour * 60 + endMin;

      // Si el horario de fin es menor que el de inicio, significa que cruza medianoche
      if (endTime < startTime) {
        endTime += 24 * 60; // Agregar 24 horas
      }

      return currentTime >= startTime && currentTime < endTime;
    });

    if (isInActiveRange) {
      return {
        isOpen: true,
        nextOpenTime: null,
        currentDay: DIAS_SEMANA[currentDay],
        loading: false,
        error: null
      };
    }

    // La tienda está cerrada pero abre hoy o próximamente
    const nextOpen = findNextOpenTime(horariosData, currentDay, currentTime);
    return {
      isOpen: false,
      nextOpenTime: nextOpen,
      currentDay: DIAS_SEMANA[currentDay],
      loading: false,
      error: null
    };
  }, []);

  // Encuentra el próximo horario de apertura
  const findNextOpenTime = (horariosData: HorarioDia[], currentDay: number, currentTime: number): string | null => {
    // Primero buscar en el día actual si hay rangos futuros
    const todaySchedule = horariosData.find(h => h.diaSemana === currentDay);
    
    if (todaySchedule?.abierto) {
      const futureRangos = todaySchedule.rangos
        .filter(r => r.estado)
        .map(r => {
          const [h, m] = r.inicio.split(':').map(Number);
          return { time: h * 60 + m, text: r.inicio };
        })
        .filter(r => r.time > currentTime)
        .sort((a, b) => a.time - b.time);

      if (futureRangos.length > 0) {
        return `Hoy a las ${futureRangos[0].text}`;
      }
    }

    // Buscar en los próximos 7 días
    for (let i = 1; i <= 7; i++) {
      const nextDay = (currentDay + i) % 7;
      const schedule = horariosData.find(h => h.diaSemana === nextDay);

      if (schedule?.abierto && schedule.rangos.some(r => r.estado)) {
        const firstRango = schedule.rangos
          .filter(r => r.estado)
          .sort((a, b) => {
            const [ah, am] = a.inicio.split(':').map(Number);
            const [bh, bm] = b.inicio.split(':').map(Number);
            return (ah * 60 + am) - (bh * 60 + bm);
          })[0];

        const dayName = i === 1 ? 'Mañana' : DIAS_SEMANA[nextDay];
        return `${dayName} a las ${firstRango.inicio}`;
      }
    }

    return 'Próximamente';
  };

  // Cargar horarios desde la API
  const loadHorarios = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));
      const response = await ApiService.getHorarios();
      
      if (response.success && Array.isArray(response.data)) {
        setHorarios(response.data);
        const newStatus = checkIfOpen(response.data);
        setStatus(newStatus);
      } else {
        // Si no hay horarios configurados, asumir que está abierto
        setStatus({
          isOpen: true,
          nextOpenTime: null,
          currentDay: DIAS_SEMANA[new Date().getDay()],
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error loading horarios:', error);
      // En caso de error, asumir que está abierto para no bloquear la tienda
      setStatus({
        isOpen: true,
        nextOpenTime: null,
        currentDay: DIAS_SEMANA[new Date().getDay()],
        loading: false,
        error: 'Error al cargar horarios'
      });
    }
  }, [checkIfOpen]);

  // Cargar horarios al montar
  useEffect(() => {
    loadHorarios();
  }, [loadHorarios]);

  // Verificar cada minuto si el estado cambió
  useEffect(() => {
    if (horarios.length === 0) return;

    const interval = setInterval(() => {
      const newStatus = checkIfOpen(horarios);
      setStatus(newStatus);
    }, 60000); // Cada 1 minuto

    return () => clearInterval(interval);
  }, [horarios, checkIfOpen]);

  return { ...status, refresh: loadHorarios };
};

export default useStoreStatus;