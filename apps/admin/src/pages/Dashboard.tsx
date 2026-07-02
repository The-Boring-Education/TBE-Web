import { BookOpen, Briefcase, FileText, Users } from "lucide-react";

import { useDashboardStats } from "@/api/dashboardApi";
import { StatCard } from "@/components/ui/stat-card";

const Dashboard = () => {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={<Users size={20} />}
            color="purple"
            isLoading={isLoading}
          />
          <StatCard
            title="Total Courses"
            value={stats?.totalCourses || 0}
            icon={<BookOpen size={20} />}
            color="blue"
            isLoading={isLoading}
          />
          <StatCard
            title="Total Projects"
            value={stats?.totalProjects || 0}
            icon={<Briefcase size={20} />}
            color="green"
            isLoading={isLoading}
          />
          <StatCard
            title="Total Interview Preps"
            value={stats?.totalSheets || 0}
            icon={<FileText size={20} />}
            color="orange"
            isLoading={isLoading}
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Enrollment Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Users Enrolled in Courses"
            value={stats?.coursesEnrolled || 0}
            color="purple"
            isLoading={isLoading}
          />
          <StatCard
            title="Users Enrolled in Projects"
            value={stats?.projectsEnrolled || 0}
            color="blue"
            isLoading={isLoading}
          />
          <StatCard
            title="Users Enrolled in Interview Prep"
            value={stats?.sheetsEnrolled || 0}
            color="green"
            isLoading={isLoading}
          />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
