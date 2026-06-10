# QTB — E-commerce de vinilos



 
```
e-commerce-prueba/
├── backend/          # API FastAPI + Beanie ODM
├── frontend/         # React + Vite + TypeScript
├── docker-compose.yml
└── README.md
```

## Requisitos previos

Instala lo siguiente si aún no lo tienes:

| Herramienta | Versión mínima | Descarga |
|-------------|----------------|----------|
| **Python** | 3.11+ | https://www.python.org/downloads/ |
| **Node.js** | 20+ | https://nodejs.org/ |
| **Docker Desktop** (opcional) | — | https://www.docker.com/products/docker-desktop/ |

Alternativa sin Docker: instala [MongoDB Community Server](https://www.mongodb.com/try/download/community) localmente.

---

## 1. Base de datos (MongoDB)

### Opción A — Docker (recomendada)

```bash
docker compose up -d
```

MongoDB quedará disponible en `mongodb://localhost:27017`.

### Opción B — MongoDB local

Asegúrate de que el servicio MongoDB esté corriendo en el puerto `27017`.

---

## 2. Backend (FastAPI)

```bash
cd backend

# Crear entorno virtual
python -m venv .venv

# Activar (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
copy .env.example .env

# Poblar la base de datos con categorías, vinilos y usuarios demo
python seed.py

# Arrancar la API
uvicorn app.main:app --reload --port 8000
```

API disponible en: http://localhost:8000  
Documentación Swagger: http://localhost:8000/docs

### Cloudinary (portadas de discos — plan gratis)

1. Crea cuenta en [cloudinary.com](https://cloudinary.com/)
2. En el **Dashboard** copia: **Cloud name**, **API Key**, **API Secret**
3. Añádelos a `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
CLOUDINARY_FOLDER=qtb/covers
```

4. Reinicia el backend
5. Como admin, en `/admin/discos` usa **Elegir imagen** al crear/editar un disco

Las imágenes se suben a Cloudinary (máx. 5 MB, JPG/PNG/WebP) y la URL pública se guarda en MongoDB.

### Usuarios de prueba (creados por seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Cliente | demo@vinylshop.com | demo1234 |
| Admin | admin@vinylshop.com | admin1234 |

---

## 3. Frontend (React)

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar entorno (opcional, el proxy de Vite ya apunta a :8000)
copy .env.example .env

# Arrancar en desarrollo
npm run dev
```

Frontend disponible en: http://localhost:5173

---

## Funcionalidades incluidas

### Backend
- Autenticación JWT (registro, login, roles `customer` / `admin`)
- Catálogo de productos con filtros (búsqueda, género, categoría, artista)
- Categorías (Rock, Jazz, Soul & Funk, etc.)
- Carrito de compras por usuario
- Checkout con validación de stock y precios
- Órdenes con idempotencia y pago simulado
- 12 vinilos de ejemplo precargados

### Frontend
- Diseño oscuro estilo tienda de vinilos (**Groove Vault**)
- Home con hero y features
- Catálogo con filtros y paginación
- Detalle de producto
- Carrito (guest en localStorage + sincronización al login)
- Checkout en pasos
- Historial de pedidos
- Login / registro
- Responsive y accesible (ARIA, navegación por teclado)

---

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/login` | Login |
| GET | `/api/products` | Listado con filtros |
| GET | `/api/products/{slug}` | Detalle |
| GET | `/api/categories` | Categorías |
| GET/POST | `/api/cart` | Carrito |
| POST | `/api/orders` | Crear pedido |
| GET | `/api/orders` | Mis pedidos |

---

## Colecciones MongoDB

- `users` — usuarios y roles
- `categories` — géneros/categorías
- `products` — discos de vinilo
- `carts` — carritos por usuario
- `orders` — pedidos con ítems embebidos

Índices en: `slug`, `sku`, `artist`, `userId`, `idempotency_key`.

---

## Scripts útiles

```bash
# Backend — tests de salud
curl http://localhost:8000/api/health

# Frontend — build producción
cd frontend && npm run build

# Re-seed (vacía manualmente la DB o borra colecciones antes)
cd backend && python seed.py
```
