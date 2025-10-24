import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import ApiService from '../../services/api';
import { Category } from 'src/intefaces/interfaz';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { toast } from 'sonner';

const CategoriasManager = () => {
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category>(null);
  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState(true);
  const [loading, setLoading] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const data = await ApiService.getCategories();
      setCategorias(data.data || []);
      if (!data.success) {
        toast.error(data.message || 'Error al cargar categorías');
        return;
      }
      toast.success(data.message || 'Categorías cargadas');
    } catch (error) {
      toast.error('Error al cargar categorías');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setLoading(true);
    try {
      if (editingCategory) {
        const data = await ApiService.updateCategory(editingCategory.id, nombre);
        if (!data.success) {
          toast.error(data.message || 'Error al actualizar');
          return;
        }
        toast.success(data.message || 'Categoría actualizada');
      } else {
        const data = await ApiService.createCategory(nombre);
        if (!data.success) {
          toast.error(data.message || 'Error al crear');
          return;
        }
        toast.success(data.message || 'Categoría creada');
      }
      setShowDialog(false);
      setNombre('');
      setEditingCategory(null);
      loadCategorias();
    } catch (error) {
      toast.error(error.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const data = await ApiService.deleteCategoria(categoryToDelete);
      if (!data.success) {
        toast.error(data.message || 'Error al eliminar');
        return;
      }
      toast.success(data.message || 'Categoría eliminada');
      loadCategorias();
    } catch (error) {
      toast.error(error.message || 'Error al eliminar');
    } finally {
      setCategoryToDelete(null);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setNombre(category.nombre);
    setEstado(category.estado);
    setShowDialog(true);
  };

  const handleToggleEstado = async (category: Category) => {
    try {
      const data = await ApiService.updateStateCategory(category.id, !category.estado);
      if (!data.success) {
        toast.error(data.message || 'Error al cambiar estado');
        return;
      }
      toast.success(`Categoría ${!category.estado ? 'activada' : 'desactivada'}`);
      loadCategorias();
    } catch (error) {
      toast.error(error.message || 'Error al cambiar estado');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Categorías</h1>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setNombre('');
            setShowDialog(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {categorias.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
          >
            <span className="font-medium text-foreground break-words">{cat.nombre}</span>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleEstado(cat)}
                title={cat.estado ? 'Desactivar' : 'Activar'}
                className="flex-shrink-0"
              >
                {cat.estado ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleEdit(cat)} className="flex-1 sm:flex-initial">
                <Pencil className="h-3 w-3 sm:mr-0 mr-2" />
                <span className="sm:hidden">Editar</span>
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setCategoryToDelete(cat.id)} className="flex-1 sm:flex-initial">
                <Trash2 className="h-3 w-3 sm:mr-0 mr-2" />
                <span className="sm:hidden">Eliminar</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Nombre</label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">¿Eliminar esta categoría?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción no se puede deshacer. La categoría será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-background text-foreground hover:bg-accent">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoriasManager;
