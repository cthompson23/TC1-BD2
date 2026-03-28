jest.mock("../../src/config/db.js", () => ({
  query: jest.fn(),
}));

const pool = require("../../src/config/db.js");
const controller = require("../../src/controllers/tables_controller.js");

const mockRequest = (body = {}, params = {}, query = {}) => ({ body, params, query });
const mockResponse = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe("Controlador de Mesas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Obtener todas las mesas
  describe("get_all_tables", () => {
    it("debe obtener todas las mesas", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const mockTables = [{ id: 1, numero_mesa: 5 }];
      pool.query.mockResolvedValue({ rows: mockTables });
      await controller.get_all_tables(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith(mockTables);
    });
  });

  // Obtener mesas por restaurante
  describe("get_tables_by_restaurant", () => {
    it("debe obtener mesas por restaurante", async () => {
      const req = mockRequest({}, { rest_id: 1 });
      const res = mockResponse();
      const mockTables = [{ id: 1, rest_id: 1 }];
      pool.query.mockResolvedValue({ rows: mockTables });
      await controller.get_tables_by_restaurant(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith(mockTables);
    });
  });

  // Obtener mesa por ID
  describe("get_table_by_id", () => {
    it("debe obtener una mesa por ID", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      const mockTable = { id: 1 };
      pool.query.mockResolvedValue({ rows: [mockTable] });
      await controller.get_table_by_id(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith(mockTable);
    });

    it("debe retornar 404 si no existe", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rows: [] });
      await controller.get_table_by_id(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Mesa no encontrada" });
    });
  });

  // Crear mesa
  describe("create_table", () => {
    it("debe crear una mesa", async () => {
      const req = mockRequest({ rest_id: 1, numero_mesa: 10, capacidad: 4 });
      const res = mockResponse();
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ ...req.body, disponible: true }] });
      await controller.create_table(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("debe retornar 404 si restaurante no existe", async () => {
      const req = mockRequest({ rest_id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValueOnce({ rows: [] });
      await controller.create_table(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Restaurante no encontrado" });
    });
  });

  // Actualizar mesa
  describe("update_table", () => {
    it("debe actualizar una mesa", async () => {
      const req = mockRequest({ capacidad: 6 }, { id: 1 });
      const res = mockResponse();
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, capacidad: 6 }] });
      await controller.update_table(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith({ id: 1, capacidad: 6 });
    });

    it("debe retornar 404 si la mesa no existe", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValueOnce({ rows: [] });
      await controller.update_table(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // Eliminar mesa
  describe("delete_table", () => {
    it("debe eliminar una mesa", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rowCount: 1 });
      await controller.delete_table(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith({ message: "Mesa eliminada exitosamente" });
    });

    it("debe retornar 404 si no existe", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rowCount: 0 });
      await controller.delete_table(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // Verificar disponibilidad de mesas
  describe("check_availability", () => {
    it("debe obtener mesas disponibles con filtros", async () => {
      const req = mockRequest({}, {}, { rest_id: 1, capacidad: 4, fecha: "2025-01-01", hora: "18:00" });
      const res = mockResponse();
      const mockTables = [{ id: 1, capacidad: 4 }];
      pool.query.mockResolvedValue({ rows: mockTables });
      await controller.check_availability(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith(mockTables);
    });

    it("debe funcionar sin filtros", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const mockTables = [{ id: 1 }];
      pool.query.mockResolvedValue({ rows: mockTables });
      await controller.check_availability(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith(mockTables);
    });

    it("debe funcionar con solo fecha y hora", async () => {
      const req = mockRequest({}, {}, { fecha: "2026-04-20", hora: "19:00:00" });
      const res = mockResponse();
      const mockTables = [{ id: 1 }];
      pool.query.mockResolvedValue({ rows: mockTables });
      await controller.check_availability(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith(mockTables);
    });
  });
});

describe("Errores", () => {

  it("get_all_tables maneja error", async () => {
    const req = mockRequest();
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.get_all_tables(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("get_tables_by_restaurant maneja error", async () => {
    const req = mockRequest({}, { rest_id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.get_tables_by_restaurant(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("get_table_by_id maneja error", async () => {
    const req = mockRequest({}, { id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.get_table_by_id(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("create_table maneja error", async () => {
    const req = mockRequest({ rest_id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.create_table(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("update_table maneja error", async () => {
    const req = mockRequest({}, { id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.update_table(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("delete_table maneja error", async () => {
    const req = mockRequest({}, { id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.delete_table(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("check_availability maneja error", async () => {
    const req = mockRequest({}, {}, { rest_id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.check_availability(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

});