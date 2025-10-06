import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { UtensilsCrossed, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-4 animate-fade-in">
        <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-gourmet-dark border-2 border-primary/20">
          <UtensilsCrossed className="w-12 h-12 text-primary animate-pulse" />
        </div>
        
        <h1 className="mb-4 text-8xl font-bold text-primary">404</h1>
        <h2 className="mb-4 text-3xl font-semibold text-foreground">Plato No Encontrado</h2>
        <p className="mb-8 text-lg text-muted-foreground max-w-md mx-auto">
          Parece que este plato no está en nuestro menú. 
          <br />
          ¿Qué tal si vuelves a la carta principal?
        </p>
        
        <Link to="/">
          <Button size="lg" className="gap-2">
            <Home className="w-5 h-5" />
            Volver al Menú
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
