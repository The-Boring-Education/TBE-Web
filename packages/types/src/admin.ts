/**
 * Admin user types — source of truth is the AdminUser MongoDB collection.
 * Use GET /api/v1/admin/me for runtime admin checks.
 */

export interface AdminUser {
  _id: string;
  email: string;
  name?: string;
  isActive: boolean;
  notes?: string;
  addedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminMeResponse {
  isAdmin: boolean;
  admin?: AdminUser;
}

export interface AdminUserFormData {
  email: string;
  name?: string;
  notes?: string;
}

export interface AdminUserUpdateData {
  name?: string;
  notes?: string;
  isActive?: boolean;
}
