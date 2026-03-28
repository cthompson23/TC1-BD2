const pool = require("../config/db.js");

// Obtener todos los menús 
exports.get_all_menus = async (req, res, next) => {
    try {
        const menus = await pool.query(`
            SELECT m.*, r.nombre_rest 
            FROM menus m 
            JOIN restaurantes r ON m.rest_id = r.id 
            ORDER BY m.id
        `);
        res.json(menus.rows);
    } catch (error) {
        next(error);
    }
};

// Obtener menús por restaurante
exports.get_menus_by_restaurant = async (req, res, next) => {
    try {
        const { rest_id } = req.params;
        const menus = await pool.query(
            'SELECT * FROM menus WHERE rest_id = $1 ORDER BY id',
            [rest_id]
        );
        res.json(menus.rows);
    } catch (error) {
        next(error);
    }
};

// Obtener un menú por ID
exports.get_menu_by_id = async (req, res, next) => {
    try {
        const { id } = req.params;
        const menu = await pool.query(
            `SELECT m.*, r.nombre_rest 
             FROM menus m 
             JOIN restaurantes r ON m.rest_id = r.id 
             WHERE m.id = $1`,
            [id]
        );
        
        if (menu.rows.length === 0) {
            return res.status(404).json({ message: 'Menú no encontrado' });
        }
        
        res.json(menu.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Crear un nuevo menú
exports.create_menu = async (req, res, next) => {
    try {
        const { nombre_menu, rest_id } = req.body;
        
        // Verificar que el restaurante existe
        const restaurantExists = await pool.query(
            'SELECT id FROM restaurantes WHERE id = $1',
            [rest_id]
        );
        
        if (restaurantExists.rows.length === 0) {
            return res.status(404).json({ message: 'Restaurante no encontrado' });
        }
        
        const new_menu = await pool.query(
            'INSERT INTO menus (nombre_menu, rest_id) VALUES ($1, $2) RETURNING *',
            [nombre_menu, rest_id]
        );
        
        res.status(201).json(new_menu.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Actualizar un menú
exports.update_menu = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre_menu, rest_id } = req.body;
        
        // Verificar que el menú existe
        const menuExists = await pool.query(
            'SELECT id FROM menus WHERE id = $1',
            [id]
        );
        
        if (menuExists.rows.length === 0) {
            return res.status(404).json({ message: 'Menú no encontrado' });
        }
        
        // Si se cambia el restaurante, verificar que existe
        if (rest_id) {
            const restaurantExists = await pool.query(
                'SELECT id FROM restaurantes WHERE id = $1',
                [rest_id]
            );
            
            if (restaurantExists.rows.length === 0) {
                return res.status(404).json({ message: 'Restaurante no encontrado' });
            }
        }
        
        const updated_menu = await pool.query(
            `UPDATE menus 
             SET nombre_menu = COALESCE($1, nombre_menu), 
                 rest_id = COALESCE($2, rest_id) 
             WHERE id = $3 
             RETURNING *`,
            [nombre_menu, rest_id, id]
        );
        
        res.json(updated_menu.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Eliminar un menú
exports.delete_menu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM menus WHERE id = $1 RETURNING id', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Menú no encontrado' });
    }
    
    res.json({ 
      message: 'Menú eliminado exitosamente' 
    });
  } catch (error) {
    next(error);
  }
};
