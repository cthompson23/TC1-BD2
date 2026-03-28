jest.mock("../../src/config/db.js", () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

const pool = require("../../src/config/db.js");
const controller = require("../../src/controllers/orders_controller.js");

// Helper para simular request con usuario autenticado
const mockRequestWithAuth = (body = {}, params = {}, user = null) => ({
  body,
  params,
  kauth: {
    grant: {
      access_token: {
        content: user || { sub: "user-123", realm_access: { roles: ["admin"] } }
      }
    }
  }
});

// Helper para simular request sin autenticación
const mockRequestWithoutAuth = (body = {}, params = {}) => ({
  body,
  params,
  kauth: null
});

const mockResponse = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("Controlador de Pedidos", () => {
  let mockClient;

  beforeEach(() => {
    mockClient = { query: jest.fn(), release: jest.fn() };
    pool.connect.mockResolvedValue(mockClient);
    jest.clearAllMocks();
  });

  // Obtener todos los pedidos
  describe("get_all_orders", () => {
    it("debe retornar todos los pedidos", async () => {
      const req = mockRequestWithAuth();
      const res = mockResponse();
      const mockOrders = [{ id: 1 }];
      pool.query.mockResolvedValue({ rows: mockOrders });
      await controller.get_all_orders(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });
  });

  // Obtener pedido por ID
  describe("get_order_by_id", () => {
    it("debe retornar un pedido si existe", async () => {
      const req = mockRequestWithAuth({}, { id: 1 });
      const res = mockResponse();
      const mockOrder = { id: 1 };
      pool.query.mockResolvedValue({ rows: [mockOrder] });
      await controller.get_order_by_id(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith(mockOrder);
    });

    it("debe retornar 404 si no existe", async () => {
      const req = mockRequestWithAuth({}, { id: 99 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rows: [] });
      await controller.get_order_by_id(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // Crear pedido
  describe("create_order", () => {
    it("debe crear un pedido correctamente", async () => {
      const req = mockRequestWithAuth(
        { reservacion_id: 1, tipo_pedido: "mesa", items: [{ plato_id: 1, cantidad: 2 }] },
        {}
      );
      const res = mockResponse();
      mockClient.query
        .mockResolvedValueOnce()
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce()
        .mockResolvedValueOnce();
      await controller.create_order(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Pedido creado exitosamente" }));
    });

    it("debe retornar 400 si no hay items", async () => {
      const req = mockRequestWithAuth(
        { reservacion_id: 1, tipo_pedido: "mesa", items: [] },
        {}
      );
      const res = mockResponse();
      mockClient.query.mockResolvedValueOnce().mockResolvedValueOnce();
      await controller.create_order(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // Actualizar estado del pedido
  describe("update_order_status", () => {
    it("debe actualizar el estado correctamente", async () => {
      const req = mockRequestWithAuth({ estado: "confirmado" }, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rowCount: 1, rows: [{ id: 1, estado: "confirmado" }] });
      await controller.update_order_status(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith({ id: 1, estado: "confirmado" });
    });

    it("debe retornar 400 si estado es inválido", async () => {
      const req = mockRequestWithAuth({ estado: "invalido" }, { id: 1 });
      const res = mockResponse();
      await controller.update_order_status(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debe retornar 404 si no existe el pedido", async () => {
      const req = mockRequestWithAuth({ estado: "confirmado" }, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rowCount: 0 });
      await controller.update_order_status(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // Eliminar pedido
  describe("delete_order", () => {
    it("debe eliminar un pedido correctamente", async () => {
      const req = mockRequestWithAuth({}, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }).mockResolvedValueOnce();
      await controller.delete_order(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith({ message: "Pedido eliminado exitosamente" });
    });

    it("debe retornar 404 si no existe", async () => {
      const req = mockRequestWithAuth({}, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rows: [] });
      await controller.delete_order(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("Errores", () => {

  it("get_all_orders maneja error", async () => {
    const req = mockRequestWithAuth();
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.get_all_orders(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("get_order_by_id maneja error", async () => {
    const req = mockRequestWithAuth({}, { id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.get_order_by_id(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("create_order hace rollback si falla", async () => {
    const req = mockRequestWithAuth({
      reservacion_id: 1,
      tipo_pedido: "mesa",
      items: [{ plato_id: 1, cantidad: 1 }]
    });

    const res = mockResponse();

    mockClient.query
      .mockResolvedValueOnce() // BEGIN
      .mockRejectedValueOnce(new Error("DB error")); // falla

    await controller.create_order(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("update_order_status maneja error", async () => {
    const req = mockRequestWithAuth({ estado: "confirmado" }, { id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.update_order_status(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("delete_order maneja error", async () => {
    const req = mockRequestWithAuth({}, { id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.delete_order(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

});

});
