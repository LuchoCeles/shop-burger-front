import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Search,
  Eye,
  EyeOff
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/api';

const MenuManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descipcion: '',
    precio: '',
    idCategoria: '',
    stock: '',
    imagen: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        apiService.getProducts(),
        apiService.getCategories()
      ]);

      setProducts(productsData?.data || []);
      setCategories(categoriesData?.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.precio || !formData.idCategoria) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    const productData = {
      ...formData,
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock) || 0
    };

    try {
      if (editingProduct) {
        await apiService.updateProduct(editingProduct.id, productData);
        setProducts(prev => prev.map(p =>
          p.id === editingProduct.id ? { ...p, ...productData } : p
        ));
        toast({
          title: "Producto actualizado",
          description: "El producto se actualizó correctamente",
        });
      } else {
        const newProduct = await apiService.createProduct(productData);
        setProducts(prev => [...prev, newProduct.product || { ...productData, id: Date.now() }]);
        toast({
          title: "Producto creado",
          description: "El producto se creó correctamente",
        });
      }

      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Hubo un error al guardar el producto",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      descipcion: product.descipcion,
      precio: product.precio.toString(),
      idCategoria: product.idCategoria,
      stock: product.stock.toString(),
      imagen: product.imagen || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      await apiService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó correctamente",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Hubo un error al eliminar el producto",
        variant: "destructive"
      });
    }
  };

  const toggleStock = (productId, currentStock) => {
    const newStock = currentStock > 0 ? 0 : 10;
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, stock: newStock } : p
    ));

    toast({
      title: newStock > 0 ? "Producto habilitado" : "Producto deshabilitado",
      description: `Stock actualizado a ${newStock}`,
    });
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descipcion: '',
      precio: '',
      idCategoria: '',
      stock: '',
      imagen: ''
    });
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Menú</h1>
            <p className="text-muted-foreground">
              Administra los productos de tu carta
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Nombre del producto"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.descipcion}
                    onChange={handleInputChange}
                    placeholder="Descripción del producto"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Precio *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.precio}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={formData.idCategoria}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, idCategoria: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.nombre}>
                          {category.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="image">Imagen</Label>
                  <Input
                    id="image"
                    name="image"
                    value={formData.imagen}
                    onChange={handleInputChange}
                    type="file"
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingProduct ? 'Actualizar' : 'Crear'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-video relative bg-muted">
                <img
                  src={product.url_imagen}
                  alt={product.nombre}
                  className="object-cover w-full h-full"
                />

                <div className="absolute top-2 right-2 flex space-x-1">
                  <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                    {product.stock > 0 ? `Stock: ${product.stock}` : 'Sin Stock'}
                  </Badge>
                </div>

                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">{product.categoria}</Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.nombre}</h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {product.descripcion}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-primary">
                    ${product.precio?.toFixed(2)}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStock(product.id, product.stock)}
                  >
                    {product.stock > 0 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No se encontraron productos' : 'No hay productos'}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Limpiar búsqueda
              </Button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default MenuManager;