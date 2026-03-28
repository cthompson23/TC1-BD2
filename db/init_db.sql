
CREATE TABLE restaurantes (
	id SERIAL PRIMARY KEY,
	nombre_rest VARCHAR(50) NOT NULL, 
	ubicacion VARCHAR(100) NOT NULL,
	correo_rest VARCHAR(100) UNIQUE,
	telefono_rest VARCHAR(15)
);

CREATE TABLE menus (
	id SERIAL PRIMARY KEY,
	nombre_menu VARCHAR(50) NOT NULL,
	rest_id INTEGER REFERENCES restaurantes(id) ON DELETE CASCADE
);

CREATE TABLE usuarios (
	id VARCHAR(255) PRIMARY KEY,
	usuario VARCHAR(50),
	nombre VARCHAR(50),
	apellido VARCHAR(50),
	email VARCHAR(100)
);

CREATE TABLE platos (
	id SERIAL PRIMARY KEY,
	nombre_plato VARCHAR(50) NOT NULL,
	precio NUMERIC(10,2) NOT NULL,
	menu_id INTEGER REFERENCES menus(id) ON DELETE CASCADE
);

CREATE TABLE mesas (
	id SERIAL PRIMARY KEY,
	disponible BOOLEAN NOT NULL DEFAULT TRUE,
	rest_id INTEGER REFERENCES restaurantes(id) ON DELETE CASCADE,
	numero_mesa INTEGER,
	capacidad INTEGER CHECK (capacidad > 0)
);

CREATE TABLE reservaciones(
	id SERIAL PRIMARY KEY,
	usuario_id varchar(255) not null,
	mesa_id INTEGER REFERENCES mesas(id) ON DELETE CASCADE,
	dia_reservacion DATE NOT NULL,
	hora_reservacion TIME NOT NULL,
	estado VARCHAR(20) DEFAULT 'activa'
);

CREATE TABLE pedidos (
	id SERIAL PRIMARY KEY,
	usuario_id varchar(255) not null,
	reservacion_id INTEGER REFERENCES reservaciones(id) ON DELETE SET NULL,
	tipo_pedido VARCHAR(50), 
	fecha_orden DATE NOT NULL,
	estado VARCHAR(50) DEFAULT 'pendiente'
);

CREATE TABLE item_pedido(
	id SERIAL PRIMARY KEY,
	pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
	plato_id INTEGER REFERENCES platos(id) ON DELETE CASCADE,
	cantidad INTEGER CHECK (cantidad > 0)
);