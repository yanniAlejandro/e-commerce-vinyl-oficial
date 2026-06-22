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

# Arrancar en desarrollo
npm run dev
```

Frontend disponible en: http://localhost:5173

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


## Scripts útiles

```bash
# Frontend — build producción
cd frontend && npm run build

# Re-seed (vacía manualmente la DB o borra colecciones antes)
cd backend && python seed.py
```
