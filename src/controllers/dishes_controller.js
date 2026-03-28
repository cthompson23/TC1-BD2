const pool = require("../config/db.js");

// Obtener todos los platos
exports.get_all_dishes = async (req, res, next) => {
    try {
        const dishes = await pool.query(`
            SELECT p.*, m.nombre_menu, r.nombre_rest 
            FROM platos p 
            JOIN menus m ON p.menu_id = m.id 
            JOIN restaurantes r ON m.rest_id = r.id 
            ORDER BY p.id
        `);
        res.json(dishes.rows);
    } catch (error) {
        next(error);
    }
};

// Obtener platos por menú
exports.get_dishes_by_menu = async (req, res, next) => {
    try {
        const { menu_id } = req.params;
        const dishes = await pool.query(
            'SELECT * FROM platos WHERE menu_id = $1 ORDER BY id',
            [menu_id]
        );
        res.json(dishes.rows);
    } catch (error) {
        next(error);
    }
};

// Obtener plato por ID
exports.get_dish_by_id = async (req, res, next) => {
    try {
        const { id } = req.params;
        const dish = await pool.query(
            `SELECT p.*, m.nombre_menu, r.nombre_rest 
             FROM platos p 
             JOIN menus m ON p.menu_id = m.id 
             JOIN restaurantes r ON m.rest_id = r.id 
             WHERE p.id = $1`,
            [id]
        );
        
        if (dish.rows.length === 0) {
            return res.status(404).json({ message: 'Plato no encontrado' });
        }
        
        res.json(dish.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Crear plato
exports.create_dish = async (req, res, next) => {
    try {
        const { nombre_plato, precio, menu_id } = req.body;
        
        const menuExists = await pool.query('SELECT id FROM menus WHERE id = $1', [menu_id]);
        if (menuExists.rows.length === 0) {
            return res.status(404).json({ message: 'Menú no encontrado' });
        }
        
        const new_dish = await pool.query(
            'INSERT INTO platos (nombre_plato, precio, menu_id) VALUES ($1, $2, $3) RETURNING *',
            [nombre_plato, precio, menu_id]
        );
        
        res.status(201).json(new_dish.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Actualizar plato
exports.update_dish = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre_plato, precio, menu_id } = req.body;
        
        const dishExists = await pool.query('SELECT id FROM platos WHERE id = $1', [id]);
        if (dishExists.rows.length === 0) {
            return res.status(404).json({ message: 'Plato no encontrado' });
        }
        
        const updated_dish = await pool.query(
            `UPDATE platos 
             SET nombre_plato = COALESCE($1, nombre_plato), 
                 precio = COALESCE($2, precio), 
                 menu_id = COALESCE($3, menu_id) 
             WHERE id = $4 
             RETURNING *`,
            [nombre_plato, precio, menu_id, id]
        );
        
        res.json(updated_dish.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Eliminar plato
exports.delete_dish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM platos WHERE id = $1 RETURNING id', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Plato no encontrado' });
    }
    
    res.json({ message: 'Plato eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};
