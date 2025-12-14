import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Truck } from 'lucide-react';
import ApiService from '@/services/api';
import { Envios } from '@/intefaces/interfaz';
import { EnviosManagerSkeleton } from '@/components/skeletons';

const EnviosManager: React.FC = () => {
  const [envio, setEnvio] = useState<Envios | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEnvio();
  }, []);

  const loadEnvio = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getEnvios();

      if (response.success) {
        setEnvio(response.data);
        setLoading(false);
      } else {
        toast.error(response.message || 'Error al cargar configuración de envío');
      }
    } catch (error) {
      toast.error(error.message || 'Error al cargar configuración de envío');
    }
  };

  const handleSave = async () => {
    if (!envio) {
      toast.error('No se encontró la configuración de envío');
      return;
    }

    if (isNaN(envio.precio) || envio.precio < 0) {
      toast.error('El precio debe ser un número mayor o igual a 0');
      return;
    }

    try {
      setSaving(true);

      // Actualizar precio
      const rsp = await ApiService.updateEnvio(envio.id, {
        precio: envio.precio,
        estado: envio.estado,
      });

      if (!rsp.success) {
        toast.error(rsp.message || 'Error al actualizar los datos de envío');
        return;
      }

      setEnvio(rsp.data);
      setSaving(false);
      
      toast.success('Configuración de envío actualizada');
    } catch (error) {
      toast.error(error.message || 'Error al guardar configuración');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <EnviosManagerSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Configuración de Envío
          </CardTitle>
          <CardDescription>
            Establecer el precio y disponibilidad del servicio de envío
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="estado">Estado del Envío</Label>
              <p className="text-sm text-muted-foreground">
                {envio.estado
                  ? 'El servicio de envío está activado'
                  : 'El servicio de envío está desactivado'}
              </p>
            </div>

            <Switch
              id="estado"
              checked={envio.estado}
              onCheckedChange={(checked) =>
                setEnvio({ ...envio, estado: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="precio">Precio del Envío</Label>
            <Input
              id="precio"
              type="number"
              min="0"
              step="0.01"
              value={envio.precio}
              onChange={(e) =>
                setEnvio({
                  ...envio,
                  precio: Number(e.target.value),
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Costo del envío a domicilio
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnviosManager;