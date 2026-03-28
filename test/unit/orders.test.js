jest.mock("../../src/config/db.js", () => ({
  query: jest.fn(),
  connect: jest.fn()
}));

const pool = require("../../src/config/db.js");
const controller = require("../../src/controllers/orders_controller.js");

// Helpers
const mockRequest = (body = {}, params = {}, kauth = {}) => ({
  body,
  params,
  kauth,
});

const mockResponse = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("Orders Controller", () => {

  let mockClient;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };

    pool.connect.mockResolvedValue(mockClient);

    jest.clearAllMocks();
  });

  // ========================
  // GET ALL
  // ========================
  describe("get_all_orders", () => {
    it("debe retornar todos los pedidos", async () => {
      const req = mockRequest();
      const res = mockResponse();

      pool.query.mockResolvedValue({
        rows: [{ id: 1 }]
      });

      await controller.get_all_orders(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
    });
  });

  // ========================
  // GET BY ID
  // ========================
  describe("get_order_by_id", () => {

    it("debe retornar un pedido si existe", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      pool.query.mockResolvedValue({
        rows: [{ id: 1 }]
      });

      await controller.get_order_by_id(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it("debe retornar 404 si no existe", async () => {
      const req = mockRequest({}, { id: 99 });
      const res = mockResponse();

      pool.query.mockResolvedValue({ rows: [] });

      await controller.get_order_by_id(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
    });

  });

  // ========================
  // CREATE ORDER
  // ========================
  describe("create_order", () => {

    it("debe crear un pedido correctamente", async () => {
      const req = mockRequest(
        {
          reservacion_id: 1,
          tipo_pedido: "mesa",
          items: [{ plato_id: 1, cantidad: 2 }]
        },
        {},
        { grant: { access_token: { content: { sub: "user123" } } } }
      );
      const res = mockResponse();

      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // insert pedido
        .mockResolvedValueOnce() // insert item
        .mockResolvedValueOnce(); // COMMIT

      await controller.create_order(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Pedido creado exitosamente",
          pedido_id: 1
        })
      );
    });

    it("debe retornar 400 si no hay items", async () => {
      const req = mockRequest(
        { reservacion_id: 1, tipo_pedido: "mesa", items: [] },
        {},
        { grant: { access_token: { content: { sub: "user123" } } } }
      );
      const res = mockResponse();

      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce(); // ROLLBACK

      await controller.create_order(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debe manejar error correctamente (rollback)", async () => {
      const req = mockRequest(
        {
          reservacion_id: 1,
          tipo_pedido: "mesa",
          items: [{ plato_id: 1, cantidad: 2 }]
        },
        {},
        { grant: { access_token: { content: { sub: "user123" } } } }
      );
      const res = mockResponse();

      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockRejectedValueOnce(new Error("DB error")); // falla controlada

      await controller.create_order(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockClient.release).toHaveBeenCalled();
    });

  });

  // ========================
  // UPDATE STATUS
  // ========================
  describe("update_order_status", () => {

    it("debe actualizar el estado correctamente", async () => {
      const req = mockRequest({ estado: "confirmado" }, { id: 1 });
      const res = mockResponse();

      pool.query.mockResolvedValue({
        rowCount: 1,
        rows: [{ id: 1, estado: "confirmado" }]
      });

      await controller.update_order_status(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        estado: "confirmado"
      });
    });

    it("debe retornar 400 si estado es inválido", async () => {
      const req = mockRequest({ estado: "invalido" }, { id: 1 });
      const res = mockResponse();

      await controller.update_order_status(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debe retornar 404 si no existe el pedido", async () => {
      const req = mockRequest({ estado: "confirmado" }, { id: 1 });
      const res = mockResponse();

      pool.query.mockResolvedValue({
        rowCount: 0,
        rows: []
      });

      await controller.update_order_status(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
    });

  });

  // ========================
  // DELETE ORDER
  // ========================
  describe("delete_order", () => {

    it("debe eliminar un pedido correctamente", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // existe
        .mockResolvedValueOnce(); // delete

      await controller.delete_order(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        message: "Pedido eliminado exitosamente"
      });
    });

    it("debe retornar 404 si no existe", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      pool.query.mockResolvedValue({ rows: [] });

      await controller.delete_order(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
    });

  });

});