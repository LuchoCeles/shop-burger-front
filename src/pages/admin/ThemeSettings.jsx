import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Palette, Save } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/hooks/use-toast';

const ThemeSettings = () => {
  const { theme, customSections, updateTheme, updateSections } = useTheme();
  const [colors, setColors] = useState({
    primary: theme.primary,
    secondary: theme.secondary,
    accent: theme.accent
  });

  const handleSave = () => {
    updateTheme(colors);
    toast({ title: "Tema actualizado", description: "Los cambios se guardaron correctamente" });
  };

  const handleSectionToggle = (section, enabled) => {
    updateSections({ ...customSections, [section]: enabled });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Configuración de Tema</h1>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Colores del Tema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Color Primario</Label>
                <Input 
                  value={colors.primary}
                  onChange={(e) => setColors({...colors, primary: e.target.value})}
                  placeholder="32 95% 44%"
                />
              </div>
              <div>
                <Label>Color Secundario</Label>
                <Input 
                  value={colors.secondary}
                  onChange={(e) => setColors({...colors, secondary: e.target.value})}
                  placeholder="0 0% 16%"
                />
              </div>
              <div>
                <Label>Color de Acento</Label>
                <Input 
                  value={colors.accent}
                  onChange={(e) => setColors({...colors, accent: e.target.value})}
                  placeholder="45 93% 47%"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secciones del Sitio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Mostrar Menú</Label>
                <Switch 
                  checked={customSections.menu}
                  onCheckedChange={(checked) => handleSectionToggle('menu', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Mostrar Contacto</Label>
                <Switch 
                  checked={customSections.contact}
                  onCheckedChange={(checked) => handleSectionToggle('contact', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Mostrar Sobre Nosotros</Label>
                <Switch 
                  checked={customSections.about}
                  onCheckedChange={(checked) => handleSectionToggle('about', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ThemeSettings;