jest.mock("../../src/config/db.js", () => ({
  query: jest.fn(),
}));
jest.mock("axios");

const axios = require("axios");
const pool = require("../../src/config/db.js");
const controller = require("../../src/controllers/users_controller.js");

const mockRequestWithUser = (body = {}, user = null) => ({
  body,
  kauth: {
    grant: {
      access_token: {
        content: user || { 
          sub: "user-123", 
          preferred_username: "testuser", 
          given_name: "Test", 
          family_name: "User", 
          name: "Test User", 
          email: "test@test.com" }
      }
    }
  }
});

const mockRequestWithoutAuth = (body = {}) => ({
  body,
  kauth: {
    grant: {
      access_token: {
        content: null,
      },
    },
  },
});

const mockResponse = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

describe("Controlador de Usuarios", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Obtener usuario autenticado
  describe("get_user", () => {
    it("debe devolver los datos del usuario", async () => {
      const req = mockRequestWithUser();
      const res = mockResponse();
      await controller.get_user(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: "user-123", username: "testuser" }));
    });

    it("debe devolver error 401 si no hay usuario", async () => {
      const req = mockRequestWithoutAuth();
      const res = mockResponse();
      await controller.get_user(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("debe manejar error interno", async () => {
      const req = {}; // rompe estructura
      const res = mockResponse();
      await controller.get_user(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // Actualizar usuario
  describe("update_user", () => {
    it("debe actualizar los datos del usuario", async () => {
      const req = mockRequestWithUser({ first_name: "Nuevo", last_name: "Apellido", email: "nuevo@test.com" });
      const res = mockResponse();
      axios.post.mockResolvedValueOnce({ data: { access_token: "admin-token" } });
      axios.put.mockResolvedValueOnce({});
      await controller.update_user(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: "Usuario actualizado correctamente" });
    });

    it("debe devolver error 401 si no hay usuario", async () => {
      const req = mockRequestWithoutAuth();
      const res = mockResponse();
      await controller.update_user(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("debe manejar error", async () => {
      const req = mockRequestWithUser();
      const res = mockResponse();
      axios.post.mockRejectedValue({
        response: { data: "error" },
      });

      await controller.update_user(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // Eliminar usuario
  describe("delete_user", () => {
    it("debe eliminar el usuario", async () => {
      const req = mockRequestWithUser();
      const res = mockResponse();
      axios.post.mockResolvedValueOnce({ data: { access_token: "admin-token" } });
      axios.delete.mockResolvedValueOnce({});
      await controller.delete_user(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: "Usuario eliminado correctamente" });
    });

    it("debe devolver error 401 si no hay usuario", async () => {
      const req = mockRequestWithoutAuth();
      const res = mockResponse();
      await controller.delete_user(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("debe manejar error", async () => {
      const req = mockRequestWithUser();
      const res = mockResponse();
      axios.post.mockRejectedValue({
        response: { data: "error" },
      });

      await controller.delete_user(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});