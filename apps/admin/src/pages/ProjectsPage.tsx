import {
  FolderKanban,
  FolderOpen,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  type ProjectSummary,
  useProjects,
  type UserProjectProgress,
  useUserProjects,
} from "@/api/projectsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROADMAP_OPTIONS } from "@/types";

type ProjectStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
type ProgressStatusFilter = "ALL" | "IN_PROGRESS" | "COMPLETED";

const ProjectsPage = () => {
  const [projectSearch, setProjectSearch] = useState("");
  const [roadmapFilter, setRoadmapFilter] = useState("ALL");
  const [projectStatusFilter, setProjectStatusFilter] =
    useState<ProjectStatusFilter>("ALL");
  const [progressSearch, setProgressSearch] = useState("");
  const [progressStatusFilter, setProgressStatusFilter] =
    useState<ProgressStatusFilter>("ALL");
  const [page, setPage] = useState(1);

  const {
    data: projects = [],
    isLoading: projectsLoading,
    isError: projectsError,
    refetch: refetchProjects,
  } = useProjects();
  const {
    data: userProjects,
    pagination,
    isLoading: userProjectsLoading,
    isError: userProjectsError,
    refetch: refetchUserProjects,
  } = useUserProjects(page, 10);

  const filteredProjects = useMemo(() => {
    const search = projectSearch.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !search ||
        [project.name, project.slug, project.description, project.roadmap]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(search));
      const matchesRoadmap =
        roadmapFilter === "ALL" || project.roadmap === roadmapFilter;
      const matchesStatus =
        projectStatusFilter === "ALL" ||
        (projectStatusFilter === "ACTIVE"
          ? project.isActive !== false
          : project.isActive === false);

      return matchesSearch && matchesRoadmap && matchesStatus;
    });
  }, [projects, projectSearch, roadmapFilter, projectStatusFilter]);

  const filteredUserProjects = useMemo(() => {
    const search = progressSearch.trim().toLowerCase();

    return userProjects.filter((enrollment) => {
      const matchesSearch =
        !search ||
        [
          enrollment.user?.userName,
          enrollment.user?.userEmail,
          enrollment.user?.userContactNo,
          enrollment.project?.name,
          enrollment.project?.slug,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(search));
      const matchesStatus =
        progressStatusFilter === "ALL" ||
        (progressStatusFilter === "COMPLETED"
          ? enrollment.isCompleted
          : !enrollment.isCompleted);

      return matchesSearch && matchesStatus;
    });
  }, [userProjects, progressSearch, progressStatusFilter]);

  const renderProject = (project: ProjectSummary) => (
    <tr key={project._id} className="transition-colors hover:bg-gray-50/80">
      <td className="px-4 py-3.5">
        <div className="flex min-w-[220px] items-center gap-3">
          {project.coverImageURL ? (
            <img
              src={project.coverImageURL}
              alt=""
              className="h-12 w-12 shrink-0 rounded border bg-gray-100 object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded border bg-gray-50 text-gray-400">
              <FolderOpen className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-gray-900">{project.name}</p>
            <p className="truncate font-mono text-xs text-gray-400">
              /{project.slug}
            </p>
            {project.description && (
              <p className="mt-1 max-w-md truncate text-xs text-gray-500">
                {project.description}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <Badge variant="outline">{project.roadmap || "Unassigned"}</Badge>
        {project.difficultyLevel && (
          <p className="mt-1 text-xs text-gray-500">
            {project.difficultyLevel}
          </p>
        )}
      </td>
      <td className="px-4 py-3.5">
        <Badge
          variant="outline"
          className={
            project.isActive === false
              ? "border-gray-200 bg-gray-50 text-gray-600"
              : "border-green-200 bg-green-50 text-green-700"
          }
        >
          {project.isActive === false ? "Inactive" : "Active"}
        </Badge>
      </td>
      <td className="px-4 py-3.5 text-gray-600">
        {project.sections?.length ?? 0}
      </td>
    </tr>
  );

  const renderUserProject = (enrollment: UserProjectProgress) => (
    <tr key={enrollment._id} className="transition-colors hover:bg-gray-50/80">
      <td className="px-4 py-3.5">
        <div className="min-w-[180px]">
          <p className="font-medium text-gray-900">
            {enrollment.user?.userName || "Unknown user"}
          </p>
          {enrollment.user?.userEmail ? (
            <a
              href={`mailto:${enrollment.user.userEmail}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {enrollment.user.userEmail}
            </a>
          ) : (
            <p className="text-sm text-gray-500">No email</p>
          )}
          {enrollment.user?.userContactNo && (
            <p className="text-xs text-gray-500">
              {enrollment.user.userContactNo}
            </p>
          )}
        </div>
      </td>
      <td className="px-4 py-3.5">
        <p className="font-medium text-gray-900">
          {enrollment.project?.name || "Unknown project"}
        </p>
        {enrollment.project?.slug && (
          <p className="font-mono text-xs text-gray-400">
            /{enrollment.project.slug}
          </p>
        )}
      </td>
      <td className="px-4 py-3.5">
        <Badge
          variant="outline"
          className={
            enrollment.isCompleted
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }
        >
          {enrollment.isCompleted ? "Completed" : "In progress"}
        </Badge>
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-600">
        {enrollment.lastUpdated || "-"}
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse the project catalog and review learner progress.
        </p>
      </div>

      <Tabs defaultValue="catalog" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="catalog">Project Catalog</TabsTrigger>
          <TabsTrigger value="user-progress">User Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4 pt-2">
          <div className="flex flex-col items-center justify-between gap-4 rounded-lg border bg-white p-4 shadow-sm md:flex-row">
            <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={projectSearch}
                  onChange={(event) => setProjectSearch(event.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roadmapFilter} onValueChange={setRoadmapFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Roadmap" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All roadmaps</SelectItem>
                  {ROADMAP_OPTIONS.map((roadmap) => (
                    <SelectItem key={roadmap} value={roadmap}>
                      {roadmap}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={projectStatusFilter}
                onValueChange={(value) =>
                  setProjectStatusFilter(value as ProjectStatusFilter)
                }
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
              <span className="text-sm text-gray-500">
                {filteredProjects.length} of {projects.length} projects
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Refresh projects"
                title="Refresh projects"
                onClick={() => void refetchProjects()}
                disabled={projectsLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${projectsLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            {projectsError ? (
              <div className="p-12 text-center">
                <h2 className="font-semibold text-gray-800">
                  Could not load projects
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Check the API connection and try again.
                </p>
                <Button
                  className="mt-4"
                  size="sm"
                  variant="outline"
                  onClick={() => void refetchProjects()}
                >
                  Retry
                </Button>
              </div>
            ) : projectsLoading ? (
              <div className="p-12 text-center text-gray-400">
                Loading projects...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-12 text-center">
                <FolderKanban className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <h2 className="font-semibold text-gray-700">
                  No projects found
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {projectSearch ||
                  roadmapFilter !== "ALL" ||
                  projectStatusFilter !== "ALL"
                    ? "Try adjusting your search or filters."
                    : "There are no projects in the catalog yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-gray-50 font-medium text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Project</th>
                      <th className="px-4 py-3">Roadmap &amp; Level</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Sections</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredProjects.map(renderProject)}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="user-progress" className="space-y-4 pt-2">
          <div className="flex flex-col items-center justify-between gap-4 rounded-lg border bg-white p-4 shadow-sm md:flex-row">
            <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search users or projects..."
                  value={progressSearch}
                  onChange={(event) => {
                    setProgressSearch(event.target.value);
                    setPage(1);
                  }}
                  className="pl-9"
                />
              </div>
              <Select
                value={progressStatusFilter}
                onValueChange={(value) => {
                  setProgressStatusFilter(value as ProgressStatusFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Progress" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All progress</SelectItem>
                  <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
              <span className="text-sm text-gray-500">
                {pagination.total} enrollments
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Refresh user progress"
                title="Refresh user progress"
                onClick={() => void refetchUserProjects()}
                disabled={userProjectsLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${userProjectsLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            {userProjectsError ? (
              <div className="p-12 text-center">
                <h2 className="font-semibold text-gray-800">
                  Could not load user progress
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Check the API connection and try again.
                </p>
                <Button
                  className="mt-4"
                  size="sm"
                  variant="outline"
                  onClick={() => void refetchUserProjects()}
                >
                  Retry
                </Button>
              </div>
            ) : userProjectsLoading ? (
              <div className="p-12 text-center text-gray-400">
                Loading user progress...
              </div>
            ) : filteredUserProjects.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <h2 className="font-semibold text-gray-700">
                  No user progress found
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {progressSearch || progressStatusFilter !== "ALL"
                    ? "Try adjusting your search or progress filter."
                    : "Project enrollments will appear here."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-gray-50 font-medium text-gray-600">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Project</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUserProjects.map(renderUserProject)}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!userProjectsLoading &&
            !userProjectsError &&
            pagination.total > 0 && (
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  Page {page} of {Math.max(pagination.totalPages, 1)}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((current) => current - 1)}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={page >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectsPage;
