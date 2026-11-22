import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  type ProjectFormData,
  type ProjectSummary,
  useCreateProject,
  useUpdateProject,
} from "@/api/projectsApi";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ROADMAP_OPTIONS, type RoadmapType } from "@/types";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: ProjectSummary | null;
}

const DEFAULT_FORM: ProjectFormData = {
  name: "",
  slug: "",
  description: "",
  coverImageURL: "",
  roadmap: "Fullstack",
  difficultyLevel: "Intermediate",
};

export const ProjectModal = ({
  isOpen,
  onClose,
  projectToEdit,
}: ProjectModalProps) => {
  const [formData, setFormData] = useState<ProjectFormData>(DEFAULT_FORM);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const isEditing = Boolean(projectToEdit);
  const isSubmitting = createProject.isPending || updateProject.isPending;

  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        name: projectToEdit.name,
        slug: projectToEdit.slug,
        description: projectToEdit.description || "",
        coverImageURL: projectToEdit.coverImageURL || "",
        roadmap: projectToEdit.roadmap || "Fullstack",
        difficultyLevel: projectToEdit.difficultyLevel || "Intermediate",
      });
    } else {
      setFormData(DEFAULT_FORM);
    }
  }, [projectToEdit, isOpen]);

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData((current) => ({ ...current, slug }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error("Project name and slug are required");
      return;
    }

    try {
      if (projectToEdit) {
        await updateProject.mutateAsync({
          projectId: projectToEdit._id,
          updatedData: {
            name: formData.name.trim(),
            description: formData.description.trim(),
            coverImageURL: formData.coverImageURL.trim(),
            roadmap: formData.roadmap,
            difficultyLevel: formData.difficultyLevel,
          },
        });
        toast.success("Project details updated");
      } else {
        await createProject.mutateAsync({
          ...formData,
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim(),
          coverImageURL: formData.coverImageURL.trim(),
        });
        toast.success("Project created");
      }
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save project",
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Project Details" : "Create Project"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project name *</Label>
              <Input
                id="project-name"
                value={formData.name}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="project-slug">Slug *</Label>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Generate
                  </button>
                )}
              </div>
              <Input
                id="project-slug"
                value={formData.slug}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    slug: event.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/\s+/g, "-"),
                  }))
                }
                disabled={isEditing}
                required
              />
              {isEditing && (
                <p className="text-xs text-gray-500">
                  Slugs are immutable after creation.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={formData.description}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-cover">Cover image URL</Label>
            <Input
              id="project-cover"
              type="url"
              value={formData.coverImageURL}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  coverImageURL: event.target.value,
                }))
              }
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project-roadmap">Roadmap</Label>
              <Select
                value={formData.roadmap}
                onValueChange={(roadmap: RoadmapType) =>
                  setFormData((current) => ({ ...current, roadmap }))
                }
              >
                <SelectTrigger id="project-roadmap">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROADMAP_OPTIONS.map((roadmap) => (
                    <SelectItem key={roadmap} value={roadmap}>
                      {roadmap}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-difficulty">Difficulty</Label>
              <Select
                value={formData.difficultyLevel}
                onValueChange={(
                  difficultyLevel: ProjectFormData["difficultyLevel"],
                ) =>
                  setFormData((current) => ({ ...current, difficultyLevel }))
                }
              >
                <SelectTrigger id="project-difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save details"
                  : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
