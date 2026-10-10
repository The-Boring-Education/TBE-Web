import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  useShikshaCourses,
  useUpdateShikshaCourseStatus,
} from "@/api/shikshaCoursesApi";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CourseLifecycleStatus, ShikshaCourse } from "@/types";
import {
  COURSE_LIFECYCLE_STATUSES,
  extractCourseStatusErrorMessage,
  filterCoursesByStatus,
  formatLastUpdated,
  getChapterCount,
  getCourseStatus,
} from "@/utils/shikshaCourse";

const STATUS_BADGE_VARIANT: Record<
  CourseLifecycleStatus,
  "default" | "secondary" | "outline"
> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  ARCHIVED: "outline",
};

const ShikshaCoursesPage = () => {
  const { data: courses, isLoading } = useShikshaCourses();
  const updateStatus = useUpdateShikshaCourseStatus();

  const [statusFilter, setStatusFilter] = useState<
    CourseLifecycleStatus | "all"
  >("all");

  const visibleCourses = useMemo(
    () => filterCoursesByStatus(courses, statusFilter),
    [courses, statusFilter],
  );

  const changeStatus = async (
    course: ShikshaCourse,
    status: CourseLifecycleStatus,
    successMessage: string,
    failureMessage: string,
  ) => {
    try {
      await updateStatus.mutateAsync({ courseId: course._id, status });
      toast.success(successMessage);
    } catch (error: unknown) {
      toast.error(extractCourseStatusErrorMessage(error, failureMessage));
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: "Course",
        cell: (row: ShikshaCourse) => (
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-gray-500">{row.slug}</div>
          </div>
        ),
        sortable: true,
      },
      {
        id: "status",
        header: "Status",
        cell: (row: ShikshaCourse) => {
          const status = getCourseStatus(row);
          return <Badge variant={STATUS_BADGE_VARIANT[status]}>{status}</Badge>;
        },
      },
      {
        id: "roadmap",
        header: "Roadmap",
        cell: (row: ShikshaCourse) => row.roadmap || "—",
      },
      {
        id: "chapters",
        header: "Chapters",
        cell: (row: ShikshaCourse) => getChapterCount(row),
      },
      {
        id: "updatedAt",
        header: "Last Updated",
        cell: (row: ShikshaCourse) => formatLastUpdated(row.updatedAt),
      },
      {
        id: "actions",
        header: "Actions",
        cell: (row: ShikshaCourse) => {
          const status = getCourseStatus(row);
          const isPending =
            updateStatus.isPending &&
            updateStatus.variables?.courseId === row._id;

          return (
            <div className="flex items-center gap-2">
              {status !== "PUBLISHED" && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() =>
                    void changeStatus(
                      row,
                      "PUBLISHED",
                      `${row.name} published`,
                      "Failed to publish course",
                    )
                  }
                >
                  Publish
                </Button>
              )}

              {status === "PUBLISHED" && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() =>
                    void changeStatus(
                      row,
                      "DRAFT",
                      `${row.name} moved back to draft`,
                      "Failed to unpublish course",
                    )
                  }
                >
                  Unpublish
                </Button>
              )}

              {status !== "ARCHIVED" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isPending}
                    >
                      Archive
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Archive this course?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <p className="text-sm text-gray-600">
                      {row.name} will be withdrawn from learners until it is
                      published again.
                    </p>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          void changeStatus(
                            row,
                            "ARCHIVED",
                            `${row.name} archived`,
                            "Failed to archive course",
                          )
                        }
                      >
                        Archive
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStatus.isPending, updateStatus.variables?.courseId],
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shiksha Courses</h1>
          <p className="text-sm text-gray-500">
            Review every course and control its lifecycle status.
          </p>
        </div>

        <div className="w-56">
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as CourseLifecycleStatus | "all")
            }
          >
            <SelectTrigger aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {COURSE_LIFECYCLE_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={visibleCourses}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ShikshaCoursesPage;
