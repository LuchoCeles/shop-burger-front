import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import ApiService from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { toast } from 'sonner';

const CategoriasManager = () => {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const data = await ApiService.getCategorias();
      setCategorias(data);
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
        await ApiService.updateCategoria(editingCategory.id, { nombre });
        toast.success('Categoría actualizada');
      } else {
        await ApiService.createCategoria({ nombre });
        toast.success('Categoría creada');
      }
      setShowDialog(false);
      setNombre('');
      setEditingCategory(null);
      loadCategorias();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return;

    try {
      await ApiService.deleteCategoria(id);
      toast.success('Categoría eliminada');
      loadCategorias();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar');
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setNombre(category.nombre);
    setShowDialog(true);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Categorías</h1>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setNombre('');
            setShowDialog(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categorias.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
          >
            <span className="font-medium text-foreground">{cat.nombre}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(cat)}>
                <Pencil className="h-3 w-3" />
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(cat.id)}>
                <Trash2 className="h-3 w-3" />
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
    </div>
  );
};

export default CategoriasManager;
