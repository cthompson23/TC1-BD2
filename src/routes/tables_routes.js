const express = require("express");
const router = express.Router();
const {create_table,get_all_tables,
        get_table_by_id, update_table, delete_table
    } = require("../controllers/tables_controller.js");

router.post("/mesas", create_table);
router.get("/mesas", get_all_tables);
router.get("/mesas/:id", get_table_by_id);
router.put("/mesas/:id", update_table);
router.delete("/mesas/:id", delete_table);

module.exports = router;