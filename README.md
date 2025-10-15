# 🍔 Burger Shop - Frontend

Tienda online con React, TypeScript y TailwindCSS.

## 🚀 Características

- **Landing Page**: Diseño minimalista premium con tema oscuro
- **Carrito de Compras**: Sistema funcional con almacenamiento local
- **Categorías**: Navegación por categorías con carrusel horizontal desplazable
- **Checkout**: Formulario de pedido con integración WhatsApp
- **Panel Admin**: CRUD completo de productos, categorías y gestión de pedidos
- **Autenticación**: Sistema de login para administradores
- **Responsive**: Diseño adaptativo para todos los dispositivos

## 📋 Requisitos Previos

- Node.js 16+ y npm
- Backend API ejecutándose (ver endpoints más abajo)

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env en la raíz del proyecto
VITE_API_URL=http://localhost:5000/api
```

4. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:8080`

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes de shadcn/ui
│   ├── Navbar.tsx
│   ├── CategoryCarousel.tsx
│   ├── ProductCard.tsx
│   └── CartModal.tsx
├── pages/              # Páginas principales
│   ├── Home.tsx
│   ├── Checkout.tsx
│   ├── Login.tsx
│   └── admin/          # Páginas del panel admin
├── context/            # Context API (Cart, Auth)
├── services/           # API service (api.js)
├── routes/             # ProtectedRoute component
└── hooks/              # Custom hooks
```

## 🎨 Tema y Diseño

- **Paleta de colores**: Tema oscuro con acentos dorados
- **Tipografía**: Inter (sistema por defecto)
- **Componentes**: shadcn/ui con variantes personalizadas
- **Animaciones**: Transiciones suaves con Tailwind

## 🔌 Endpoints API

### Autenticación
- `POST /login` - Login de administrador
- `POST /register` - Registro (si aplica)

### Productos
- `GET /producto/` - Listar todos los productos
- `GET /producto/:id` - Obtener un producto
- `POST /producto` - Crear producto (FormData con imagen)
- `PATCH /producto/:id` - Actualizar producto
- `DELETE /producto/:id` - Eliminar producto

### Categorías
- `GET /categoria/` - Listar categorías
- `POST /categoria` - Crear categoría
- `PUT /categoria/:id` - Actualizar categoría
- `DELETE /categoria/:id` - Eliminar categoría

### Pedidos
- `POST /pedido` - Crear pedido
- `GET /pedido` - Listar pedidos (admin)
- `PATCH /pedido/:id/estado` - Actualizar estado
- `PATCH /pedido/:id/cancelar` - Cancelar pedido
- `DELETE /pedido/:id` - Eliminar pedido

### Clientes
- `GET /cliente` - Listar clientes (admin)

## 🛒 Flujo de Compra

1. Usuario navega por productos y categorías
2. Agrega productos al carrito
3. Va al checkout y completa el formulario
4. Sistema crea el pedido en la base de datos
5. Muestra información de pago (alias/CBU simulado)
6. Botón de WhatsApp con mensaje pre-armado

**Nota**: El flujo de pago es simulado. No se procesan pagos reales.

## 👨‍💼 Panel de Administración

Acceso en `/login` con credenciales de admin.

Funcionalidades:
- **Dashboard**: Resumen de productos, categorías y pedidos
- **Productos**: CRUD completo con carga de imágenes
- **Categorías**: Crear, editar y eliminar categorías
- **Pedidos**: Ver y gestionar estados de pedidos

## 🔐 Autenticación

El sistema usa JWT almacenado en `localStorage`. Las rutas de admin están protegidas con `ProtectedRoute`.

## 📱 Responsive

- Mobile: Vista de columna única
- Tablet: Grid de 2 columnas
- Desktop: Grid de 3-4 columnas

## 🧪 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Linter ESLint
```

## 🚀 Deployment

1. Configurar `VITE_API_URL` con la URL de producción de tu API
2. Ejecutar `npm run build`
3. Desplegar la carpeta `dist` en tu hosting favorito

## 📝 Notas Importantes

- Las imágenes de productos se cargan desde Cloudinary (gestionado por el backend)
- El tema oscuro es el predeterminado (editable desde admin en futuro)
- Los datos bancarios (alias/CBU) son simulados
- El botón de WhatsApp abre la app con un mensaje pre-formateado

## 🤝 Contribuir

Este es un proyecto privado. Para contribuir, contacta al propietario del repositorio.

## 📄 Licencia

Todos los derechos reservados.
