const express = require("express");
const router = express.Router();
const {create_menu,get_all_menus,
        get_menu_by_id, update_menu, delete_menu
    } = require("../controllers/menus_controller.js");

router.post("/menus", create_menu);
router.get("/menus", get_all_menus);
router.get("/menus/:id", get_menu_by_id);
router.put("/menus/:id", update_menu);
router.delete("/menus/:id", delete_menu);

module.exports = router;