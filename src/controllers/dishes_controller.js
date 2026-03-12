const pool = require("../config/db.js");

exports.create_dish = async (req, res, next) => {
  try {
    const {nombre_plato, precio, menu_id} = req.body;
    const new_dish = await pool.query(
      'INSERT INTO platos(nombre_plato, precio, menu_id) VALUES($1, $2, $3) RETURNING *',
      [nombre_plato, precio, menu_id]
    );

    res.json(new_dish.rows[0]);

  } catch (error) {
    next(error);
  }
};

exports.get_all_dishes = async (req, res, next) => {
  try {
        const dishes = await pool.query('SELECT * FROM platos');
        res.json(dishes.rows);
  } catch (error) {
    next(error);
  }
};

exports.get_dish_by_id = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dish = await pool.query('SELECT * FROM platos WHERE id= $1', [id]);
    if (dish.rows.length === 0) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.json(dish.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.update_dish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre_plato, precio, menu_id } = req.body;
    const updated_dish = await pool.query(
      'UPDATE platos SET nombre_plato = $1, precio = $2, menu_id = $3 WHERE id = $4 RETURNING *',
      [nombre_plato, precio, menu_id, id]
    );
    res.json(updated_dish.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.delete_dish = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM platos WHERE id = $1', [id]);
    res.json({ message: 'Dish deleted successfully' });
  } catch (error) {
    next(error);
  }
};