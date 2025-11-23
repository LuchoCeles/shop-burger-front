import GenericAssignDialog from "./GenericAssignDialog";
import ApiService from "@/services/api";
import { Product } from "src/intefaces/interfaz";

export default function AsignarGuarnicionesDialog(props) {
  const obtenerIdGxP = (product: Product) => {
    const ids = product.guarniciones.map((g) => {
      return {
        id: g.id,
        idRelacion: g.idGxP
      }
    });
    return ids;
  }
  return (
    <GenericAssignDialog
      {...props}
      title="Asignar Guarniciones"
      fetchItems={() => ApiService.getGuarniciones()}
      getProductItems={(p) => p.guarniciones || []}
      getIdARelacion={(p) => obtenerIdGxP(p)}
      onAdd={(productId, guarId) =>
        ApiService.addGuarnicionToProducto(productId, guarId)
      }
      onRemove={(idGuar) =>
        ApiService.removeGuarnicionFromProducto(idGuar)
      }
      itemLabel={(g) => g.nombre}
      itemDetails={() => null}
    />
  );
}