const express = require("express");
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

router.get("/tables", get_all_tables);
router.get("/tables/availability", check_availability);
router.get("/tables/:id", get_table_by_id);
router.get("/restaurants/:rest_id/tables", get_tables_by_restaurant);
router.post("/tables", create_table);
router.put("/tables/:id", update_table);
router.delete("/tables/:id", delete_table);

module.exports = router;