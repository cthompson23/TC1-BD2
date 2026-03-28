jest.mock("../../src/config/db.js", () => ({
  query: jest.fn(),
}));

const pool = require("../../src/config/db.js");
const controller = require("../../src/controllers/restaurants_controller.js");

const mockRequest = (body = {}, params = {}) => ({ body, params });
const mockResponse = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe("Controlador de Restaurantes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Crear restaurante
  describe("create_restaurant", () => {
    it("debe crear un restaurante", async () => {
      const req = mockRequest({ nombre_rest: "Test", ubicacion: "CR", correo_rest: "test@test.com", telefono_rest: "1234" });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rows: [req.body] });
      await controller.create_restaurant(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith(req.body);
    });
  });

  // Obtener todos los restaurantes
  describe("get_all_restaurants", () => {
    it("debe obtener todos los restaurantes", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const mockData = [{ id: 1, nombre_rest: "Test" }];
      pool.query.mockResolvedValue({ rows: mockData });
      await controller.get_all_restaurants(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });
  });

  // Obtener restaurante por ID
  describe("get_restaurant_by_id", () => {
    it("debe obtener un restaurante por ID", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      const mockRestaurant = { id: 1, nombre_rest: "Test" };
      pool.query.mockResolvedValue({ rows: [mockRestaurant] });
      await controller.get_restaurant_by_id(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith(mockRestaurant);
    });

    it("debe retornar 404 si no existe", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rows: [] });
      await controller.get_restaurant_by_id(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Restaurante no encontrado" });
    });
  });

  // Actualizar restaurante
  describe("update_restaurant", () => {
    it("debe actualizar un restaurante", async () => {
      const req = mockRequest({ nombre_rest: "Updated" }, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rows: [{ id: 1, ...req.body }] });
      await controller.update_restaurant(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith({ id: 1, ...req.body });
    });
  });

  // Eliminar restaurante
  describe("delete_restaurant", () => {
    it("debe eliminar un restaurante", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rowCount: 1 });
      await controller.delete_restaurant(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith({ message: "Restaurante eliminado exitosamente" });
    });

    it("debe retornar 404 si no existe", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rowCount: 0 });
      await controller.delete_restaurant(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Restaurante no encontrado" });
    });
  });
});

describe("Errores", () => {

  it("create_restaurant debe manejar error", async () => {
    const req = mockRequest({ nombre_rest: "Test" });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.create_restaurant(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("get_all_restaurants debe manejar error", async () => {
    const req = mockRequest();
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.get_all_restaurants(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("get_restaurant_by_id debe manejar error", async () => {
    const req = mockRequest({}, { id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.get_restaurant_by_id(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("update_restaurant debe manejar error", async () => {
    const req = mockRequest({}, { id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.update_restaurant(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("delete_restaurant debe manejar error", async () => {
    const req = mockRequest({}, { id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.delete_restaurant(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

});