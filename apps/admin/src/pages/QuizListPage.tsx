import { Edit, Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useQuizCategories } from "@/api/quizApi";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const QuizListPage = () => {
  const { data, isLoading } = useQuizCategories(true, true);
  const [page] = useState(1);
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        id: "categoryName",
        header: "Category Name",
        cell: (row: any) => {
          // Try multiple possible ID fields
          const id = row._id || row.id || row.categoryId;
          if (!id) {
            return <span className="text-red-500">No ID</span>;
          }
          return (
            <Link
              className="text-purple-700 hover:underline font-medium"
              to={`/content/modifications/quiz/${id}`}
            >
              {row.categoryName}
            </Link>
          );
        },
        sortable: true,
      },
      {
        id: "_id",
        header: "Quiz ID",
        cell: (row: any) => {
          const id = row._id || row.id || row.categoryId;
          return (
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              {id || "No ID"}
            </code>
          );
        },
        sortable: true,
      },
      {
        id: "categoryDescription",
        header: "Description",
        cell: (row: any) => (
          <span className="text-sm text-gray-600 line-clamp-2">
            {row.categoryDescription}
          </span>
        ),
        sortable: false,
      },
      {
        id: "categoryIcon",
        header: "Icon",
        cell: (row: any) => (
          <div className="flex items-center gap-2">
            <span className="text-2xl">{row.categoryIcon}</span>
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
              {row.categoryIcon}
            </code>
          </div>
        ),
        sortable: false,
      },
      {
        id: "questionCount",
        header: "Questions",
        cell: (row: any) => (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {row.questionCount || 0} questions
            </Badge>
          </div>
        ),
        sortable: true,
      },
      {
        id: "status",
        header: "Status",
        cell: (row: any) => (
          <div className="flex items-center gap-2">
            {row.isActive ? (
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Active
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-red-100 text-red-800 flex items-center gap-1"
              >
                <EyeOff className="w-3 h-3" />
                Inactive
              </Badge>
            )}
          </div>
        ),
        sortable: true,
      },
      {
        id: "actions",
        header: "Actions",
        cell: (row: any) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Try multiple possible ID fields
              const id = row._id || row.id || row.categoryId;
              if (!id) {
                return;
              }
              navigate(`/content/modifications/quiz/${id}`);
            }}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
        ),
        sortable: false,
      },
    ],
    [navigate],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quiz Categories</h1>
          <p className="text-gray-600 mt-2">
            Manage and modify existing quiz categories and their questions
          </p>
        </div>
        <Button
          onClick={() => navigate("/content/creation/quizzes")}
          variant="outline"
        >
          Create New Quiz
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mt-4">
        <DataTable
          columns={columns}
          data={data || []}
          isLoading={isLoading}
          searchable
          pagination={{
            pageSize: 20,
            pageIndex: page - 1,
            pageCount: Math.ceil((data?.length || 0) / 20),
            onPageChange: () => {},
          }}
        />
      </div>
    </div>
  );
};

export default QuizListPage;
