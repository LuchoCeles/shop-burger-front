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
import { Adicional } from '@/intefaces/interfaz';
import { toast } from 'sonner';

export default function AdicionalesManager() {
  const [adicionales, setAdicionales] = useState<Adicional[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAdicional, setSelectedAdicional] = useState<Adicional | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: '',
    maxCantidad: '',
  });
  const maxLength = 25;

  useEffect(() => {
    loadAdicionales();
  }, []);

  const loadAdicionales = async () => {
    try {
      const data = await ApiService.getAdicionales();
      setAdicionales(data.data);
    } catch (error) {
      toast.error('Error al cargar los adicionales');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const adicionalData = {
      nombre: formData.nombre,
      stock: parseInt(formData.stock),
      precio: parseFloat(formData.precio),
      maxCantidad: parseInt(formData.maxCantidad),
    };

    try {
      if (selectedAdicional) {
        await ApiService.updateAdicional(selectedAdicional.id, adicionalData);
        toast.success("El adicional se actualizó correctamente");
      } else {
        await ApiService.createAdicional(adicionalData);
        toast.success("El adicional se creó correctamente");
      }
      loadAdicionales();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Error al crear o actualizar el adicional");
    }
  };

  const handleEdit = (adicional: Adicional) => {
    setSelectedAdicional(adicional);
    setFormData({
      nombre: adicional.nombre,
      precio: adicional.precio.toString(),
      stock: adicional.stock.toString(),
      maxCantidad: adicional.maxCantidad.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedAdicional) return;

    try {
      await ApiService.deleteAdicional(selectedAdicional.id);
      toast.success('El adicional se eliminó correctamente');
      loadAdicionales();
      setIsDeleteDialogOpen(false);
      setSelectedAdicional(null);
    } catch (error) {
      toast.error('Error al eliminar el adicional');
    }
  };

  const handleToggleEstado = async (adicional: Adicional) => {
    try {
      const a = await ApiService.changeStateAdicional(adicional.id);
      const estado = a.data.estado ? 'Adicional activado' : 'Adicional desactivado';
      toast.info(estado);
      loadAdicionales();
    } catch (error) {
      toast.error('Error al cambiar el estado del adicional');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      precio: '',
      stock: '',
      maxCantidad: '',
    });
    setSelectedAdicional(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Adicionales</h1>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Adicional
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {adicionales.map((adicional) => (
          <div
            key={adicional.id}
            className="border border-border rounded-lg p-4 bg-card space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{adicional.nombre}</h3>
                <p className="text-2xl font-bold text-primary mt-1">
                  ${adicional.precio}
                </p>
              </div>

            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>Estado: {adicional.estado ? 'Activo' : 'Inactivo'}</p>
              <p>Cantidad Disponible: {adicional.stock}</p>
              <p>Cantidad Máxima por Producto: {adicional.maxCantidad}</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleEstado(adicional)}
                className="flex-shrink-0"
              >
                {adicional.estado ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(adicional)}
                className="flex-1 min-w-0"
              >
                <Pencil className="mr-2 h-4 w-4" />
                <span className="truncate">Editar</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setSelectedAdicional(adicional);
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

      {adicionales.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay adicionales creados</p>
          <p className="text-sm mt-1">Crea tu primer adicional para comenzar</p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAdicional ? 'Editar Adicional' : 'Nuevo Adicional'}
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
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio">Precio</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                min="0"
                value={formData.precio}
                onChange={(e) =>
                  setFormData({ ...formData, precio: e.target.value })
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

            <div className="space-y-2">
              <Label htmlFor="maxCantidad">Cantidad Máxima por Producto</Label>
              <Input
                id="maxCantidad"
                type="number"
                min="1"
                value={formData.maxCantidad}
                onChange={(e) =>
                  setFormData({ ...formData, maxCantidad: e.target.value })
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
                {selectedAdicional ? 'Actualizar' : 'Crear'}
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
              Esta acción eliminará el adicional "{selectedAdicional?.nombre}" de forma
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