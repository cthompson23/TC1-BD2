jest.mock("../../src/config/db.js", () => ({
  query: jest.fn(),
}));

const pool = require("../../src/config/db.js");
const restaurantController = require("../../src/controllers/restaurants_controller.js");

describe('Restaurant Controller', () => {

  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  // ========================
  // CREATE
  // ========================
  it('debería crear un restaurante', async () => {
    req.body = {
      nombre_rest: 'Test',
      ubicacion: 'CR',
      correo_rest: 'test@test.com',
      telefono_rest: '1234'
    };

    pool.query.mockResolvedValue({
      rows: [req.body]
    });

    await restaurantController.create_restaurant(req, res, next);

    expect(pool.query).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(req.body);
  });

  it('debería manejar error en create_restaurant', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    await restaurantController.create_restaurant(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // ========================
  // GET ALL
  // ========================
  it('debería obtener todos los restaurantes', async () => {
    const mockData = [{ id: 1, nombre_rest: 'Test' }];

    pool.query.mockResolvedValue({
      rows: mockData
    });

    await restaurantController.get_all_restaurants(req, res, next);

    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  it('debería manejar error en get_all_restaurants', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    await restaurantController.get_all_restaurants(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // ========================
  // GET BY ID
  // ========================
  it('debería obtener un restaurante por ID', async () => {
    req.params.id = 1;

    const mockRestaurant = { id: 1, nombre_rest: 'Test' };

    pool.query.mockResolvedValue({
      rows: [mockRestaurant]
    });

    await restaurantController.get_restaurant_by_id(req, res, next);

    expect(res.json).toHaveBeenCalledWith(mockRestaurant);
  });

  it('debería retornar 404 si no existe el restaurante', async () => {
    req.params.id = 1;

    pool.query.mockResolvedValue({
      rows: []
    });

    await restaurantController.get_restaurant_by_id(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Restaurante no encontrado'
    });
  });

  it('debería manejar error en get_restaurant_by_id', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    await restaurantController.get_restaurant_by_id(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // ========================
  // UPDATE
  // ========================
  it('debería actualizar un restaurante', async () => {
    req.params.id = 1;
    req.body = {
      nombre_rest: 'Updated',
      ubicacion: 'CR',
      correo_rest: 'updated@test.com',
      telefono_rest: '5678'
    };

    pool.query.mockResolvedValue({
      rows: [{ id: 1, ...req.body }]
    });

    await restaurantController.update_restaurant(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      ...req.body
    });
  });

  it('debería manejar error en update_restaurant', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    await restaurantController.update_restaurant(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // ========================
  // DELETE
  // ========================
  it('debería eliminar un restaurante', async () => {
    req.params.id = 1;

    pool.query.mockResolvedValue({
      rowCount: 1
    });

    await restaurantController.delete_restaurant(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Restaurante eliminado exitosamente'
    });
  });

  it('debería retornar 404 si no existe al eliminar', async () => {
    req.params.id = 1;

    pool.query.mockResolvedValue({
      rowCount: 0
    });

    await restaurantController.delete_restaurant(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Restaurante no encontrado'
    });
  });

  it('debería manejar error en delete_restaurant', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    await restaurantController.delete_restaurant(req, res, next);

    expect(next).toHaveBeenCalled();
  });

});