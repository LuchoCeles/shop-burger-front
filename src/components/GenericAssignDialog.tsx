import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { toast } from "sonner";

/**
 * Componente genérico para asignar items a un producto
 *
 * Props:
 * - open: boolean
 * - onOpenChange: (boolean) => void
 * - Product: Product
 * - title: string
 * - fetchItems: () => Promise<{ data: any[] }>
 * - getProductItems: (product: Product) => any[]
 * - getIdRelacion: (item) => number | undefined   → opcional (para relaciones pivot)
 * - onAdd: (productId, itemId) => Promise
 * - onRemove: (idRelacion) => Promise
 * - itemLabel: (item) => string (mostrar título)
 * - itemDetails: (item) => ReactNode html (mostrar subtítulos)
 * - itemDisabled?: (item) => boolean
 */
export default function GenericAssignDialog({
  open,
  onOpenChange,
  Product,
  title,
  fetchItems,
  getProductItems,
  getIdRelacion,
  onAdd,
  onRemove,
  itemLabel,
  itemDetails,
  itemDisabled
}) {
  const [items, setItems] = useState<any[]>([]);
  const [assignedIds, setAssignedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);


  useEffect(() => {
    if (open) loadData();
  }, [open, Product?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const resp = await fetchItems();
      const activos = resp.data.filter((x) => x.estado !== false);
      setItems(activos);

      const productItems = getProductItems(Product);
      const ids = productItems?.map((i) => i.id).filter(Boolean) || [];
      setAssignedIds(ids);

    } catch (err) {
      toast.error(err.message || "No se pudieron cargar los items");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (item) => {
    const id = item.id;
    const isAssigned = assignedIds.includes(id);

    try {
      if (isAssigned) {
        let relationId = getIdRelacion ? getIdRelacion(Product) : null;

        if (Array.isArray(relationId)) {
          relationId = relationId.find((r) => r.id === id);
          if(relationId){
            await onRemove(relationId.idRelacion);
          }
        }

        if (!relationId) {
          throw new Error("No se encontró el ID de relación para este item");
        }

        setAssignedIds((prev) => prev.filter((x) => x !== id));

        toast.success(`${title} removido`);
      } else {
        await onAdd(Product.id, id);
        setAssignedIds((prev) => [...prev, id]);

        toast.success(`${title} agregado`);
      }
    } catch (err) {
      toast.error(err.message || "No se pudo realizar la acción");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {title} {Product?.nombre ? `a "${Product.nombre}"` : ""}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No hay {title.toLowerCase()} disponibles</p>
          </div>
        ) : (
          <div className="grid gap-3 py-4">
            {items.map((item) => {
              const isAssigned = assignedIds.includes(item.id);
              const disabled = itemDisabled?.(item) ?? false;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{itemLabel(item)}</h4>
                    {itemDetails(item)}
                  </div>

                  <Button
                    variant={isAssigned ? "destructive" : "default"}
                    size="sm"
                    onClick={() => handleToggle(item)}
                    disabled={disabled}
                  >
                    {isAssigned ? (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Quitar
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}