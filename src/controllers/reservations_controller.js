const pool = require("../config/db.js");

// Obtener todas las reservaciones
exports.get_all_reservations = async (req, res, next) => {
  try {
        const reservations = await pool.query('SELECT * FROM reservaciones');
        res.json(reservations.rows);
  } catch (error) {
    next(error);
  }
};

exports.get_reservation_by_id = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reservation = await pool.query('SELECT * FROM reservaciones WHERE id= $1', [id]);
    if (reservation.rows.length === 0) {
      return res.status(404).json({ message: 'Reservación no encontrada' });
    }
    res.json(reservation.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Crear reservación
exports.create_reservation = async (req, res, next) => {
    const client = await pool.connect();
    const user = req.kauth.grant.access_token.content;
    
    try {
        await client.query('BEGIN');
        
        const { mesa_id, dia_reservacion, hora_reservacion } = req.body;
        
        // Verificar que la mesa existe y está disponible
        const mesaCheck = await client.query(
            'SELECT disponible, rest_id FROM mesas WHERE id = $1',
            [mesa_id]
        );
        
        if (mesaCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Mesa no encontrada' });
        }
        
        if (!mesaCheck.rows[0].disponible) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Mesa no disponible' });
        }
        
        // Verificar que no hay conflicto de horario
        const conflictCheck = await client.query(
            `SELECT id FROM reservaciones 
             WHERE mesa_id = $1 
             AND dia_reservacion = $2 
             AND hora_reservacion = $3
             AND estado = 'activa'`,
            [mesa_id, dia_reservacion, hora_reservacion]
        );
        
        if (conflictCheck.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'La mesa ya está reservada para ese horario' });
        }
        
        // Crear la reservación
        const newReservation = await client.query(
            `INSERT INTO reservaciones (usuario_id, mesa_id, dia_reservacion, hora_reservacion, estado) 
             VALUES ($1, $2, $3, $4, 'activa') 
             RETURNING *`,
            [user.sub, mesa_id, dia_reservacion, hora_reservacion]
        );
        
        // Marcar la mesa como no disponible
        await client.query('UPDATE mesas SET disponible = false WHERE id = $1', [mesa_id]);
        
        await client.query('COMMIT');
        
        res.status(201).json(newReservation.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

// Cancelar reservación
exports.cancel_reservation = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const reservation = await pool.query(
            'SELECT mesa_id, estado FROM reservaciones WHERE id = $1',
            [id]
        );
        
        if (reservation.rows.length === 0) {
            return res.status(404).json({ message: 'Reservación no encontrada' });
        }
        
        if (reservation.rows[0].estado === 'cancelada') {
            return res.status(400).json({ message: 'Reservación ya cancelada' });
        }
        
        // Cambiar estado
        await pool.query(
            "UPDATE reservaciones SET estado = 'cancelada' WHERE id = $1",
            [id]
        );
        
        await pool.query(
            'UPDATE mesas SET disponible = true WHERE id = $1',
            [reservation.rows[0].mesa_id]
        );
        
        res.json({ message: 'Reservación cancelada exitosamente' });
    } catch (error) {
        next(error);
    }
};

// Eliminar reservación
exports.delete_reservation = async (req, res, next) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { id } = req.params;
        
        const reservation = await client.query(
            'SELECT mesa_id FROM reservaciones WHERE id = $1',
            [id]
        );
        
        if (reservation.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Reservación no encontrada' });
        }
        
        const mesa_id = reservation.rows[0].mesa_id;
        
        await client.query('DELETE FROM reservaciones WHERE id = $1', [id]);
        
        await client.query('UPDATE mesas SET disponible = true WHERE id = $1', [mesa_id]);
        
        await client.query('COMMIT');
        
        res.json({ message: 'Reservación eliminada correctamente' });
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};