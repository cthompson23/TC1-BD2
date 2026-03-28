const express = require("express");
const { keycloak } = require("../config/keycloak.js");
const { hasRole } = require("../middleware/auth.js");
const router = express.Router();

const {
    get_all_tables,
    get_tables_by_restaurant,
    get_table_by_id,
    create_table,
    update_table,
    delete_table,
    check_availability
} = require("../controllers/tables_controller.js");

/**
 * @swagger
 * tags:
 *   name: Mesas
 *   description: Gestión de mesas de restaurantes
 */

/**
 * @swagger
 * /tables:
 *  get:
 *    summary: Obtener todas las mesas
 *   tags: [Mesas]
 *  responses:
 *    200: 
 *      description: Lista de mesas
 */

router.get("/tables", get_all_tables);

/**
 * @swagger
 * /tables/availability:
 *   get:
 *     summary: Verificar disponibilidad de mesas
 *     tags: [Mesas]
 *     parameters:
 *       - in: query
 *         name: rest_id
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: fecha
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: hora
 *         schema:
 *           type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Disponibilidad de mesas
 */
router.get("/tables/availability", check_availability);

/**
 * @swagger
 * /tables/{id}:
 *   get:
 *     summary: Obtener una mesa por ID
 *     tags: [Mesas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Mesa encontrada
 *       404:
 *         description: Mesa no encontrada
 */
router.get("/tables/:id", get_table_by_id);

/**
 * @swagger
 * /tables/{id}:
 *   get:
 *     summary: Obtener una mesa por ID
 *     tags: [Mesas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Mesa encontrada
 *       404:
 *         description: Mesa no encontrada
 */
router.get("/restaurants/:rest_id/tables", get_tables_by_restaurant);

/**
 * @swagger
 * /tables:
 *   post:
 *     summary: Crear una mesa (solo admin)
 *     tags: [Mesas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rest_id
 *               - numero_mesa
 *               - capacidad
 *             properties:
 *               rest_id:
 *                  type: integer
 *                  example: 1
 *               numero_mesa:
 *                  type: integer
 *                  example: 1
 *               capacidad:
 *                  type: integer
 *                  example: 4
 *               disponible:
 *                  type: boolean
 *                  example: true
 *     responses:
 *       200:
 *         description: Mesa creada correctamente
 *       403:
 *         description: Requiere rol admin
 */
router.post("/tables", keycloak.protect(), hasRole("admin"), create_table);

/**
 * @swagger
 * /tables/{id}:
 *   put:
 *     summary: Actualizar una mesa (solo admin)
 *     tags: [Mesas]
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
 *               numero_mesa:
 *                 type: integer
 *               capacidad:
 *                 type: integer
 *               disponible:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Mesa actualizada
 *       403:
 *         description: Requiere rol admin
 */
router.put("/tables/:id", keycloak.protect(), hasRole("admin"), update_table);

/**
 * @swagger
 * /tables/{id}:
 *   delete:
 *     summary: Eliminar una mesa (solo admin)
 *     tags: [Mesas]
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
 *         description: Mesa eliminada
 *       403:
 *         description: Requiere rol admin
 */
router.delete("/tables/:id", keycloak.protect(), hasRole("admin"), delete_table);

module.exports = router;