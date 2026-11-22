import { useAuth } from "@tbe/auth";
import { useAdmin } from "@tbe/hooks";
import { Bot } from "lucide-react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAdminEnvironment } from "@/hooks/useEnvironment";

import AgentsStatus from "../AgentsStatus";
import DebugPanel from "../DebugPanel";
import LogViewer from "../LogViewer";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { isAuthenticated, isLoading, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const adminEnv = getAdminEnvironment();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Access denied</h1>
        <p className="max-w-md text-gray-600">
          Your account does not have admin access. Contact the platform team if
          you believe this is an error.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => signOut("/login")}
        >
          Back to login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between border-b bg-white/70 px-4 py-2 backdrop-blur">
          <div className="flex flex-1 items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex h-8 items-center gap-2 px-3 text-xs"
                >
                  <Bot className="h-4 w-4" />
                  AI Status
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="start">
                <AgentsStatus showDetails />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-1 items-center justify-end">
            <LogViewer />
          </div>
        </div>

        <div className="border-b border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="grid grid-cols-1 gap-3 px-6 py-3 text-xs text-gray-700 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="font-semibold">Platform API</span>
              <span className="rounded bg-green-100 px-2 py-0.5 text-green-800">
                Env: {adminEnv.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <span className="font-semibold">Agents</span>
              <span className="rounded bg-purple-100 px-2 py-0.5 text-purple-800">
                Env: {adminEnv.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">{children}</div>
        {import.meta.env.DEV && <DebugPanel />}
      </main>
    </div>
  );
};

export default MainLayout;
