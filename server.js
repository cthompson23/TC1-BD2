const express = require("express");
const session = require("express-session");
const { keycloak, memoryStore } = require("./src/config/keycloak.js");

const restaurant_routes = require("./src/routes/restaurant_routes.js");
const menu_routes = require("./src/routes/menus_routes.js");
const dishes_routes = require("./src/routes/dishes_routes.js");
const tables_routes = require("./src/routes/tables_routes.js");
const error_handler = require("./src/middleware/error_handler.js");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json()); 


app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    store: memoryStore
  })
);

app.use(keycloak.middleware());

//ROUTES
app.use("/api", restaurant_routes);
app.use("/api", menu_routes);
app.use("/api", dishes_routes);
app.use("/api", tables_routes);


// middleware error handler
app.use(error_handler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});