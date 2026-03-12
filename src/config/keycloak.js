const session = require("express-session");
const Keycloak = require("keycloak-connect");

const memoryStore = new session.MemoryStore();

const keycloak = new Keycloak(
  { store: memoryStore },
  {
    realm: "restaurant-realm",
    "auth-server-url": "http://keycloak:8080/",
    resource: "restaurant-api",
    "confidential-port": 0
  }
);

module.exports = { keycloak, memoryStore };