const session = require("express-session");
const memoryStore = new session.MemoryStore();

const keycloakMock = {
  protect: () => (req, res, next) => {
    
    req.kauth = {
      grant: { access_token: { content: { realm_access: { roles: ['admin'] } } } }
    };
    return next(); 
  },
  middleware: () => (req, res, next) => next()
};

module.exports = { keycloak: keycloakMock, memoryStore };