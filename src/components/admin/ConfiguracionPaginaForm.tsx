import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, Plus, Trash2, Upload, Globe, MapPin, Phone, Image as ImageIcon, X } from 'lucide-react';
import ApiService from '@/services/api';

interface SocialLink {
  nombre: string;
  url: string;
}

const ConfiguracionPaginaForm = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Estado del formulario
  const [formData, setFormData] = useState({
    metaTitulo: '',
    nombreLocal: '',
    slogan: '',
    whatsapp: '',
    email: '',
    copyright: '',
    modoMantenimiento: false,
    estado: true,
  });

  // Estados para archivos y previsualizaciones
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [previewFavicon, setPreviewFavicon] = useState<string | null>(null);

  // Estados para listas dinámicas
  const [otrasPaginas, setOtrasPaginas] = useState<SocialLink[]>([]);
  const [direcciones, setDirecciones] = useState<{ direccion: string }[]>([]);
  const [telefonos, setTelefonos] = useState<{ telefono: string }[]>([]);

  // Cargar datos al montar
  useEffect(() => {
    fetchConfig();
    
    // Cleanup de object URLs para evitar memory leaks
    return () => {
        if (previewLogo && !previewLogo.startsWith('http')) URL.revokeObjectURL(previewLogo);
        if (previewFavicon && !previewFavicon.startsWith('http')) URL.revokeObjectURL(previewFavicon);
    };
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await ApiService.getConfiguracion();
      if (response.success && response.data) {
        const data = response.data;
        
        // Cargar datos planos. Usamos '' para que el input sea controlado.
        setFormData({
          metaTitulo: data.metaTitulo || '',
          nombreLocal: data.nombreLocal || '',
          slogan: data.slogan || '',
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          copyright: data.copyright || '',
          modoMantenimiento: !!data.modoMantenimiento, // Asegurar booleano
          estado: data.estado !== undefined ? !!data.estado : true,
        });

        // Cargar previsualizaciones existentes
        if (data.url_logo) setPreviewLogo(data.url_logo);
        if (data.favicon) setPreviewFavicon(data.favicon);

        // Cargar arrays
        setOtrasPaginas(data.otrasPaginas || []);
        setDirecciones(data.direcciones || []);
        setTelefonos(data.telefonos || []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar la configuración');
    } finally {
      setFetching(false);
    }
  };

  // Manejadores de cambios simples
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TypeScript sabe que e.target es un HTMLInputElement (o un tipo compatible)
    const { name, value } = e.target;
    // que tiene name y value.
    setFormData(prev => ({ ...prev, [name]: value }));
    };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Manejador de Archivos (Logo/Favicon)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (type === 'logo') {
        setLogoFile(file);
        setPreviewLogo(previewUrl);
      } else {
        setFaviconFile(file);
        setPreviewFavicon(previewUrl);
      }
    }
  };

  // Manejadores de Listas Dinámicas
  const addSocial = () => setOtrasPaginas([...otrasPaginas, { nombre: '', url: '' }]);
  const removeSocial = (idx: number) => setOtrasPaginas(otrasPaginas.filter((_, i) => i !== idx));
  const updateSocial = (idx: number, field: keyof SocialLink, value: string) => {
    const newItems = [...otrasPaginas];
    newItems[idx][field] = value;
    setOtrasPaginas(newItems);
  };

  const addDireccion = () => setDirecciones([...direcciones, { direccion: '' }]);
  const removeDireccion = (idx: number) => setDirecciones(direcciones.filter((_, i) => i !== idx));
  const updateDireccion = (idx: number, value: string) => {
    const newItems = [...direcciones];
    newItems[idx].direccion = value;
    setDirecciones(newItems);
  };

  const addTelefono = () => setTelefonos([...telefonos, { telefono: '' }]);
  const removeTelefono = (idx: number) => setTelefonos(telefonos.filter((_, i) => i !== idx));
  const updateTelefono = (idx: number, value: string) => {
    const newItems = [...telefonos];
    newItems[idx].telefono = value;
    setTelefonos(newItems);
  };

  // Envío del Formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = new FormData();

      // 1. Añadir datos simples
      Object.entries(formData).forEach(([key, value]) => {
        dataToSend.append(key, String(value));
      });

      // 2. Añadir archivos
      if (logoFile) dataToSend.append('logoFile', logoFile);
      if (faviconFile) dataToSend.append('faviconFile', faviconFile);

      // 3. Añadir arrays (serializados a JSON)
      dataToSend.append('otrasPaginas', JSON.stringify(otrasPaginas));
      dataToSend.append('direcciones', JSON.stringify(direcciones));
      dataToSend.append('telefonos', JSON.stringify(telefonos));

      // ** MODIFICACIÓN CLAVE: Cambiar a ApiService.updateConfiguracion que usa PUT **
      const response = await ApiService.updateConfiguracion(dataToSend);

      if (response.success) {
        toast.success('Configuración actualizada correctamente');
        // Recargar para obtener las URLs limpias del servidor
        fetchConfig(); 
        setLogoFile(null);
        setFaviconFile(null);
      } else {
        toast.error(response.message || 'Error al guardar');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Cargando datos...</p>
        </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-10">
      
      {/* Sección: Identidad Visual */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Identidad Visual</CardTitle>
                <CardDescription>Gestione el logotipo y el icono de la pestaña.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* LOGO */}
                <div className="space-y-3">
                    <Label>Logo Principal</Label>
                    <div className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-4 bg-muted/10 min-h-[160px] relative transition-colors hover:bg-muted/20">
                        {previewLogo ? (
                            <div className="relative w-full h-32 flex items-center justify-center">
                                <img 
                                    src={previewLogo} 
                                    alt="Logo Preview" 
                                    className="max-h-full max-w-full object-contain drop-shadow-sm" 
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-muted-foreground py-4">
                                <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                                <span className="text-sm font-medium">Sin logo cargado</span>
                            </div>
                        )}
                        <div className="relative">
                            <Input 
                                id="logo-upload"
                                type="file" 
                                accept="image/*" 
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'logo')} 
                            />
                            <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('logo-upload')?.click()}>
                                <Upload className="mr-2 h-4 w-4" />
                                {previewLogo ? 'Cambiar Logo' : 'Subir Logo'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* FAVICON */}
                <div className="space-y-3 pt-2">
                    <Label>Favicon (Icono de pestaña)</Label>
                    <div className="flex items-center gap-4 border rounded-lg p-3 bg-card">
                        <div className="h-12 w-12 rounded-md border bg-background flex items-center justify-center overflow-hidden shrink-0">
                            {previewFavicon ? (
                                <img src={previewFavicon} alt="Favicon" className="h-8 w-8 object-contain" />
                            ) : (
                                <Globe className="h-6 w-6 text-muted-foreground/50" />
                            )}
                        </div>
                        <div className="flex-1">
                            <Input 
                                type="file" 
                                accept="image/*" 
                                className="text-sm cursor-pointer file:cursor-pointer file:text-primary file:font-medium"
                                onChange={(e) => handleFileChange(e, 'favicon')} 
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">Recomendado: 32x32px o 64x64px</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="space-y-6">
            {/* Sección: Información Básica */}
            <Card>
                <CardHeader>
                    <CardTitle>Información General</CardTitle>
                    <CardDescription>Datos visibles para el cliente y motores de búsqueda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nombre del Local</Label>
                        <Input 
                            name="nombreLocal" 
                            value={formData.nombreLocal} 
                            onChange={handleChange} 
                            placeholder="Ej: Burger King" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Slogan</Label>
                        <Input 
                            name="slogan" 
                            value={formData.slogan} 
                            onChange={handleChange} 
                            placeholder="Ej: Las mejores hamburguesas a la parrilla"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Meta Título (SEO)</Label>
                        <Input 
                            name="metaTitulo" 
                            value={formData.metaTitulo} 
                            onChange={handleChange} 
                            placeholder="Título que aparece en Google"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Sección: Estados */}
            <Card>
                <CardHeader>
                    <CardTitle>Disponibilidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Sitio Público</Label>
                            <p className="text-sm text-muted-foreground">Si se desactiva, el sitio no será accesible.</p>
                        </div>
                        <Switch 
                            checked={formData.estado} 
                            onCheckedChange={(c) => handleSwitchChange('estado', c)} 
                        />
                    </div>
                    <div className="flex items-center justify-between border-t pt-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Modo Mantenimiento</Label>
                            <p className="text-sm text-muted-foreground">Muestra una página de "En construcción".</p>
                        </div>
                        <Switch 
                            checked={formData.modoMantenimiento} 
                            onCheckedChange={(c) => handleSwitchChange('modoMantenimiento', c)} 
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Sección: Contacto */}
      <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
                <CardTitle>Contacto Directo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Email de Contacto</Label>
                    <Input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="contacto@ejemplo.com"
                    />
                </div>
                <div className="space-y-2">
                    <Label>WhatsApp Principal</Label>
                    <Input 
                        name="whatsapp" 
                        value={formData.whatsapp} 
                        onChange={handleChange} 
                        placeholder="+54 9 11 1234 5678"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Copyright Footer</Label>
                    <Input 
                        name="copyright" 
                        value={formData.copyright} 
                        onChange={handleChange} 
                        placeholder="© 2024 Mi Empresa. Todos los derechos reservados."
                    />
                </div>
            </CardContent>
          </Card>

          {/* Listas Dinámicas */}
          <Card>
            <CardHeader>
                <CardTitle>Listas Adicionales</CardTitle>
                <CardDescription>Agregue múltiples puntos de contacto.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* Redes Sociales */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 font-semibold"><Globe className="h-4 w-4"/> Redes Sociales</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={addSocial} className="h-8 text-primary">
                            <Plus className="h-3 w-3 mr-1"/> Agregar
                        </Button>
                    </div>
                    {otrasPaginas.length === 0 && <p className="text-sm text-muted-foreground italic">No hay redes configuradas.</p>}
                    <div className="space-y-2">
                        {otrasPaginas.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-start group">
                            <Input 
                                placeholder="Nombre (Facebook)" 
                                className="flex-1"
                                value={item.nombre}
                                onChange={(e) => updateSocial(idx, 'nombre', e.target.value)}
                            />
                            <Input 
                                placeholder="https://..." 
                                className="flex-[2]"
                                value={item.url}
                                onChange={(e) => updateSocial(idx, 'url', e.target.value)}
                            />
                            <Button 
                                type="button" variant="ghost" size="icon" 
                                className="text-muted-foreground hover:text-destructive shrink-0"
                                onClick={() => removeSocial(idx)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        ))}
                    </div>
                </div>

                {/* Direcciones */}
                <div className="space-y-3 pt-2 border-t">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4"/> Sucursales</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={addDireccion} className="h-8 text-primary">
                            <Plus className="h-3 w-3 mr-1"/> Agregar
                        </Button>
                    </div>
                    {direcciones.length === 0 && <p className="text-sm text-muted-foreground italic">No hay direcciones configuradas.</p>}
                    <div className="space-y-2">
                        {direcciones.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                            <Textarea 
                                placeholder="Calle Falsa 123, Ciudad..." 
                                className="min-h-[38px] h-[38px] py-2 resize-none flex-1 text-sm"
                                value={item.direccion}
                                onChange={(e) => updateDireccion(idx, e.target.value)}
                            />
                            <Button 
                                type="button" variant="ghost" size="icon" 
                                className="text-muted-foreground hover:text-destructive shrink-0"
                                onClick={() => removeDireccion(idx)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        ))}
                    </div>
                </div>

                 {/* Teléfonos */}
                 <div className="space-y-3 pt-2 border-t">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 font-semibold"><Phone className="h-4 w-4"/> Teléfonos Extra</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={addTelefono} className="h-8 text-primary">
                            <Plus className="h-3 w-3 mr-1"/> Agregar
                        </Button>
                    </div>
                    {telefonos.length === 0 && <p className="text-sm text-muted-foreground italic">No hay teléfonos adicionales.</p>}
                    <div className="space-y-2">
                        {telefonos.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                            <Input 
                                placeholder="+54 223..." 
                                className="flex-1"
                                value={item.telefono}
                                onChange={(e) => updateTelefono(idx, e.target.value)}
                            />
                            <Button 
                                type="button" variant="ghost" size="icon" 
                                className="text-muted-foreground hover:text-destructive shrink-0"
                                onClick={() => removeTelefono(idx)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        ))}
                    </div>
                </div>

            </CardContent>
          </Card>
      </div>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <div className="bg-background/80 backdrop-blur-sm p-2 rounded-lg border shadow-sm">
            <Button type="submit" disabled={loading} size="lg" className="min-w-[200px] shadow-md">
            {loading ? (
                'Guardando cambios...'
            ) : (
                <>
                <Save className="mr-2 h-5 w-5" /> Guardar Configuración
                </>
            )}
            </Button>
        </div>
      </div>
    </form>
  );
};

export default ConfiguracionPaginaForm;