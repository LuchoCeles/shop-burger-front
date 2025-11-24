import { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import {
  Adicional,
  CartItemAdicional,
  Guarniciones,
  Tamaños,
  Product
} from '@/intefaces/interfaz';
import { toast } from 'sonner';


export interface ProductConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onConfirm: (config: {
    tamaño?: Tamaños;
    guarniciones: Guarniciones;
    adicionales: CartItemAdicional[];
  }) => void;
  initialConfig?: {
    tamaño?: Tamaños;
    guarniciones?: Guarniciones;
    adicionales?: CartItemAdicional[];
  };
}

export default function ProductConfigModal({
  open,
  onOpenChange,
  product,
  onConfirm,
  initialConfig,
}: ProductConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>('tamaños');

  // Estados para las opciones disponibles
  const [tamañosDisponibles, setTamañosDisponibles] = useState<Tamaños[]>([]);
  const [guarnicionesDisponibles, setGuarnicionesDisponibles] = useState<Guarniciones[]>([]);
  const [adicionalesDisponibles, setAdicionalesDisponibles] = useState<Adicional[]>([]);

  // Estados para las selecciones
  const [selectedTamaño, setSelectedTamaño] = useState<number | null>(null);
  const [selectedGuarnicion, setSelectedGuarnicion] = useState<number | null>(null);
  const [selectedAdicionales, setSelectedAdicionales] = useState<Map<number, number>>(new Map());

  const [precioTotal, setPrecioTotal] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      loadData();
      initializeSelections();
    }
  }, [open, product.id]);

  useEffect(() => {
    let total = 0;

    if (selectedTamaño) {
      const t = tamañosDisponibles.find(t => t.id === selectedTamaño);
      if (t) total += t.precio || 0;
    }

    total += calcularTotalAdicionales();

    setPrecioTotal(total);
  }, [selectedTamaño, selectedAdicionales, tamañosDisponibles]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar tamaños
      if (product.tam && product.tam.length > 0) {
        setTamañosDisponibles(product.tam);
      }

      // Cargar guarniciones
      if (product.guarniciones && product.guarniciones.length > 0) {
        setGuarnicionesDisponibles(product.guarniciones);
      }

      // Cargar adicionales
      if (product.adicionales && product.adicionales.length > 0) {
        setAdicionalesDisponibles(product.adicionales);
      }
    } catch (error) {
      toast.error(error.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const initializeSelections = () => {
    if (initialConfig) {
      if (initialConfig.tamaño) {
        setSelectedTamaño(initialConfig.tamaño.id || null);
      }
    } else {
      if (product.tam?.length === 1) {
        setSelectedTamaño(product.tam[0].id);
      }
    }

    if (initialConfig?.guarniciones) {
      setSelectedGuarnicion(initialConfig.guarniciones.id || null);
    }

    if (initialConfig?.adicionales) {
      const initial = new Map<number, number>();
      initialConfig.adicionales.forEach(adic => {
        if (adic.cantidad > 0) initial.set(adic.id, adic.cantidad);
      });
      setSelectedAdicionales(initial);
    }
  };

  const handleIncrementAdicional = (adicional: Adicional) => {
    const current = selectedAdicionales.get(adicional.id!) || 0;
    if (current < adicional.maxCantidad && current < adicional.stock) {
      const newMap = new Map(selectedAdicionales);
      newMap.set(adicional.id!, current + 1);
      setSelectedAdicionales(newMap);
    } else if (current >= adicional.maxCantidad) {
      toast.warning(`Máximo de ${adicional.maxCantidad} seleccionados`);
    } else {
      toast.error(`No hay más stock de ${adicional.nombre}`);
    }
  };

  const handleDecrementAdicional = (adicionalId: number) => {
    const current = selectedAdicionales.get(adicionalId) || 0;
    if (current > 0) {
      const newMap = new Map(selectedAdicionales);
      if (current === 1) {
        newMap.delete(adicionalId);
      } else {
        newMap.set(adicionalId, current - 1);
      }
      setSelectedAdicionales(newMap);
    }
  };

  const handleConfirm = () => {
    // Preparar tamaño seleccionado
    const tamaño = selectedTamaño
      ? tamañosDisponibles.find(t => t.id === selectedTamaño)
      : undefined;

    // Preparar guarniciones seleccionadas
    const guarniciones = selectedGuarnicion
      ? guarnicionesDisponibles.find(g => g.id === selectedGuarnicion)
      : undefined;

    // Preparar adicionales seleccionados
    const adicionales: CartItemAdicional[] = adicionalesDisponibles.map(adicional => ({
      id: adicional.id!,
      nombre: adicional.nombre,
      precio: adicional.precio,
      cantidad: selectedAdicionales.get(adicional.id!) || 0,
      maxCantidad: adicional.maxCantidad,
    }));

    onConfirm({
      tamaño,
      guarniciones,
      adicionales,
    });
    onOpenChange(false);
  };

  const calcularTotalAdicionales = () => {
    let total = 0;
    selectedAdicionales.forEach((cantidad, id) => {
      const adicional = adicionalesDisponibles.find(a => a.id === id);
      if (adicional) {
        total += adicional.precio * cantidad;
      }
    });
    return total;
  };

  const hayOpciones = tamañosDisponibles.length > 0 ||
    guarnicionesDisponibles.length > 0 ||
    adicionalesDisponibles.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Configurar producto{product?.nombre ? ` - "${product.nombre}"` : ''}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Cargando opciones...</div>
        ) : !hayOpciones ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No hay opciones disponibles para este producto</p>
          </div>
        ) : (
          <Accordion
            type="single"
            value={openAccordion}
            onValueChange={setOpenAccordion}
            collapsible
            className="w-full"
          >
            {/* Acordeón de Tamaños */}
            {tamañosDisponibles.length > 1 && (
              <AccordionItem value="tamaños">
                <AccordionTrigger className="text-base font-semibold">
                  Tamaños
                </AccordionTrigger>
                <AccordionContent>
                  <RadioGroup
                    value={selectedTamaño?.toString()}
                    onValueChange={(value) => setSelectedTamaño(Number(value))}
                    className="space-y-3"
                  >
                    {tamañosDisponibles.map((tamaño) => (
                      <label
                        key={tamaño.id}
                        htmlFor={`tamaño-${tamaño.id}`}
                        className="flex items-center space-x-3 p-3 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <RadioGroupItem
                          value={tamaño.id.toString()}
                          id={`tamaño-${tamaño.id}`}
                        />

                        <div className="flex justify-between items-center flex-1">
                          <span className="font-medium">{tamaño.nombre}</span>
                          {tamaño.precio > 0 && (
                            <span className="text-sm text-primary font-semibold">
                              +${tamaño.precio}
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Acordeón de Guarniciones */}
            {guarnicionesDisponibles.length > 0 && (
              <AccordionItem value="guarniciones">
                <AccordionTrigger className="text-base font-semibold">
                  Guarnición
                </AccordionTrigger>
                <AccordionContent>
                  <RadioGroup
                    value={selectedGuarnicion?.toString()}
                    onValueChange={(value) => setSelectedGuarnicion(Number(value))}
                    className="space-y-3"
                  >
                    {guarnicionesDisponibles.map((g) => (
                      <Label
                        key={g.id}
                        htmlFor={`guarnicion-${g.id}`}
                        className="flex items-center space-x-3 p-3 border border-border rounded-lg 
                            bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <RadioGroupItem
                          value={g.id!.toString()}
                          id={`guarnicion-${g.id}`}
                        />

                        <span className="flex-1">{g.nombre}</span>
                      </Label>
                    ))}
                  </RadioGroup>

                </AccordionContent>
              </AccordionItem>
            )}

            {/* Acordeón de Adicionales */}
            {adicionalesDisponibles.length > 0 && (
              <AccordionItem value="adicionales">
                <AccordionTrigger className="text-base font-semibold">
                  Adicionales
                  {selectedAdicionales.size > 0 && (
                    <span className="ml-2 text-sm font-normal text-primary">
                      ({selectedAdicionales.size} seleccionados)
                    </span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {adicionalesDisponibles.map((adicional) => {
                      const cantidad = selectedAdicionales.get(adicional.id!) || 0;
                      return (
                        <div
                          key={adicional.id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg bg-card"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{adicional.nombre}</h4>
                            <p className="text-sm text-muted-foreground">
                              ${adicional.precio}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDecrementAdicional(adicional.id!)}
                              disabled={cantidad === 0}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{cantidad}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleIncrementAdicional(adicional)}
                              disabled={cantidad >= adicional.maxCantidad || cantidad >= adicional.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {selectedAdicionales.size > 0 && (
                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Subtotal adicionales:</span>
                        <span className="font-bold text-primary">
                          ${calcularTotalAdicionales().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}


        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-bold text-primary">
            ${precioTotal?.toFixed(2) ?? '0.00'}
          </span>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
