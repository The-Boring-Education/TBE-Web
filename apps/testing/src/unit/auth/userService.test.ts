import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAxiosPost = vi.fn();
const mockAxiosGet = vi.fn();

vi.mock("axios", () => ({
  default: {
    post: (...args: any[]) => mockAxiosPost(...args),
    get: (...args: any[]) => mockAxiosGet(...args),
  },
}));

describe("Auth userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com/v1";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  describe("createOrFindUser", () => {
    it("should send correct POST request and return user data", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        image: "https://avatar.test/img.png",
        provider: "google",
        providerAccountId: "google_123",
      };
      const apiResponse = {
        data: {
          status: true,
          data: { _id: "user_123", ...userData },
        },
      };
      mockAxiosPost.mockResolvedValue(apiResponse);

      const { createOrFindUser } =
        await import("../../../../../packages/auth/src/services/userService");
      const result = await createOrFindUser(userData);

      expect(mockAxiosPost).toHaveBeenCalledWith(
        "https://api.test.com/v1/user",
        {
          name: userData.name,
          email: userData.email,
          image: userData.image,
          provider: userData.provider,
          providerAccountId: userData.providerAccountId,
        },
      );
      expect(result._id).toBe("user_123");
    });

    it("should throw when API returns unsuccessful response", async () => {
      mockAxiosPost.mockResolvedValue({
        data: { status: false, data: null },
      });

      const { createOrFindUser } =
        await import("../../../../../packages/auth/src/services/userService");

      await expect(
        createOrFindUser({
          name: "Test",
          email: "test@example.com",
          image: "",
          provider: "google",
          providerAccountId: "123",
        }),
      ).rejects.toThrow("Failed to create or find user");
    });

    it("should throw when axios request fails", async () => {
      mockAxiosPost.mockRejectedValue(new Error("Network error"));

      const { createOrFindUser } =
        await import("../../../../../packages/auth/src/services/userService");

      await expect(
        createOrFindUser({
          name: "Test",
          email: "test@example.com",
          image: "",
          provider: "google",
          providerAccountId: "123",
        }),
      ).rejects.toThrow("Network error");
    });

    it("should throw when API URL is not configured", async () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      delete process.env.API_URL;
      delete process.env.VITE_BASE_API_URL;

      const { createOrFindUser } =
        await import("../../../../../packages/auth/src/services/userService");

      await expect(
        createOrFindUser({
          name: "Test",
          email: "test@example.com",
          image: "",
          provider: "google",
          providerAccountId: "123",
        }),
      ).rejects.toThrow("API URL is not configured");
    });
  });

  describe("getUserByEmail", () => {
    it("should return user data when found", async () => {
      const apiResponse = {
        data: {
          status: true,
          data: {
            _id: "user_123",
            email: "test@example.com",
            isOnboarded: true,
          },
        },
      };
      mockAxiosGet.mockResolvedValue(apiResponse);

      const { getUserByEmail } =
        await import("../../../../../packages/auth/src/services/userService");
      const result = await getUserByEmail("test@example.com");

      expect(mockAxiosGet).toHaveBeenCalledWith(
        "https://api.test.com/v1/user",
        { params: { email: "test@example.com" } },
      );
      expect(result?._id).toBe("user_123");
      expect(result?.isOnboarded).toBe(true);
    });

    it("should return null when user not found", async () => {
      mockAxiosGet.mockResolvedValue({
        data: { status: false, data: null },
      });

      const { getUserByEmail } =
        await import("../../../../../packages/auth/src/services/userService");
      const result = await getUserByEmail("unknown@example.com");

      expect(result).toBeNull();
    });

    it("should return null on network error", async () => {
      mockAxiosGet.mockRejectedValue(new Error("Connection timeout"));

      const { getUserByEmail } =
        await import("../../../../../packages/auth/src/services/userService");
      const result = await getUserByEmail("test@example.com");

      expect(result).toBeNull();
    });
  });

  describe("getUserById", () => {
    it("should return user data when found", async () => {
      const apiResponse = {
        data: {
          status: true,
          data: {
            _id: "user_123",
            email: "test@example.com",
            isOnboarded: false,
          },
        },
      };
      mockAxiosGet.mockResolvedValue(apiResponse);

      const { getUserById } =
        await import("../../../../../packages/auth/src/services/userService");
      const result = await getUserById("user_123");

      expect(mockAxiosGet).toHaveBeenCalledWith(
        "https://api.test.com/v1/user",
        { params: { userId: "user_123" } },
      );
      expect(result?._id).toBe("user_123");
    });

    it("should return null when user not found", async () => {
      mockAxiosGet.mockResolvedValue({
        data: { status: false },
      });

      const { getUserById } =
        await import("../../../../../packages/auth/src/services/userService");
      const result = await getUserById("nonexistent");

      expect(result).toBeNull();
    });

    it("should return null on network error", async () => {
      mockAxiosGet.mockRejectedValue(new Error("503 Service Unavailable"));

      const { getUserById } =
        await import("../../../../../packages/auth/src/services/userService");
      const result = await getUserById("user_123");

      expect(result).toBeNull();
    });
  });
});
