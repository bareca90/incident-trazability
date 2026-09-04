# 🚀 Guía de Despliegue en Producción — Ubuntu Server con Docker

Esta guía detalla el procedimiento paso a paso para desplegar **DevTrace** en un servidor con **Ubuntu Server (20.04 / 22.04 / 24.04 LTS)** utilizando Docker y Docker Compose.

---

## 📋 Arquitectura de Despliegue

El despliegue en producción levanta tres contenedores orquestados en una red interna privada:

1. **`devtrace-frontend` (Nginx):** Expone el puerto `80` (o el puerto configurado), sirve la aplicación compilada de React y actúa como proxy inverso hacia el backend en las rutas `/api/` y `/uploads/`.
2. **`devtrace-backend` (Node.js 20):** Ejecuta la API REST en el puerto interno `3838`, gestiona Prisma ORM y la persistencia de archivos subidos en el volumen `devtrace_backend_uploads`.
3. **`devtrace-postgres` (PostgreSQL 16):** Base de datos relacional con volumen persistente `devtrace_postgres_data` y script inicial `init.sql` ejecutado automáticamente al primer inicio.
4. **`devtrace-adminer` (Opcional):** Interfaz web de base de datos protegida mediante perfil.

---

## 1. Preparación del Servidor Ubuntu

Conéctate por SSH a tu servidor Ubuntu:

```bash
ssh usuario@ip-del-servidor
```

### 1.1. Actualizar el sistema e instalar utilidades básicas
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ufw ca-certificates gnupg lsb-release
```

### 1.2. Verificar Docker y Docker Compose
Verifica que Docker esté instalado y corriendo:
```bash
docker --version
docker compose version
```

> *Si no tienes Docker instalado todavía, puedes instalarlo con el script oficial:*
> ```bash
> curl -fsSL https://get.docker.com -o get-docker.sh
> sudo sh get-docker.sh
> sudo usermod -aG docker $USER
> newgrp docker
> ```

### 1.3. Configurar el Firewall (UFW)
Habilita los puertos necesarios (SSH, HTTP, HTTPS):
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 2. Clonar el Repositorio en el Servidor

Crea un directorio de aplicaciones (por ejemplo, en `/opt` o en tu carpeta de usuario):

```bash
mkdir -p ~/apps
cd ~/apps
git clone https://github.com/bareca90/incident-trazability.git
cd incident-trazability
```

---

## 3. Configurar Variables de Entorno de Producción

Copia la plantilla de producción a `.env`:

```bash
cp .env.production.example .env
```

Edita el archivo con `nano` o `vim`:

```bash
nano .env
```

### Variables recomendadas para producción:
```env
# 1. Credenciales de Base de Datos
POSTGRES_USER=postgres
POSTGRES_PASSWORD=TuPasswordMuySeguroDeProduccion123!
POSTGRES_DB=trazabilidad_db

# 2. Claves Secretas JWT (Cámbialas por cadenas aleatorias)
# Puedes generar una clave aleatoria ejecutando: openssl rand -base64 48
JWT_ACCESS_SECRET=pega_aqui_el_secreto_generado_1
JWT_REFRESH_SECRET=pega_aqui_el_secreto_generado_2
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# 3. Puertos
HTTP_PORT=80
ADMINER_PORT=8080

# 4. Límite de carga de archivos (en Megabytes)
MAX_FILE_SIZE_MB=30
```

Guarda los cambios (`Ctrl + O`, luego `Enter`, y sal con `Ctrl + X`).

---

## 4. Compilar y Levantar los Contenedores

Ejecuta el siguiente comando para construir las imágenes de frontend y backend e iniciar los contenedores en segundo plano:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 5. Verificar el Estado del Despliegue

### 5.1. Comprobar que todos los contenedores estén activos ("healthy" o "Up"):
```bash
docker compose -f docker-compose.prod.yml ps
```

Deberías ver:
```text
NAME                 IMAGE                     STATUS
devtrace-backend     incident-trazability-backend   Up (healthy)
devtrace-frontend    incident-trazability-frontend  Up
devtrace-postgres    postgres:16-alpine             Up (healthy)
```

### 5.2. Ver los registros en tiempo real:
```bash
docker compose -f docker-compose.prod.yml logs -f
```
*(Para salir de los logs presiona `Ctrl + C`).*

### 5.3. Probar la respuesta HTTP del servidor:
```bash
curl -I http://localhost
```
Debe devolver `HTTP/1.1 200 OK`.

---

## 6. Acceso al Sistema

Abre tu navegador web e ingresa a la IP o dominio de tu servidor:

```text
http://TU_IP_O_DOMINIO/
```

### Credenciales de acceso inicial:
- **Usuario/Correo:** `admin@trazabilidad.com`
- **Contraseña inicial:** `Admin123!`

> ⚠️ **Importante:** Al iniciar sesión por primera vez con el usuario administrador, el sistema exigirá automáticamente el cambio de contraseña para cumplir con las políticas de seguridad.

---

## 7. Configuración de Dominio con HTTPS / SSL (Recomendado)

Para publicar la plataforma bajo un dominio con candado de seguridad SSL (**HTTPS**):

### Opción A: Usar Certbot en el servidor host con Nginx

Si deseas que el host gestione los certificados SSL:
1. Cambia en el archivo `.env` el `HTTP_PORT=8080` (o el puerto interno que prefieras).
2. Levanta de nuevo: `docker compose -f docker-compose.prod.yml up -d`.
3. Instala Nginx y Certbot en Ubuntu:
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```
4. Configura un virtual host en `/etc/nginx/sites-available/devtrace`:
   ```nginx
   server {
       server_name trazabilidad.tudominio.com;

       client_max_body_size 30M;

       location / {
           proxy_pass http://127.0.0.1:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
5. Habilita el sitio y genera el certificado:
   ```bash
   sudo ln -s /etc/nginx/sites-available/devtrace /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot --nginx -d trazabilidad.tudominio.com
   ```

---

## 8. Mantenimiento y Operación

### 8.1. Actualizar a una nueva versión del código
Cuando subas cambios a GitHub y quieras actualizar producción:
```bash
cd ~/apps/incident-trazability
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

### 8.2. Reiniciar el sistema
```bash
docker compose -f docker-compose.prod.yml restart
```

### 8.3. Detener los contenedores
```bash
docker compose -f docker-compose.prod.yml down
```
*(Los datos de la base de datos y los archivos adjuntos se conservan intactos en los volúmenes de Docker).*

### 8.4. Respaldar la Base de Datos (Backup)
Para generar un dump SQL de la base de datos de producción:
```bash
docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres -d trazabilidad_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 8.5. Restaurar un Respaldo
```bash
cat backup_archivo.sql | docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d trazabilidad_db
```

### 8.6. Abrir Adminer (Gestor web de Base de Datos)
Para levantar temporalmente la consola de Adminer en el puerto `8080`:
```bash
docker compose -f docker-compose.prod.yml --profile tools up -d adminer
```
Para apagarlo al terminar:
```bash
docker compose -f docker-compose.prod.yml stop adminer
```
