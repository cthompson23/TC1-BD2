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

Crear archivo ```.env``` en la raíz del proyecto, por ejemplo:
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
## 📚 Documentación de la API (Swagger)
### Acceso a la documentación
Una vez que el servidor esté corriendo, puedes acceder a la interfaz en:

```bash
http://localhost:5001/api-docs
```

### Cómo probar endpoints protegidos (Admin)
Para los endpoints que requieren el rol `admin`se debe sigue:

1. **Obtener Token:** Realiza una petición de autenticación a Keycloak para obtener tu `access_token`.
2. **Autorizar:** Haz clic en el botón **"Authorize"** en la parte superior de Swagger.
3. **Insertar Token:** Pega tu token en el campo de valor.
4. **Ejecutar:** Ahora puedes usar el botón **"Try it out"** en cualquier ruta protegida.

### Endpoints Principales
| Método | Ruta | Descripción | Acceso |
|:-------|:-----|:------------|:-------|
| POST | `/api/restaurants` | Crea un nuevo restaurante | Admin |
| POST | `/api/auth/login` | Inicio de sesión y obtención de JWT | Público |
| GET | `/api/user/me` | Obtener detalles del usuario autenticado | Público |


