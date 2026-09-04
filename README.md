<div align="center">

# 🛠️ DevTrace — Plataforma de Trazabilidad de Incidencias & Soluciones

**Sistema integral de gestión, diagnóstico y bitácora técnica de incidentes operacionales y de infraestructura.**

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<br />

> **DevTrace** es una solución corporativa diseñada para centralizar la resolución de incidencias de infraestructura tecnológica, bases de datos y sistemas transaccionales. Permite correlacionar tickets institucionales (como **Proactivanet**) con una bitácora técnica paso a paso (consultas SQL, comandos ejecutados, rollbacks, logs y evidencias adjuntas), asegurando trazabilidad total, base de conocimiento reutilizable y cumplimiento de políticas de seguridad.

---

</div>

## 📑 Tabla de Contenidos

- [Visión General](#-visión-general)
- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Repositorio](#-estructura-del-repositorio)
- [Puesta en Marcha (Instalación Rápida)](#-puesta-en-marcha)
  - [1. Requisitos Previos](#1-requisitos-previos)
  - [2. Configuración de Variables de Entorno](#2-configuración-de-variables-de-entorno)
  - [3. Despliegue de Base de Datos con Docker](#3-despliegue-de-base-de-datos-con-docker)
  - [4. Inicialización del Backend](#4-inicialización-del-backend)
  - [5. Inicialización del Frontend](#5-inicialización-del-frontend)
- [Módulos y Flujos de Trabajo](#-módulos-y-flujos-de-trabajo)
- [Seguridad y Control de Acceso (RBAC)](#-seguridad-y-control-de-acceso-rbac)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Scripts Disponibles](#-scripts-disponibles)
- [Créditos y Licencia](#-créditos-y-licencia)

---

## 🌟 Visión General

En entornos corporativos de alta demanda, los incidentes tecnológicos suelen resolverse de manera aislada, perdiendo el registro exacto de las consultas ejecutadas en bases de datos de producción o los comandos ejecutados en servidores.

**DevTrace** resuelve esta brecha operacional ofreciendo:
- **Trazabilidad Forense y Técnica:** Registro secuencial de acciones ejecutadas por los ingenieros (consultas SQL, configuraciones, comandos CLI, rollbacks).
- **Enlace Institucional:** Vinculación directa entre el correlativo interno del incidente (`INC-YYYY-XXXX`) y el ticket externo de mesa de ayuda (**Ticket Proactivanet**).
- **Gestión del Activo Afectado:** Documentación clara del servidor host, base de datos afectada, sistema tecnológico y departamento solicitante.
- **Gobernanza y Auditoría:** Registro cronológico de auditoría de cada modificación realizada en el sistema.

---

## 🚀 Características Principales

| Módulo | Descripción |
|---|---|
| **📊 Dashboard de Operaciones** | Métricas en tiempo real de incidentes totales, abiertos, en proceso y resueltos. Indicadores de estado de salud del sistema y últimas actividades. |
| **🎫 Gestión de Incidencias** | Ciclo de vida de incidentes con prioridades (`Baja`, `Media`, `Alta`, `Crítica`) y estados (`Abierta`, `En Proceso`, `Resuelta`, `Cerrada`, `Reabierta`, `Cancelada`). |
| **🛠️ Bitácora de Pasos de Solución** | Constructor paso a paso para documentar diagnósticos, scripts SQL, comandos, notas técnicas, planes de rollback y adjuntar capturas/archivos. |
| **👥 Gestión de Usuarios y Perfiles** | Administración de cuentas, estados de usuario (`activo`, `bloqueado`, `pendiente`), y asignación de roles de acceso. |
| **🛡️ Matriz de Permisos RBAC** | Control de acceso granular por opción de menú: `ver`, `crear`, `editar`, `eliminar`, `exportar` y `aprobar`. |
| **🔑 Ciclo de Vida de Credenciales** | Forzado de cambio de contraseña inicial (`mustChangePwd`), reseteo de claves por administradores y verificación de políticas de complejidad. |
| **🗂️ Catálogo de Sistemas** | Mantenimiento de sistemas tecnológicos corporativos para clasificación estandarizada del impacto. |
| **📜 Auditoría (Audit Logs)** | Registro inmutable de acciones de usuarios con dirección IP, agente de usuario y entidad intervenida. |

---

## 🏛️ Arquitectura del Sistema

El proyecto está diseñado bajo principios de **Clean Architecture (Arquitectura Limpia)** en el backend y una interfaz de usuario reactiva componentizada en el frontend:

```mermaid
graph TD
    subgraph Cliente ["Frontend (React + Vite)"]
        UI[UI / Páginas Tailwind CSS]
        CTX[Auth Context & State]
        AXIOS[Axios HTTP Client + Interceptores]
    end

    subgraph Servidor ["Backend (Express + Node.js)"]
        API[Router HTTP / Middleware]
        AUTH[Auth & JWT Controller]
        MW[RBAC & Rate Limit Middleware]
        UC[Use Cases / Lógica de Dominio]
        REPO[Repositorios de Infraestructura]
    end

    subgraph Persistencia ["Base de Datos (Docker)"]
        PRISMA[Prisma ORM Client]
        PG[(PostgreSQL 16 \n Esquema: trazabilidad)]
        ADMINER[Adminer DB GUI :8080]
    end

    UI --> CTX
    CTX --> AXIOS
    AXIOS -- "Bearer Token (JWT)" --> API
    API --> MW
    MW --> AUTH
    MW --> UC
    UC --> REPO
    REPO --> PRISMA
    PRISMA --> PG
    ADMINER -.-> PG
```

### Principios de Arquitectura Backend:
- **`domain/`**: Entidades centrales, contratos e interfaces independientes del framework.
- **`use-cases/`**: Orquestación de la lógica de negocio (casos de uso de autenticación, incidencias, roles, pasos).
- **`infrastructure/`**: Implementación técnica de base de datos con Prisma, rutas Express, subida de archivos (Multer) y seguridad.
- **`shared/`**: Utilidades comunes, middleware de errores, logging Winston y tokens JWT.

---

## 💻 Stack Tecnológico

### Frontend
- **Framework:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & DevServer:** [Vite 6](https://vitejs.dev/)
- **Enrutamiento:** [React Router v7](https://reactrouter.com/)
- **Estilos & UI:** [Tailwind CSS v3](https://tailwindcss.com/) + Google Material Symbols Outlined
- **Cliente HTTP:** [Axios](https://axios-http.com/) con interceptores para renovación transparente de tokens JWT

### Backend
- **Entorno de Ejecución:** [Node.js v20+](https://nodejs.org/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Framework Web:** [Express.js 4](https://expressjs.com/)
- **ORM:** [Prisma ORM 5](https://www.prisma.io/) (Soporte multi-schema en PostgreSQL)
- **Seguridad:** [Helmet](https://helmetjs.github.io/), [Bcryptjs](https://github.com/dcodeIO/bcrypt.js), [JsonWebToken (JWT)](https://jwt.io/), [Express Rate Limit](https://express-rate-limit.mintlify.app/)
- **Subida de Archivos:** [Multer](https://github.com/expressjs/multer)
- **Validación & Logging:** [Zod](https://zod.dev/) y [Winston](https://github.com/winstonjs/winston)

### Base de Datos & DevOps
- **Motor Relacional:** [PostgreSQL 16](https://www.postgresql.org/)
- **Orquestación:** [Docker](https://www.docker.com/) & `docker-compose`
- **Gestión Visual:** [Adminer](https://www.adminer.org/)

---

## 📁 Estructura del Repositorio

```text
trazabilidad_incidencias/
├── backend/                        # Servidor API REST en Node.js + TypeScript
│   ├── prisma/
│   │   └── schema.prisma           # Esquema relacional y mapeo de modelos
│   ├── src/
│   │   ├── domain/                 # Entidades y tipos de dominio
│   │   ├── infrastructure/         # Controladores, rutas, middleware y repositorios
│   │   ├── shared/                 # Utilidades globales, helpers y tokens
│   │   ├── use-cases/              # Lógica de aplicación por entidad
│   │   └── main.ts                 # Punto de entrada de la aplicación
│   ├── uploads/                    # Almacenamiento local de adjuntos
│   ├── nodemon.json                # Configuración de recarga en caliente
│   ├── package.json
│   └── tsconfig.json
├── database/
│   └── init.sql                    # Script DDL inicial, tipos enum, esquemas y seed
├── frontend/                       # Interfaz SPA en React + Vite
│   ├── src/
│   │   ├── components/             # Componentes reusables (Layout, Header, Sidebar, Modales)
│   │   ├── context/                # Contexto global de autenticación y permisos
│   │   ├── pages/                  # Vistas de la aplicación (Dashboard, Incidencias, etc.)
│   │   ├── services/               # Clientes y llamadas API con Axios
│   │   ├── types/                  # Definiciones de TypeScript
│   │   ├── App.tsx                 # Configuración de rutas y guardias protegidos
│   │   └── main.tsx                # Montaje de la aplicación React
│   ├── tailwind.config.js          # Configuración y paleta de colores personalizada
│   ├── vite.config.ts              # Configuración de Vite y proxy
│   └── package.json
├── docker-compose.yml              # Orquestador para PostgreSQL y Adminer
└── README.md                       # Documentación principal del proyecto
```

---

## ⚙️ Puesta en Marcha

### 1. Requisitos Previos

Asegúrate de contar con las siguientes herramientas instaladas:
- **Node.js**: Versión 18.x o 20.x LTS.
- **Docker Desktop**: En ejecución con Docker Compose v2+.
- **Git**: Para clonación y control de versiones.

---

### 2. Configuración de Variables de Entorno

#### Backend (`backend/.env`):
Copia el archivo de ejemplo o crea el archivo `backend/.env`:

```env
NODE_ENV=development
PORT=3000

# Conexión PostgreSQL (Docker mapeado al puerto 5433 o local 5432)
DATABASE_URL="postgresql://postgres:Sistemas123456@localhost:5433/trazabilidad_db?schema=trazabilidad"

# Seguridad JWT
JWT_ACCESS_SECRET=tu_clave_secreta_para_token_de_acceso_muy_segura
JWT_REFRESH_SECRET=tu_clave_secreta_para_refresh_token_muy_segura
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Almacenamiento de Archivos Adjuntos
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=20

# CORS y Seguridad
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
```

#### Frontend (`frontend/.env` - opcional):
Por defecto, el frontend se comunica con `http://localhost:3000/api`. Si requieres personalizar la URL del API:
```env
VITE_API_URL=http://localhost:3000/api
```

---

### 3. Despliegue de Base de Datos con Docker

Desde la raíz del proyecto, ejecuta:

```bash
docker compose up -d
```

Este comando iniciará:
- **PostgreSQL 16** escuchando en el puerto local `5433` (configurado en `docker-compose.yml`).
- **Adminer** disponible en [http://localhost:8080](http://localhost:8080) para exploración rápida de tablas.
- El archivo `database/init.sql` inicializará automáticamente el esquema `trazabilidad`, las extensiones UUID y los datos maestros.

---

### 4. Inicialización del Backend

1. Accede al directorio `backend`:
   ```bash
   cd backend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Genera el cliente de Prisma:
   ```bash
   npx prisma generate
   ```

4. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
   El backend estará corriendo en: `http://localhost:3000`

---

### 5. Inicialización del Frontend

1. Abre una nueva terminal y navega al directorio `frontend`:
   ```bash
   cd frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```
   La aplicación web estará disponible en: [http://localhost:5173](http://localhost:5173)

---

## 🎯 Módulos y Flujos de Trabajo

### 1. Autenticación y Acceso Inicial
- El inicio de sesión solicita correo electrónico y contraseña.
- Se implementa control de primera sesión con la bandera `mustChangePwd`. Si el usuario tiene cambio de clave pendiente, la aplicación lo redirige de forma obligatoria a `/cambio-clave` antes de permitir el acceso al resto del sistema.

### 2. Gestión de Incidencias & Ticket Proactivanet
- Al crear una nueva incidencia, se le asigna un correlativo institucional único (`INC-YYYY-XXXX`).
- Se vincula el código de **Ticket Proactivanet** para trazabilidad cruzada.
- Se documenta:
  - Sistema afectado.
  - Departamento solicitante.
  - Servidor / Host y Base de Datos involucrada.
  - Diagnóstico previo y causa raíz preliminar.

### 3. Bitácora de Solución Paso a Paso
Dentro del detalle de la incidencia (`/incidencias/:id`), los técnicos pueden documentar cada acción ejecutada:
- **Consulta SQL:** Sentencias DDL/DML ejecutadas con formateo de código.
- **Comando:** Instrucciones de terminal ejecutadas en los hosts o contenedores.
- **Configuración / Nota:** Modificaciones de parámetros de software o notas técnicas.
- **Rollback:** Procedimientos de contingencia en caso de revertir el cambio.
- **Evidencias Adjuntas:** Carga de capturas de pantalla, archivos de configuración o logs.

---

## 🔒 Seguridad y Control de Acceso (RBAC)

DevTrace cuenta con un modelo de autorización basado en la tabla relacional de menús y permisos:

- **Roles:** Agrupaciones como `Super Administrador`, `Especialista de Base de Datos`, `Operador de Soporte`, `Auditor`.
- **Menús:** Registro jerárquico de accesos (Dashboard, Incidencias, Usuarios, Roles, Menús, Sistemas, Bitácora).
- **Tipos de Acceso:**
  - `ver`: Lectura de pantallas y datos.
  - `crear`: Registro de nuevas entidades.
  - `editar`: Modificación de datos existentes.
  - `eliminar`: Baja o inactivación de registros.
  - `exportar`: Descarga de reportes.
  - `aprobar`: Validaciones de estado y cambios.

---

## 📡 Endpoints de la API

La API REST expone los siguientes recursos bajo el prefijo `/api`:

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/auth/login` | Inicia sesión y genera par de tokens JWT | Público |
| `POST` | `/auth/refresh` | Renueva el access token expirado | Con Refresh Token |
| `POST` | `/auth/logout` | Revoca y limpia la sesión actual | Autenticado |
| `GET` | `/incidents` | Lista incidencias con filtros y paginación | Permiso `INC_LISTA` |
| `POST` | `/incidents` | Registra una nueva incidencia | Permiso `INC_NUEVA` |
| `GET` | `/incidents/:id` | Obtiene el detalle completo de un caso | Permiso `INC_DETALLE` |
| `PUT` | `/incidents/:id` | Actualiza cabecera, estado o diagnóstico | Permiso `INC_DETALLE` |
| `POST` | `/incidents/:id/steps` | Agrega un nuevo paso a la bitácora técnica | Permiso `INC_DETALLE` |
| `POST` | `/incidents/:id/attachments`| Sube un archivo adjunto como evidencia | Permiso `INC_DETALLE` |
| `GET` | `/systems` | Lista el catálogo de sistemas | Permiso `CONF_SISTEMAS`|
| `GET` | `/users` | Gestión y listado de usuarios del sistema | Permiso `USR_LISTA` |
| `GET` | `/roles` | Listado y configuración de roles y matriz | Permiso `SEG_ROLES` |
| `GET` | `/menus` | Árbol dinámico de menús según permisos | Autenticado |
| `GET` | `/audit-logs` | Consulta histórica de bitácora de auditoría | Permiso `SEG_BITACORA` |

---

## 📜 Scripts Disponibles

### Backend (`/backend`)
- `npm run dev`: Inicia el servidor con Nodemon y recarga automática.
- `npm run build`: Compila el código TypeScript a JavaScript en la carpeta `dist/`.
- `npm start`: Inicia el servidor en producción a partir de la compilación.
- `npx prisma generate`: Actualiza los tipos de TypeScript según `schema.prisma`.
- `npx prisma studio`: Abre la interfaz visual de Prisma para inspección de datos.

### Frontend (`/frontend`)
- `npm run dev`: Inicia el servidor de desarrollo Vite con HMR.
- `npm run build`: Valida tipos (`tsc -b`) y empaqueta la aplicación para producción.
- `npm run preview`: Previsualiza el paquete compilado de producción localmente.

---

## 👥 Créditos y Licencia

Desarrollado para la gestión de infraestructura y trazabilidad técnica en **Sistemas Promarisco**.  
Todos los derechos reservados &copy; 2026.
