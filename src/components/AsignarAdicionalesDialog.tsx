import GenericAssignDialog from "./GenericAssignDialog";
import ApiService from "@/services/api";
import { Product } from "src/intefaces/interfaz";

export default function AsignarAdicionalesDialog(props) {
  const obtenerIdAxp = (product: Product) => {
    const ids = product.adicionales.map((a) => {
      return {
        id: a.id,
        idRelacion: a.idAxp
      }
    });
    return ids;
  }
  return (
    <GenericAssignDialog
      {...props}
      title="Asignar Adicionales"
      fetchItems={() => ApiService.getAdicionales()}
      getProductItems={(p) => p.adicionales || []}
      getIdARelacion={(p) => obtenerIdAxp(p)}
      onAdd={(productId, adicionalId) =>
        ApiService.addAdicionalToProducto(productId, adicionalId)
      }
      onRemove={(idAxp) => ApiService.removeAdicionalFromProducto(idAxp)}
      itemLabel={(a) => a.nombre}
      itemDetails={(a) => (
        <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
          <span>Precio: ${a.precio}</span>
          <span>Stock: {a.stock}</span>
          <span>Máx: {a.maxCantidad}</span>
        </div>
      )}
    />
  );
}