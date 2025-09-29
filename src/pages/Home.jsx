import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChefHat, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <main className="pt-24">
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <ChefHat className="w-16 h-16 mx-auto mb-6 text-primary" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Las Mejores
              <span className="block bg-gradient-to-r from-[hsl(var(--burger-orange))] to-[hsl(var(--burger-yellow))] bg-clip-text text-transparent">
                Hamburguesas
              </span>
              de la Ciudad
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Ingredientes frescos, sabores únicos y la pasión por crear la hamburguesa perfecta. 
              Descubre nuestra carta y déjate sorprender.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-[hsl(var(--burger-orange))] to-[hsl(var(--burger-yellow))] hover:shadow-[var(--shadow-burger)] transition-all duration-300"
              >
                <Link to="/menu" className="group">
                  Ver Nuestra Carta
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary/20 hover:bg-primary/5"
              >
                Conoce Nuestra Historia
              </Button>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-lg bg-card shadow-[var(--shadow-card)]">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Ingredientes Frescos</h3>
                <p className="text-muted-foreground">
                  Seleccionamos los mejores ingredientes locales para garantizar calidad en cada bocado.
                </p>
              </div>
              
              <div className="text-center p-8 rounded-lg bg-card shadow-[var(--shadow-card)]">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Recetas Únicas</h3>
                <p className="text-muted-foreground">
                  Cada hamburguesa es creada con nuestras recetas secretas desarrolladas por expertos.
                </p>
              </div>
              
              <div className="text-center p-8 rounded-lg bg-card shadow-[var(--shadow-card)]">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Entrega Rápida</h3>
                <p className="text-muted-foreground">
                  Preparamos y entregamos tu pedido en tiempo récord sin comprometer la calidad.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;