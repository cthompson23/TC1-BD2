jest.mock("../../src/config/db.js", () => ({
  query: jest.fn()
}));

const pool = require("../../src/config/db.js");
const tableController = require("../../src/controllers/tables_controller.js");

describe('Table Controller', () => {

  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {}
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  // ========================
  // GET ALL TABLES
  // ========================
  it('debería obtener todas las mesas', async () => {
    const mockTables = [{ id: 1, numero_mesa: 5 }];

    pool.query.mockResolvedValue({ rows: mockTables });

    await tableController.get_all_tables(req, res, next);

    expect(res.json).toHaveBeenCalledWith(mockTables);
  });

  it('debería manejar error en get_all_tables', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    await tableController.get_all_tables(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // ========================
  // GET BY RESTAURANT
  // ========================
  it('debería obtener mesas por restaurante', async () => {
    req.params.rest_id = 1;

    const mockTables = [{ id: 1, rest_id: 1 }];

    pool.query.mockResolvedValue({ rows: mockTables });

    await tableController.get_tables_by_restaurant(req, res, next);

    expect(res.json).toHaveBeenCalledWith(mockTables);
  });

  // ========================
  // GET BY ID
  // ========================
  it('debería obtener una mesa por ID', async () => {
    req.params.id = 1;

    const mockTable = { id: 1 };

    pool.query.mockResolvedValue({ rows: [mockTable] });

    await tableController.get_table_by_id(req, res, next);

    expect(res.json).toHaveBeenCalledWith(mockTable);
  });

  it('debería retornar 404 si no existe la mesa', async () => {
    req.params.id = 1;

    pool.query.mockResolvedValue({ rows: [] });

    await tableController.get_table_by_id(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Mesa no encontrada'
    });
  });

  // ========================
  // CREATE TABLE
  // ========================
  it('debería crear una mesa', async () => {
    req.body = {
      rest_id: 1,
      numero_mesa: 10,
      capacidad: 4
    };

    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // restaurante existe
      .mockResolvedValueOnce({ rows: [{ ...req.body, disponible: true }] });

    await tableController.create_table(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  it('debería retornar 404 si restaurante no existe', async () => {
    req.body = { rest_id: 1 };

    pool.query.mockResolvedValueOnce({ rows: [] });

    await tableController.create_table(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Restaurante no encontrado'
    });
  });

  // ========================
  // UPDATE TABLE
  // ========================
  it('debería actualizar una mesa', async () => {
    req.params.id = 1;
    req.body = { capacidad: 6 };

    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // existe
      .mockResolvedValueOnce({ rows: [{ id: 1, capacidad: 6 }] });

    await tableController.update_table(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      capacidad: 6
    });
  });

  it('debería retornar 404 si la mesa no existe', async () => {
    req.params.id = 1;

    pool.query.mockResolvedValueOnce({ rows: [] });

    await tableController.update_table(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  // ========================
  // DELETE TABLE
  // ========================
  it('debería eliminar una mesa', async () => {
    req.params.id = 1;

    pool.query.mockResolvedValue({ rowCount: 1 });

    await tableController.delete_table(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Mesa eliminada exitosamente'
    });
  });

  it('debería retornar 404 al eliminar si no existe', async () => {
    req.params.id = 1;

    pool.query.mockResolvedValue({ rowCount: 0 });

    await tableController.delete_table(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  // ========================
  // CHECK AVAILABILITY
  // ========================
  it('debería obtener mesas disponibles con filtros', async () => {
    req.query = {
      rest_id: 1,
      capacidad: 4,
      fecha: '2025-01-01',
      hora: '18:00'
    };

    const mockTables = [{ id: 1, capacidad: 4 }];

    pool.query.mockResolvedValue({ rows: mockTables });

    await tableController.check_availability(req, res, next);

    expect(pool.query).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(mockTables);
  });

  it('debería funcionar sin filtros', async () => {
    const mockTables = [{ id: 1 }];

    pool.query.mockResolvedValue({ rows: mockTables });

    await tableController.check_availability(req, res, next);

    expect(res.json).toHaveBeenCalledWith(mockTables);
  });

  it('debería manejar error en check_availability', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    await tableController.check_availability(req, res, next);

    expect(next).toHaveBeenCalled();
  });

});