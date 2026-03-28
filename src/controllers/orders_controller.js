const pool = require("../config/db.js");

// Obtener todos los pedidos
exports.get_all_orders = async (req, res, next) => {
  try {
        const orders = await pool.query('SELECT * FROM pedidos');
        res.json(orders.rows);
  } catch (error) {
    next(error);
  }
};

// Obtener pedido por ID
exports.get_order_by_id = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await pool.query('SELECT * FROM pedidos WHERE id= $1', [id]);
    if (order.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Crear pedido
exports.create_order = async (req, res, next) => {
    const client = await pool.connect();
    const user = req.kauth.grant.access_token.content;
    
    try {
        await client.query('BEGIN');
        
        const { reservacion_id, tipo_pedido, items } = req.body;
        
        if (!items || items.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'El pedido debe tener al menos un plato' });
        }
        
        // Crear el pedido
        const newOrder = await client.query(
            `INSERT INTO pedidos (usuario_id, reservacion_id, tipo_pedido, fecha_orden, estado) 
             VALUES ($1, $2, $3, CURRENT_DATE, 'pendiente') 
             RETURNING *`,
            [user.sub, reservacion_id, tipo_pedido]
        );
        
        const pedido_id = newOrder.rows[0].id;
        
        // Insertar los items del pedido
        for (const item of items) {
            await client.query(
                `INSERT INTO item_pedido (pedido_id, plato_id, cantidad) 
                 VALUES ($1, $2, $3)`,
                [pedido_id, item.plato_id, item.cantidad]
            );
        }
        
        await client.query('COMMIT');
        
        res.status(201).json({
            message: 'Pedido creado exitosamente',
            pedido_id: pedido_id,
            pedido: newOrder.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

// Actualizar estado del pedido
exports.update_order_status = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        const validStates = ['pendiente', 'confirmado', 'en_preparacion', 'listo', 'entregado', 'cancelado'];
        if (!validStates.includes(estado)) {
            return res.status(400).json({ 
                message: `Estado inválido. Estados válidos: ${validStates.join(', ')}` 
            });
        }
        
        const result = await pool.query(
            'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *',
            [estado, id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Eliminar pedido
exports.delete_order = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const orderExists = await pool.query('SELECT id FROM pedidos WHERE id = $1', [id]);
        
        if (orderExists.rows.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        
        // Eliminar pedido (CASCADE eliminará idem_pedido)
        await pool.query('DELETE FROM pedidos WHERE id = $1', [id]);
        
        res.json({ message: 'Pedido eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
};