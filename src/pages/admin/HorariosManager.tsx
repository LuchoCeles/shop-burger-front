import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import ApiService from "../../services/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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

const HorariosManager = () => {
  const [horarios, setHorarios] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingHorario, setEditingHorario] = useState(null);

  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFin, setHorarioFin] = useState("");
  const [estado, setEstado] = useState(true);

  const [loading, setLoading] = useState(false);
  const [horarioToDelete, setHorarioToDelete] = useState(null);

  useEffect(() => {
    loadHorarios();
  }, []);

  const loadHorarios = async () => {
    try {
      //const res = await ApiService.get("/horarios");
      //setHorarios(res.data);
    } catch (err) {
      toast.error("No se pudieron cargar los horarios");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        inicio: horarioInicio,
        fin: horarioFin,
        estado,
      };

      if (editingHorario) {
        //await ApiService.patch(`/horarios/${editingHorario.id}`, payload);
        toast.success("Horario actualizado");
      } else {
        //await ApiService.post("/horarios", payload);
        toast.success("Horario creado");
      }

      setShowDialog(false);
      loadHorarios();
    } catch (err) {
      toast.error("Error guardando horario");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (horario) => {
    setEditingHorario(horario);
    setHorarioInicio(horario.inicio);
    setHorarioFin(horario.fin);
    setEstado(horario.estado);
    setShowDialog(true);
  };

  const handleToggleEstado = async (horario) => {
    try {
      /*await ApiService.patch(`/horarios/${horario.id}`, {
        estado: !horario.estado,
      });*/

      toast.success("Estado actualizado");
      loadHorarios();
    } catch {
      toast.error("No se pudo actualizar el estado");
    }
  };

  const handleDelete = async () => {
    try {
      //await ApiService.delete(`/horarios/${horarioToDelete}`);
      toast.success("Horario eliminado");
      loadHorarios();
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setHorarioToDelete(null);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Horarios</h1>

        <Button
          onClick={() => {
            setEditingHorario(null);
            setHorarioInicio("");
            setHorarioFin("");
            setEstado(true);
            setShowDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Horario
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {horarios.map((h) => (
          <div
            key={h.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border rounded-lg p-4"
          >
            <div className="flex-1">
              <p className="font-medium">
                {h.inicio} — {h.fin}
              </p>
              <p className="text-sm text-muted-foreground">
                Estado: {h.estado ? "Activo" : "Inactivo"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleToggleEstado(h)}>
                {h.estado ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>

              <Button variant="outline" size="sm" onClick={() => handleEdit(h)}>
                <Pencil className="h-3 w-3" />
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => setHorarioToDelete(h.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingHorario ? "Editar Horario" : "Nuevo Horario"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm">Hora inicio</label>
              <Input type="time" value={horarioInicio} onChange={(e) => setHorarioInicio(e.target.value)} required />
            </div>

            <div>
              <label className="text-sm">Hora fin</label>
              <Input type="time" value={horarioFin} onChange={(e) => setHorarioFin(e.target.value)} required />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!horarioToDelete} onOpenChange={() => setHorarioToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar horario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HorariosManager;