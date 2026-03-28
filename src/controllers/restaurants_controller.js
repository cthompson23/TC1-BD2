//logica del endpoint
const pool = require("../config/db.js");

exports.create_restaurant = async (req, res, next) => {
  try {
    const {nombre_rest, ubicacion, correo_rest, telefono_rest} = req.body;
    const new_restaurant = await pool.query(
      'INSERT INTO restaurantes(nombre_rest, ubicacion, correo_rest, telefono_rest) VALUES($1, $2, $3, $4) RETURNING *',
      [nombre_rest, ubicacion, correo_rest, telefono_rest]
    );

    res.json(new_restaurant.rows[0]);

  } catch (error) {
    next(error);
  }
};

exports.get_all_restaurants = async (req, res, next) => {
  try {
        const restaurants = await pool.query('SELECT * FROM restaurantes');
        res.json(restaurants.rows);
  } catch (error) {
    next(error);
  }
};

exports.get_restaurant_by_id = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurant = await pool.query('SELECT * FROM restaurantes WHERE id= $1', [id]);
    if (restaurant.rows.length === 0) {
      return res.status(404).json({ message: 'Restaurante no encontrado' });
    }
    res.json(restaurant.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.update_restaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre_rest, ubicacion, correo_rest, telefono_rest } = req.body;
    const updated_restaurant = await pool.query(
      'UPDATE restaurantes SET nombre_rest = $1, ubicacion = $2, correo_rest = $3, telefono_rest = $4 WHERE id = $5 RETURNING *',
      [nombre_rest, ubicacion, correo_rest, telefono_rest, id]
    );
    res.json(updated_restaurant.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.delete_restaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM restaurantes WHERE id = $1 RETURNING id', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Restaurante no encontrado' });
    }
    
    res.json({ 
      message: 'Restaurante eliminado exitosamente' 
    });
  } catch (error) {
    next(error);
  }
};
