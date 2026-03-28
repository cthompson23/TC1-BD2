jest.mock("../../src/config/db.js", () => ({
  query: jest.fn(),
}));

const pool = require("../../src/config/db.js");
const controller = require("../../src/controllers/dishes_controller.js");

// Helper para simular request
const mockRequest = (body = {}, params = {}) => ({ body, params });

// Helper para simular response
const mockResponse = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("Controlador de Platos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Obtener todos los platos
  describe("get_all_dishes", () => {
    it("debe retornar todos los platos", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const mockData = [{ id: 1, nombre_plato: "Pizza" }];
      pool.query.mockResolvedValue({ rows: mockData });
      await controller.get_all_dishes(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });
  });

  // Obtener platos por menú
  describe("get_dishes_by_menu", () => {
    it("debe retornar platos por menú", async () => {
      const req = mockRequest({}, { menu_id: 1 });
      const res = mockResponse();
      const mockData = [{ id: 1, menu_id: 1 }];
      pool.query.mockResolvedValue({ rows: mockData });
      await controller.get_dishes_by_menu(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });
  });

  // Obtener plato por ID
  describe("get_dish_by_id", () => {
    it("debe retornar un plato si existe", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      const mockDish = { id: 1, nombre_plato: "Pizza" };
      pool.query.mockResolvedValue({ rows: [mockDish] });
      await controller.get_dish_by_id(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith(mockDish);
    });

    it("debe retornar 404 si no existe", async () => {
      const req = mockRequest({}, { id: 99 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rows: [] });
      await controller.get_dish_by_id(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Plato no encontrado" });
    });
  });

  // Crear plato
  describe("create_dish", () => {
    it("debe crear un plato correctamente", async () => {
      const req = mockRequest({ nombre_plato: "Pizza", precio: 5000, menu_id: 1 });
      const res = mockResponse();
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, ...req.body }] });
      await controller.create_dish(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, ...req.body });
    });

    it("debe retornar 404 si el menú no existe", async () => {
      const req = mockRequest({ nombre_plato: "Pizza", precio: 5000, menu_id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValueOnce({ rows: [] });
      await controller.create_dish(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Menú no encontrado" });
    });
  });

  // Actualizar plato
  describe("update_dish", () => {
    it("debe actualizar un plato correctamente", async () => {
      const req = mockRequest({ nombre_plato: "Pizza Updated" }, { id: 1 });
      const res = mockResponse();
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, nombre_plato: "Pizza Updated" }] });
      await controller.update_dish(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith({ id: 1, nombre_plato: "Pizza Updated" });
    });

    it("debe retornar 404 si el plato no existe", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValueOnce({ rows: [] });
      await controller.update_dish(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Plato no encontrado" });
    });
  });

  // Eliminar plato
  describe("delete_dish", () => {
    it("debe eliminar un plato correctamente", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rowCount: 1 });
      await controller.delete_dish(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith({ message: "Plato eliminado exitosamente" });
    });

    it("debe retornar 404 si no existe", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rowCount: 0 });
      await controller.delete_dish(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Plato no encontrado" });
    });
  });
});

describe("Errores", () => {

  it("get_all_dishes debe manejar error", async () => {
    const req = mockRequest();
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.get_all_dishes(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("get_dishes_by_menu debe manejar error", async () => {
    const req = mockRequest({}, { menu_id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.get_dishes_by_menu(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("get_dish_by_id debe manejar error", async () => {
    const req = mockRequest({}, { id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.get_dish_by_id(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("create_dish debe manejar error", async () => {
    const req = mockRequest({ nombre_plato: "Pizza", precio: 5000, menu_id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.create_dish(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("update_dish debe manejar error", async () => {
    const req = mockRequest({}, { id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.update_dish(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("delete_dish debe manejar error", async () => {
    const req = mockRequest({}, { id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.delete_dish(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

});