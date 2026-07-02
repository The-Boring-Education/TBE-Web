import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Column {
  id: string;
  header: string;
  cell?: (row: any) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  searchable?: boolean;
  pagination?: {
    pageSize: number;
    pageIndex: number;
    pageCount: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable({
  columns,
  data,
  isLoading = false,
  searchable = true,
  pagination,
}: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");

  // Handle sorting
  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  };

  // Filter data based on search term
  const filteredData = searchTerm
    ? data.filter((row) =>
        Object.values(row).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )
    : data;

  // Sort data
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const valueA = a[sortColumn];
        const valueB = b[sortColumn];

        if (valueA === valueB) return 0;

        const comparison = valueA > valueB ? 1 : -1;
        return sortDirection === "asc" ? comparison : -comparison;
      })
    : filteredData;

  // Generate placeholder rows for loading state
  const loadingRows = Array(pagination?.pageSize || 5)
    .fill(0)
    .map((_, index) => (
      <TableRow key={`loading-${index}`}>
        {columns.map((column) => (
          <TableCell key={`loading-cell-${column.id}-${index}`}>
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </TableCell>
        ))}
      </TableRow>
    ));

  const renderDefaultCell = (value: any, columnId: string) => {
    if (columnId === "email") {
      return (
        <a href={`mailto:${value}`} className="text-blue-600 underline">
          {value}
        </a>
      );
    }

    if (columnId === "isOnboarded") {
      return (
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {value ? "Yes" : "No"}
        </span>
      );
    }

    if (columnId === "image") {
      return (
        <img
          src={value}
          alt="user avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }

    if (columnId === "createdAt") {
      const date = new Date(value);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    if (columnId === "purpose") {
      return Array.isArray(value) ? value.join(", ") : value;
    }

    return value ?? "";
  };

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 max-w-xs"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id}>
                  {column.sortable ? (
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort(column.id)}
                    >
                      {column.header}
                      {sortColumn === column.id ? (
                        sortDirection === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        )
                      ) : null}
                    </div>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading
              ? loadingRows
              : sortedData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column) => (
                      <TableCell key={`${rowIndex}-${column.id}`}>
                        {column.cell
                          ? column.cell(row)
                          : renderDefaultCell(row[column.id], column.id)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

            {!isLoading && sortedData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-6"
                >
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-gray-500">
            Page {pagination.pageIndex + 1} of {pagination.pageCount}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
              disabled={pagination.pageIndex === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
              disabled={pagination.pageIndex + 1 >= pagination.pageCount}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
