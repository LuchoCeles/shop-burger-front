import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Landmark } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ApiService from '@/services/api';

interface DatosBancariosFormProps {
  onLogout: () => void;
}

const DatosBancariosForm: React.FC<DatosBancariosFormProps> = ({ onLogout }) => {
  const { bankData, setBankData } = useAuth();
  const [saving, setSaving] = useState(false);
  
  // Estado local del formulario - se inicializa vacío y se sincroniza con bankData
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cuit: '',
    cbu: '',
    alias: '',
  });

  // Sincronizar formData cuando bankData cambie
  useEffect(() => {
    if (bankData) {
      setFormData({
        nombre: bankData.nombre || '',
        apellido: bankData.apellido || '',
        cuit: bankData.cuit || '',
        cbu: bankData.cbu || '',
        alias: bankData.alias || '',
      });
    }
  }, [bankData]);

  const formatCuit = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 11);

    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 10) {
      return `${limited.slice(0, 2)}-${limited.slice(2)}`;
    } else {
      return `${limited.slice(0, 2)}-${limited.slice(2, 10)}-${limited.slice(10)}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'cuit') {
      const formatted = formatCuit(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!bankData?.id) {
      toast.error('No se encontró el ID de datos bancarios');
      return;
    }

    // Verificar si hay cambios
    const hasChanges =
      formData.nombre !== (bankData.nombre || '') ||
      formData.apellido !== (bankData.apellido || '') ||
      formData.cuit !== (bankData.cuit || '') ||
      formData.cbu !== (bankData.cbu || '') ||
      formData.alias !== (bankData.alias || '');

    if (!hasChanges) {
      toast.info('No hay cambios para guardar');
      return;
    }

    try {
      setSaving(true);
      
      const dataToSend = {
        ...formData,
      };

      const response = await ApiService.updateBanco(bankData.id, dataToSend);

      if (response.success) {
        toast.success(response.message || 'Datos bancarios actualizados');
        setBankData(response.data);
      } else {
        toast.error(response.message || 'Error al actualizar datos');
      }
    } catch (error) {
      toast.error(error.message || 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Landmark className="h-5 w-5" />
          Datos Bancarios
        </CardTitle>
        <CardDescription>
          Información de la cuenta para recibir pagos por transferencia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              maxLength={50}
              onChange={handleInputChange}
              placeholder="Nombre del titular"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellido">Apellido</Label>
            <Input
              id="apellido"
              name="apellido"
              value={formData.apellido}
              maxLength={50}
              onChange={handleInputChange}
              placeholder="Apellido del titular"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cuit">CUIT</Label>
          <Input
            id="cuit"
            name="cuit"
            value={formData.cuit}
            maxLength={13}
            onChange={handleInputChange}
            placeholder="XX-XXXXXXXX-X"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cbu">CBU</Label>
          <Input
            id="cbu"
            name="cbu"
            value={formData.cbu}
            maxLength={50}
            onChange={handleInputChange}
            placeholder="XXXXXXXXXXXXXXXXXXXXXX"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="alias">Alias</Label>
          <Input
            id="alias"
            name="alias"
            value={formData.alias}
            maxLength={50}
            onChange={handleInputChange}
            placeholder="alias.banco"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onLogout}
          >
            Cerrar Sesión
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatosBancariosForm;
