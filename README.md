# Burger House - Aplicación de Hamburguería

Una aplicación completa de hamburguería con panel administrativo, desarrollada en React con diseño minimalista oscuro.

## 🚀 Características

### Frontend Público
- **Home**: Landing page con hero y CTA
- **Carta/Menú**: Lista de productos con filtros y búsqueda
- **Detalle de Producto**: Galería de imágenes y descripción completa
- **Carrito**: Persistente en localStorage, widget flotante
- **Checkout**: Formulario completo con integración WhatsApp

### Panel Administrativo
- **Dashboard**: Estadísticas y resumen
- **Gestión de Menú**: CRUD completo de hamburguesas
- **Categorías**: Administración de categorías
- **Pedidos**: Listado de órdenes recibidas
- **Configuración**: Editor de tema y colores

## 🛠️ Tecnologías

- React 18+ (JavaScript, no TypeScript)
- React Router para navegación
- Tailwind CSS con diseño system personalizado
- Shadcn/UI para componentes
- Context API para estado global
- LocalStorage para persistencia

## ⚡ Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

## 🎨 Diseño

- **Tema**: Oscuro por defecto con acentos naranjas/amarillos
- **Tipografía**: Inter font family
- **Responsive**: Mobile-first approach
- **Animaciones**: Transiciones suaves y hover effects

## 🔐 Acceso Administrativo

**Credenciales de prueba:**
- Email: `admin@burger.com`
- Contraseña: `admin123`

Ruta: `/auth`

## 📱 Flujo de Compra

1. Explorar carta → Agregar al carrito
2. Revisar pedido → Checkout
3. Completar datos → Confirmar
4. Ver información de pago → WhatsApp con comprobante

## 🔧 Configuración API

La app está preparada para conectar con un backend REST. Configurar `REACT_APP_API_URL` en `.env`.

Mock data incluido para desarrollo sin backend.

## 📦 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── contexts/           # Context providers (Auth, Cart, Theme)
├── hooks/              # Custom hooks
├── pages/              # Páginas principales
│   ├── admin/          # Panel administrativo
├── services/           # API service
└── lib/                # Utilidades
```

## 🌟 Próximos Pasos

- Integrar con backend real
- Añadir sistema de pagos
- Implementar notificaciones push
- Dashboard de analytics avanzado