import { useAuth } from "@tbe/auth";
import {
  Activity,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Briefcase,
  FileText,
  Heart,
  Home,
  ListChecks,
  LogOut,
  Mail,
  Target,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut("/login");
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: <Home size={20} /> },
    { name: "Users", path: "/users", icon: <Users size={20} /> },
    {
      name: "User Interests",
      path: "/user-interests",
      icon: <Heart size={20} />,
    },
    { name: "Courses", path: "/courses", icon: <BookOpen size={20} /> },
    { name: "Projects", path: "/projects", icon: <Briefcase size={20} /> },
    { name: "Quizzes", path: "/quizzes", icon: <ListChecks size={20} /> },
    {
      name: "Quiz Analytics",
      path: "/content/analytics/quiz",
      icon: <BarChart3 size={20} />,
    },
    {
      name: "Interview Prep",
      path: "/interview-prep",
      icon: <FileText size={20} />,
    },
    {
      name: "Prep Logs",
      path: "/prep-logs",
      icon: <BookOpenCheck size={20} />,
    },
    { name: "Challenges", path: "/challenges", icon: <Target size={20} /> },
    { name: "Mentorship", path: "/mentorship", icon: <Trophy size={20} /> },
    { name: "Coupons", path: "/coupon", icon: <Ticket size={20} /> },
    {
      name: "Email Management",
      path: "/email-management",
      icon: <Mail size={20} />,
    },
    { name: "Agents", path: "/agents", icon: <Activity size={20} /> },
  ];

  return (
    <aside className="flex w-64 flex-col border-r bg-white shadow-sm">
      <div className="border-b p-6">
        <h1 className="text-xl font-bold text-purple-700">TBE Admin</h1>
        {user?.email && (
          <p className="mt-1 truncate text-xs text-gray-500">{user.email}</p>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
