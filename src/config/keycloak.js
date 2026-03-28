const session = require("express-session");
const Keycloak = require("keycloak-connect");

if (process.env.NODE_ENV === "test") {
  module.exports = require("./keycloak_test.js");
} else {
  const memoryStore = new session.MemoryStore();
  const keycloak = new Keycloak(
    { store: memoryStore },
    {
      realm: "restaurant-realm",
      "auth-server-url": process.env.KEYCLOAK_URL || "http://keycloak:8080/",
      resource: "restaurant-api",
      "bearer-only": true,
      "confidential-port": 0
    }
  );

  module.exports = { keycloak, memoryStore };
}