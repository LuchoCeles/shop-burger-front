import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { CreditCard, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ApiService from '@/services/api';

const MercadoPagoForm: React.FC = () => {
  const { bankData, setBankData } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Estado local del formulario MP
  const [mpEstado, setMpEstado] = useState(false);
  const [mpAccessToken, setMpAccessToken] = useState('');

  // Cargar datos cuando bankData esté disponible desde el contexto
  useEffect(() => {
    if (bankData && bankData.id) {
      setMpEstado(Boolean(bankData.mpEstado));
      setMpAccessToken(bankData.mercadoPagoAccessToken || '');
      setIsDataLoaded(true);
    }
  }, [bankData]);

  const handleSave = async () => {
    if (!bankData?.id) {
      toast.error('No se encontró el ID de datos bancarios');
      return;
    }

    // Verificar si hay cambios
    const hasChanges =
      mpEstado !== Boolean(bankData.mpEstado) ||
      mpAccessToken !== (bankData.mercadoPagoAccessToken || '');

    if (!hasChanges) {
      toast.info('No hay cambios para guardar');
      return;
    }

    try {
      setSaving(true);

      const response = await ApiService.updateBancoMP(bankData.id, {
        mpEstado,
        mpAccessToken,
      });

      if (response.success) {
        toast.success(response.message || 'Configuración de Mercado Pago actualizada');
        // Actualizar el contexto (que también actualiza localStorage automáticamente)
        setBankData(response.data);
      } else {
        toast.error(response.message || 'Error al actualizar configuración');
      }
    } catch (error) {
      console.error('Error al guardar MP:', error);
      toast.error('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  // Mostrar skeleton mientras se cargan los datos
  if (!isDataLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Mercado Pago
          </CardTitle>
          <CardDescription>
            Activar o desactivar la integración con Mercado Pago
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-48 mt-1" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex justify-end pt-4">
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Mercado Pago
        </CardTitle>
        <CardDescription>
          Activar o desactivar la integración con Mercado Pago
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="mp-estado">Estado de Mercado Pago</Label>
            <p className="text-sm text-muted-foreground">
              {mpEstado
                ? "Mercado Pago está activado"
                : "Mercado Pago está desactivado"}
            </p>
          </div>

          <Switch
            id="mp-estado"
            checked={mpEstado}
            onCheckedChange={setMpEstado}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mp-token">Token de Acceso</Label>
          <div className="relative">
            <Input
              id="mp-token"
              type={showToken ? "text" : "password"}
              value={mpAccessToken}
              onChange={(e) => setMpAccessToken(e.target.value)}
              placeholder="Ingrese su token de acceso"
              maxLength={70}
              className="pr-10"
              autoComplete="off"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            >
              {showToken ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MercadoPagoForm;
