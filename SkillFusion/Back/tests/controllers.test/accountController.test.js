import { accountController } from"../../src/controllers/accountController.js";
import { Users, Role } from "../../src/models/association.js";
jest.mock("../../src/models/association.js", () => ({
  Users: {
    findAll: jest.fn(),
  },
  Role: {},
}));

const mockRequest = () => ({});
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('accountController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('devrait renvoyer tous les utilisateurs', async () => {
      const mockUsers = [{ id: 1, pseudo: "user1", role: { id: 1, name: "admin" } }];
      Users.findAll.mockResolvedValue(mockUsers);

      const req = mockRequest();
      const res = mockResponse();

      await accountController.getAllUsers(req, res);

      expect(Users.findAll).toHaveBeenCalledWith({
        include: [{ model: Role, as: "role" }],
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ allUsers: mockUsers });
    });
  });
});