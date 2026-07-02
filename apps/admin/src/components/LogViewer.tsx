import { CheckCircle, Copy, Info, Trash2, X, XCircle } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { LogEntry, LogType } from "@/contexts/LogContext";
import { useLogs } from "@/contexts/LogContext";
import { cn } from "@/lib/utils";

interface LogViewerProps {
  trigger?: React.ReactNode;
}

const LogViewer = ({ trigger }: LogViewerProps) => {
  const { logs, clearLogs, removeLog } = useLogs();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<LogType | "all">("all");

  const filteredLogs = logs.filter(
    (log) => filter === "all" || log.type === filter,
  );

  const getLogIcon = (type: LogType) => {
    switch (type) {
      case "toast":
        return <Info className="w-4 h-4" />;
      case "api_success":
        return <CheckCircle className="w-4 h-4" />;
      case "api_error":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getLogColor = (type: LogType) => {
    switch (type) {
      case "toast":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "api_success":
        return "bg-green-100 text-green-800 border-green-200";
      case "api_error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const copyToClipboard = (log: LogEntry) => {
    const logText = JSON.stringify(
      {
        type: log.type,
        timestamp: log.timestamp.toISOString(),
        title: log.title,
        description: log.description,
        method: log.method,
        path: log.path,
        status: log.status,
        data: log.data,
      },
      null,
      2,
    );
    navigator.clipboard.writeText(logText);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="h-8 px-3">
            <Info className="h-4 w-4 mr-2" />
            Logs ({logs.length})
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <div className="px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle>Notification & API Response Logs</DialogTitle>
            <DialogDescription>
              View all toast notifications and server responses. Logs are stored
              in memory and cleared on page refresh.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All ({logs.length})
            </Button>
            <Button
              variant={filter === "toast" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("toast")}
            >
              Toasts ({logs.filter((l) => l.type === "toast").length})
            </Button>
            <Button
              variant={filter === "api_success" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("api_success")}
            >
              API Success ({logs.filter((l) => l.type === "api_success").length}
              )
            </Button>
            <Button
              variant={filter === "api_error" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("api_error")}
            >
              API Errors ({logs.filter((l) => l.type === "api_error").length})
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={clearLogs}
            disabled={logs.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>

        <Separator />

        <div className="flex-1 min-h-0 px-6 pb-6">
          <ScrollArea className="h-full">
            {filteredLogs.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No logs to display
              </div>
            ) : (
              <div className="space-y-3 py-2 pr-4">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      "border rounded-lg p-3 space-y-2 hover:shadow-md transition-shadow",
                      getLogColor(log.type),
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        <div className="mt-0.5">{getLogIcon(log.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className={cn("text-xs", getLogColor(log.type))}
                            >
                              {log.type.replace("_", " ").toUpperCase()}
                            </Badge>
                            {log.method && log.path && (
                              <span className="text-xs font-mono text-gray-600">
                                {log.method} {log.path}
                              </span>
                            )}
                            {log.status && (
                              <Badge variant="outline" className="text-xs">
                                {log.status}
                              </Badge>
                            )}
                          </div>
                          <div className="font-medium text-sm">{log.title}</div>
                          {log.description && (
                            <div className="text-sm text-gray-700 mt-1">
                              {log.description}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            {log.timestamp.toLocaleString()}
                          </div>
                          {log.data && (
                            <details className="mt-2">
                              <summary className="text-xs cursor-pointer text-gray-600 hover:text-gray-800">
                                View Data
                              </summary>
                              <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(log)}
                          title="Copy to clipboard"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeLog(log.id)}
                          title="Remove log"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogViewer;
