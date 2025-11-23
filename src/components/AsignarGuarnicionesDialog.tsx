import GenericAssignDialog from "./GenericAssignDialog";
import ApiService from "@/services/api";

export default function AsignarGuarnicionesDialog(props) {
  return (
    <GenericAssignDialog
      {...props}
      title="Asignar Guarniciones"
      fetchItems={() => ApiService.getGuarniciones()}
      getProductItems={(p) => p.guarniciones || []}
      // guarniciones NO tienen idAxp → se quitan por ID directo
      getIdARelacion={null}
      onAdd={(productId, guarId) =>
        ApiService.addGuarnicionToProducto(productId, guarId)
      }
      onRemove={(idGuar) =>
        ApiService.removeGuarnicionFromProducto(idGuar)
      }
      itemLabel={(g) => g.nombre}
      itemDetails={(g) => (
        <div className="mt-1 text-sm text-muted-foreground">
          <span>Stock: {g.stock}</span>
        </div>
      )}
    />
  );
}