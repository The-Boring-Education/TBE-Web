import { useMemo, useState } from "react";

import { useUserCourses } from "@/api/coursesApi";
import { DataTable } from "@/components/tables/DataTable";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CoursesPage = () => {
  const [page, setPage] = useState(1);
  const { data, pagination, isLoading } = useUserCourses(page, 10);
  console.log("HERE", data);

  const columns = useMemo(
    () => [
      {
        id: "user",
        header: "User",
        cell: (row: any) => (
          <div>
            <div className="font-medium">👤 {row.user?.userName || "-"}</div>
            <div className="text-sm text-gray-500">
              📧{" "}
              <a
                href={`mailto:${row.user?.userEmail}`}
                className="text-blue-600 underline"
              >
                {row.user?.userEmail}
              </a>
            </div>
            <div className="text-sm text-gray-500">
              📞 {row.user?.userContactNo || "-"}
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        id: "course",
        header: "Course",
        cell: (row: any) => (
          <div>
            <div className="font-medium">{row.course?.name || "-"}</div>
            <div className="text-sm text-gray-500">
              {row.course?.slug || "-"}
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        id: "progress",
        header: "Progress",
        cell: (row: any) => {
          const progress = row.totalChapters
            ? Math.round((row.completedChapters / row.totalChapters) * 100)
            : 0;
          return (
            <div className="w-full max-w-[200px]">
              <Progress value={progress} className="h-2" />
              <span className="text-xs text-gray-500 mt-1 inline-block">
                {progress}%
              </span>
            </div>
          );
        },
        sortable: true,
      },
      {
        id: "lastUpdated",
        header: "Last Updated",
        cell: (row: any) => <div>{row.lastUpdated || "-"}</div>,
        sortable: true,
      },
    ],
    [],
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Courses</h1>

      <Tabs defaultValue="user-progress" className="w-full">
        <TabsList>
          <TabsTrigger value="user-progress">User Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="user-progress">
          <div className="bg-white p-6 rounded-lg shadow-sm mt-4">
            <DataTable
              columns={columns}
              data={data || []}
              isLoading={isLoading}
              searchable
              pagination={{
                pageSize: 10,
                pageIndex: page - 1,
                pageCount: pagination?.totalPages || 1,
                onPageChange: (newPage) => setPage(newPage + 1),
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoursesPage;
