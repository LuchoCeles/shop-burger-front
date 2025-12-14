import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, CreditCard, Landmark, Globe } from 'lucide-react';
import ApiService from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import DatosBancariosForm from '@/components/admin/DatosBancariosForm';
import MercadoPagoForm from '@/components/admin/MercadoPagoForm';
import ConfiguracionPaginaForm from '@/components/admin/ConfiguracionPaginaForm';
import { ConfiguracionManagerSkeleton } from '@/components/skeletons';

const ConfiguracionManager = () => {
  const { isBankAuthenticated, loginBanco, logoutBanco, loading: authLoading } = useAuth();
  
  // Estado para el login
  const [cuit, setCuit] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

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

  const handleCuitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCuit(formatCuit(e.target.value));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cuit.trim() || !password.trim()) {
      toast.error('Complete todos los campos');
      return;
    }

    try {
      setLoggingIn(true);
      const response = await ApiService.loginBanco(cuit.trim(), password);
      
      if (response.success) {
        loginBanco(response.token, response.data);
        toast.success(response.message || 'Autenticación exitosa');
        // Limpiar formulario después del login exitoso
        setCuit('');
        setPassword('');
      } else {
        toast.error(response.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast.error('Error al autenticar');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    logoutBanco();
    toast.success('Sesión cerrada correctamente');
  };

  // Mostrar skeleton mientras se carga el estado de autenticación
  if (authLoading) {
    return <ConfiguracionManagerSkeleton />;
  }

  // Formulario de login si no está autenticado
  if (!isBankAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Gestionar datos bancarios, pagos y sitio web</p>
        </div>

        <div className="flex items-center justify-center min-h-[50vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Autenticación Requerida
              </CardTitle>
              <CardDescription>
                Ingrese el CUIT y la contraseña para acceder a la configuración del sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cuit-login">CUIT</Label>
                  <Input
                    id="cuit-login"
                    type="text"
                    placeholder="XX-XXXXXXXX-X"
                    value={cuit}
                    onChange={handleCuitChange}
                    required
                    maxLength={13}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-login">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password-login"
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

                <Button type="submit" className="w-full" disabled={loggingIn}>
                  {loggingIn ? 'Verificando...' : 'Acceder'}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Credenciales de prueba:</strong>
                </p>
                <p className="text-xs text-muted-foreground select-text">
                  CUIT: 20-12345678-9<br />
                  Contraseña: admin
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Vista principal con tabs cuando está autenticado
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Gestionar datos bancarios, métodos de pago y sitio web</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
            Cerrar Sesión Segura
        </Button>
      </div>

      <Tabs defaultValue="pagina" className="w-full">
        {/* Actualizado el grid a 3 columnas */}
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pagina" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Sitio Web
          </TabsTrigger>
          <TabsTrigger value="bancarios" className="flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            Datos Bancarios
          </TabsTrigger>
          <TabsTrigger value="mercadopago" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Mercado Pago
          </TabsTrigger>
        </TabsList>

        {/* Nueva Pestaña */}
        <TabsContent value="pagina">
          <ConfiguracionPaginaForm />
        </TabsContent>

        <TabsContent value="bancarios">
          <DatosBancariosForm  onLogout={handleLogout}/>
        </TabsContent>

        <TabsContent value="mercadopago">
          <MercadoPagoForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracionManager;