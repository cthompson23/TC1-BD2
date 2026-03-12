const express = require("express");
const router = express.Router();
const {create_dish,get_all_dishes,
        get_dish_by_id, update_dish, delete_dish
    } = require("../controllers/dishes_controller.js");

router.post("/platos", create_dish);
router.get("/platos", get_all_dishes);
router.get("/platos/:id", get_dish_by_id);
router.put("/platos/:id", update_dish);
router.delete("/platos/:id", delete_dish);

module.exports = router;