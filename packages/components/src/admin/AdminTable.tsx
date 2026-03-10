import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import Button from "../common/Buttons/Button";
import Text from "../common/Typography/Text";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface AdminTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    sortBy: string;
    order: "asc" | "desc";
    onSort: (key: string, order: "asc" | "desc") => void;
  };
  filters?: {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    additionalFilters?: React.ReactNode;
  };
  actions?: {
    onExport?: () => void;
    onRefresh?: () => void;
  };
}

const AdminTable = ({
  columns,
  data,
  loading = false,
  pagination,
  sorting,
  filters,
  actions,
}: AdminTableProps) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const toggleRowSelection = (id: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(
        new Set(data.map((item, index) => item._id || index.toString())),
      );
    }
  };

  const handleSort = (key: string) => {
    if (!sorting) return;

    const newOrder =
      sorting.sortBy === key && sorting.order === "asc" ? "desc" : "asc";
    sorting.onSort(key, newOrder);
  };

  const renderSortIcon = (key: string) => {
    if (!sorting || sorting.sortBy !== key) return null;

    return sorting.order === "asc" ? (
      <ChevronUpIcon className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 inline ml-1" />
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-t-lg" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 border-t" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Table Header Actions */}
      {(filters || actions) && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {filters && (
                <>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filters.searchTerm}
                    onChange={(e) => filters.onSearchChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {filters.additionalFilters}
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {actions?.onRefresh && (
                <Button
                  variant="OUTLINE"
                  text="Refresh"
                  onClick={actions.onRefresh}
                />
              )}
              {actions?.onExport && (
                <Button
                  variant="OUTLINE"
                  text="Export"
                  onClick={actions.onExport}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={toggleAllRows}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  {column.label}
                  {column.sortable && renderSortIcon(column.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={row._id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row._id || index.toString())}
                    onChange={() =>
                      toggleRowSelection(row._id || index.toString())
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <Text className="text-sm text-gray-700" level="p">
              Showing {(pagination.currentPage - 1) * 20 + 1} to{" "}
              {Math.min(pagination.currentPage * 20, pagination.total)} of{" "}
              {pagination.total} results
            </Text>
            <div className="flex items-center space-x-2">
              <Button
                variant="OUTLINE"
                text="Previous"
                onClick={() =>
                  pagination.onPageChange(pagination.currentPage - 1)
                }
                disabled={pagination.currentPage === 1}
              />
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="OUTLINE"
                text="Next"
                onClick={() =>
                  pagination.onPageChange(pagination.currentPage + 1)
                }
                disabled={pagination.currentPage === pagination.totalPages}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTable;
