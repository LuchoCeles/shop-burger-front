import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff } from 'lucide-react';
import ApiService from '@/services/api';
import { BankData } from '@/intefaces/interfaz';

const ConfiguracionManager = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bankData, setBankData] = useState<BankData | null>(null);
  const [formData, setFormData] = useState({
    cuit: '',
    alias: '',
    cbu: '',
    apellido: '',
    nombre: '',
  });

  const fetchBankData = (data: BankData) => {
    setBankData(data);
    setFormData({
      cuit: data.cuit || '',
      alias: data.alias || '',
      cbu: data.cbu || '',
      apellido: data.apellido || '',
      nombre: data.nombre || '',
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await ApiService.loginBanco(password);
      if (response.success) {
        setIsAuthenticated(true);
        fetchBankData(response.data);
        toast.success(response.message || 'Autenticación exitosa');
      } else {
        toast.error(response.message || 'Contraseña incorrecta');
      }
    } catch (error) {
      toast.error('Error al autenticar');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const isDiferent =
        formData.cuit !== bankData?.cuit ||
        formData.alias !== bankData?.alias ||
        formData.cbu !== bankData?.cbu ||
        formData.apellido !== bankData?.apellido ||
        formData.nombre !== bankData?.nombre;
      if (!isDiferent) {
        toast.info('No hay cambios para guardar');
        return;
      }
      const response = await ApiService.updateBanco(bankData.id, formData);
      console.log(response);
      if (response.success) {
        toast.success(response.message || 'Datos actualizados correctamente');
        fetchBankData(response.data);
      } else {
        toast.error(response.message || 'Error al actualizar datos');
      }
    } catch (error) {
      toast.error('Error al guardar cambios');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Autenticación Requerida
            </CardTitle>
            <CardDescription>
              Ingrese la contraseña para acceder a la configuración bancaria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingrese la contraseña"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verificando...' : 'Acceder'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Gestionar datos bancarios</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos Bancarios</CardTitle>
          <CardDescription>
            Información de la cuenta para recibir pagos
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
              onChange={handleInputChange}
              placeholder="alias.banco"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAuthenticated(false);
                setPassword('');
              }}
            >
              Cerrar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfiguracionManager;
