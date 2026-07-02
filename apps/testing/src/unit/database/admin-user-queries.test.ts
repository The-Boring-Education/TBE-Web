import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockFind,
  mockFindOne,
  mockFindById,
  mockFindByIdAndUpdate,
  mockFindByIdAndDelete,
  mockCountDocuments,
  mockCreate,
  mockSelect,
  mockSort,
  MockAdminUserConstructor,
} = vi.hoisted(() => {
  const mockFindInner = vi.fn();
  const mockFindOneInner = vi.fn();
  const mockFindByIdInner = vi.fn();
  const mockFindByIdAndUpdateInner = vi.fn();
  const mockFindByIdAndDeleteInner = vi.fn();
  const mockCountDocumentsInner = vi.fn();
  const mockCreateInner = vi.fn();
  const mockSelectInner = vi.fn();
  const mockSortInner = vi.fn();

  mockSortInner.mockReturnValue([]);
  mockSelectInner.mockResolvedValue([]);
  mockFindOneInner.mockResolvedValue(null);
  mockFindByIdInner.mockResolvedValue(null);
  mockFindByIdAndUpdateInner.mockResolvedValue(null);
  mockFindByIdAndDeleteInner.mockResolvedValue(null);
  mockCountDocumentsInner.mockResolvedValue(0);
  mockCreateInner.mockResolvedValue({});

  const MockAdminUserConstructorInner = vi.fn();
  Object.assign(MockAdminUserConstructorInner, {
    find: (...args: unknown[]) => {
      mockFindInner(...args);
      return {
        sort: (...sortArgs: unknown[]) => {
          mockSortInner(...sortArgs);
          return mockSortInner();
        },
        select: (...selectArgs: unknown[]) => {
          mockSelectInner(...selectArgs);
          return mockSelectInner();
        },
      };
    },
    findOne: (...args: unknown[]) => mockFindOneInner(...args),
    findById: (...args: unknown[]) => mockFindByIdInner(...args),
    findByIdAndUpdate: (...args: unknown[]) =>
      mockFindByIdAndUpdateInner(...args),
    findByIdAndDelete: (...args: unknown[]) =>
      mockFindByIdAndDeleteInner(...args),
    countDocuments: (...args: unknown[]) => mockCountDocumentsInner(...args),
    create: (...args: unknown[]) => mockCreateInner(...args),
  });

  return {
    mockFind: mockFindInner,
    mockFindOne: mockFindOneInner,
    mockFindById: mockFindByIdInner,
    mockFindByIdAndUpdate: mockFindByIdAndUpdateInner,
    mockFindByIdAndDelete: mockFindByIdAndDeleteInner,
    mockCountDocuments: mockCountDocumentsInner,
    mockCreate: mockCreateInner,
    mockSelect: mockSelectInner,
    mockSort: mockSortInner,
    MockAdminUserConstructor: MockAdminUserConstructorInner,
  };
});

vi.mock("../../../../api/src/lib/database/models/AdminUser", () => ({
  default: MockAdminUserConstructor,
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import {
  countActiveAdminUsersFromDB,
  countAllAdminUsersFromDB,
  createAdminUserFromDB,
  deleteAdminUserFromDB,
  getActiveAdminEmailsFromDB,
  getAllAdminUsersFromDB,
  isActiveAdminEmailInDB,
  updateAdminUserFromDB,
} from "../../../../api/src/lib/database/queries/admin-user";

const VALID_ADMIN = {
  _id: "507f191e810c19729de860ea",
  email: "admin@example.com",
  name: "Admin",
  isActive: true,
  notes: "Primary admin",
  addedBy: "bootstrap",
};

describe("Admin User Queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSort.mockReturnValue([VALID_ADMIN]);
    mockSelect.mockResolvedValue([{ email: "admin@example.com" }]);
    mockFindOne.mockResolvedValue(null);
    mockFindById.mockResolvedValue(VALID_ADMIN);
    mockCountDocuments.mockResolvedValue(1);
    mockCreate.mockResolvedValue(VALID_ADMIN);
    mockFindByIdAndUpdate.mockResolvedValue({
      ...VALID_ADMIN,
      name: "Updated Admin",
    });
    mockFindByIdAndDelete.mockResolvedValue(VALID_ADMIN);
  });

  it("getAllAdminUsersFromDB returns admins sorted by createdAt", async () => {
    const result = await getAllAdminUsersFromDB();
    expect(result.data).toEqual([VALID_ADMIN]);
    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it("isActiveAdminEmailInDB returns true when active admin exists", async () => {
    mockFindOne.mockResolvedValue(VALID_ADMIN);
    const result = await isActiveAdminEmailInDB("admin@example.com");
    expect(result.data).toBe(true);
    expect(mockFindOne).toHaveBeenCalledWith({
      email: "admin@example.com",
      isActive: true,
    });
  });

  it("createAdminUserFromDB rejects duplicate email", async () => {
    mockFindOne.mockResolvedValue(VALID_ADMIN);
    const result = await createAdminUserFromDB({
      email: "admin@example.com",
    });
    expect(result.error).toBe("Admin user with this email already exists");
  });

  it("createAdminUserFromDB creates normalized admin", async () => {
    const result = await createAdminUserFromDB({
      email: " Admin@Example.COM ",
      name: " Admin ",
      notes: " notes ",
      addedBy: " Owner@Example.com ",
    });

    expect(result.data).toEqual(VALID_ADMIN);
    expect(mockCreate).toHaveBeenCalledWith({
      email: "admin@example.com",
      name: "Admin",
      notes: "notes",
      addedBy: "owner@example.com",
      isActive: true,
    });
  });

  it("updateAdminUserFromDB blocks deactivating last active admin", async () => {
    mockCountDocuments.mockResolvedValue(1);
    const result = await updateAdminUserFromDB(VALID_ADMIN._id, {
      isActive: false,
    });
    expect(result.error).toBe("Cannot deactivate the last active admin");
  });

  it("deleteAdminUserFromDB blocks deleting last active admin", async () => {
    mockCountDocuments.mockResolvedValue(1);
    const result = await deleteAdminUserFromDB(VALID_ADMIN._id);
    expect(result.error).toBe("Cannot delete the last active admin");
  });

  it("countActiveAdminUsersFromDB returns active count", async () => {
    mockCountDocuments.mockResolvedValue(2);
    const result = await countActiveAdminUsersFromDB();
    expect(result.data).toBe(2);
    expect(mockCountDocuments).toHaveBeenCalledWith({ isActive: true });
  });

  it("countAllAdminUsersFromDB returns total count", async () => {
    mockCountDocuments.mockResolvedValue(3);
    const result = await countAllAdminUsersFromDB();
    expect(result.data).toBe(3);
    expect(mockCountDocuments).toHaveBeenCalledWith({});
  });

  it("getActiveAdminEmailsFromDB returns email list", async () => {
    const result = await getActiveAdminEmailsFromDB();
    expect(result.data).toEqual(["admin@example.com"]);
    expect(mockFind).toHaveBeenCalledWith({ isActive: true });
    expect(mockSelect).toHaveBeenCalledWith("email");
  });
});
