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
import { Checkbox } from './ui/checkbox';
import { 
  Adicional, 
  CartItemAdicional, 
  Guarniciones, 
  Tamaños,
  Product 
} from '@/intefaces/interfaz';
import ApiService from '@/services/api';
import { toast } from '@/hooks/use-toast';

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
  const [selectedGuarniciones, setSelectedGuarniciones] = useState<Set<number>>(new Set());
  const [selectedAdicionales, setSelectedAdicionales] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    if (open) {
      loadData();
      initializeSelections();
    }
  }, [open, product.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar tamaños
      if (product.tam && product.tam.length > 0) {
        setTamañosDisponibles(product.tam.filter(t => t.estado !== false));
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
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las opciones del producto',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeSelections = () => {
    if (initialConfig) {
      if (initialConfig.tamaño) {
        setSelectedTamaño(initialConfig.tamaño.id || null);
      }
      if (initialConfig.guarniciones) {
        setSelectedGuarniciones(new Set(initialConfig.guarniciones.map(g => g.id!)));
      }
      if (initialConfig.adicionales) {
        const initial = new Map<number, number>();
        initialConfig.adicionales.forEach(adic => {
          if (adic.cantidad > 0) {
            initial.set(adic.id, adic.cantidad);
          }
        });
        setSelectedAdicionales(initial);
      }
    }
  };

  const handleToggleGuarnicion = (guarnicionId: number) => {
    const newSet = new Set(selectedGuarniciones);
    if (newSet.has(guarnicionId)) {
      newSet.delete(guarnicionId);
    } else {
      newSet.add(guarnicionId);
    }
    setSelectedGuarniciones(newSet);
  };

  const handleIncrementAdicional = (adicional: Adicional) => {
    const current = selectedAdicionales.get(adicional.id!) || 0;
    if (current < adicional.maxCantidad && current < adicional.stock) {
      const newMap = new Map(selectedAdicionales);
      newMap.set(adicional.id!, current + 1);
      setSelectedAdicionales(newMap);
    } else if (current >= adicional.maxCantidad) {
      toast({
        title: 'Límite alcanzado',
        description: `Máximo ${adicional.maxCantidad} unidades de ${adicional.nombre}`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Sin stock',
        description: `Solo hay ${adicional.stock} unidades disponibles`,
        variant: 'destructive',
      });
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
    const guarniciones = guarnicionesDisponibles.filter(g => 
      selectedGuarniciones.has(g.id!)
    );

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
            {tamañosDisponibles.length > 0 && (
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
                      <div
                        key={tamaño.id}
                        className="flex items-center space-x-3 p-3 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                      >
                        <RadioGroupItem value={tamaño.id!.toString()} id={`tamaño-${tamaño.id}`} />
                        <Label
                          htmlFor={`tamaño-${tamaño.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{tamaño.nombre}</span>
                            {tamaño.precio && tamaño.precio > 0 && (
                              <span className="text-sm text-primary font-semibold">
                                +${tamaño.precio}
                              </span>
                            )}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Acordeón de Guarniciones */}
            {guarnicionesDisponibles.length > 0 && (
              <AccordionItem value="guarniciones">
                <AccordionTrigger className="text-base font-semibold">
                  Guarniciones
                  {selectedGuarniciones.size > 0 && (
                    <span className="ml-2 text-sm font-normal text-primary">
                      ({selectedGuarniciones.size} seleccionadas)
                    </span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {guarnicionesDisponibles.map((guarnicion) => (
                      <div
                        key={guarnicion.id}
                        className="flex items-center space-x-3 p-3 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          id={`guarnicion-${guarnicion.id}`}
                          checked={selectedGuarniciones.has(guarnicion.id!)}
                          onCheckedChange={() => handleToggleGuarnicion(guarnicion.id!)}
                        />
                        <Label
                          htmlFor={`guarnicion-${guarnicion.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{guarnicion.nombre}</span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
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
                              ${adicional.precio} - Máx: {adicional.maxCantidad}
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
