//logica del endpoint
const pool = require("../config/db.js");

exports.create_table = async (req, res, next) => {
  try {
    const {disponible, rest_id, numero_mesa, capacidad} = req.body;
    const new_table = await pool.query(
      'INSERT INTO mesas(disponible, rest_id, numero_mesa, capacidad) VALUES($1, $2, $3, $4) RETURNING *',
      [disponible, rest_id, numero_mesa, capacidad]
    );

    res.json(new_table.rows[0]);

  } catch (error) {
    next(error);
  }
};

exports.get_all_tables = async (req, res, next) => {
  try {
        const tables = await pool.query('SELECT * FROM mesas');
        res.json(tables.rows);
  } catch (error) {
    next(error);
  }
};

exports.get_table_by_id = async (req, res, next) => {
  try {
    const { id } = req.params;
    const table = await pool.query('SELECT * FROM mesas WHERE id= $1', [id]);
    if (table.rows.length === 0) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json(table.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.update_table = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { disponible, rest_id, numero_mesa, capacidad } = req.body;
    const updated_table = await pool.query(
      'UPDATE mesas SET disponible = $1, rest_id = $2, numero_mesa = $3, capacidad = $4 WHERE id = $5 RETURNING *',
      [disponible, rest_id, numero_mesa, capacidad, id]
    );
    res.json(updated_table.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.delete_table = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM mesas WHERE id = $1', [id]);
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    next(error);
  }
};