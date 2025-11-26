import { useState, useEffect } from "react";
import { Plus, Pencil, Eye, EyeOff, ListPlus, UtensilsCrossed } from "lucide-react";
import ApiService from "../../services/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Product, Category, Tamaños } from "src/intefaces/interfaz";
import ImageEditor from "../../components/ImageEditor";
import AsignarAdicionalesDialog from "../../components/AsignarAdicionalesDialog";
import AsignarGuarnicionesDialog from "../../components/AsignarGuarnicionesDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Checkbox,
} from "../../components/ui/checkbox";
import { toast } from "sonner";
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

const ProductosManager = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [tamaños, setTamaños] = useState<Tamaños[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    stock: "",
    descuento: "",
    idCategoria: "",
    isPromocion: false,
  });
  const [preciosPorTam, setPreciosPorTam] = useState<{ idTam: number; precio: string }[]>([]);
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenOriginal, setImagenOriginal] = useState<File | null>(null);
  const [imagenParaEditar, setImagenParaEditar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [adicionalesDialogOpen, setAdicionalesDialogOpen] = useState(false);
  const [guarnicionesDialogOpen, setGuarnicionesDialogOpen] = useState(false);
  const [selectedProductForAdicionales, setSelectedProductForAdicionales] = useState<Product | null>(null);
  const [selectedProductForGuarniciones, setSelectedProductForGuarniciones] = useState<Product | null>(null);



  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodData, catData, tamData, guarData] = await Promise.all([
        ApiService.getProducts(false),
        ApiService.getCategories(),
        ApiService.getTamaños(),
      ]);
      setProductos(prodData.data);
      setCategorias(catData.data);
      setTamaños(tamData.data);
    } catch (error) {
      toast.error(error.message || "Error al cargar datos");
    }
  };

  const handleReopenEditor = () => {
    if (imagenOriginal) {
      setImagenParaEditar(imagenOriginal);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (categorias.length === 0) {
      toast.error(
        "Debes crear al menos una categoría antes de crear productos"
      );
      setLoading(false);
      return;
    }
    if (!formData.idCategoria) {
      toast.error("Selecciona una categoría");
      setLoading(false);
      return;
    }
    if (preciosPorTam.length === 0) {
      toast.error("Selecciona al menos un tamaño");
      setLoading(false);
      return;
    }

    // Validar que todos los tamaños tengan precio
    const sinPrecio = preciosPorTam.find(p => !p.precio || parseFloat(p.precio) <= 0);
    if (sinPrecio) {
      toast.error("Todos los tamaños deben tener un precio válido");
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nombre", formData.nombre);
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("descuento", formData.descuento);
      formDataToSend.append("idCategoria", formData.idCategoria);
      formDataToSend.append("isPromocion", formData.isPromocion ? "true" : "false");

      // Enviar precios por tamaño
      const preciosFormatted = preciosPorTam.map(p => ({
        idTam: p.idTam,
        precio: parseFloat(p.precio)
      }));
      formDataToSend.append("tam", JSON.stringify(preciosFormatted));

      if (imagen) {
        formDataToSend.append("imagen", imagen);
      }

      if (editingProduct) {
        await ApiService.updateProduct(editingProduct.id, formDataToSend);
        toast.success("Producto actualizado");
      } else {
        await ApiService.createProduct(formDataToSend);
        toast.success("Producto creado");
      }

      setShowDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.message || "Error al guardar producto");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await ApiService.deleteProducto(productToDelete);
      toast.success("Producto eliminado");
      loadData();
    } catch (error) {
      toast.error(error.message || "Error al eliminar");
    } finally {
      setProductToDelete(null);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion || "",
      stock: product.stock?.toString() || "",
      idCategoria: product.idCategoria?.toString() || "",
      descuento: product.descuento?.toString() || "",
      isPromocion: product.descuento ? true : false,
    });

    // Cargar precios por tamaño
    if (product.tam && product.tam.length > 0) {
      const precios = product.tam.map(t => ({
        idTam: t.id!,
        precio: t.precio?.toString() || ""
      }));
      setPreciosPorTam(precios);
    }

    setShowDialog(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      nombre: "",
      descripcion: "",
      stock: "",
      idCategoria: "",
      descuento: "",
      isPromocion: false,
    });
    setPreciosPorTam([]);
    setImagen(null);
    setImagenParaEditar(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      setImagenOriginal(file);
      setImagen(null);
      setImagenParaEditar(file);
      e.target.value = "";
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

  const handleNumeric = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof typeof formData,
    options?: { allowNegative?: boolean; max?: number }
  ) => {
    const value = e.target.value;

    if (value === "") {
      setFormData({ ...formData, [fieldName]: "" });
      return;
    }
    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return;
    }

    if (!options?.allowNegative && numValue < 0) {
      return;
    }

    if (options?.max !== undefined && numValue > options.max) {
      return;
    }
    setFormData({ ...formData, [fieldName]: value });
  };

  const handleTamañoToggle = (tamId: number) => {
    const existe = preciosPorTam.find(p => p.idTam === tamId);

    if (existe) {
      // Remover tamaño
      setPreciosPorTam(preciosPorTam.filter(p => p.idTam !== tamId));
    } else {
      // Agregar tamaño
      setPreciosPorTam([...preciosPorTam, { idTam: tamId, precio: "" }]);
    }
  };

  const handlePrecioChange = (tamId: number, precio: string) => {
    setPreciosPorTam(preciosPorTam.map(p =>
      p.idTam === tamId ? { ...p, precio } : p
    ));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Productos
        </h1>
        <Button
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {productos.map((product) => (
          <div
            key={product.id}
            className="overflow-hidden rounded-lg border border-border bg-card flex flex-col"
          >
            {product.url_imagen && (
              <img
                src={product.url_imagen}
                alt={product.nombre}
                className="h-48 w-full object-contain bg-muted"
              />
            )}

            <div className="p-4 flex flex-col flex-1">
              <h3 className="mb-2 font-semibold text-foreground">{product.nombre}</h3>

              {/* 💡 Esto permite que la descripción ocupe lo que necesite SIN empujar los botones */}
              <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
                {product.descripcion}
              </p>

              <p className="mb-2 text-lg font-bold text-primary">
                {product.tam[0].nombre} $
                {new Intl.NumberFormat("es-AR", {
                  style: "decimal",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(product.tam[0].precioFinal)}
              </p>

              <p className="mb-4 text-xs text-muted-foreground">
                Stock: {product.stock || "N/A"}
              </p>

              <div className="mt-auto">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                    onClick={() => handleToggleEstado(product.id, product.estado)}
                  >
                    {product.estado ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                    onClick={() => {
                      setSelectedProductForAdicionales(product);
                      setAdicionalesDialogOpen(true);
                    }}
                  >
                    <ListPlus className="h-3 w-3" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                    onClick={() => {
                      setSelectedProductForGuarniciones(product);
                      setGuarnicionesDialogOpen(true);
                    }}
                  >
                    <UtensilsCrossed className="h-3 w-3" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 min-w-0"
                    onClick={() => handleEdit(product)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    <span className="truncate">Editar</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Nombre
              </label>
              <Input
                value={formData.nombre}
                type="text"
                placeholder="Nombre del producto"
                maxLength={50}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
                className="bg-background"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Descripción
              </label>
              <Textarea
                value={formData.descripcion}
                maxLength={255}
                placeholder="Descripción del producto"
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                className="bg-background"
              />
            </div>
            <div
              className={
                editingProduct
                  ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                  : "w-full"
              }
            >
              <div className={editingProduct ? "" : "col-span-2"}>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Stock
                </label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleNumeric(e, "stock", { max: 9999 })}
                  max="9999"
                  className="bg-background"
                />
              </div>

              {editingProduct && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Descuento %
                  </label>
                  <Input
                    type="number"
                    value={formData.descuento}
                    onChange={(e) => handleNumeric(e, "descuento", { max: 100 })}
                    max="100"
                    min="0"
                    className="bg-background"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Categoría
              </label>
              <Select
                value={formData.idCategoria}
                onValueChange={(value) =>
                  setFormData({ ...formData, idCategoria: value })
                }
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
            {formData.idCategoria && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Tamaños
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {tamaños.map((tam) => {
                      const checked = preciosPorTam.some(p => p.idTam === tam.id);

                      return (
                        <label
                          key={tam.id}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => handleTamañoToggle(tam.id!)}
                          />
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {tam.nombre}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {preciosPorTam.length > 0 && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-foreground">
                      Precios por Tamaño
                    </label>
                    {preciosPorTam.map((precio, index) => {
                      const tamaño = tamaños.find(t => t.id === precio.idTam);
                      return (
                        <div key={precio.idTam}>
                          {index > 0 && (
                            <div className="border-t border-border/50 mb-4" />
                          )}
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-foreground min-w-[100px]">
                              {tamaño?.nombre}:
                            </span>
                            <Input
                              type="number"
                              placeholder="Precio"
                              value={precio.precio}
                              onChange={(e) => handlePrecioChange(precio.idTam, e.target.value)}
                              min="0"
                              step="0.01"
                              required
                              className="bg-background"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Imagen
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="bg-background"
              />
              {imagen && !imagenParaEditar && (
                <div className="mt-2 cursor-pointer" onClick={handleReopenEditor}>
                  <p className="text-xs text-muted-foreground mb-1">
                    Vista previa (click para editar):
                  </p>
                  <img
                    src={URL.createObjectURL(imagen)}
                    alt="Vista previa"
                    className="h-32 w-32 object-contain rounded border border-border hover:opacity-80 transition"
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
                {loading ? "Guardando..." : "Guardar"}
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
      <AlertDialog
        open={!!productToDelete}
        onOpenChange={() => setProductToDelete(null)}
      >
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              ¿Eliminar este producto?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción no se puede deshacer. El producto será eliminado
              permanentemente.
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
      {selectedProductForGuarniciones && (
        <AsignarGuarnicionesDialog
          open={guarnicionesDialogOpen}
          onOpenChange={(open) => {
            setGuarnicionesDialogOpen(open);
            if (!open) loadData();
          }}
          Product={selectedProductForGuarniciones}
        />
      )}

    </div>
  );
};

export default ProductosManager;
