const express = require("express");
const { keycloak } = require("../config/keycloak.js");
const { hasRole } = require("../middleware/auth.js");
const router = express.Router();

const {
    get_all_orders,
    get_order_by_id,
    create_order,
    update_order_status,
    delete_order
} = require("../controllers/orders_controller.js");

// Rutas protegidas - requieren autenticación
/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: Gestión de pedidos
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Obtener todos los pedidos (requiere autenticación)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *       401:
 *         description: No autenticado
 */
router.get("/orders", keycloak.protect(), get_all_orders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Obtener un pedido por ID
 *     tags: [Pedidos]
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
 *         description: Pedido encontrado
 *       404:
 *         description: Pedido no encontrado
 */
router.get("/orders/:id", keycloak.protect(), get_order_by_id);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Crear un nuevo pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario_id
 *               - tipo_pedido
 *               - fecha_orden
 *             properties:
 *               reservacion_id:
 *                 type: integer
 *               tipo_pedido:
 *                 type: string
 *                 example: "express"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     plato_id:
 *                       type: integer
 *                     cantidad:
 *                       type: integer
 *               fecha_orden:
 *                 type: string
 *                 example: "2026-03-28"
 *               estado:
 *                 type: string
 *                 example: "pendiente"
 *     responses:
 *       200:
 *         description: Pedido creado correctamente
 *       401:
 *         description: No autenticado
 */
router.post("/orders", keycloak.protect(), create_order);

// Rutas protegidas - solo admin
/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Actualizar estado de un pedido (solo admin)
 *     tags: [Pedidos]
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
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 example: "completado"
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       403:
 *         description: Requiere rol admin
 */
router.patch("/orders/:id/status", keycloak.protect(), hasRole("admin"), update_order_status);

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Eliminar un pedido (solo admin)
 *     tags: [Pedidos]
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
 *         description: Pedido eliminado
 *       403:
 *         description: Requiere rol admin
 */
router.delete("/orders/:id", keycloak.protect(), hasRole("admin"), delete_order);

module.exports = router;