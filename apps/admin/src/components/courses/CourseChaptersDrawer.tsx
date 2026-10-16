import { BookOpen, Edit, FileText, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import { useCourse, useDeleteChapter } from "@/api/coursesApi";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Course, CourseChapter } from "@/types";

import { ChapterModal } from "./ChapterModal";

interface CourseChaptersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
}

export const CourseChaptersDrawer: React.FC<CourseChaptersDrawerProps> = ({
  isOpen,
  onClose,
  course,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<CourseChapter | null>(
    null,
  );
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<CourseChapter | null>(
    null,
  );

  // Fetch live course details with chapters
  const { data: liveCourse, isLoading } = useCourse(course?._id);
  const deleteChapter = useDeleteChapter();

  const chapters = liveCourse?.chapters || course?.chapters || [];

  const handleOpenAddChapter = () => {
    setSelectedChapter(null);
    setIsChapterModalOpen(true);
  };

  const handleOpenEditChapter = (chapter: CourseChapter) => {
    setSelectedChapter(chapter);
    setIsChapterModalOpen(true);
  };

  const handleDeleteChapterConfirm = async () => {
    if (!course?._id || !chapterToDelete?._id) return;

    try {
      await deleteChapter.mutateAsync({
        courseId: course._id,
        chapterId: chapterToDelete._id,
      });
      toast.success("Chapter deleted successfully");
      setChapterToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete chapter");
    }
  };

  if (!course) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-xl flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  {course.name}
                </SheetTitle>
                <SheetDescription className="text-xs font-mono text-gray-500 mt-1">
                  Slug: {course.slug} • {chapters.length} chapters
                </SheetDescription>
              </div>
              <Button onClick={handleOpenAddChapter} size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Chapter
              </Button>
            </div>
          </SheetHeader>

          <div className="py-6 space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-gray-400">
                Loading chapters...
              </div>
            ) : chapters.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg space-y-3">
                <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-600 font-medium">
                  No chapters yet
                </p>
                <p className="text-xs text-gray-400 mt-1 mb-4">
                  Get started by adding the first chapter to this course
                </p>
                <Button
                  onClick={handleOpenAddChapter}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Chapter
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {chapters.map((chapter, idx) => (
                  <div
                    key={chapter._id || chapter.key || idx}
                    className="p-4 border rounded-lg bg-white shadow-sm hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700 text-sm">
                            #{idx + 1}
                          </span>
                          <span className="font-medium text-gray-900">
                            {chapter.name}
                          </span>
                          {chapter.isOptional && (
                            <Badge
                              variant="outline"
                              className="text-xs text-gray-500"
                            >
                              Optional
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs font-mono text-gray-400">
                          key: {chapter.key}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditChapter(chapter)}
                          className="h-8 w-8 p-0"
                          title="Edit Chapter"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setChapterToDelete(chapter)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          title="Delete Chapter"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Chapter Add/Edit Modal */}
      {isChapterModalOpen && course && (
        <ChapterModal
          isOpen={isChapterModalOpen}
          onClose={() => setIsChapterModalOpen(false)}
          courseId={course._id}
          chapterToEdit={selectedChapter}
        />
      )}

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={Boolean(chapterToDelete)}
        onOpenChange={(open) => !open && setChapterToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete chapter{" "}
              <strong>"{chapterToDelete?.name}"</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChapterConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
