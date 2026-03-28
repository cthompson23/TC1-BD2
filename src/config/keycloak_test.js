const session = require("express-session");
const memoryStore = new session.MemoryStore();

const keycloakMock = {
  protect: () => (req, res, next) => {
    // Inyectamos datos mínimos para que no truene el controlador
    req.kauth = {
      grant: { access_token: { content: { realm_access: { roles: ['admin'] } } } }
    };
    return next(); // <--- Saltamos la validación real
  },
  middleware: () => (req, res, next) => next()
};

module.exports = { keycloak: keycloakMock, memoryStore };