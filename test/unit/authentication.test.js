jest.mock("../../src/config/db.js", () => ({
  query: jest.fn(),
}));
jest.mock("axios");

const axios = require("axios");
const pool = require("../../src/config/db.js");
const controller = require("../../src/controllers/authentication_controller.js");

const mockRequest = (body = {}) => ({ body });
const mockResponse = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe("Controlador de Autenticación", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Registrar usuario
  describe("register", () => {
    it("debe registrar un usuario normal", async () => {
      const req = mockRequest({ username: "user1", email: "user1@test.com", password: "123", first_name: "Juan", last_name: "Perez", isAdmin: false });
      const res = mockResponse();
      axios.post.mockResolvedValueOnce({ data: { access_token: "token" } });
      axios.post.mockResolvedValueOnce({ headers: { location: "http://keycloak/users/abc-123" } });
      pool.query.mockResolvedValueOnce({});
      await controller.register(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("registrado") }));
    });

    it("debe registrar un usuario admin", async () => {
      const req = mockRequest({ username: "admin1", email: "admin@test.com", password: "123", first_name: "Admin", last_name: "User", isAdmin: true });
      const res = mockResponse();
      axios.post.mockResolvedValueOnce({ data: { access_token: "token" } });
      axios.post.mockResolvedValueOnce({ headers: { location: "http://keycloak/users/admin-456" } });
      axios.get.mockResolvedValueOnce({ data: [{ name: "admin", id: "role-1" }] });
      axios.post.mockResolvedValueOnce({});
      pool.query.mockResolvedValueOnce({});
      await controller.register(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("registrado") }));
    });

    it("debe manejar error si Keycloak falla", async () => {
      const req = mockRequest({ username: "test", email: "test@test.com", password: "123", first_name: "Test", last_name: "User" });
      const res = mockResponse();
      axios.post.mockRejectedValue({ response: { data: { error: "Error" } } });
      await controller.register(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // Iniciar sesión
  describe("login", () => {
    it("debe iniciar sesión correctamente", async () => {
      const req = mockRequest({ username: "user1", password: "123" });
      const res = mockResponse();
      axios.post.mockResolvedValueOnce({ data: { access_token: "token-falso" } });
      await controller.login(req, res, mockNext);
      expect(res.json).toHaveBeenCalledWith({ access_token: "token-falso" });
    });

    it("debe devolver error 401 si credenciales inválidas", async () => {
      const req = mockRequest({ username: "malo", password: "malo" });
      const res = mockResponse();
      axios.post.mockRejectedValue({ response: { status: 401 } });
      await controller.login(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Credenciales inválidas" });
    });
  });
});