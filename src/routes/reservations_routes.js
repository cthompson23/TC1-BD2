const express = require("express");
const { keycloak } = require("../config/keycloak.js");
const router = express.Router();

const {
    get_all_reservations,
    get_reservation_by_id,
    create_reservation,
    cancel_reservation,
    delete_reservation
} = require("../controllers/reservations_controller.js");

router.get("/reservations", get_all_reservations);
router.get("/reservations/:id", get_reservation_by_id);
router.post("/reservations", keycloak.protect(), create_reservation);
router.patch("/reservations/:id/cancel", cancel_reservation);
router.delete("/reservations/:id", delete_reservation);

module.exports = router;