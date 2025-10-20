import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, ListPlus } from 'lucide-react';
import ApiService from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Product, Category } from 'src/intefaces/interfaz';
import ImageEditor from '../../components/ImageEditor';
import AsignarAdicionalesDialog from '../../components/AsignarAdicionalesDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';
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


const ProductosManager = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    descuento: '',
    idCategoria: '',
    isPromocion: false,
  });
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenParaEditar, setImagenParaEditar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [adicionalesDialogOpen, setAdicionalesDialogOpen] = useState(false);
  const [selectedProductForAdicionales, setSelectedProductForAdicionales] = useState<Product | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodData, catData] = await Promise.all([ApiService.getProducts(false), ApiService.getCategories()]);
      setProductos(prodData.data);
      setCategorias(catData.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (categorias.length === 0) {
      toast.error('Debes crear al menos una categoría antes de crear productos');
      setLoading(false);
      return;
    }
    if (!formData.idCategoria) {
      toast.error('Selecciona una categoría');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('precio', formData.precio);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('descuento', formData.descuento);
      formDataToSend.append('idCategoria', formData.idCategoria);
      if (imagen) {
        formDataToSend.append('imagen', imagen);
      }

      if (editingProduct) {
        await ApiService.updateProduct(editingProduct.id, formDataToSend);
        toast.success('Producto actualizado');
      } else {
        await ApiService.createProduct(formDataToSend);
        toast.success('Producto creado');
      }

      setShowDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.message || 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await ApiService.deleteProducto(productToDelete);
      toast.success('Producto eliminado');
      loadData();
    } catch (error) {
      toast.error(error.message || 'Error al eliminar');
    } finally {
      setProductToDelete(null);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      precio: product.precio.toString(),
      stock: product.stock?.toString() || '',
      idCategoria: product.idCategoria?.toString() || '',
      descuento: product.descuento?.toString() || '',
      isPromocion: product.descuento ? true : false,
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      idCategoria: '',
      descuento: '',
      isPromocion: false,
    });
    setImagen(null);
    setImagenParaEditar(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImagenParaEditar(file);
    }
  };

  const handleImageSave = (croppedImage: File) => {
    setImagen(croppedImage);
    setImagenParaEditar(null);
  };

  const handleImageCancel = () => {
    setImagenParaEditar(null);
  };

  const handleToggleEstado = async (id: number, currentState: boolean) => {
    if (currentState === undefined) return;
    await ApiService.updateStateProduct(id, !currentState);
    loadData();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Productos</h1>
        <Button
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {productos.map((product) => (
          <div
            key={product.id}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            {product.url_imagen && (
              <img
                src={product.url_imagen}
                alt={product.nombre}
                className="h-48 w-full object-contain bg-muted"
              />
            )}
            <div className="p-4">
              <h3 className="mb-2 font-semibold text-foreground">{product.nombre}</h3>
              <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
                {product.descripcion}
              </p>
              <p className="mb-2 text-lg font-bold text-primary">${product.precio}</p>
              <p className="mb-4 text-xs text-muted-foreground">Stock: {product.stock || 'N/A'}</p>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleEstado(product.id, product.estado)}
                    title={product.estado ? 'Desactivar' : 'Activar'}
                  >
                    {product.estado ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(product)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Editar
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedProductForAdicionales(product);
                      setAdicionalesDialogOpen(true);
                    }}
                  >
                    <ListPlus className="mr-1 h-3 w-3" />
                    Adicionales
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Nombre</label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                className="bg-background"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Descripción</label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Precio</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Stock</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="bg-background"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Descuento %</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.descuento}
                onChange={(e) => setFormData({ ...formData, descuento: e.target.value })}
                className="bg-background"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Precio Final</label>
              <Input
                type="number"
                min="1"
                value={formData.precio && formData.descuento
                  ? (parseFloat(formData.precio) * (1 - parseFloat(formData.descuento) / 100)).toFixed(2)
                  : formData.precio}
                readOnly
                onChange={(e) => setFormData({ ...formData, descuento: e.target.value })}
                className="bg-background"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Categoría</label>
              <Select
                value={formData.idCategoria}
                onValueChange={(value) => setFormData({ ...formData, idCategoria: value })}
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
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Imagen</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="bg-background"
              />
              {imagen && !imagenParaEditar && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Vista previa:</p>
                  <img
                    src={URL.createObjectURL(imagen)}
                    alt="Vista previa"
                    className="h-32 w-32 object-contain rounded border border-border"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading || categorias.length === 0}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ImageEditor
        file={imagenParaEditar}
        onSave={handleImageSave}
        onCancel={handleImageCancel}
      />
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">¿Eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
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

      {selectedProductForAdicionales && (
        <AsignarAdicionalesDialog
          open={adicionalesDialogOpen}
          onOpenChange={(open) => {
            setAdicionalesDialogOpen(open);
            if (!open) {
              loadData();
            }
          }}
          Product={selectedProductForAdicionales}
        />
      )}
    </div>
  );
};

export default ProductosManager;
