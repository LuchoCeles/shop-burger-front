import { useState, useEffect } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { toast } from "sonner";
import { HorariosManagerSkeleton } from "../../components/skeletons";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";

const DIAS_SEMANA = [
  { id: 1, nombre: 'Lunes', corto: 'Lun' },
  { id: 2, nombre: 'Martes', corto: 'Mar' },
  { id: 3, nombre: 'Miércoles', corto: 'Mié' },
  { id: 4, nombre: 'Jueves', corto: 'Jue' },
  { id: 5, nombre: 'Viernes', corto: 'Vie' },
  { id: 6, nombre: 'Sábado', corto: 'Sáb' },
  { id: 0, nombre: 'Domingo', corto: 'Dom' }
];

interface HorarioRango {
  id?: number;
  inicio: string;
  fin: string;
  estado: boolean;
  tempId?: string;
}

interface HorarioDia {
  id?: number;
  diaSemana: number;
  abierto: boolean;
  rangos: HorarioRango[];
}

const HorariosManager = () => {
  const [horarios, setHorarios] = useState<HorarioDia[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingDia, setEditingDia] = useState<number | null>(null);
  const [tempRangos, setTempRangos] = useState<HorarioRango[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadHorarios();
  }, []);

  const loadHorarios = async () => {
    try {
      const res = await ApiService.getHorarios();
      if (res.success && Array.isArray(res.data)) {
        setHorarios(res.data);
      } else {
        setHorarios(DIAS_SEMANA.map(dia => ({
          diaSemana: dia.id,
          abierto: false,
          rangos: []
        })));
      }
      setInitialLoading(false);
    } catch (err) {
      toast.error("No se pudieron cargar los horarios");
      setHorarios(DIAS_SEMANA.map(dia => ({
        diaSemana: dia.id,
        abierto: false,
        rangos: []
      })));
      setInitialLoading(false);
    }
  };

  if (initialLoading) {
    return <HorariosManagerSkeleton />;
  }

  const handleEditDia = (diaId: number) => {
    const horarioDia = horarios.find(h => h.diaSemana === diaId);
    setEditingDia(diaId);
    setTempRangos(horarioDia?.rangos || []);
    setShowDialog(true);
  };

  const handleAddRango = () => {
    setTempRangos([...tempRangos, {
      tempId: `temp-${Date.now()}`,
      inicio: "11:00",
      fin: "15:00",
      estado: true
    }]);
  };

  const handleRemoveRango = (index: number) => {
    const newRangos = tempRangos.filter((_, i) => i !== index);
    setTempRangos(newRangos);
  };

  const handleUpdateRango = (index: number, field: 'inicio' | 'fin', value: string) => {
    const newRangos = [...tempRangos];
    newRangos[index][field] = value;
    setTempRangos(newRangos);
  };

  const handleToggleRangoEstado = (index: number) => {
    const newRangos = [...tempRangos];
    newRangos[index].estado = !newRangos[index].estado;
    setTempRangos(newRangos);
  };

  const handleSubmit = async () => {
    if (editingDia === null) return;

    setLoading(true);

    try {
      const horarioDia = horarios.find(h => h.diaSemana === editingDia);
      
      const payload = {
        diaSemana: editingDia,
        abierto: tempRangos.length > 0,
        rangos: tempRangos.map(r => ({
          inicio: r.inicio,
          fin: r.fin,
          estado: r.estado
        }))
      };

      if (horarioDia?.id) {
        await ApiService.updateHorario(horarioDia.id, payload);
        toast.success("Horario actualizado");
      } else {
        await ApiService.createHorario(payload);
        toast.success("Horario creado");
      }

      setShowDialog(false);
      setEditingDia(null);
      setTempRangos([]);
      loadHorarios();
    } catch (err) {
      toast.error("Error guardando horario");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDiaAbierto = async (diaId: number) => {
    const horarioDia = horarios.find(h => h.diaSemana === diaId);
    
    if (!horarioDia?.id) {
      toast.error("Primero configura los horarios de este día");
      return;
    }

    try {
      await ApiService.updateHorario(horarioDia.id, {
        ...horarioDia,
        abierto: !horarioDia.abierto
      });
      toast.success("Estado actualizado");
      loadHorarios();
    } catch {
      toast.error("No se pudo actualizar el estado");
    }
  };

  const getDiaData = (diaId: number) => {
    return horarios.find(h => h.diaSemana === diaId) || {
      diaSemana: diaId,
      abierto: false,
      rangos: []
    };
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
        {DIAS_SEMANA.map((dia) => {
          const horarioDia = getDiaData(dia.id);
          const rangosActivos = horarioDia.rangos.filter(r => r.estado);

          return (
            <div
              key={dia.id}
              className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    horarioDia.abierto ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'
                  }`}>
                    {horarioDia.abierto ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{dia.nombre}</h3>
                    {rangosActivos.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {rangosActivos.map((rango, idx) => (
                          <span key={idx} className="text-sm text-muted-foreground">
                            {rango.inicio} - {rango.fin}
                            {idx < rangosActivos.length - 1 && ','}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Cerrado</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {horarioDia.id && (
                  <div className="flex items-center gap-2 mr-2">
                    <Switch
                      checked={horarioDia.abierto}
                      onCheckedChange={() => handleToggleDiaAbierto(dia.id)}
                    />
                    <Label className="text-sm">
                      {horarioDia.abierto ? 'Abierto' : 'Cerrado'}
                    </Label>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditDia(dia.id)}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Configurar {DIAS_SEMANA.find(d => d.id === editingDia)?.nombre}
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
                            checked={rango.estado}
                            onCheckedChange={() => handleToggleRangoEstado(index)}
                          />
                          <Label className="text-xs">
                            {rango.estado ? 'Activo' : 'Inactivo'}
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
                onClick={() => {
                  setShowDialog(false);
                  setEditingDia(null);
                  setTempRangos([]);
                }}
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