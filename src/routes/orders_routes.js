const express = require("express");
const { keycloak } = require("../config/keycloak.js");
const router = express.Router();

const {
    get_all_orders,
    get_order_by_id,
    create_order,
    update_order_status,
    delete_order
} = require("../controllers/orders_controller.js");

router.get("/orders", get_all_orders);
router.get("/orders/:id", get_order_by_id);
router.post("/orders", keycloak.protect(), create_order);
router.patch("/orders/:id/status", update_order_status);
router.delete("/orders/:id", delete_order);

module.exports = router;