import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, CreditCard, Landmark } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import ApiService from '@/services/api';
import { BankData } from '@/intefaces/interfaz';
import { useAuth } from '@/context/AuthContext';

const ConfiguracionManager = () => {
  const [password, setPassword] = useState("");
  const { loginBanco, isBankAuthenticated: isAuthenticated, logoutBanco, bankData, setBankData } = useAuth();
  const [cuit, setCuit] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cuit: '',
    alias: '',
    cbu: '',
    apellido: '',
    nombre: '',
    mpEstado: Boolean,
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchBankData(bankData);
    }
  }, [isAuthenticated, bankData]);

  const fetchBankData = (data: BankData) => {
    setBankData(data);
    setFormData({
      cuit: data.cuit || '',
      alias: data.alias || '',
      cbu: data.cbu || '',
      apellido: data.apellido || '',
      nombre: data.nombre || '',
      mpEstado: data.mpEstado,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await ApiService.loginBanco(cuit.trim(), password);
      if (response.success) {
        loginBanco(response.token, response.data);
        console.log(response.data);
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

  const handleChangeMP = async () => {
    try {
      setLoading(true);
      const rsp = await ApiService.updateBancoMP(bankData.id, formData.mpEstado);
      if (rsp.success) {
        toast.success(rsp.message || 'Estado de Mercado Pago actualizado');
        fetchBankData(rsp.data);
      } else {
        toast.error(rsp.message || 'Error al actualizar estado de Mercado Pago');
      }
    } catch (error) {
      toast.error(error.message || 'Error al guardar cambios');
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true);
      const isDiferent =
        formData.cuit !== bankData?.cuit ||
        formData.alias !== bankData?.alias ||
        formData.cbu !== bankData?.cbu ||
        formData.apellido !== bankData?.apellido ||
        formData.nombre !== bankData?.nombre ||
        formData.mpEstado !== !!bankData?.mpEstado;
      if (!isDiferent) {
        toast.info('No hay cambios para guardar');
        return;
      }

      const response = await ApiService.updateBanco(bankData.id, formData);

      if (response.success) {
        toast.success(response.message || 'Datos actualizados correctamente');
        fetchBankData(response.data);
        setBankData(response.data);
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
              Ingrese el cuit y la contraseña para acceder a la configuración bancaria.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="mb-2 block text-sm font-medium text-foreground">CUIT</label>
                <Input
                  type="text"
                  placeholder="XX-XXXXXXXX-X"
                  value={cuit}
                  onChange={(e) => setCuit(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>

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
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">
                <strong>Credenciales de prueba:</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                CUIT: 20-12345678-9<br />
                Contraseña: admin
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Gestionar datos bancarios y métodos de pago</p>
      </div>

      <Tabs defaultValue="bancarios" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bancarios" className="flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            Datos Bancarios
          </TabsTrigger>
          <TabsTrigger value="mercadopago" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Mercado Pago
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bancarios">
          <Card>
            <CardHeader>
              <CardTitle>Datos Bancarios</CardTitle>
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
                  onClick={() => { logoutBanco(); toast.success('Cierre de sesión exitoso'); }}
                >
                  Cerrar
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mercadopago">
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
                    {formData.mpEstado ? 'Mercado Pago está activado' : 'Mercado Pago está desactivado'}
                  </p>
                </div>
                <Switch
                  id="mp-estado"
                  checked={formData.mpEstado}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, mpEstado: checked }))}
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleChangeMP} disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracionManager;
