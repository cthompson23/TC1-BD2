const express = require("express");
const { keycloak } = require("../config/keycloak.js");
const {hasRole} = require("../middleware/auth.js");
const router = express.Router();

const {
    create_restaurant,
    get_all_restaurants,
    get_restaurant_by_id,
    update_restaurant,
    delete_restaurant
} = require("../controllers/restaurants_controller.js");

router.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "API funcionando correctamente",
        timestamp: new Date().toISOString()
    });
});

router.post("/restaurants", keycloak.protect(), hasRole("admin"), create_restaurant);
router.get("/restaurants", get_all_restaurants);
router.get("/restaurants/:id", get_restaurant_by_id);
router.put("/restaurants/:id", update_restaurant);
router.delete("/restaurants/:id", delete_restaurant);

module.exports = router;