import { format } from "date-fns";
import {
  Bot,
  ExternalLink,
  Eye,
  Globe,
  Monitor,
  Smartphone,
} from "lucide-react";
import { useState } from "react";

import { useUserInterests } from "@/api/userInterestsApi";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserInterest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  eventType: string;
  eventDescription?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  source: "WEBAPP" | "PREPYATRA" | "ADMIN" | "API";
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

const UserInterestsPage = () => {
  const [page, setPage] = useState(1);
  const [eventType, setEventType] = useState("all");
  const [source, setSource] = useState("all");
  const [isActive, setIsActive] = useState("all");

  const { data, pagination, isLoading } = useUserInterests(
    page,
    10,
    eventType === "all" ? "" : eventType,
    source === "all" ? "" : source,
    isActive === "all" ? "" : isActive,
  );

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      PREPYATRA_SUBSCRIPTION: "bg-blue-100 text-blue-700",
      WEBAPP_SUBSCRIPTION: "bg-green-100 text-green-700",
      AI_MENTOR: "bg-purple-100 text-purple-700",
      COHORT_PROGRAM: "bg-orange-100 text-orange-700",
      NEWSLETTER: "bg-gray-100 text-gray-700",
      BETA_FEATURE: "bg-yellow-100 text-yellow-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "WEBAPP":
        return <Globe className="h-4 w-4" />;
      case "PREPYATRA":
        return <Smartphone className="h-4 w-4" />;
      case "ADMIN":
        return <Monitor className="h-4 w-4" />;
      case "API":
        return <Bot className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const columns = [
    {
      id: "user",
      header: "User",
      cell: (row: UserInterest) => (
        <div className="flex items-center space-x-3">
          <div>
            <div className="font-medium">{row.userId.name}</div>
            <div className="text-sm text-gray-500">{row.userId.email}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      id: "eventType",
      header: "Interest Type",
      cell: (row: UserInterest) => (
        <Badge className={getEventTypeColor(row.eventType)}>
          {row.eventType.replace(/_/g, " ")}
        </Badge>
      ),
      sortable: true,
    },
    {
      id: "source",
      header: "Source",
      cell: (row: UserInterest) => (
        <div className="flex items-center space-x-2">
          {getSourceIcon(row.source)}
          <span className="text-sm">{row.source}</span>
        </div>
      ),
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      cell: (row: UserInterest) => (
        <Badge
          className={
            row.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }
        >
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
      sortable: true,
    },
    {
      id: "description",
      header: "Description",
      cell: (row: UserInterest) => (
        <div className="max-w-xs">
          <div className="text-sm text-gray-600 truncate">
            {row.eventDescription || "-"}
          </div>
          {row.metadata && Object.keys(row.metadata).length > 0 && (
            <div className="text-xs text-gray-400 mt-1">Has metadata</div>
          )}
        </div>
      ),
    },
    {
      id: "createdAt",
      header: "Registered On",
      cell: (row: UserInterest) => (
        <div className="text-sm">
          {format(new Date(row.createdAt), "MMM dd, yyyy")}
          <div className="text-xs text-gray-500">
            {format(new Date(row.createdAt), "HH:mm")}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row: UserInterest) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Open metadata view modal
              const metadata = {
                ...row.metadata,
                ipAddress: row.ipAddress,
                userAgent: row.userAgent,
              };
              alert(`Metadata: ${JSON.stringify(metadata, null, 2)}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.open(`mailto:${row.userId.email}`, "_blank");
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Interests</h1>
        <div className="text-sm text-gray-500">
          Track user interest in upcoming features and subscriptions
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue placeholder="All event types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All event types</SelectItem>
                <SelectItem value="PREPYATRA_SUBSCRIPTION">
                  PrepYatra Subscription
                </SelectItem>
                <SelectItem value="WEBAPP_SUBSCRIPTION">
                  Webapp Subscription
                </SelectItem>
                <SelectItem value="AI_MENTOR">AI Mentor</SelectItem>
                <SelectItem value="COHORT_PROGRAM">Cohort Program</SelectItem>
                <SelectItem value="NEWSLETTER">Newsletter</SelectItem>
                <SelectItem value="BETA_FEATURE">Beta Feature</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source
            </label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                <SelectItem value="WEBAPP">Webapp</SelectItem>
                <SelectItem value="PREPYATRA">PrepYatra</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="API">API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select value={isActive} onValueChange={setIsActive}>
              <SelectTrigger>
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {pagination.totalItems || 0}
          </div>
          <div className="text-sm text-gray-500">Total Interests</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {
              data.filter((item) => item.eventType === "PREPYATRA_SUBSCRIPTION")
                .length
            }
          </div>
          <div className="text-sm text-gray-500">PrepYatra Subscription</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            {
              data.filter((item) => item.eventType === "WEBAPP_SUBSCRIPTION")
                .length
            }
          </div>
          <div className="text-sm text-gray-500">Webapp Subscription</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-orange-600">
            {data.filter((item) => item.isActive).length}
          </div>
          <div className="text-sm text-gray-500">Active Interests</div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <DataTable
          columns={columns}
          data={data || []}
          isLoading={isLoading}
          searchable={false}
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

export default UserInterestsPage;
