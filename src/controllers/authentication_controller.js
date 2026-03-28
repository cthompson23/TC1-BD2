const axios = require("axios");
const pool = require("../config/db.js"); // 1. Importa tu conexión a la DB

exports.register = async (req, res) => {
    try {
        const { username, email, password, first_name, last_name } = req.body;

        // --- PASO A: Obtener Token de Admin ---
        const adminToken = await axios.post(
            "http://keycloak:8080/realms/master/protocol/openid-connect/token",
            new URLSearchParams({
                client_id: "admin-cli",
                username: "admin",
                password: "admin",
                grant_type: "password"
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const token = adminToken.data.access_token;

        // --- PASO B: Crear Usuario en Keycloak ---
        const kcResponse = await axios.post(
            "http://keycloak:8080/admin/realms/restaurant-realm/users",
            {
                username: username,
                email: email,
                firstName: first_name,
                lastName: last_name,
                enabled: true,
                emailVerified: true,
                credentials: [{ type: "password", value: password, temporary: false }]
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // --- PASO C: Extraer el ID de Keycloak ---
        // Keycloak devuelve la URL del nuevo usuario en el header 'Location'
        // Ejemplo: http://.../users/5a8e... <- Ese final es el ID que necesitamos
        const locationHeader = kcResponse.headers.location;
        const kcUserId = locationHeader.split('/').pop();

        // --- PASO D: Insertar en tu tabla PostgreSQL ---
        await pool.query(
            "INSERT INTO usuarios (id, email, nombre) VALUES ($1, $2, $3)",
            [kcUserId, email, `${first_name} ${last_name}`]
        );

        res.json({
            message: "Usuario registrado correctamente en Keycloak y base de datos local",
            id: kcUserId
        });

    } catch (error) {
        console.error("Error en registro:", error.response ? error.response.data : error.message);
        res.status(500).json({
            error: "No se pudo registrar el usuario",
            details: error.response ? error.response.data : error.message
        });
    }
};

exports.login = async (req, res) => {
    // Tu función de login se mantiene igual. 
    // Al loguearse, el usuario recibirá el token que usará para los demás endpoints.
    try {
        const { username, password } = req.body;
        const response = await axios.post(
            "http://keycloak:8080/realms/restaurant-realm/protocol/openid-connect/token",
            new URLSearchParams({
                client_id: "restaurant-api",
                grant_type: "password",
                username: username,
                password: password
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
        res.json(response.data);
    } catch (error) {
        res.status(401).json({ error: "Credenciales inválidas" });
    }
};