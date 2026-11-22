import { Edit, FileText, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import {
  type ProjectChapter,
  type ProjectSection,
  type ProjectSummary,
  useAddProjectChapter,
  useAddProjectSection,
  useDeleteProjectChapter,
  useDeleteProjectSection,
  useProjects,
  useUpdateProjectChapter,
  useUpdateProjectSection,
} from "@/api/projectsApi";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface ProjectSectionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectSummary | null;
}

interface ChapterDraft {
  chapterName: string;
  content: string;
  isOptional: boolean;
}

const EMPTY_CHAPTER: ChapterDraft = {
  chapterName: "",
  content: "",
  isOptional: false,
};

export const ProjectSectionsDrawer = ({
  isOpen,
  onClose,
  project,
}: ProjectSectionsDrawerProps) => {
  const { data: projects = [], isLoading, isError } = useProjects();
  const liveProject =
    projects.find((item) => item._id === project?._id) || project;

  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState<ProjectSection | null>(
    null,
  );
  const [sectionName, setSectionName] = useState("");
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [chapterSectionId, setChapterSectionId] = useState("");
  const [chapterToEdit, setChapterToEdit] = useState<ProjectChapter | null>(
    null,
  );
  const [chapterDraft, setChapterDraft] = useState<ChapterDraft>(EMPTY_CHAPTER);
  const [sectionToDelete, setSectionToDelete] = useState<ProjectSection | null>(
    null,
  );
  const [chapterToDelete, setChapterToDelete] = useState<{
    sectionId: string;
    chapter: ProjectChapter;
  } | null>(null);

  const addSection = useAddProjectSection();
  const updateSection = useUpdateProjectSection();
  const deleteSection = useDeleteProjectSection();
  const addChapter = useAddProjectChapter();
  const updateChapter = useUpdateProjectChapter();
  const deleteChapter = useDeleteProjectChapter();

  const sections = liveProject?.sections || [];
  const isSavingSection = addSection.isPending || updateSection.isPending;
  const isSavingChapter = addChapter.isPending || updateChapter.isPending;

  const openAddSection = () => {
    setSectionToEdit(null);
    setSectionName("");
    setSectionDialogOpen(true);
  };

  const openRenameSection = (section: ProjectSection) => {
    setSectionToEdit(section);
    setSectionName(section.sectionName);
    setSectionDialogOpen(true);
  };

  const saveSection = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!project || !sectionName.trim()) return;

    try {
      if (sectionToEdit) {
        await updateSection.mutateAsync({
          projectId: project._id,
          sectionId: sectionToEdit.sectionId,
          updatedSectionName: sectionName.trim(),
        });
        toast.success("Section renamed");
      } else {
        await addSection.mutateAsync({
          projectId: project._id,
          sectionName: sectionName.trim(),
        });
        toast.success("Section added");
      }
      setSectionDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save section",
      );
    }
  };

  const openAddChapter = (sectionId: string) => {
    setChapterSectionId(sectionId);
    setChapterToEdit(null);
    setChapterDraft(EMPTY_CHAPTER);
    setChapterDialogOpen(true);
  };

  const openEditChapter = (sectionId: string, chapter: ProjectChapter) => {
    setChapterSectionId(sectionId);
    setChapterToEdit(chapter);
    setChapterDraft({
      chapterName: chapter.chapterName,
      content: chapter.content || "",
      isOptional: Boolean(chapter.isOptional),
    });
    setChapterDialogOpen(true);
  };

  const saveChapter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !project ||
      !chapterDraft.chapterName.trim() ||
      !chapterDraft.content.trim()
    ) {
      toast.error("Chapter title and content are required");
      return;
    }

    try {
      const payload = {
        projectId: project._id,
        sectionId: chapterSectionId,
        chapterName: chapterDraft.chapterName.trim(),
        content: chapterDraft.content,
        isOptional: chapterDraft.isOptional,
      };

      if (chapterToEdit) {
        await updateChapter.mutateAsync({
          ...payload,
          chapterId: chapterToEdit.chapterId,
        });
        toast.success("Chapter updated");
      } else {
        await addChapter.mutateAsync(payload);
        toast.success("Chapter added");
      }
      setChapterDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save chapter",
      );
    }
  };

  const confirmDeleteSection = async () => {
    if (!project || !sectionToDelete) return;
    try {
      await deleteSection.mutateAsync({
        projectId: project._id,
        sectionId: sectionToDelete.sectionId,
      });
      toast.success("Section deleted");
      setSectionToDelete(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete section",
      );
    }
  };

  const confirmDeleteChapter = async () => {
    if (!project || !chapterToDelete) return;
    try {
      await deleteChapter.mutateAsync({
        projectId: project._id,
        sectionId: chapterToDelete.sectionId,
        chapterId: chapterToDelete.chapter.chapterId,
      });
      toast.success("Chapter deleted");
      setChapterToDelete(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete chapter",
      );
    }
  };

  if (!project) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
          <SheetHeader className="border-b pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3 pr-6">
              <div>
                <SheetTitle className="text-xl">
                  {liveProject?.name || project.name}
                </SheetTitle>
                <SheetDescription className="mt-1 font-mono text-xs">
                  /{liveProject?.slug || project.slug} · {sections.length}{" "}
                  sections
                </SheetDescription>
              </div>
              <Button size="sm" onClick={openAddSection}>
                <Plus className="mr-1 h-4 w-4" /> Add section
              </Button>
            </div>
          </SheetHeader>

          <div className="space-y-4 py-6">
            {isLoading ? (
              <div className="py-12 text-center text-sm text-gray-500">
                Loading project content...
              </div>
            ) : isError ? (
              <div className="py-12 text-center text-sm text-red-600">
                Could not refresh project content. Close and reopen this editor
                to retry.
              </div>
            ) : sections.length === 0 ? (
              <div className="space-y-3 rounded-lg border border-dashed p-10 text-center">
                <FileText className="mx-auto h-9 w-9 text-gray-300" />
                <div>
                  <p className="font-medium text-gray-800">No sections yet</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Add a section to start building this project.
                  </p>
                </div>
                <Button size="sm" onClick={openAddSection}>
                  <Plus className="mr-1 h-4 w-4" /> Add section
                </Button>
              </div>
            ) : (
              sections.map((section, sectionIndex) => (
                <section
                  key={section.sectionId}
                  className="overflow-hidden rounded-lg border bg-white"
                >
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-gray-50 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="text-xs font-semibold text-gray-400">
                        {String(sectionIndex + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-gray-900">
                          {section.sectionName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {section.chapters.length} chapters
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAddChapter(section.sectionId)}
                      >
                        <Plus className="mr-1 h-4 w-4" /> Chapter
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Rename ${section.sectionName}`}
                        title="Rename section"
                        onClick={() => openRenameSection(section)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${section.sectionName}`}
                        title="Delete section"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setSectionToDelete(section)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </header>

                  {section.chapters.length === 0 ? (
                    <div className="px-4 py-5 text-sm text-gray-500">
                      No chapters in this section yet.
                    </div>
                  ) : (
                    <div className="divide-y">
                      {section.chapters.map((chapter, chapterIndex) => (
                        <div
                          key={chapter.chapterId}
                          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="text-xs text-gray-400">
                              {sectionIndex + 1}.{chapterIndex + 1}
                            </span>
                            <p className="truncate text-sm font-medium text-gray-800">
                              {chapter.chapterName}
                            </p>
                            {chapter.isOptional && (
                              <Badge
                                variant="outline"
                                className="shrink-0 text-xs"
                              >
                                Optional
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Edit ${chapter.chapterName}`}
                              title="Edit chapter content"
                              onClick={() =>
                                openEditChapter(section.sectionId, chapter)
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Delete ${chapter.chapterName}`}
                              title="Delete chapter"
                              className="text-red-600 hover:text-red-700"
                              onClick={() =>
                                setChapterToDelete({
                                  sectionId: section.sectionId,
                                  chapter,
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={sectionDialogOpen}
        onOpenChange={(open) => setSectionDialogOpen(open)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {sectionToEdit ? "Rename section" : "Add section"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={saveSection} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-section-name">Section name</Label>
              <Input
                id="project-section-name"
                value={sectionName}
                onChange={(event) => setSectionName(event.target.value)}
                autoFocus
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSectionDialogOpen(false)}
                disabled={isSavingSection}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingSection}>
                {isSavingSection
                  ? "Saving..."
                  : sectionToEdit
                    ? "Save name"
                    : "Add section"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={chapterDialogOpen}
        onOpenChange={(open) => setChapterDialogOpen(open)}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {chapterToEdit ? "Edit chapter" : "Add chapter"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={saveChapter} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="project-chapter-name">Chapter title</Label>
              <Input
                id="project-chapter-name"
                value={chapterDraft.chapterName}
                onChange={(event) =>
                  setChapterDraft((current) => ({
                    ...current,
                    chapterName: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="flex items-center gap-3 rounded-md bg-gray-50 p-3">
              <Switch
                id="project-chapter-optional"
                checked={chapterDraft.isOptional}
                onCheckedChange={(isOptional) =>
                  setChapterDraft((current) => ({ ...current, isOptional }))
                }
              />
              <Label htmlFor="project-chapter-optional">Optional chapter</Label>
            </div>
            <div className="space-y-2">
              <Label>Chapter content (Markdown / MDX)</Label>
              <Tabs defaultValue="editor">
                <TabsList>
                  <TabsTrigger value="editor">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="editor">
                  <Textarea
                    value={chapterDraft.content}
                    onChange={(event) =>
                      setChapterDraft((current) => ({
                        ...current,
                        content: event.target.value,
                      }))
                    }
                    rows={16}
                    className="font-mono text-sm leading-relaxed"
                    placeholder="# Lesson title\n\nWrite lesson content in Markdown or MDX."
                    required
                  />
                </TabsContent>
                <TabsContent value="preview">
                  <pre className="min-h-[300px] max-h-[500px] overflow-auto whitespace-pre-wrap rounded-md border bg-gray-50 p-4 font-mono text-sm">
                    {chapterDraft.content || "No content to preview"}
                  </pre>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setChapterDialogOpen(false)}
                disabled={isSavingChapter}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingChapter}>
                {isSavingChapter
                  ? "Saving..."
                  : chapterToEdit
                    ? "Save chapter"
                    : "Add chapter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(sectionToDelete)}
        onOpenChange={(open) => !open && setSectionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete section?</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting “{sectionToDelete?.sectionName}” removes its chapters and
              any learner progress tied to them. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSection}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete section
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(chapterToDelete)}
        onOpenChange={(open) => !open && setChapterToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chapter?</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting “{chapterToDelete?.chapter.chapterName}” removes learner
              progress for this chapter. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteChapter}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete chapter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
