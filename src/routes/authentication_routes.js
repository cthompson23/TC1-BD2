const express = require("express");
const router = express.Router();
const {login, register} = require("../controllers/authentication_controller.js");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación de usuarios con Keycloak
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario en Keycloak
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "newuser"
 *               email:
 *                 type: string
 *                 example: "newuser@example.com"
 *               first_name:
 *                 type: string
 *                 example: "New"
 *               last_name:
 *                 type: string
 *                 example: "User"
 *               password:
 *                 type: string
 *                 example: "securepassword"
 *     responses:
 *       200:
 *         description: Usuario registrado correctamente
 *       500:
 *         description: Error en el registro
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicio de sesión (obtiene token desde Keycloak)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "newuser"
 *               password:
 *                 type: string
 *                 example: "securepassword"
 *     responses:
 *       200:
 *         description: Token JWT obtenido
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", login);

module.exports = router;
