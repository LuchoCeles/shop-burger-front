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
  const [relationMap, setRelationMap] = useState<Record<number, number>>({}); // itemId -> relationId
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

      // Construir mapa de relaciones existentes
      if (getIdRelacion) {
        const relations = getIdRelacion(Product);
        if (Array.isArray(relations)) {
          const map: Record<number, number> = {};
          relations.forEach((r) => {
            if (r.id && r.idRelacion) {
              map[r.id] = r.idRelacion;
            }
          });
          setRelationMap(map);
        }
      }

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
        // Buscar el ID de relación en el mapa local primero
        const storedRelationId = relationMap[id];
        
        if (storedRelationId) {
          await onRemove(storedRelationId);
          setRelationMap((prev) => {
            const newMap = { ...prev };
            delete newMap[id];
            return newMap;
          });
        } else {
          // Fallback al método anterior
          let relationId = getIdRelacion ? getIdRelacion(Product) : null;
          if (Array.isArray(relationId)) {
            const found = relationId.find((r) => r.id === id);
            if (found) {
              await onRemove(found.idRelacion);
            } else {
              throw new Error("No se encontró el ID de relación para este item");
            }
          } else {
            throw new Error("No se encontró el ID de relación para este item");
          }
        }

        setAssignedIds((prev) => prev.filter((x) => x !== id));
        toast.success(`${title} removido`);
      } else {
        const response = await onAdd(Product.id, id);
        setAssignedIds((prev) => [...prev, id]);

        // Guardar el ID de relación devuelto por la API
        if (response?.data?.id) {
          setRelationMap((prev) => ({ ...prev, [id]: response.data.id }));
        } else if (response?.data?.idAxp) {
          setRelationMap((prev) => ({ ...prev, [id]: response.data.idAxp }));
        } else if (response?.data?.idGxP) {
          setRelationMap((prev) => ({ ...prev, [id]: response.data.idGxP }));
        }

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