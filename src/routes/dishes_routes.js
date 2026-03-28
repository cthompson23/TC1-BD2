const express = require("express");
const { keycloak } = require("../config/keycloak.js");
const { hasRole } = require("../middleware/auth.js");
const router = express.Router();

const {
    get_all_dishes,
    get_dishes_by_menu,
    get_dish_by_id,
    create_dish,
    update_dish,
    delete_dish
} = require("../controllers/dishes_controller.js");

// Rutas públicas
/**
 * @swagger
 * tags:
 *   name: Platos
 *   description: Gestión de platos dentro de los menús
 */

/**
 * @swagger
 * /dishes:
 *   get:
 *     summary: Obtener todos los platos
 *     tags: [Platos]
 *     responses:
 *       200:
 *         description: Lista de platos
 */
router.get("/dishes", get_all_dishes);

/**
 * @swagger
 * tags:
 *   name: Platos
 *   description: Gestión de platos dentro de los menús
 */

/**
 * @swagger
 * /dishes:
 *   get:
 *     summary: Obtener todos los platos
 *     tags: [Platos]
 *     responses:
 *       200:
 *         description: Lista de platos
 */
router.get("/dishes/:id", get_dish_by_id);

/**
 * @swagger
 * /dishes/{id}:
 *   get:
 *     summary: Obtener un plato por ID
 *     tags: [Platos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Plato encontrado
 *       404:
 *         description: Plato no encontrado
 */
router.get("/menus/:menu_id/dishes", get_dishes_by_menu);

// Rutas para admin
/**
 * @swagger
 * /dishes:
 *   post:
 *     summary: Crear un plato (solo admin)
 *     tags: [Platos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_plato
 *               - precio
 *               - menu_id
 *             properties:
 *               nombre_plato:
 *                 type: string
 *                 example: "Hamburguesa Clásica"
 *               precio:
 *                 type: number
 *                 format: float
 *                 example: 8.99
 *               menu_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Plato creado correctamente
 *       403:
 *         description: Requiere rol admin
 */
router.post("/dishes", keycloak.protect(), hasRole("admin"), create_dish);

/**
 * @swagger
 * /dishes/{id}:
 *   put:
 *     summary: Actualizar un plato (solo admin)
 *     tags: [Platos]
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
 *               nombre_plato:
 *                 type: string
 *               precio:
 *                 type: number
 *               menu_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Plato actualizado
 *       403:
 *         description: Requiere rol admin
 */
router.put("/dishes/:id", keycloak.protect(), hasRole("admin"), update_dish);

/**
 * @swagger
 * /dishes/{id}:
 *   delete:
 *     summary: Eliminar un plato (solo admin)
 *     tags: [Platos]
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
 *         description: Plato eliminado
 *       403:
 *         description: Requiere rol admin
 */
router.delete("/dishes/:id", keycloak.protect(), hasRole("admin"), delete_dish);

module.exports = router;