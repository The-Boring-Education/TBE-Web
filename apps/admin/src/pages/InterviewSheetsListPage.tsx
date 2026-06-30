import { Edit, Percent, Tag, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCoupons } from "@/api/couponsApi";
import {
  useDeleteInterviewSheet,
  useInterviewSheets,
} from "@/api/interviewPrepApi";
import { DataTable } from "@/components/tables/DataTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const InterviewSheetsListPage = () => {
  const { data, isLoading } = useInterviewSheets();
  const { data: coupon } = useCoupons();
  const navigate = useNavigate();
  const deleteSheet = useDeleteInterviewSheet();
  const { toast } = useToast();

  // Helper function to get coupon targeting a specific sheet
  const getCouponsForSheet = (sheetId: string) => {
    if (!coupon) return [];
    return coupon.filter((coupon) =>
      coupon.applicableProducts.includes(sheetId),
    );
  };

  const handleDeleteSheet = async (sheetId: string, sheetName: string) => {
    try {
      await deleteSheet.mutateAsync(sheetId);
      toast({
        title: "Success",
        description: `Sheet "${sheetName}" deleted successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete sheet",
        variant: "destructive",
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: "Name",
        cell: (row: any) => (
          <Link
            className="text-purple-700 hover:underline"
            to={`/lab/interview-sheets/${row._id}`}
          >
            {row.name}
          </Link>
        ),
        sortable: true,
      },
      {
        id: "slug",
        header: "Slug",
        cell: (row: any) => row.slug,
        sortable: true,
      },
      {
        id: "liveOn",
        header: "Live On",
        cell: (row: any) =>
          row.liveOn ? new Date(row.liveOn).toLocaleDateString() : "-",
        sortable: true,
      },
      {
        id: "questions",
        header: "Questions",
        cell: (row: any) => row.questions?.length ?? 0,
      },
      {
        id: "pricing",
        header: "Pricing",
        cell: (row: any) => (
          <div className="space-y-1">
            {row.isPremium ? (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Premium
                </Badge>
                <span className="text-sm font-medium">
                  ₹{row.price?.toLocaleString("en-IN") || "0"}
                </span>
                {(row as any).discountPercentage > 0 && (
                  <Badge className="text-xs bg-green-100 text-green-800">
                    <Percent className="w-3 h-3 mr-1" />
                    {(row as any).discountPercentage}% OFF
                  </Badge>
                )}
              </div>
            ) : (
              <Badge variant="outline" className="text-xs">
                Free
              </Badge>
            )}
          </div>
        ),
      },
      {
        id: "coupon",
        header: "Coupons",
        cell: (row: any) => {
          const sheetCoupons = getCouponsForSheet(row._id);
          const activeCoupons = sheetCoupons.filter(
            (c) => c.isActive && new Date(c.expiryDate) > new Date(),
          );

          return (
            <div className="flex items-center gap-2">
              {sheetCoupons.length > 0 ? (
                <div className="flex items-center gap-1">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">
                    {activeCoupons.length} active
                    {sheetCoupons.length !== activeCoupons.length && (
                      <span className="text-gray-500">
                        , {sheetCoupons.length - activeCoupons.length} inactive
                      </span>
                    )}
                  </span>
                  {activeCoupons.length > 0 && (
                    <div className="flex gap-1 ml-2">
                      {activeCoupons.slice(0, 2).map((coupon) => (
                        <Badge
                          key={coupon._id}
                          className="text-xs font-mono bg-blue-100 text-blue-800"
                        >
                          {coupon.code}
                        </Badge>
                      ))}
                      {activeCoupons.length > 2 && (
                        <Badge className="text-xs bg-gray-100 text-gray-600">
                          +{activeCoupons.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-gray-400 text-sm">No coupon</span>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: (row: any) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/lab/interview-sheets/${row._id}`)}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Sheet</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{row.name}"? This action
                    cannot be undone. All questions and associated data will be
                    permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteSheet(row._id, row.name)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleteSheet.isPending}
                  >
                    {deleteSheet.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ),
      },
    ],
    [coupon, deleteSheet, navigate],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Interview Sheets</h1>
        <Button onClick={() => navigate("/lab/interview-sheets/new")}>
          New Sheet
        </Button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm mt-4">
        <DataTable
          columns={columns}
          data={data || []}
          isLoading={isLoading}
          searchable
          pagination={{
            pageSize: 50,
            pageIndex: 0,
            pageCount: 1,
            onPageChange: () => {},
          }}
        />
      </div>
    </div>
  );
};

export default InterviewSheetsListPage;
