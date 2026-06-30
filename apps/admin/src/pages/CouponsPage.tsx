import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  useCoupons,
  useCreateCoupon,
  useDeleteCoupon,
  useUpdateCoupon,
} from "@/api/couponsApi";
import { getProductsByIds, useFlatProducts } from "@/api/productsApi";
import ProductMultiSelect from "@/components/ProductMultiSelect";
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
import type { Coupon, CouponFormData } from "@/types";

const CouponsPage = () => {
  const { data: coupon, isLoading } = useCoupons();
  const { data: products, isLoading: productsLoading } = useFlatProducts();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    discountPercentage: 0,
    description: "",
    isActive: true,
    expiryDate: "",
    maxUsage: undefined,
    minimumAmount: 0,
    applicableProducts: [],
  });

  const resetForm = () => {
    setFormData({
      code: "",
      discountPercentage: 0,
      description: "",
      isActive: true,
      expiryDate: "",
      maxUsage: undefined,
      minimumAmount: 0,
      applicableProducts: [],
    });
  };

  const handleCreate = () => {
    resetForm();
    setEditingCoupon(null);
    setShowCreateDialog(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      description: coupon.description,
      isActive: coupon.isActive,
      expiryDate: coupon.expiryDate.split("T")[0], // Format for date input
      maxUsage: coupon.maxUsage,
      minimumAmount: coupon.minimumAmount,
      applicableProducts: coupon.applicableProducts || [],
    });
    setEditingCoupon(coupon);
    setShowCreateDialog(true);
  };

  const validateForm = () => {
    if (!formData.code.trim()) {
      toast.error("Coupon code is required");
      return false;
    }
    if (formData.code.trim().length < 3) {
      toast.error("Coupon code must be at least 3 characters long");
      return false;
    }
    if (formData.discountPercentage <= 0 || formData.discountPercentage > 100) {
      toast.error("Discount percentage must be between 1 and 100");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (!formData.expiryDate) {
      toast.error("Expiry date is required");
      return false;
    }
    if (new Date(formData.expiryDate) <= new Date()) {
      toast.error("Expiry date must be in the future");
      return false;
    }
    if (formData.minimumAmount < 0) {
      toast.error("Minimum amount cannot be negative");
      return false;
    }
    if (formData.maxUsage !== undefined && formData.maxUsage <= 0) {
      toast.error("Max usage must be greater than 0 if specified");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingCoupon) {
        await updateCoupon.mutateAsync({
          couponId: editingCoupon._id,
          updatedData: formData,
        });
        toast.success("Coupon updated successfully!");
      } else {
        await createCoupon.mutateAsync(formData);
        toast.success("Coupon created successfully!");
      }
      setShowCreateDialog(false);
      resetForm();
      setEditingCoupon(null);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save coupon";
      toast.error(errorMessage);
      console.error("Failed to save coupon:", error);
    }
  };

  const handleDelete = async (couponId: string) => {
    try {
      await deleteCoupon.mutateAsync(couponId);
      toast.success("Coupon deleted successfully!");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete coupon";
      toast.error(errorMessage);
      console.error("Failed to delete coupon:", error);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "code",
        header: "Code",
        cell: (row: Coupon) => (
          <span
            className={`font-mono font-bold ${row.isActive ? "text-green-600" : "text-gray-400"}`}
          >
            {row.code}
          </span>
        ),
        sortable: true,
      },
      {
        id: "discount",
        header: "Discount",
        cell: (row: Coupon) => `${row.discountPercentage}%`,
        sortable: true,
      },
      {
        id: "description",
        header: "Description",
        cell: (row: Coupon) => (
          <div className="max-w-xs truncate" title={row.description}>
            {row.description}
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (row: Coupon) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        id: "usage",
        header: "Usage",
        cell: (row: Coupon) => (
          <span className="text-sm">
            {row.currentUsage}
            {row.maxUsage ? `/${row.maxUsage}` : ""}
          </span>
        ),
      },
      {
        id: "products",
        header: "Applicable Products",
        cell: (row: Coupon) => {
          if (!row.applicableProducts || row.applicableProducts.length === 0) {
            return (
              <Badge variant="secondary" className="text-xs">
                All Products
              </Badge>
            );
          }

          const selectedProducts = getProductsByIds(
            products,
            row.applicableProducts,
          );
          return (
            <div className="flex flex-wrap gap-1">
              {selectedProducts.slice(0, 2).map((product) => (
                <Badge key={product._id} variant="outline" className="text-xs">
                  {product.name}
                </Badge>
              ))}
              {selectedProducts.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{selectedProducts.length - 2} more
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        id: "expiry",
        header: "Expires",
        cell: (row: Coupon) => {
          const date = new Date(row.expiryDate);
          const isExpired = date < new Date();
          return (
            <span
              className={`text-sm ${isExpired ? "text-red-600" : "text-gray-600"}`}
            >
              {date.toLocaleDateString()}
            </span>
          );
        },
        sortable: true,
      },
      {
        id: "actions",
        header: "Actions",
        cell: (row: Coupon) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
                </AlertDialogHeader>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete coupon "{row.code}"? This
                  action cannot be undone.
                </p>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(row._id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Coupons Management</h1>
        <Button onClick={handleCreate}>Create New Coupon</Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : coupon && coupon.length > 0 ? (
          <DataTable
            columns={columns}
            data={coupon}
            isLoading={isLoading}
            searchable
            pagination={{
              pageSize: 20,
              pageIndex: 0,
              pageCount: 1,
              onPageChange: () => {},
            }}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Coupons Found
            </h3>
            <p className="text-gray-500 mb-4">
              Start by creating your first coupon to offer discounts to your
              users.
            </p>
            <Button onClick={handleCreate}>Create Your First Coupon</Button>
          </div>
        )}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Coupon Code
              </label>
              <Input
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="FREEDOM20"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Discount Percentage
              </label>
              <Input
                type="number"
                value={formData.discountPercentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountPercentage: parseInt(e.target.value) || 0,
                  })
                }
                min="1"
                max="100"
                placeholder="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="20% off for Independence Day"
                maxLength={200}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Expiry Date
                </label>
                <Input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Min Amount (₹)
                </label>
                <Input
                  type="number"
                  value={formData.minimumAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimumAmount: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Max Usage (Optional)
              </label>
              <Input
                type="number"
                value={formData.maxUsage || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxUsage: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                min="1"
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Applicable Products
              </label>
              <ProductMultiSelect
                selectedProductIds={formData.applicableProducts || []}
                onSelectionChange={(productIds) =>
                  setFormData({ ...formData, applicableProducts: productIds })
                }
                disabled={productsLoading}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to apply coupon to all available products
              </p>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createCoupon.isPending || updateCoupon.isPending}
            >
              {editingCoupon ? "Update" : "Create"} Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponsPage;
