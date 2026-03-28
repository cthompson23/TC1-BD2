const express = require("express");
const router = express.Router();

const { keycloak } = require("../config/keycloak.js");

const {
  register,
  login,
  get_user,
  update_user,
  delete_user
} = require("../controllers/users_controller.js");

router.post("/auth/register", register);
router.post("/auth/login", login);

router.get("/user/me", keycloak.protect(), get_user);
router.put("/user", keycloak.protect(), update_user);
router.delete("/user", keycloak.protect(), delete_user);

module.exports = router;