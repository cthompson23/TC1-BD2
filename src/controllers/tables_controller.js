const pool = require("../config/db.js");

// Obtener todas las mesas
exports.get_all_tables = async (req, res, next) => {
    try {
        const tables = await pool.query(`
            SELECT m.*, r.nombre_rest 
            FROM mesas m 
            JOIN restaurantes r ON m.rest_id = r.id 
            ORDER BY m.id
        `);
        res.json(tables.rows);
    } catch (error) {
        next(error);
    }
};

// Obtener mesas por restaurante
exports.get_tables_by_restaurant = async (req, res, next) => {
    try {
        const { rest_id } = req.params;
        const tables = await pool.query(
            'SELECT * FROM mesas WHERE rest_id = $1 ORDER BY numero_mesa',
            [rest_id]
        );
        res.json(tables.rows);
    } catch (error) {
        next(error);
    }
};

// Obtener mesa por ID
exports.get_table_by_id = async (req, res, next) => {
    try {
        const { id } = req.params;
        const table = await pool.query(
            `SELECT m.*, r.nombre_rest 
             FROM mesas m 
             JOIN restaurantes r ON m.rest_id = r.id 
             WHERE m.id = $1`,
            [id]
        );
        
        if (table.rows.length === 0) {
            return res.status(404).json({ message: 'Mesa no encontrada' });
        }
        
        res.json(table.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Crear mesa
exports.create_table = async (req, res, next) => {
    try {
        const { disponible, rest_id, numero_mesa, capacidad } = req.body;
        
        const restaurantExists = await pool.query('SELECT id FROM restaurantes WHERE id = $1', [rest_id]);
        if (restaurantExists.rows.length === 0) {
            return res.status(404).json({ message: 'Restaurante no encontrado' });
        }
        
        const new_table = await pool.query(
            `INSERT INTO mesas (disponible, rest_id, numero_mesa, capacidad) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [disponible !== undefined ? disponible : true, rest_id, numero_mesa, capacidad]
        );
        
        res.status(201).json(new_table.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Actualizar mesa
exports.update_table = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { disponible, rest_id, numero_mesa, capacidad } = req.body;
        
        const tableExists = await pool.query('SELECT id FROM mesas WHERE id = $1', [id]);
        if (tableExists.rows.length === 0) {
            return res.status(404).json({ message: 'Mesa no encontrada' });
        }
        
        const updated_table = await pool.query(
            `UPDATE mesas 
             SET disponible = COALESCE($1, disponible), 
                 rest_id = COALESCE($2, rest_id), 
                 numero_mesa = COALESCE($3, numero_mesa), 
                 capacidad = COALESCE($4, capacidad) 
             WHERE id = $5 
             RETURNING *`,
            [disponible, rest_id, numero_mesa, capacidad, id]
        );
        
        res.json(updated_table.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Eliminar mesa
exports.delete_table = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM mesas WHERE id = $1 RETURNING id', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }
    
    res.json({ 
      message: 'Mesa eliminada exitosamente' 
    });
  } catch (error) {
    next(error);
  }
};

// Verificar disponibilidad de mesas por fecha y hora
exports.check_availability = async (req, res, next) => {
    try {
        const { rest_id, fecha, hora, capacidad } = req.query;
        
        let query = `
            SELECT m.* FROM mesas m
            WHERE m.disponible = true
        `;
        const params = [];
        let paramCount = 1;
        
        if (rest_id) {
            query += ` AND m.rest_id = $${paramCount}`;
            params.push(rest_id);
            paramCount++;
        }
        
        if (capacidad) {
            query += ` AND m.capacidad >= $${paramCount}`;
            params.push(capacidad);
            paramCount++;
        }
        
        if (fecha && hora) {
            query += `
                AND NOT EXISTS (
                    SELECT 1 FROM reservaciones r
                    WHERE r.mesa_id = m.id
                    AND r.dia_reservacion = $${paramCount}
                    AND r.hora_reservacion = $${paramCount + 1}
                    AND r.estado = 'activa'
                )
            `;
            params.push(fecha, hora);
        }
        
        const availableTables = await pool.query(query, params);
        res.json(availableTables.rows);
    } catch (error) {
        next(error);
    }
};