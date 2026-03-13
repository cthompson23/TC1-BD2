# Restaurant API
API REST para la gestión de restaurantes, menús, platos, mesas y reservaciones.
El proyecto utiliza contenedores Docker, autenticación con Keycloak y una base de datos PostgreSQL.

## ⚙️ Tecnologías utilizadas
- **Node.js**
- **Express.js**
- **PostgreSQL**
- **Keycloak**
- **Docker**
- **Docker Compose**

## 🛠️ Instalación
Clonar repositorio:
```bash
git clone https://github.com/
```

Crear archivo ```.env``` en la raíz del proyecto:
```
PORT=5000
BD_USER=postgres
BD_PASSWORD=postgres
BD_DATABASE=restaurantes_db
BD_HOST=db
BD_PORT=5432

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=restaurantes_db

KC_BOOTSTRAP_ADMIN_USERNAME=admin
KC_BOOTSTRAP_ADMIN_PASSWORD=admin
```
Ejecutar contenedores:
```
docker compose up --build
```



