const express = require("express");
const router = express.Router();
const {create_restaurant,get_all_restaurants,
        get_restaurant_by_id, update_restaurant, delete_restaurant
    } = require("../controllers/restaurants_controller.js");

router.post("/restaurantes", create_restaurant);
router.get("/restaurantes", get_all_restaurants);
router.get("/restaurantes/:id", get_restaurant_by_id);
router.put("/restaurantes/:id", update_restaurant);
router.delete("/restaurantes/:id", delete_restaurant);

module.exports = router;