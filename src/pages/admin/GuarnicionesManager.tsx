import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ApiService from '@/services/api';
import { Guarniciones } from '@/intefaces/interfaz';
import { toast } from 'sonner';

export default function GuarnicionesManager() {
  const [guarniciones, setGuarniciones] = useState<Guarniciones[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGuarnicion, setSelectedGuarnicion] = useState<Guarniciones | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    stock: ''
  });
  const maxLength = 25;

  useEffect(() => {
    loadGuarniciones();
  }, []);

  const loadGuarniciones = async () => {
    try {
      const data = await ApiService.getGuarniciones();
      setGuarniciones(data.data);
    } catch (error) {
      toast.error('Error al cargar los guarniciones');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const guarnicionData = {
      nombre: formData.nombre,
      stock: parseInt(formData.stock),
    };

    try {
      if (selectedGuarnicion) {
        await ApiService.updateGuarnicion(selectedGuarnicion.id, guarnicionData);
        toast.success("El guarnicion se actualizó correctamente");
      } else {
        await ApiService.createGuarnicion(guarnicionData);
        toast.success("El guarnicion se creó correctamente");
      }
      loadGuarniciones();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Error al crear o actualizar el guarnicion");
    }
  };

  const handleEdit = (guarnicion: Guarniciones) => {
    setSelectedGuarnicion(guarnicion);
    setFormData({
      nombre: guarnicion.nombre,
      stock: guarnicion.stock.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedGuarnicion) return;

    try {
      await ApiService.deleteGuarnicion(selectedGuarnicion.id);
      toast.success('El guarnicion se eliminó correctamente');
      loadGuarniciones();
      setIsDeleteDialogOpen(false);
      setSelectedGuarnicion(null);
    } catch (error) {
      toast.error('Error al eliminar el guarnicion');
    }
  };

  const handleToggleEstado = async (guarnicion: Guarniciones) => {
    try {
      const a = await ApiService.changeState(guarnicion.id);
      const estado = a.data.estado ? 'Guarnicion activado' : 'Guarnicion desactivado';
      toast.info(estado);
      loadGuarniciones();
    } catch (error) {
      toast.error('Error al cambiar el estado del guarnicion');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      stock: ''
    });
    setSelectedGuarnicion(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Guarniciones</h1>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Guarnicion
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {guarniciones.map((guarnicion) => (
          <div
            key={guarnicion.id}
            className="border border-border rounded-lg p-4 bg-card space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{guarnicion.nombre}</h3>
              </div>

            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>Cantidad Disponible: {guarnicion.stock}</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleEstado(guarnicion)}
                className="flex-shrink-0"
              >
                {guarnicion.estado ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(guarnicion)}
                className="flex-1 min-w-0"
              >
                <Pencil className="mr-2 h-4 w-4" />
                <span className="truncate">Editar</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setSelectedGuarnicion(guarnicion);
                  setIsDeleteDialogOpen(true);
                }}
                className="flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {guarniciones.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay guarniciones creados</p>
          <p className="text-sm mt-1">Crea tu primer guarnicion para comenzar</p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedGuarnicion ? 'Editar Guarnicion' : 'Nuevo Guarnicion'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="nombre">Nombre</Label>
                <div className="text-sm text-gray-500">
                  {formData.nombre.length} / {maxLength}
                </div>
              </div>

              <Input
                id="nombre"
                value={formData.nombre}
                maxLength={maxLength}
                autoComplete='off'
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {selectedGuarnicion ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el guarnicion "{selectedGuarnicion?.nombre}" de forma
              permanente.
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
}