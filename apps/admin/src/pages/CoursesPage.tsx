import { BookOpen, Edit, Layers, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  useCourses,
  useDeleteCourse,
  useUpdateCourseStatus,
  useUserCourses,
} from "@/api/coursesApi";
import { CourseChaptersDrawer } from "@/components/courses/CourseChaptersDrawer";
import { CourseModal } from "@/components/courses/CourseModal";
import { DataTable } from "@/components/tables/DataTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Course, ROADMAP_OPTIONS } from "@/types";

const CoursesPage = () => {
  // Course Management State
  const [searchQuery, setSearchQuery] = useState("");
  const [roadmapFilter, setRoadmapFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  const [selectedCourseForChapters, setSelectedCourseForChapters] =
    useState<Course | null>(null);
  const [isChaptersDrawerOpen, setIsChaptersDrawerOpen] = useState(false);

  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Queries & Mutations
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const deleteCourse = useDeleteCourse();
  const updateCourseStatus = useUpdateCourseStatus();

  // User Progress Tab State
  const [userProgressPage, setUserProgressPage] = useState(1);
  const {
    data: userProgressData,
    pagination: userProgressPagination,
    isLoading: userProgressLoading,
  } = useUserCourses(userProgressPage, 10);

  // Filtered courses list
  const filteredCourses = useMemo(() => {
    return (courses || []).filter((c) => {
      const courseName = c.name || c.title || "";
      const matchesSearch =
        courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRoadmap =
        roadmapFilter === "ALL" || c.roadmap === roadmapFilter;

      const courseStatus = c.status || "DRAFT";
      const matchesStatus =
        statusFilter === "ALL" || courseStatus === statusFilter;

      return matchesSearch && matchesRoadmap && matchesStatus;
    });
  }, [courses, searchQuery, roadmapFilter, statusFilter]);

  const handleOpenCreateCourse = () => {
    setCourseToEdit(null);
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setCourseToEdit(course);
    setIsCourseModalOpen(true);
  };

  const handleOpenChapters = (course: Course) => {
    setSelectedCourseForChapters(course);
    setIsChaptersDrawerOpen(true);
  };

  const handleUpdateStatus = async (
    course: Course,
    nextStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED",
  ) => {
    if (course.status === nextStatus) return;
    try {
      await updateCourseStatus.mutateAsync({
        courseId: course._id,
        status: nextStatus,
      });
      toast.success(`Course status updated to ${nextStatus}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteCourseConfirm = async () => {
    if (!courseToDelete?._id) return;

    try {
      await deleteCourse.mutateAsync(courseToDelete._id);
      toast.success("Course deleted successfully");
      setCourseToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete course");
    }
  };

  // User progress columns definition (preserved)
  const userProgressColumns = useMemo(
    () => [
      {
        id: "user",
        header: "User",
        cell: (row: any) => (
          <div>
            <div className="font-medium">👤 {row.user?.userName || "-"}</div>
            <div className="text-sm text-gray-500">
              📧{" "}
              <a
                href={`mailto:${row.user?.userEmail}`}
                className="text-blue-600 underline"
              >
                {row.user?.userEmail}
              </a>
            </div>
            <div className="text-sm text-gray-500">
              📞 {row.user?.userContactNo || "-"}
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        id: "course",
        header: "Course",
        cell: (row: any) => (
          <div>
            <div className="font-medium">{row.course?.name || "-"}</div>
            <div className="text-sm text-gray-500">
              {row.course?.slug || "-"}
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        id: "progress",
        header: "Progress",
        cell: (row: any) => {
          const progress = row.totalChapters
            ? Math.round((row.completedChapters / row.totalChapters) * 100)
            : 0;
          return (
            <div className="w-full max-w-[200px]">
              <Progress value={progress} className="h-2" />
              <span className="text-xs text-gray-500 mt-1 inline-block">
                {progress}%
              </span>
            </div>
          );
        },
        sortable: true,
      },
      {
        id: "lastUpdated",
        header: "Last Updated",
        cell: (row: any) => <div>{row.lastUpdated || "-"}</div>,
        sortable: true,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create, curate, and manage Shiksha courses
          </p>
        </div>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="courses">Course Management</TabsTrigger>
          <TabsTrigger value="user-progress">User Progress</TabsTrigger>
        </TabsList>

        {/* Tab 1: Course Management */}
        <TabsContent value="courses" className="space-y-4 pt-2">
          {/* Controls bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search by title or slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={roadmapFilter} onValueChange={setRoadmapFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Roadmap" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roadmaps</SelectItem>
                  {ROADMAP_OPTIONS.map((rm) => (
                    <SelectItem key={rm} value={rm}>
                      {rm}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleOpenCreateCourse}
              className="w-full md:w-auto"
            >
              <Plus className="w-4 h-4 mr-1" /> Create Course
            </Button>
          </div>

          {/* Courses Table / List */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {coursesLoading ? (
              <div className="p-12 text-center text-gray-400">
                Loading courses...
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-base font-semibold text-gray-700">
                  No courses found
                </h3>
                <p className="text-sm text-gray-400 mt-1 mb-4">
                  {searchQuery ||
                  roadmapFilter !== "ALL" ||
                  statusFilter !== "ALL"
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first course"}
                </p>
                <Button onClick={handleOpenCreateCourse} size="sm">
                  <Plus className="w-4 h-4 mr-1" /> Create Course
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b text-gray-600 font-medium">
                    <tr>
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4">Roadmap & Level</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Chapters</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredCourses.map((c) => {
                      const chapterCount = c.chapters?.length ?? 0;

                      return (
                        <tr
                          key={c._id}
                          className="hover:bg-gray-50/80 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {c.coverImageURL ? (
                                <img
                                  src={c.coverImageURL}
                                  alt={c.name}
                                  className="w-12 h-12 rounded object-cover border bg-gray-100 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded bg-gray-100 border flex items-center justify-center flex-shrink-0 text-gray-400">
                                  <BookOpen className="w-6 h-6" />
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {c.name || c.title}
                                </div>
                                <div className="text-xs font-mono text-gray-400">
                                  /{c.slug}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 space-y-1">
                            <Badge variant="outline" className="text-xs">
                              {c.roadmap}
                            </Badge>
                            <div className="text-xs text-gray-500">
                              {c.difficultyLevel}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <Select
                              value={c.status || "DRAFT"}
                              onValueChange={(
                                val: "DRAFT" | "PUBLISHED" | "ARCHIVED",
                              ) => handleUpdateStatus(c, val)}
                              disabled={updateCourseStatus.isPending}
                            >
                              <SelectTrigger className="w-[125px] h-8 text-xs font-medium bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="DRAFT">
                                  <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                    Draft
                                  </span>
                                </SelectItem>
                                <SelectItem value="PUBLISHED">
                                  <span className="flex items-center gap-1.5 text-green-700 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                                    Published
                                  </span>
                                </SelectItem>
                                <SelectItem value="ARCHIVED">
                                  <span className="flex items-center gap-1.5 text-red-700 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                    Archived
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </td>

                          <td className="py-3.5 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenChapters(c)}
                              className="text-xs flex items-center gap-1.5 h-8 font-medium text-blue-600 hover:text-blue-800"
                            >
                              <Layers className="w-4 h-4" />
                              {chapterCount}{" "}
                              {chapterCount === 1 ? "chapter" : "chapters"}
                            </Button>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenChapters(c)}
                                className="h-8 text-xs"
                              >
                                Chapters
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEditCourse(c)}
                                className="h-8 w-8 p-0"
                                title="Edit Course"
                              >
                                <Edit className="w-4 h-4 text-gray-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCourseToDelete(c)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                title="Delete Course"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: User Progress (Preserved) */}
        <TabsContent value="user-progress">
          <div className="bg-white p-6 rounded-lg shadow-sm border mt-4">
            <DataTable
              columns={userProgressColumns}
              data={userProgressData || []}
              isLoading={userProgressLoading}
              searchable
              pagination={{
                pageSize: 10,
                pageIndex: userProgressPage - 1,
                pageCount: userProgressPagination?.totalPages || 1,
                onPageChange: (newPage) => setUserProgressPage(newPage + 1),
              }}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Course Create / Edit Modal */}
      {isCourseModalOpen && (
        <CourseModal
          isOpen={isCourseModalOpen}
          onClose={() => setIsCourseModalOpen(false)}
          courseToEdit={courseToEdit}
        />
      )}

      {/* Course Chapters Drawer */}
      {isChaptersDrawerOpen && selectedCourseForChapters && (
        <CourseChaptersDrawer
          isOpen={isChaptersDrawerOpen}
          onClose={() => setIsChaptersDrawerOpen(false)}
          course={selectedCourseForChapters}
        />
      )}

      {/* Delete Course Alert Dialog */}
      <AlertDialog
        open={Boolean(courseToDelete)}
        onOpenChange={(open) => !open && setCourseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete course{" "}
              <strong>"{courseToDelete?.name || courseToDelete?.title}"</strong>
              ? This will permanently remove the course and all associated
              chapters.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourseConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CoursesPage;
