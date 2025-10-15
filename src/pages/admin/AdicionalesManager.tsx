import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
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
import { toast } from '@/hooks/use-toast';

export default function AdicionalesManager() {
  const [adicionales, setAdicionales] = useState<Adicional[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAdicional, setSelectedAdicional] = useState<Adicional | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: '',
    cantidadMax: '',
  });

  useEffect(() => {
    loadAdicionales();
  }, []);

  const loadAdicionales = async () => {
    try {
      const data = await ApiService.getAdicionales();
      setAdicionales(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los adicionales',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const adicionalData = {
      nombre: formData.nombre,
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock),
      cantidadMax: parseInt(formData.cantidadMax),
    };

    try {
      if (selectedAdicional) {
        await ApiService.updateAdicional(selectedAdicional.id, adicionalData);
        toast({
          title: 'Adicional actualizado',
          description: 'El adicional se actualizó correctamente',
        });
      } else {
        await ApiService.createAdicional(adicionalData);
        toast({
          title: 'Adicional creado',
          description: 'El adicional se creó correctamente',
        });
      }
      loadAdicionales();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el adicional',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (adicional: Adicional) => {
    setSelectedAdicional(adicional);
    setFormData({
      nombre: adicional.nombre,
      precio: adicional.precio.toString(),
      stock: adicional.stock.toString(),
      cantidadMax: adicional.cantidadMax.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedAdicional) return;

    try {
      await ApiService.deleteAdicional(selectedAdicional.id);
      toast({
        title: 'Adicional eliminado',
        description: 'El adicional se eliminó correctamente',
      });
      loadAdicionales();
      setIsDeleteDialogOpen(false);
      setSelectedAdicional(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el adicional',
        variant: 'destructive',
      });
    }
  };

  const handleToggleEstado = async (adicional: Adicional) => {
    try {
      await ApiService.updateAdicional(adicional.id, {
        ...adicional,
        estado: !adicional.estado,
      });
      toast({
        title: adicional.estado ? 'Adicional desactivado' : 'Adicional activado',
      });
      loadAdicionales();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cambiar el estado',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      precio: '',
      stock: '',
      cantidadMax: '',
    });
    setSelectedAdicional(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Adicionales</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Adicional
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adicionales.map((adicional) => (
          <div
            key={adicional.id}
            className="border border-border rounded-lg p-4 bg-card space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{adicional.nombre}</h3>
                <p className="text-2xl font-bold text-primary mt-1">
                  ${adicional.precio.toFixed(2)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleEstado(adicional)}
              >
                {adicional.estado ? (
                  <ToggleRight className="h-5 w-5 text-green-500" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>Stock: {adicional.stock}</p>
              <p>Cantidad Máxima: {adicional.cantidadMax}</p>
              <p>Estado: {adicional.estado ? 'Activo' : 'Inactivo'}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(adicional)}
                className="flex-1"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setSelectedAdicional(adicional);
                  setIsDeleteDialogOpen(true);
                }}
                className="flex-1"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
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
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
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
              <Label htmlFor="cantidadMax">Cantidad Máxima por Pedido</Label>
              <Input
                id="cantidadMax"
                type="number"
                min="1"
                value={formData.cantidadMax}
                onChange={(e) =>
                  setFormData({ ...formData, cantidadMax: e.target.value })
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