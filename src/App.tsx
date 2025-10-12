import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import OrderNotification from "./components/OrderNotification";
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import DashboardHome from "./pages/admin/DashboardHome";
import ProductosManager from "./pages/admin/ProductosManager";
import CategoriasManager from "./pages/admin/CategoriasManager";
import PedidosManager from "./pages/admin/PedidosManager";
import ConfiguracionManager from "./pages/admin/ConfiguracionManager";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SocketProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <OrderNotification />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/auth" element={<Login />} />
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardHome />} />
                  <Route path="productos" element={<ProductosManager />} />
                  <Route path="categorias" element={<CategoriasManager />} />
                  <Route path="pedidos" element={<PedidosManager />} />
                  <Route path="configuracion" element={<ConfiguracionManager />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
