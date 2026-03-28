const axios = require("axios");

const KEYCLOAK_URL = "http://keycloak:8080";
const REALM = "restaurant-realm";

const getAdminToken = async () => {
  const response = await axios.post(
    `${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
    new URLSearchParams({
      client_id: "admin-cli",
      username: "admin",
      password: "admin",
      grant_type: "password"
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    }
  );

  return response.data.access_token;
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name } = req.body;

    const adminToken = await getAdminToken();

    await axios.post(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users`,
      {
        username: username,
        email: email,
        firstName: first_name,
        lastName: last_name,
        enabled: true,
        emailVerified: true,
        credentials: [
          {
            type: "password",
            value: password,
            temporary: false
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      message: "Usuario registrado correctamente"
    });

  } catch (error) {
    console.log(error.response?.data);
    res.status(500).json({
      error: "Error al registrar usuario"
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const response = await axios.post(
      `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
      new URLSearchParams({
        client_id: "restaurant-api",
        grant_type: "password",
        username: username,
        password: password
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    console.log(error.response?.data);

    res.status(401).json({
      error: "Credenciales inválidas"
    });
  }
};

exports.get_user = async (req, res) => {
  try {
    const user = req.kauth.grant.access_token.content;

    if (!user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    res.json({
      id: user.sub,
      username: user.preferred_username,
      nombre: user.given_name,
      apellido: user.family_name,
      nombre_completo: user.name,
      email: user.email
    });

  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

exports.update_user = async (req, res) => {
  try {
    const user = req.kauth.grant.access_token.content;

    if (!user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { first_name, last_name, email } = req.body;

    const adminToken = await getAdminToken();

    await axios.put(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users/${user.sub}`,
      {
        firstName: first_name,
        lastName: last_name,
        email: email
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      message: "Usuario actualizado correctamente"
    });

  } catch (error) {
    console.log(error.response?.data);

    res.status(500).json({
      error: "Error al actualizar usuario"
    });
  }
};

exports.delete_user = async (req, res) => {
  try {
    const user = req.kauth.grant.access_token.content;

    if (!user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const adminToken = await getAdminToken();

    await axios.delete(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users/${user.sub}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );

    res.json({
      message: "Usuario eliminado correctamente"
    });

  } catch (error) {
    console.log(error.response?.data);

    res.status(500).json({
      error: "Error al eliminar usuario"
    });
  }
};