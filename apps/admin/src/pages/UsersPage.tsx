import { useState } from "react";

import { useUsers } from "@/api/usersApi";
import { DataTable } from "@/components/tables/DataTable";
import type { User } from "@/types";

const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { data, pagination, isLoading } = useUsers(page, 10, searchTerm);

  const columns = [
    {
      id: "createdAt",
      header: "Created On",
      cell: (row: User) => {
        return <div>{row.createdAt}</div>;
      },
      sortable: true,
    },
    {
      id: "name",
      header: "Name",
      cell: (row: User) => <div className="font-medium">{row.name}</div>,
      sortable: true,
    },
    {
      id: "userName",
      header: "Username",
      cell: (row: User) => <div>{row.userName || "-"}</div>,
    },
    {
      id: "email",
      header: "Email",
      cell: (row: User) => (
        <a href={`mailto:${row.email}`} className="text-blue-600 underline">
          {row.email}
        </a>
      ),
      sortable: true,
    },
    {
      id: "occupation",
      header: "Occupation",
      cell: (row: User) => <div>{row.occupation || "-"}</div>,
    },
    {
      id: "contactNo",
      header: "Contact No",
      cell: (row: User) => <div>{row.contactNo || "-"}</div>,
    },
    {
      id: "purpose",
      header: "Purpose",
      cell: (row: User) => (
        <div>{Array.isArray(row.purpose) ? row.purpose.join(", ") : "-"}</div>
      ),
    },
    {
      id: "isOnboarded",
      header: "Onboarded",
      cell: (row: User) => (
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            row.isOnboarded
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.isOnboarded ? "Yes" : "No"}
        </span>
      ),
    },
    {
      id: "lastUpdated",
      header: "Last Updated On",
      cell: (row: User) => {
        return <div>{row.lastUpdated}</div>;
      },
      sortable: true,
    },
  ];

  console.log("HERE", data);

  if (isLoading) return;
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Users</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm">
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
    </div>
  );
};

export default UsersPage;
