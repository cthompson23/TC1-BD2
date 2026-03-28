jest.mock("../../src/config/db.js", () => ({
  query: jest.fn(),
}));

const pool = require("../../src/config/db.js");
const controller = require("../../src/controllers/menus_controller.js");

const mockRequest = (body = {}, params = {}) => ({ body, params });
const mockResponse = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe("Controlador de Menús", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Obtener todos los menús
  describe("get_all_menus", () => {
    it("debe retornar todos los menús", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const mockMenus = [{ id: 1, nombre_menu: "Menu 1" }];
      pool.query.mockResolvedValue({ rows: mockMenus });
      await controller.get_all_menus(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith(mockMenus);
    });
  });

  // Obtener menús por restaurante
  describe("get_menus_by_restaurant", () => {
    it("debe retornar menús por restaurante", async () => {
      const req = mockRequest({}, { rest_id: 1 });
      const res = mockResponse();
      const mockMenus = [{ id: 1, rest_id: 1 }];
      pool.query.mockResolvedValue({ rows: mockMenus });
      await controller.get_menus_by_restaurant(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith(mockMenus);
    });
  });

  // Obtener menú por ID
  describe("get_menu_by_id", () => {
    it("debe retornar un menú si existe", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      const mockMenu = { id: 1, nombre_menu: "Menu 1" };
      pool.query.mockResolvedValue({ rows: [mockMenu] });
      await controller.get_menu_by_id(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith(mockMenu);
    });

    it("debe retornar 404 si no existe", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rows: [] });
      await controller.get_menu_by_id(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Menú no encontrado" });
    });
  });

  // Crear menú
  describe("create_menu", () => {
    it("debe crear un menú correctamente", async () => {
      const req = mockRequest({ nombre_menu: "Nuevo Menu", rest_id: 1 });
      const res = mockResponse();
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [req.body] });
      await controller.create_menu(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(req.body);
    });

    it("debe retornar 404 si el restaurante no existe", async () => {
      const req = mockRequest({ nombre_menu: "Menu", rest_id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValueOnce({ rows: [] });
      await controller.create_menu(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Restaurante no encontrado" });
    });
  });

  // Actualizar menú
  describe("update_menu", () => {
    it("debe actualizar un menú correctamente", async () => {
      const req = mockRequest({ nombre_menu: "Updated" }, { id: 1 });
      const res = mockResponse();
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, ...req.body }] });
      await controller.update_menu(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith({ id: 1, ...req.body });
    });

    it("debe retornar 404 si el menú no existe", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValueOnce({ rows: [] });
      await controller.update_menu(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Menú no encontrado" });
    });
  });

  // Eliminar menú
  describe("delete_menu", () => {
    it("debe eliminar un menú correctamente", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rowCount: 1 });
      await controller.delete_menu(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith({ message: "Menú eliminado exitosamente" });
    });

    it("debe retornar 404 si no existe", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rowCount: 0 });
      await controller.delete_menu(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Menú no encontrado" });
    });
  });
  describe("Errores", () => {

  it("get_all_menus maneja error", async () => {
    const req = mockRequest();
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.get_all_menus(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("get_menus_by_restaurant maneja error", async () => {
    const req = mockRequest({}, { rest_id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.get_menus_by_restaurant(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("get_menu_by_id maneja error", async () => {
    const req = mockRequest({}, { id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.get_menu_by_id(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("create_menu maneja error", async () => {
    const req = mockRequest({ nombre_menu: "Menu", rest_id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.create_menu(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("update_menu maneja error", async () => {
    const req = mockRequest({}, { id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.update_menu(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("delete_menu maneja error", async () => {
    const req = mockRequest({}, { id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.delete_menu(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });
});
});

