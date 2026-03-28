const express = require("express");
const router = express.Router();

const {
    get_all_dishes,
    get_dishes_by_menu,
    get_dish_by_id,
    create_dish,
    update_dish,
    delete_dish
} = require("../controllers/dishes_controller.js");

router.get("/dishes", get_all_dishes);
router.get("/dishes/:id", get_dish_by_id);
router.get("/menus/:menu_id/dishes", get_dishes_by_menu);
router.post("/dishes", create_dish);
router.put("/dishes/:id", update_dish);
router.delete("/dishes/:id", delete_dish);

module.exports = router;