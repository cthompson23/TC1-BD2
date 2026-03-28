const express = require("express");
const session = require("express-session");
const swaggerUi = require("swagger-ui-express");

const { keycloak, memoryStore } = require("./config/keycloak.js");

const restaurant_routes = require("./routes/restaurant_routes.js");
const menu_routes = require("./routes/menus_routes.js");
const dishes_routes = require("./routes/dishes_routes.js");
const tables_routes = require("./routes/tables_routes.js");
const reservations_routes = require("./routes/reservations_routes.js");
const orders_routes = require("./routes/orders_routes.js");
const user_routes = require("./routes/users_routes.js");
const authentication_routes = require("./routes/authentication_routes.js");
const swaggerSpec = require("./config/swagger.js");

const error_handler = require("./middleware/error_handler.js");

const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    store: memoryStore
  })
);

// Keycloak middleware solo si no es test
if (process.env.NODE_ENV !== "test") {
  app.use(keycloak.middleware());
}

// Rutas
app.use("/api/auth", authentication_routes);
app.use("/api", restaurant_routes);
app.use("/api", menu_routes);
app.use("/api", dishes_routes);
app.use("/api", tables_routes);
app.use("/api", reservations_routes);
app.use("/api", orders_routes);
app.use("/api", user_routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// middleware error handler
app.use(error_handler);

module.exports = app;
