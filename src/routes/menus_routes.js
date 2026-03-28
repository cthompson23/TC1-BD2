const express = require("express");
const { keycloak } = require("../config/keycloak.js");
const { hasRole } = require("../middleware/auth.js");
const router = express.Router();

const {
    get_all_menus,
    get_menus_by_restaurant,
    get_menu_by_id,
    create_menu,
    update_menu,
    delete_menu
} = require("../controllers/menus_controller.js");


/**
 * @swagger
 * tags:
 *   name: Menus
 *   description: Gestión de menús de restaurantes
 */

/**
 * @swagger
 * /menus:
 *   get:
 *     summary: Obtener todos los menús
 *     tags: [Menus]
 *     responses:
 *       200:
 *         description: Lista de menús
 */
router.get("/menus", get_all_menus);

/**
 * @swagger
 * /menus/{id}:
 *   get:
 *     summary: Obtener un menú por ID
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Menú encontrado
 *       404:
 *         description: Menú no encontrado
 */
router.get("/menus/:id", get_menu_by_id);

/**
 * @swagger
 * /menus/{id}:
 *   get:
 *     summary: Obtener un menú por ID
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Menú encontrado
 *       404:
 *         description: Menú no encontrado
 */
router.get("/restaurants/:rest_id/menus", get_menus_by_restaurant);

/**
 * @swagger
 * /menus:
 *   post:
 *     summary: Crear un menú (solo admin)
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_menu:
 *                 type: string
 *                 example: "Menú del Día"
 *               rest_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Menú creado correctamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol admin
 */
router.post("/menus", keycloak.protect(), hasRole("admin"), create_menu);

/**
 * @swagger
 * /menus/{id}:
 *   put:
 *     summary: Actualizar un menú (solo admin)
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_menu:
 *                 type: string
 *               rest_id:
 *                 type: integer
 *               precio:
 *                 type: number
 *     responses:
 *       200:
 *         description: Menú actualizado
 *       403:
 *         description: Requiere rol admin
 */
router.put("/menus/:id", keycloak.protect(), hasRole("admin"), update_menu);

/**
 * @swagger
 * /menus/{id}:
 *   delete:
 *     summary: Eliminar un menú (solo admin)
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Menú eliminado
 *       403:
 *         description: Requiere rol admin
 */
router.delete("/menus/:id", keycloak.protect(), hasRole("admin"), delete_menu);

module.exports = router;