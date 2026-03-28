jest.mock("../../src/config/db.js", () => ({
  query: jest.fn(),
}));

const pool = require("../../src/config/db.js");
const menuController = require("../../src/controllers/menus_controller.js");

describe('Menu Controller', () => {

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
  // GET ALL MENUS
  // ========================
  it('debería obtener todos los menús', async () => {
    const mockMenus = [{ id: 1, nombre_menu: 'Menu 1' }];

    pool.query.mockResolvedValue({ rows: mockMenus });

    await menuController.get_all_menus(req, res, next);

    expect(res.json).toHaveBeenCalledWith(mockMenus);
  });

  it('debería manejar error en get_all_menus', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    await menuController.get_all_menus(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // ========================
  // GET MENUS BY RESTAURANT
  // ========================
  it('debería obtener menús por restaurante', async () => {
    req.params.rest_id = 1;

    const mockMenus = [{ id: 1, rest_id: 1 }];

    pool.query.mockResolvedValue({ rows: mockMenus });

    await menuController.get_menus_by_restaurant(req, res, next);

    expect(res.json).toHaveBeenCalledWith(mockMenus);
  });

  it('debería manejar error en get_menus_by_restaurant', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    await menuController.get_menus_by_restaurant(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // ========================
  // GET MENU BY ID
  // ========================
  it('debería obtener un menú por ID', async () => {
    req.params.id = 1;

    const mockMenu = { id: 1, nombre_menu: 'Menu 1' };

    pool.query.mockResolvedValue({ rows: [mockMenu] });

    await menuController.get_menu_by_id(req, res, next);

    expect(res.json).toHaveBeenCalledWith(mockMenu);
  });

  it('debería retornar 404 si no existe el menú', async () => {
    req.params.id = 1;

    pool.query.mockResolvedValue({ rows: [] });

    await menuController.get_menu_by_id(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Menú no encontrado'
    });
  });

  it('debería manejar error en get_menu_by_id', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    await menuController.get_menu_by_id(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // ========================
  // CREATE MENU
  // ========================
  it('debería crear un menú', async () => {
    req.body = {
      nombre_menu: 'Nuevo Menu',
      rest_id: 1
    };

    // 1. restaurante existe
    // 2. inserción
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // restaurantExists
      .mockResolvedValueOnce({ rows: [req.body] }); // insert

    await menuController.create_menu(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(req.body);
  });

  it('debería retornar 404 si el restaurante no existe al crear', async () => {
    req.body = {
      nombre_menu: 'Menu',
      rest_id: 1
    };

    pool.query.mockResolvedValueOnce({ rows: [] });

    await menuController.create_menu(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Restaurante no encontrado'
    });
  });

  it('debería manejar error en create_menu', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    await menuController.create_menu(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // ========================
  // UPDATE MENU
  // ========================
  it('debería actualizar un menú', async () => {
    req.params.id = 1;
    req.body = {
      nombre_menu: 'Updated',
      rest_id: 2
    };

    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // menuExists
      .mockResolvedValueOnce({ rows: [{ id: 2 }] }) // restaurantExists
      .mockResolvedValueOnce({ rows: [{ id: 1, ...req.body }] }); // update

    await menuController.update_menu(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      ...req.body
    });
  });

  it('debería retornar 404 si el menú no existe', async () => {
    req.params.id = 1;

    pool.query.mockResolvedValueOnce({ rows: [] });

    await menuController.update_menu(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Menú no encontrado'
    });
  });

  it('debería retornar 404 si el restaurante no existe al actualizar', async () => {
    req.params.id = 1;
    req.body = { rest_id: 2 };

    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // menuExists
      .mockResolvedValueOnce({ rows: [] }); // restaurantExists

    await menuController.update_menu(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Restaurante no encontrado'
    });
  });

  it('debería manejar error en update_menu', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    await menuController.update_menu(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // ========================
  // DELETE MENU
  // ========================
  it('debería eliminar un menú', async () => {
    req.params.id = 1;

    pool.query.mockResolvedValue({ rowCount: 1 });

    await menuController.delete_menu(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Menú eliminado exitosamente'
    });
  });

  it('debería retornar 404 si no existe el menú al eliminar', async () => {
    req.params.id = 1;

    pool.query.mockResolvedValue({ rowCount: 0 });

    await menuController.delete_menu(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Menú no encontrado'
    });
  });

  it('debería manejar error en delete_menu', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    await menuController.delete_menu(req, res, next);

    expect(next).toHaveBeenCalled();
  });

});