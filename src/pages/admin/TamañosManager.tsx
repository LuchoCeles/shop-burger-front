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
import { Tamaños, Category } from '@/intefaces/interfaz';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { TamañosManagerSkeleton } from '@/components/skeletons';

export default function TamañosManager() {
  const [tamaño, setTamaño] = useState<Tamaños[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTamaño, setSelectedTamaño] = useState<Tamaños | null>(null);
  const [formData, setFormData] = useState({
    idCategoria: '',
    nombre: '',
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
  const [nombreError, setNombreError] = useState<string>('');
  const maxLength = 25;

  useEffect(() => {
    loadTamaños();
  }, []);

  const loadTamaños = async () => {
    try {
      const [dataCategories, dataTam] = await Promise.all([
        ApiService.getCategories(),
        ApiService.getTamaños(),
      ]);
      setCategorias(dataCategories.data);
      setTamaño(dataTam.data);
      setInitialLoading(false);
    } catch (error) {
      toast.error('Error al cargar los tamaños');
    }
  };

  if (initialLoading) {
    return <TamañosManagerSkeleton />;
  }

  // Filtrar tamaños por estado y categoría
  const tamañosFiltrados = tamaño.filter((t) => {
    const estadoMatch = estadoFiltro === 'todos' 
      ? true 
      : estadoFiltro === 'activos' 
        ? t.estado 
        : !t.estado;
    const categoriaMatch = categoriaFiltro === 'todos' 
      ? true 
      : t.idCategoria?.toString() === categoriaFiltro;
    return estadoMatch && categoriaMatch;
  });

  // Validar si el nombre ya existe en la categoría seleccionada
  const validarNombreDuplicado = (nombre: string, categoriaId: string) => {
    if (!nombre.trim() || !categoriaId) {
      setNombreError('');
      return false;
    }
    
    const existente = tamaño.find(
      t => t.nombre.toLowerCase().trim() === nombre.toLowerCase().trim() 
        && t.idCategoria?.toString() === categoriaId
        && t.id !== selectedTamaño?.id // Excluir el item actual si estamos editando
    );
    
    if (existente) {
      setNombreError(`Ya existe un tamaño "${nombre}" en esta categoría`);
      return true;
    }
    setNombreError('');
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar nombre duplicado antes de enviar
    if (validarNombreDuplicado(formData.nombre, formData.idCategoria)) {
      return;
    }

    try {
      if (selectedTamaño) {
        const rsp = await ApiService.updateTamaño(selectedTamaño.id, { nombre: formData.nombre, idCategoria: formData.idCategoria });
        if (rsp.success) toast.success("El tamaño se actualizó correctamente");
        else toast.error(rsp.message || "Error al actualizar el tamaño");

      } else {
        const rsp = await ApiService.createTamaño({ nombre: formData.nombre, idCategoria: formData.idCategoria });
        if (!rsp.success) toast.error(rsp.message || "Error al crear el tamaño");
        else toast.success("El tamaño se creó correctamente");
      }
      loadTamaños();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Error al crear o actualizar el tamaño");
    }
  };

  const handleEdit = (tamaño: Tamaños) => {
    setSelectedTamaño(tamaño);
    setFormData({
      idCategoria: tamaño.idCategoria ? String(tamaño.idCategoria) : '',
      nombre: tamaño.nombre
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTamaño) return;

    try {
      await ApiService.deleteTamaño(selectedTamaño.id);
      toast.success('El tamaño se eliminó correctamente');
      loadTamaños();
      setIsDeleteDialogOpen(false);
      setSelectedTamaño(null);
    } catch (error) {
      toast.error('Error al eliminar el tamaño');
    }
  };

  const handleToggleEstado = async (tamaño: Tamaños) => {
    try {
      const a = await ApiService.updateStateTamaño(tamaño.id);
      const estado = a.data.estado ? 'Tamaño activado' : 'Tamaño desactivado';
      toast.info(estado);
      loadTamaños();
    } catch (error) {
      toast.error('Error al cambiar el estado del tamaño');
    }
  };

  const resetForm = () => {
    setFormData({
      idCategoria: '',
      nombre: ''
    });
    setSelectedTamaño(null);
    setNombreError('');
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Tamaños</h1>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <Select value={estadoFiltro} onValueChange={(v) => setEstadoFiltro(v as 'todos' | 'activos' | 'inactivos')}>
            <SelectTrigger className="bg-background w-full sm:w-32">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="activos">Activos</SelectItem>
              <SelectItem value="inactivos">Inactivos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
            <SelectTrigger className="bg-background w-full sm:w-40">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openCreateDialog} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Tamaño
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {tamañosFiltrados.map((tamaño) => (
          <div
            key={tamaño.id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{tamaño.nombre}</h3>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                Categoria: {
                  categorias.find(cat => cat.id === tamaño.idCategoria)?.nombre || "Sin categoría"
                }
              </p>
            </div>

            <div className="flex items-center gap-2 w-full mt-2">

              {/* Activar/Desactivar */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleEstado(tamaño)}
                className="h-9 w-9 p-0 flex justify-center items-center"
                title={tamaño.estado ? "Desactivar" : "Activar"}
              >
                {tamaño.estado ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>

              {/* Editar */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(tamaño)}
                className="flex-1 h-9 flex justify-center items-center gap-1 px-3"
              >
                <Pencil className="h-4 w-4" />
                <span className="truncate">Editar</span>
              </Button>

              {/* Eliminar */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setSelectedTamaño(tamaño);
                  setIsDeleteDialogOpen(true);
                }}
                className="h-9 w-9 p-0 flex justify-center items-center"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

            </div>
          </div>
        ))}
      </div>

      {tamañosFiltrados.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>{tamaño.length === 0 ? 'No hay tamaños creados' : 'No hay tamaños con los filtros seleccionados'}</p>
          {tamaño.length === 0 && <p className="text-sm mt-1">Crea tu primer tamaño para comenzar</p>}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTamaño ? 'Editar Tamaño' : 'Nuevo Tamaño'}
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
                autoComplete='off'
                value={formData.nombre}
                maxLength={maxLength}
                onChange={(e) => {
                  const newNombre = e.target.value;
                  setFormData({ ...formData, nombre: newNombre });
                  validarNombreDuplicado(newNombre, formData.idCategoria);
                }}
                required
                className={nombreError ? 'border-destructive' : ''}
              />
              {nombreError && (
                <p className="text-sm text-destructive mt-1">{nombreError}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Categoría
              </label>
              <Select
                value={formData.idCategoria}
                onValueChange={(value) => {
                  setFormData({ ...formData, idCategoria: value });
                  validarNombreDuplicado(formData.nombre, value);
                }}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {selectedTamaño ? 'Actualizar' : 'Crear'}
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
              Esta acción eliminará el tamaño "{selectedTamaño?.nombre}" de forma
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