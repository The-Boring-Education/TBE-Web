import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ErrorDetails, errorLogger } from "@/utils/errorLogger";

const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<ErrorDetails[]>([]);

  const loadErrors = () => {
    setErrors(errorLogger.getStoredErrors());
  };

  const clearErrors = () => {
    errorLogger.clearStoredErrors();
    setErrors([]);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status?: number) => {
    if (!status) return "bg-gray-100 text-gray-800";
    if (status >= 500) return "bg-red-100 text-red-800";
    if (status >= 400) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => {
          if (!isOpen) loadErrors();
          setIsOpen(!isOpen);
        }}
        variant="outline"
        size="sm"
        className="bg-white shadow-lg"
      >
        🐛 Debug{" "}
        {errors.length > 0 && (
          <Badge variant="destructive" className="ml-1">
            {errors.length}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute bottom-12 right-0 w-96 max-h-96 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Error Log</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={loadErrors}>
                  Refresh
                </Button>
                <Button size="sm" variant="destructive" onClick={clearErrors}>
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {errors.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No errors logged
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {errors.map((error, index) => (
                  <div key={index} className="border rounded p-3 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {error.status ? `HTTP ${error.status}` : "Network"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(error.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm font-medium mb-1">
                      {error.message}
                    </div>
                    {error.url && (
                      <div className="text-xs text-gray-600 mb-1">
                        {error.method} {error.url}
                      </div>
                    )}
                    {error.environment && (
                      <div className="text-xs text-gray-500">
                        Env: {error.environment}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DebugPanel;
