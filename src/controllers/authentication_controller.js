const axios = require("axios");
const pool = require("../config/db.js");

exports.register = async (req, res) => {
    try {
        const { username, email, password, first_name, last_name, isAdmin } = req.body; 

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

        // Crear usuario
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

        const locationHeader = kcResponse.headers.location;
        const kcUserId = locationHeader.split('/').pop();

        if (isAdmin) {
            // Obtener el ID del rol "admin" en Keycloak
            const rolesResponse = await axios.get(
                `http://keycloak:8080/admin/realms/restaurant-realm/roles`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            const adminRole = rolesResponse.data.find(role => role.name === "admin");
            
            if (adminRole) {
                await axios.post(
                    `http://keycloak:8080/admin/realms/restaurant-realm/users/${kcUserId}/role-mappings/realm`,
                    [adminRole],
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
            }
        }

        await pool.query(
            "INSERT INTO usuarios (id, email, nombre) VALUES ($1, $2, $3)",
            [kcUserId, email, `${first_name} ${last_name}`]
        );

        res.status(201).json({
            message: "Usuario registrado correctamente",
            id: kcUserId,
            roles: isAdmin ? ["admin"] : []
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