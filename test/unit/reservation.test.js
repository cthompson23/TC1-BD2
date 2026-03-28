jest.mock("../../src/config/db.js", () => ({
  query: jest.fn(),
  connect: jest.fn()
}));

const pool = require("../../src/config/db.js");
const controller = require("../../src/controllers/reservations_controller.js");

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

describe("Reservations Controller", () => {

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
  // CREATE RESERVATION
  // ========================
  describe("create_reservation", () => {

    it("debe crear una reservación correctamente", async () => {
      const req = mockRequest(
        { mesa_id: 1, dia_reservacion: "2026-03-26", hora_reservacion: "12:00" },
        {},
        { grant: { access_token: { content: { sub: "user123" } } } }
      );
      const res = mockResponse();

      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce({ rows: [{ disponible: true }] }) // mesaCheck
        .mockResolvedValueOnce({ rows: [] }) // conflictCheck
        .mockResolvedValueOnce({ rows: [{ id: 1, ...req.body }] }) // insert
        .mockResolvedValueOnce() // update mesa
        .mockResolvedValueOnce(); // COMMIT

      await controller.create_reservation(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    it("debe manejar errores correctamente (rollback)", async () => {
      const req = mockRequest(
        { mesa_id: 1 },
        {},
        { grant: { access_token: { content: { sub: "user123" } } } }
      );
      const res = mockResponse();

      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockRejectedValueOnce(new Error("DB error")); // falla controlada

      await controller.create_reservation(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockClient.release).toHaveBeenCalled();
    });

  });

  // ========================
  // GET ALL
  // ========================
  describe("get_all_reservations", () => {

    it("debe retornar todas las reservaciones", async () => {
      const req = mockRequest();
      const res = mockResponse();

      pool.query.mockResolvedValue({
        rows: [{ id: 1, mesa_id: 1 }],
      });

      await controller.get_all_reservations(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith([{ id: 1, mesa_id: 1 }]);
    });

  });

  // ========================
  // GET BY ID
  // ========================
  describe("get_reservation_by_id", () => {

    it("debe retornar una reservación si existe", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      pool.query.mockResolvedValue({
        rows: [{ id: 1 }],
      });

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

  // ========================
  // CANCEL
  // ========================
  describe("cancel_reservation", () => {

    it("debe cancelar una reservación correctamente", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      pool.query
        .mockResolvedValueOnce({ rows: [{ mesa_id: 1, estado: "activa" }] })
        .mockResolvedValueOnce()
        .mockResolvedValueOnce();

      await controller.cancel_reservation(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        message: "Reservación cancelada exitosamente",
      });
    });

  });


 it('debe retornar 400 si la mesa no está disponible', async () => {
  const req = mockRequest(
    { mesa_id: 1 },
    {},
    { grant: { access_token: { content: { sub: "user123" } } } }
  );
  const res = mockResponse();

  mockClient.query
    .mockResolvedValueOnce() // BEGIN
    .mockResolvedValueOnce({ rows: [{ disponible: false }] }) // mesaCheck
    .mockResolvedValueOnce(); // ROLLBACK

  await controller.create_reservation(req, res, mockNext);

  expect(res.status).toHaveBeenCalledWith(400);
});

it('debe retornar 400 si hay conflicto', async () => {
  const req = mockRequest(
    {
      mesa_id: 1,
      dia_reservacion: "2026-03-26",
      hora_reservacion: "12:00"
    },
    {},
    { grant: { access_token: { content: { sub: "user123" } } } }
  );
  const res = mockResponse();

  mockClient.query
    .mockResolvedValueOnce() // BEGIN
    .mockResolvedValueOnce({ rows: [{ disponible: true }] }) // mesaCheck
    .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // conflictCheck
    .mockResolvedValueOnce(); // ROLLBACK

  await controller.create_reservation(req, res, mockNext);

  expect(res.status).toHaveBeenCalledWith(400);
});

it('debe retornar 400 si ya está cancelada', async () => {
  const req = mockRequest({}, { id: 1 });
  const res = mockResponse();

  pool.query.mockResolvedValue({
    rows: [{ estado: 'cancelada', mesa_id: 1 }]
  });

  await controller.cancel_reservation(req, res, mockNext);

  expect(res.status).toHaveBeenCalledWith(400);
});

it('debe retornar 404 si la mesa no existe', async () => {
  const req = mockRequest(
    { mesa_id: 1 },
    {},
    { grant: { access_token: { content: { sub: "user123" } } } }
  );
  const res = mockResponse();

  mockClient.query
    .mockResolvedValueOnce() // BEGIN
    .mockResolvedValueOnce({ rows: [] }) // mesaCheck
    .mockResolvedValueOnce(); // ROLLBACK

  await controller.create_reservation(req, res, mockNext);

  expect(res.status).toHaveBeenCalledWith(404);
});

it('debe retornar 404 si no existe la reservación al eliminar', async () => {
  const req = mockRequest({}, { id: 1 });
  const res = mockResponse();

  mockClient.query
    .mockResolvedValueOnce() // BEGIN
    .mockResolvedValueOnce({ rows: [] }) // no existe
    .mockResolvedValueOnce(); // ROLLBACK

  await controller.delete_reservation(req, res, mockNext);

  expect(res.status).toHaveBeenCalledWith(404);
});

it('debe manejar error en delete_reservation', async () => {
  const req = mockRequest({}, { id: 1 });
  const res = mockResponse();

  mockClient.query
    .mockResolvedValueOnce() // BEGIN
    .mockRejectedValueOnce(new Error('DB error'));

  await controller.delete_reservation(req, res, mockNext);

  expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  expect(mockClient.release).toHaveBeenCalled();
});

it('debe manejar error en cancel_reservation', async () => {
  const req = mockRequest({}, { id: 1 });
  const res = mockResponse();

  pool.query.mockRejectedValue(new Error('DB error'));

  await controller.cancel_reservation(req, res, mockNext);

  expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
});

it('debe manejar error en get_all_reservations', async () => {
  const req = mockRequest();
  const res = mockResponse();

  pool.query.mockRejectedValue(new Error('DB error'));

  await controller.get_all_reservations(req, res, mockNext);

  expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
});

it('debe manejar error en get_reservation_by_id', async () => {
  const req = mockRequest({}, { id: 1 });
  const res = mockResponse();

  pool.query.mockRejectedValue(new Error('DB error'));

  await controller.get_reservation_by_id(req, res, mockNext);

  expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
});
});