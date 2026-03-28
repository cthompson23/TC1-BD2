const express = require("express");
const router = express.Router();

const { keycloak } = require("../config/keycloak.js");

const {
  get_user,
  update_user,
  delete_user
} = require("../controllers/users_controller.js");

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión del usuario autenticado
 */

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Obtener información del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario
 *       401:
 *         description: No autenticado
 */
router.get("/user/me", keycloak.protect(), get_user);

/**
 * @swagger
 * /user:
 *   put:
 *     summary: Actualizar información del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "User"
 *               last_name:
 *                 type: string
 *                 example: "Updated"
 *               email:
 *                 type: string
 *                 example: "user@email.com"
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       401:
 *         description: No autenticado
 */
router.put("/user", keycloak.protect(), update_user);

/**
 * @swagger
 * /user:
 *   delete:
 *     summary: Eliminar usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       401:
 *         description: No autenticado
 */
router.delete("/user", keycloak.protect(), delete_user);

module.exports = router;