
create table restaurantes (
	id SERIAL primary key,
	nombre_rest varchar(50) not null, 
	ubicacion varchar(100) not null,
	correo_rest varchar(100) unique,
	telefono_rest varchar(15)
);

create table menus (
	id SERIAL primary key,
	nombre_menu varchar(50) not null,
	rest_id int references Restaurantes(id)
);

create table usuarios (
	id SERIAL primary key,
	usuario varchar(50),
	nombre varchar(50),
	apellido varchar(50),
	email varchar(100),
	rol varchar(15)
);
create table platos (
	id SERIAL primary key,
	nombre_plato varchar(50) not null,
	precio numeric(10,2) not null,
	menu_id int references menus(id)
);

create table mesas (
	id SERIAL primary key,
	disponible boolean not null default true,
	rest_id int references restaurantes(id),
	numero_mesa int,
	capacidad int  check (capacidad > 0)
);

create table reservaciones(
	id SERIAL primary key,
	usuario_id int references usuarios(id),
	mesa_id int references mesas(id),
	dia_reservacion DATE not null,
	hora_reservacion TIME not null,
	estado varchar(20) default 'activa'
);

create table pedidos (
	id SERIAL primary key,
	usuario_id int references usuarios(id),
	reservacion_id int references reservaciones(id),
	tipo_pedido varchar(50), 
	fecha_orden Date not null,
	estado varchar(50) default 'pendiente'
);

create table idem_pedido(
	id SERIAL primary key,
	pedido_id int references pedidos(id),
	plato_id int references platos(id),
	cantidad int check (cantidad > 0)
);