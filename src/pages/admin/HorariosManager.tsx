import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";
import ApiService from "../../services/api";
import { Button } from "../../components/ui/button";
import { TimePickerInput } from "../../components/TimePickerInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { toast } from "sonner";
import { HorariosManagerSkeleton } from "../../components/skeletons";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";

// Interfaces según estructura del backend
interface HorarioRango {
  id?: number;
  inicio: string;
  fin: string;
  estado: number; // 1 o 0
  tempId?: string;
}

interface HorarioDia {
  id: number;
  nombre: string;
  estado: number; // 1 o 0
  rangos: HorarioRango[];
}

const HorariosManager = () => {
  const [horarios, setHorarios] = useState<HorarioDia[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingDia, setEditingDia] = useState<HorarioDia | null>(null);
  const [tempRangos, setTempRangos] = useState<HorarioRango[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Guardar snapshot de rangos originales para comparar
  const originalRangosRef = useRef<HorarioRango[]>([]);

  useEffect(() => {
    loadHorarios();
  }, []);

  const loadHorarios = async () => {
    try {
      const res = await ApiService.getHorarios();
      if (res.success && Array.isArray(res.data)) {
        setHorarios(res.data);
        setInitialLoading(false);
      }
    } catch {
      toast.error("No se pudieron cargar los horarios");
    }
  };

  if (initialLoading) {
    return <HorariosManagerSkeleton />;
  }

  const handleEditDia = (diaId: number) => {
    const horarioDia = horarios.find(h => h.id === diaId);
    if (!horarioDia) return;

    setEditingDia(horarioDia);
    // Clonar profundo para evitar mutaciones
    const rangosClone = horarioDia.rangos.map(r => ({ ...r }));
    setTempRangos(rangosClone);
    originalRangosRef.current = horarioDia.rangos.map(r => ({ ...r }));
    setShowDialog(true);
  };

  const handleAddRango = () => {
    setTempRangos([...tempRangos, {
      tempId: `temp-${Date.now()}`,
      inicio: "11:00",
      fin: "15:00",
      estado: 1
    }]);
  };

  const handleRemoveRango = (index: number) => {
    setTempRangos(tempRangos.filter((_, i) => i !== index));
  };

  const handleUpdateRango = (index: number, field: 'inicio' | 'fin', value: string) => {
    const newRangos = [...tempRangos];
    newRangos[index] = { ...newRangos[index], [field]: value };
    setTempRangos(newRangos);
  };

  const handleToggleRangoEstado = (index: number) => {
    const newRangos = [...tempRangos];
    newRangos[index] = { 
      ...newRangos[index], 
      estado: newRangos[index].estado === 1 ? 0 : 1 
    };
    setTempRangos(newRangos);
  };

  // Comparar si hubo cambios
  const hasChanges = (): boolean => {
    const original = originalRangosRef.current;
    
    if (original.length !== tempRangos.length) return true;

    return tempRangos.some((rango, i) => {
      const orig = original[i];
      if (!orig) return true;
      return (
        rango.id !== orig.id ||
        rango.inicio !== orig.inicio ||
        rango.fin !== orig.fin ||
        rango.estado !== orig.estado
      );
    });
  };

  const handleSubmit = async () => {
    if (!editingDia) return;

    // Verificar si hay cambios
    if (!hasChanges()) {
      toast.info("No hay cambios para guardar");
      closeDialog();
      return;
    }

    setLoading(true);

    try {
      const payload = tempRangos.map(r => ({
        idHorario: r.id || null,
        horarioApertura: r.inicio,
        horarioCierre: r.fin,
        estado: r.estado === 1
      }));

      const rsp = await ApiService.updateHorario(editingDia.id, payload);
      
      if (rsp.success) {
        toast.success("Horario actualizado");
        loadHorarios();
      } else {
        toast.error("Error guardando horario");
      }

      closeDialog();
    } catch {
      toast.error("Error guardando horario");
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingDia(null);
    setTempRangos([]);
    originalRangosRef.current = [];
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold md:text-3xl">Horarios de Apertura</h1>
        <p className="text-sm text-muted-foreground">
          Configura los días y horarios en que la tienda estará disponible para recibir pedidos.
        </p>
      </div>

      <div className="grid gap-4">
        {horarios.map((horarioDia) => {
          const rangosActivos = horarioDia.rangos.filter(r => r.estado === 1);
          const isOpen = horarioDia.estado === 1 && rangosActivos.length > 0;

          return (
            <div
              key={horarioDia.id}
              className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isOpen ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'
                  }`}>
                    {isOpen ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{horarioDia.nombre}</h3>
                    {rangosActivos.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {rangosActivos.map((rango, idx) => (
                          <span key={rango.id || idx} className="text-sm text-muted-foreground">
                            {rango.inicio} - {rango.fin}
                            {idx < rangosActivos.length - 1 && ','}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin horarios configurados</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditDia(horarioDia.id)}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Configurar {editingDia?.nombre}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Rangos Horarios</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRango}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Rango
                </Button>
              </div>

              {tempRangos.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No hay rangos horarios configurados.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Agrega un rango para que la tienda esté disponible este día.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tempRangos.map((rango, index) => (
                    <div
                      key={rango.id || rango.tempId || index}
                      className="rounded-lg border border-border p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Rango {index + 1}</Label>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rango.estado === 1}
                            onCheckedChange={() => handleToggleRangoEstado(index)}
                          />
                          <Label className="text-xs">
                            {rango.estado === 1 ? 'Activo' : 'Inactivo'}
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRango(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <TimePickerInput
                          label="Apertura"
                          value={rango.inicio}
                          onChange={(value) => handleUpdateRango(index, 'inicio', value)}
                          required
                        />
                        <TimePickerInput
                          label="Cierre"
                          value={rango.fin}
                          onChange={(value) => handleUpdateRango(index, 'fin', value)}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={closeDialog}
              >
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HorariosManager;