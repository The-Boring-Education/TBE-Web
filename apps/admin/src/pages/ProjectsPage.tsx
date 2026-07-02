import { useMemo, useState } from "react";

import { useUserProjects } from "@/api/projectsApi";
import { DataTable } from "@/components/tables/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProjectsPage = () => {
  const [page, setPage] = useState(1);
  const { data, pagination, isLoading } = useUserProjects(page, 10);
  console.log("HERE", data);

  const columns = useMemo(
    () => [
      {
        id: "user",
        header: "User",
        cell: (row: any) => (
          <div>
            <div className="font-medium">{row.user.userName}</div>
            <div className="text-sm text-gray-500">{row.user.userEmail}</div>
            <div className="text-sm text-gray-400">
              {row.user.userContactNo || "-"}
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        id: "project",
        header: "Project",
        cell: (row: any) => (
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.project.name}</span>
          </div>
        ),
        sortable: true,
      },
      {
        id: "lastUpdated",
        header: "Last Updated",
        cell: (row: any) => <div>{row.lastUpdated}</div>,
        sortable: true,
      },
    ],
    [],
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Projects</h1>

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

export default ProjectsPage;
