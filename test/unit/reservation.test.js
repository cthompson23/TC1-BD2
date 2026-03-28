jest.mock("../../src/config/db.js", () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

const pool = require("../../src/config/db.js");
const controller = require("../../src/controllers/reservations_controller.js");

const mockRequest = (body = {}, params = {}, kauth = {}) => ({ body, params, kauth });
const mockResponse = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe("Controlador de Reservaciones", () => {
  let mockClient;

  beforeEach(() => {
    mockClient = { query: jest.fn(), release: jest.fn() };
    pool.connect.mockResolvedValue(mockClient);
    jest.clearAllMocks();
  });

  // Obtener todas las reservaciones
  describe("get_all_reservations", () => {
    it("debe retornar todas las reservaciones", async () => {
      const req = mockRequest();
      const res = mockResponse();
      pool.query.mockResolvedValue({ rows: [{ id: 1, mesa_id: 1 }] });
      await controller.get_all_reservations(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith([{ id: 1, mesa_id: 1 }]);
    });
  });

  // Obtener reservación por ID
  describe("get_reservation_by_id", () => {
    it("debe retornar una reservación si existe", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
      await controller.get_reservation_by_id(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it("debe retornar 404 si no existe", async () => {
      const req = mockRequest({}, { id: 99 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rows: [] });
      await controller.get_reservation_by_id(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // Crear reservación
  describe("create_reservation", () => {
    it("debe crear una reservación correctamente", async () => {
      const req = mockRequest(
        { mesa_id: 1, dia_reservacion: "2026-03-26", hora_reservacion: "12:00" },
        {},
        { grant: { access_token: { content: { sub: "user123" } } } }
      );
      const res = mockResponse();
      mockClient.query
        .mockResolvedValueOnce()
        .mockResolvedValueOnce({ rows: [{ disponible: true }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce()
        .mockResolvedValueOnce();
      await controller.create_reservation(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("debe retornar 400 si la mesa no está disponible", async () => {
      const req = mockRequest(
        { mesa_id: 1 },
        {},
        { grant: { access_token: { content: { sub: "user123" } } } }
      );
      const res = mockResponse();
      mockClient.query
        .mockResolvedValueOnce()
        .mockResolvedValueOnce({ rows: [{ disponible: false }] })
        .mockResolvedValueOnce();
      await controller.create_reservation(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debe retornar 404 si la mesa no existe", async () => {
      const req = mockRequest(
        { mesa_id: 1 },
        {},
        { grant: { access_token: { content: { sub: "user123" } } } }
      );
      const res = mockResponse();
      mockClient.query
        .mockResolvedValueOnce()
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce();
      await controller.create_reservation(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // Cancelar reservación
  describe("cancel_reservation", () => {
    it("debe cancelar una reservación correctamente", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      pool.query
        .mockResolvedValueOnce({ rows: [{ mesa_id: 1, estado: "activa" }] })
        .mockResolvedValueOnce()
        .mockResolvedValueOnce();
      await controller.cancel_reservation(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith({ message: "Reservación cancelada exitosamente" });
    });

    it("debe retornar 400 si ya está cancelada", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      pool.query.mockResolvedValue({ rows: [{ estado: "cancelada", mesa_id: 1 }] });
      await controller.cancel_reservation(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // Eliminar reservación físicamente
  describe("delete_reservation", () => {
    it("debe eliminar una reservación y liberar la mesa", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      mockClient.query
        .mockResolvedValueOnce()
        .mockResolvedValueOnce({ rows: [{ mesa_id: 1 }] })
        .mockResolvedValueOnce()
        .mockResolvedValueOnce()
        .mockResolvedValueOnce();
      await controller.delete_reservation(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith({ message: "Reservación eliminada correctamente" });
    });

    it("debe retornar 404 si no existe", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      mockClient.query
        .mockResolvedValueOnce()
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce();
      await controller.delete_reservation(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("Errores", () => {

  it("create_reservation hace rollback si falla", async () => {
    const req = mockRequest(
      { mesa_id: 1 },
      {},
      { grant: { access_token: { content: { sub: "user123" } } } }
    );
    const res = mockResponse();

    mockClient.query
      .mockResolvedValueOnce() // BEGIN
      .mockRejectedValueOnce(new Error("DB error"));

    await controller.create_reservation(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("create_reservation retorna 400 si hay conflicto", async () => {
    const req = mockRequest(
      { mesa_id: 1, dia_reservacion: "2026-03-26", hora_reservacion: "12:00" },
      {},
      { grant: { access_token: { content: { sub: "user123" } } } }
    );
    const res = mockResponse();

    mockClient.query
      .mockResolvedValueOnce() // BEGIN
      .mockResolvedValueOnce({ rows: [{ disponible: true }] })
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // conflicto
      .mockResolvedValueOnce(); // ROLLBACK

    await controller.create_reservation(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
  });


  it("get_all_reservations maneja error", async () => {
    const req = mockRequest();
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.get_all_reservations(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("get_reservation_by_id maneja error", async () => {
    const req = mockRequest({}, { id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.get_reservation_by_id(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("cancel_reservation maneja error", async () => {
    const req = mockRequest({}, { id: 1 });
    const res = mockResponse();

    pool.query.mockRejectedValue(new Error("DB error"));

    await controller.cancel_reservation(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("delete_reservation maneja error y hace rollback", async () => {
    const req = mockRequest({}, { id: 1 });
    const res = mockResponse();

    mockClient.query
      .mockResolvedValueOnce() // BEGIN
      .mockRejectedValueOnce(new Error("DB error"));

    await controller.delete_reservation(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    expect(mockClient.release).toHaveBeenCalled();
  });

});
});