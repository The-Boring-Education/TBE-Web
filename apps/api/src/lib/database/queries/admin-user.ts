import type { DatabaseQueryResponseType } from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import AdminUser from "../models/AdminUser";

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const getAllAdminUsersFromDB = async (): Promise<DatabaseQueryResponseType> => {
  try {
    const admins = await AdminUser.find({}).sort({ createdAt: -1 });
    return { data: admins };
  } catch (error) {
    logger.error("DB: getAllAdminUsersFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to fetch admin users", details: error };
  }
};

const getAdminUserByIdFromDB = async (
  adminId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const admin = await AdminUser.findById(adminId);
    if (!admin) {
      return { error: "Admin user not found" };
    }
    return { data: admin };
  } catch (error) {
    logger.error("DB: getAdminUserByIdFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to fetch admin user", details: error };
  }
};

const getAdminUserByEmailFromDB = async (
  email: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const admin = await AdminUser.findOne({ email: normalizeEmail(email) });
    if (!admin) {
      return { error: "Admin user not found" };
    }
    return { data: admin };
  } catch (error) {
    logger.error("DB: getAdminUserByEmailFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to fetch admin user", details: error };
  }
};

const isActiveAdminEmailInDB = async (
  email: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const admin = await AdminUser.findOne({
      email: normalizeEmail(email),
      isActive: true,
    });
    return { data: Boolean(admin) };
  } catch (error) {
    logger.error("DB: isActiveAdminEmailInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to verify admin email", details: error };
  }
};

const countActiveAdminUsersFromDB =
  async (): Promise<DatabaseQueryResponseType> => {
    try {
      const count = await AdminUser.countDocuments({ isActive: true });
      return { data: count };
    } catch (error) {
      logger.error("DB: countActiveAdminUsersFromDB failed", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return { error: "Failed to count active admin users", details: error };
    }
  };

const countAllAdminUsersFromDB =
  async (): Promise<DatabaseQueryResponseType> => {
    try {
      const count = await AdminUser.countDocuments({});
      return { data: count };
    } catch (error) {
      logger.error("DB: countAllAdminUsersFromDB failed", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return { error: "Failed to count admin users", details: error };
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
    const existing = await AdminUser.findOne({ email });
    if (existing) {
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
    logger.error("DB: createAdminUserFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to create admin user", details: error };
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

    if (payload.isActive === false && existing.isActive) {
      const { data: activeCount } = await countActiveAdminUsersFromDB();
      if (typeof activeCount === "number" && activeCount <= 1) {
        return { error: "Cannot deactivate the last active admin" };
      }
    }

    const updateFields: UpdateAdminUserPayload = {};
    if (payload.name !== undefined) {
      updateFields.name = payload.name.trim() || undefined;
    }
    if (payload.notes !== undefined) {
      updateFields.notes = payload.notes.trim() || undefined;
    }
    if (payload.isActive !== undefined) {
      updateFields.isActive = payload.isActive;
    }

    const admin = await AdminUser.findByIdAndUpdate(adminId, updateFields, {
      new: true,
      runValidators: true,
    });

    return { data: admin };
  } catch (error) {
    logger.error("DB: updateAdminUserFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to update admin user", details: error };
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

    if (existing.isActive) {
      const { data: activeCount } = await countActiveAdminUsersFromDB();
      if (typeof activeCount === "number" && activeCount <= 1) {
        return { error: "Cannot delete the last active admin" };
      }
    }

    await AdminUser.findByIdAndDelete(adminId);
    return { data: { deleted: true } };
  } catch (error) {
    logger.error("DB: deleteAdminUserFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to delete admin user", details: error };
  }
};

const getActiveAdminEmailsFromDB =
  async (): Promise<DatabaseQueryResponseType> => {
    try {
      const admins = await AdminUser.find({ isActive: true }).select("email");
      const emails = admins.map((admin) => admin.email);
      return { data: emails };
    } catch (error) {
      logger.error("DB: getActiveAdminEmailsFromDB failed", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return { error: "Failed to fetch active admin emails", details: error };
    }
  };

export {
  countActiveAdminUsersFromDB,
  countAllAdminUsersFromDB,
  createAdminUserFromDB,
  deleteAdminUserFromDB,
  getActiveAdminEmailsFromDB,
  getAdminUserByEmailFromDB,
  getAdminUserByIdFromDB,
  getAllAdminUsersFromDB,
  isActiveAdminEmailInDB,
  updateAdminUserFromDB,
};
