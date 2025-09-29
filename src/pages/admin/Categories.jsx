import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { toast } from '@/hooks/use-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  const handleAdd = () => {
    if (!newCategory.trim()) return;
    
    const category = {
      id: Date.now(),
      name: newCategory.trim()
    };
    
    setCategories([...categories, category]);
    setNewCategory('');
    toast({ title: "Categoría agregada", description: category.nombre });
  };

  const handleDelete = (id) => {
    setCategories(categories.filter(c => c.id !== id));
    toast({ title: "Categoría eliminada" });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Categorías</h1>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex space-x-2 mb-4">
              <Input
                placeholder="Nueva categoría..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              />
              <Button onClick={handleAdd}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {categories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{category.nombre}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Categories;