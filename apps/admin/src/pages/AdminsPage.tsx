import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  useAdmins,
  useCreateAdmin,
  useDeleteAdmin,
  useUpdateAdmin,
} from "@/api/adminsApi";
import { DataTable } from "@/components/tables/DataTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AdminUser, AdminUserFormData } from "@/types";

const emptyForm: AdminUserFormData = {
  email: "",
  name: "",
  notes: "",
};

const AdminsPage = () => {
  const { data: admins, isLoading } = useAdmins();
  const createAdmin = useCreateAdmin();
  const updateAdmin = useUpdateAdmin();
  const deleteAdmin = useDeleteAdmin();

  const [showDialog, setShowDialog] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<AdminUserFormData>(emptyForm);

  const activeAdminCount = useMemo(
    () => admins.filter((admin) => admin.isActive).length,
    [admins],
  );

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingAdmin(null);
  };

  const handleCreate = () => {
    resetForm();
    setShowDialog(true);
  };

  const handleEdit = (admin: AdminUser) => {
    setFormData({
      email: admin.email,
      name: admin.name || "",
      notes: admin.notes || "",
    });
    setEditingAdmin(admin);
    setShowDialog(true);
  };

  const validateForm = () => {
    if (!editingAdmin && !formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!editingAdmin && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingAdmin) {
        await updateAdmin.mutateAsync({
          adminId: editingAdmin._id,
          updatedData: {
            name: formData.name?.trim() || undefined,
            notes: formData.notes?.trim() || undefined,
          },
        });
        toast.success("Admin updated successfully");
      } else {
        await createAdmin.mutateAsync({
          email: formData.email.trim(),
          name: formData.name?.trim() || undefined,
          notes: formData.notes?.trim() || undefined,
        });
        toast.success("Admin added successfully");
      }
      setShowDialog(false);
      resetForm();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save admin",
      );
    }
  };

  const handleToggleActive = async (admin: AdminUser) => {
    if (admin.isActive && activeAdminCount <= 1) {
      toast.error("Cannot deactivate the last active admin");
      return;
    }

    try {
      await updateAdmin.mutateAsync({
        adminId: admin._id,
        updatedData: { isActive: !admin.isActive },
      });
      toast.success(admin.isActive ? "Admin deactivated" : "Admin reactivated");
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update admin status",
      );
    }
  };

  const handleDelete = async (adminId: string) => {
    try {
      await deleteAdmin.mutateAsync(adminId);
      toast.success("Admin removed successfully");
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to remove admin",
      );
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "email",
        header: "Email",
        cell: (row: AdminUser) => (
          <span className="font-medium">{row.email}</span>
        ),
        sortable: true,
      },
      {
        id: "name",
        header: "Name",
        cell: (row: AdminUser) => row.name || "—",
      },
      {
        id: "status",
        header: "Status",
        cell: (row: AdminUser) => (
          <Badge variant={row.isActive ? "default" : "secondary"}>
            {row.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "addedBy",
        header: "Added By",
        cell: (row: AdminUser) => row.addedBy || "Bootstrap",
      },
      {
        id: "notes",
        header: "Notes",
        cell: (row: AdminUser) => (
          <div className="max-w-xs truncate" title={row.notes}>
            {row.notes || "—"}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: (row: AdminUser) => {
          const isLastActive = row.isActive && activeAdminCount <= 1;

          return (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(row)}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isLastActive}
                onClick={() => void handleToggleActive(row)}
              >
                {row.isActive ? "Deactivate" : "Activate"}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isLastActive}
                  >
                    Remove
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove admin access?</AlertDialogTitle>
                  </AlertDialogHeader>
                  <p className="text-sm text-gray-600">
                    This will permanently remove {row.email} from the admin
                    allowlist.
                  </p>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => void handleDelete(row._id)}
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          );
        },
      },
    ],
    [activeAdminCount, deleteAdmin, updateAdmin],
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
          <p className="text-sm text-gray-500">
            Manage who can access the TBE admin dashboard and APIs.
          </p>
        </div>
        <Button onClick={handleCreate}>Add Admin</Button>
      </div>

      <DataTable
        data={admins}
        columns={columns}
        isLoading={isLoading}
        searchKey="email"
        searchPlaceholder="Search by email..."
      />

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAdmin ? "Edit Admin" : "Add Admin"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={Boolean(editingAdmin)}
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Name (optional)
              </label>
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Display name"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Notes (optional)
              </label>
              <Textarea
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Why this person was added"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={createAdmin.isPending || updateAdmin.isPending}
            >
              {editingAdmin ? "Save Changes" : "Add Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminsPage;
