const pool = require("../config/db.js");

exports.create_menu = async (req, res, next) => {
  try {
    const {nombre_menu, rest_id} = req.body;
    const new_menu = await pool.query(
      'INSERT INTO menus(nombre_menu, rest_id) VALUES($1, $2) RETURNING *',
      [nombre_menu, rest_id]
    );

    res.json(new_menu.rows[0]);

  } catch (error) {
    next(error);
  }
};

exports.get_all_menus = async (req, res, next) => {
  try {
        const menus = await pool.query('SELECT * FROM menus');
        res.json(menus.rows);
  } catch (error) {
    next(error);
  }
};

exports.get_menu_by_id = async (req, res, next) => {
  try {
    const { id } = req.params;
    const menu = await pool.query('SELECT * FROM menus WHERE id= $1', [id]);
    if (menu.rows.length === 0) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    res.json(menu.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.update_menu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre_menu, rest_id } = req.body;
    const updated_menu = await pool.query(
      'UPDATE menus SET nombre_menu = $1, rest_id = $2 WHERE id = $3 RETURNING *',
      [nombre_menu, rest_id, id]
    );
    res.json(updated_menu.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.delete_menu = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM menus WHERE id = $1', [id]);
    res.json({ message: 'Menu deleted successfully' });
  } catch (error) {
    next(error);
  }
};