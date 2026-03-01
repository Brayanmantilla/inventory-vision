

# 📦 Inventory Vision

Sistema de gestión de inventario con detección de objetos en tiempo real usando YOLOv8, Spring Boot, React y PostgreSQL.

---

## 🚀 Demo en vivo

| Servicio | URL |
|----------|-----|
| Frontend | https://inventory-vision-two.vercel.app |
| Backend | https://observant-empathy-production-facf.up.railway.app |
| Python/YOLOv8 | https://inventory-vision-production.up.railway.app |

**Credenciales demo:** `admin` / `admin123`

---

## 🏗️ Arquitectura

```
React (Vercel)
    ↓
Spring Boot (Railway) → PostgreSQL (Railway)
    ↓
Python/YOLOv8 (Railway)
```

---

## 🛠️ Stack tecnológico

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Spring Boot 3.3 + Java 21 + JWT + WebSocket
- **Detección:** Python 3.11 + FastAPI + YOLOv8n
- **Base de datos:** PostgreSQL 16
- **Deploy:** Vercel (frontend) + Railway (backend + Python + DB)

---

## ✨ Funcionalidades

- Login con JWT
- Cámara en tiempo real con bounding boxes
- Detección de objetos con YOLOv8
- Captura manual de objetos detectados
- Dashboard con estadísticas en tiempo real
- Gráfica de distribución por producto
- Exportar inventario a Excel
- QR para acceso desde móvil
- WebSocket para actualizaciones en tiempo real

---

## 🖥️ Correr localmente

### Requisitos
- Java 21
- Python 3.11
- Node.js 18+
- PostgreSQL 16

### 1. Base de datos
```sql
CREATE DATABASE inventory;
```

### 2. Python detector
```bash
cd python-detector
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### 3. Spring Boot backend
```bash
cd backend
./mvnw spring-boot:run
```

### 4. React frontend
```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173` y usa `admin` / `admin123`.

---

## 🗄️ Base de datos

```sql
-- Tablas principales
users (id, username, password_hash, role)
products (id, name, sku, category, image_url)
inventory_records (id, product_id, quantity, detected_at, session_id)
```

---

## 🐳 Docker Compose (local)

```bash
docker-compose up -d
```

Accede en `http://localhost:3000`

---

## 📁 Estructura del proyecto

```
inventory-demo/
├── python-detector/     # FastAPI + YOLOv8
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── backend/             # Spring Boot
│   ├── src/
│   └── Dockerfile
├── frontend/            # React + Vite
│   ├── src/
│   └── vercel.json
└── docker-compose.yml
```
