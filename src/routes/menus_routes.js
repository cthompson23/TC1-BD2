const express = require("express");
const router = express.Router();

const {
    get_all_menus,
    get_menus_by_restaurant,
    get_menu_by_id,
    create_menu,
    update_menu,
    delete_menu
} = require("../controllers/menus_controller.js");

router.get("/menus", get_all_menus);
router.get("/menus/:id", get_menu_by_id);
router.get("/restaurants/:rest_id/menus", get_menus_by_restaurant);
router.post("/menus", create_menu);
router.put("/menus/:id", update_menu);
router.delete("/menus/:id", delete_menu);

module.exports = router;