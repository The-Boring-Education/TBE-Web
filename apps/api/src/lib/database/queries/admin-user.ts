import type {
  AdminUserModel,
  DatabaseQueryResponseType,
} from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import AdminUser from "../models/AdminUser";

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const failed = (
  operation: string,
  message: string,
  error: unknown,
): DatabaseQueryResponseType => {
  logger.error(`DB: ${operation} failed`, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  return { error: message, details: error };
};

const isLastActiveAdmin = async (admin: AdminUserModel): Promise<boolean> =>
  admin.isActive && (await AdminUser.countDocuments({ isActive: true })) <= 1;

const getAllAdminUsersFromDB = async (): Promise<DatabaseQueryResponseType> => {
  try {
    return { data: await AdminUser.find({}).sort({ createdAt: -1 }) };
  } catch (error) {
    return failed(
      "getAllAdminUsersFromDB",
      "Failed to fetch admin users",
      error,
    );
  }
};

const getAdminUserByIdFromDB = async (
  adminId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const admin = await AdminUser.findById(adminId);
    return admin ? { data: admin } : { error: "Admin user not found" };
  } catch (error) {
    return failed(
      "getAdminUserByIdFromDB",
      "Failed to fetch admin user",
      error,
    );
  }
};

const getAdminUserByEmailFromDB = async (
  email: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const admin = await AdminUser.findOne({ email: normalizeEmail(email) });
    return admin ? { data: admin } : { error: "Admin user not found" };
  } catch (error) {
    return failed(
      "getAdminUserByEmailFromDB",
      "Failed to fetch admin user",
      error,
    );
  }
};

const getActiveAdminEmailsFromDB =
  async (): Promise<DatabaseQueryResponseType> => {
    try {
      const admins = await AdminUser.find({ isActive: true }).select("email");
      return { data: admins.map((admin) => admin.email) };
    } catch (error) {
      return failed(
        "getActiveAdminEmailsFromDB",
        "Failed to fetch active admin emails",
        error,
      );
    }
  };

interface CreateAdminUserPayload {
  email: string;
  name?: string;
  notes?: string;
  addedBy?: string;
}

const createAdminUserFromDB = async (
  payload: CreateAdminUserPayload,
): Promise<DatabaseQueryResponseType> => {
  try {
    const email = normalizeEmail(payload.email);
    if (await AdminUser.findOne({ email })) {
      return { error: "Admin user with this email already exists" };
    }

    const admin = await AdminUser.create({
      email,
      name: payload.name?.trim() || undefined,
      notes: payload.notes?.trim() || undefined,
      addedBy: payload.addedBy ? normalizeEmail(payload.addedBy) : undefined,
      isActive: true,
    });

    return { data: admin };
  } catch (error) {
    return failed(
      "createAdminUserFromDB",
      "Failed to create admin user",
      error,
    );
  }
};

interface UpdateAdminUserPayload {
  name?: string;
  notes?: string;
  isActive?: boolean;
}

const updateAdminUserFromDB = async (
  adminId: string,
  payload: UpdateAdminUserPayload,
): Promise<DatabaseQueryResponseType> => {
  try {
    const existing = await AdminUser.findById(adminId);
    if (!existing) {
      return { error: "Admin user not found" };
    }

    if (payload.isActive === false && (await isLastActiveAdmin(existing))) {
      return { error: "Cannot deactivate the last active admin" };
    }

    const updates: UpdateAdminUserPayload = {};
    if (payload.name !== undefined) {
      updates.name = payload.name.trim() || undefined;
    }
    if (payload.notes !== undefined) {
      updates.notes = payload.notes.trim() || undefined;
    }
    if (payload.isActive !== undefined) {
      updates.isActive = payload.isActive;
    }

    const admin = await AdminUser.findByIdAndUpdate(adminId, updates, {
      new: true,
      runValidators: true,
    });

    return { data: admin };
  } catch (error) {
    return failed(
      "updateAdminUserFromDB",
      "Failed to update admin user",
      error,
    );
  }
};

const deleteAdminUserFromDB = async (
  adminId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const existing = await AdminUser.findById(adminId);
    if (!existing) {
      return { error: "Admin user not found" };
    }

    if (await isLastActiveAdmin(existing)) {
      return { error: "Cannot delete the last active admin" };
    }

    await AdminUser.findByIdAndDelete(adminId);
    return { data: { deleted: true } };
  } catch (error) {
    return failed(
      "deleteAdminUserFromDB",
      "Failed to delete admin user",
      error,
    );
  }
};

export {
  createAdminUserFromDB,
  deleteAdminUserFromDB,
  getActiveAdminEmailsFromDB,
  getAdminUserByEmailFromDB,
  getAdminUserByIdFromDB,
  getAllAdminUsersFromDB,
  updateAdminUserFromDB,
};
