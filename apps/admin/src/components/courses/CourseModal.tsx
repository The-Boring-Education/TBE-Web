import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { useCreateCourse, useUpdateCourse } from "@/api/coursesApi";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  type Course,
  type CourseFormData,
  ROADMAP_OPTIONS,
  type RoadmapType,
} from "@/types";

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToEdit?: Course | null;
}

const DEFAULT_FORM: CourseFormData = {
  name: "",
  slug: "",
  description: "",
  meta: "",
  coverImageURL: "",
  liveOn: new Date().toISOString().split("T")[0],
  status: "DRAFT",
  isPremium: false,
  price: 0,
  roadmap: "Fullstack",
  difficultyLevel: "Intermediate",
  features: [],
};

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  courseToEdit,
}) => {
  const [formData, setFormData] = useState<CourseFormData>(DEFAULT_FORM);
  const [featureInput, setFeatureInput] = useState("");

  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();

  const isEditing = Boolean(courseToEdit);
  const isSubmitting = createCourse.isPending || updateCourse.isPending;

  useEffect(() => {
    if (courseToEdit) {
      setFormData({
        name: courseToEdit.name || courseToEdit.title || "",
        slug: courseToEdit.slug || "",
        description: courseToEdit.description || "",
        meta: courseToEdit.meta || "",
        coverImageURL: courseToEdit.coverImageURL || "",
        liveOn: courseToEdit.liveOn
          ? new Date(courseToEdit.liveOn).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status: courseToEdit.status || "DRAFT",
        isPremium: Boolean(courseToEdit.isPremium),
        price: courseToEdit.price || 0,
        roadmap: courseToEdit.roadmap || "Fullstack",
        difficultyLevel: courseToEdit.difficultyLevel || "Intermediate",
        features: courseToEdit.features || [],
      });
    } else {
      setFormData(DEFAULT_FORM);
    }
    setFeatureInput("");
  }, [courseToEdit, isOpen]);

  const handleSlugify = () => {
    if (!formData.name) return;
    const generatedSlug = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData((prev) => ({ ...prev, slug: generatedSlug }));
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...(prev.features || []), featureInput.trim()],
    }));
    setFeatureInput("");
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Course name is required");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("Course slug is required");
      return;
    }
    if (!formData.coverImageURL.trim()) {
      toast.error("Cover image URL is required");
      return;
    }

    try {
      if (isEditing && courseToEdit) {
        await updateCourse.mutateAsync({
          courseId: courseToEdit._id,
          data: formData,
        });
        toast.success("Course updated successfully");
      } else {
        await createCourse.mutateAsync(formData);
        toast.success("Course created successfully");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save course");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Course" : "Create New Course"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Course Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Full-stack AI Engineering"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="slug">Slug (kebab-case) *</Label>
                <button
                  type="button"
                  onClick={handleSlugify}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Generate from name
                </button>
              </div>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  }))
                }
                placeholder="e.g. full-stack-ai-engineering"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Comprehensive summary of what students will build and learn..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meta">SEO Meta Description</Label>
              <Input
                id="meta"
                value={formData.meta}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, meta: e.target.value }))
                }
                placeholder="Brief meta tag for social shares & search engines"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImageURL">Cover Image URL *</Label>
              <Input
                id="coverImageURL"
                value={formData.coverImageURL}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    coverImageURL: e.target.value,
                  }))
                }
                placeholder="https://ik.imagekit.io/..."
                required
              />
            </div>
          </div>

          {/* Classification & Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roadmap">Roadmap *</Label>
              <Select
                value={formData.roadmap}
                onValueChange={(val: RoadmapType) =>
                  setFormData((prev) => ({ ...prev, roadmap: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select roadmap" />
                </SelectTrigger>
                <SelectContent>
                  {ROADMAP_OPTIONS.map((rm) => (
                    <SelectItem key={rm} value={rm}>
                      {rm}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty *</Label>
              <Select
                value={formData.difficultyLevel}
                onValueChange={(
                  val: "Beginner" | "Intermediate" | "Advanced",
                ) => setFormData((prev) => ({ ...prev, difficultyLevel: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(val: "DRAFT" | "PUBLISHED" | "ARCHIVED") => {
                  if (!isEditing && val === "PUBLISHED") {
                    toast.warning(
                      "New courses must start as Draft. You can publish once chapters are added.",
                    );
                    return;
                  }
                  setFormData((prev) => ({ ...prev, status: val }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem
                    value="PUBLISHED"
                    disabled={
                      !isEditing || (courseToEdit?.chapters?.length || 0) === 0
                    }
                  >
                    Published{" "}
                    {!isEditing
                      ? "(Add chapters first)"
                      : (courseToEdit?.chapters?.length || 0) === 0
                        ? "(Add chapters first)"
                        : ""}
                  </SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing & Premium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-gray-50 p-4 rounded-md">
            <div className="flex items-center space-x-2">
              <Switch
                id="isPremium"
                checked={formData.isPremium}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isPremium: checked }))
                }
              />
              <Label htmlFor="isPremium">Premium Course</Label>
            </div>

            <div className="space-y-1">
              <Label htmlFor="price">Price (₹ INR / Paise)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price ?? 0}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
                disabled={!formData.isPremium}
                placeholder="0"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="liveOn">Live On Date</Label>
              <Input
                id="liveOn"
                type="date"
                value={formData.liveOn}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, liveOn: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Course Features */}
          <div className="space-y-3">
            <Label>Course Features / Highlights</Label>
            <div className="flex gap-2">
              <Input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="e.g. Production RAG Pipelines with Hybrid Search"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddFeature}
                variant="secondary"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {formData.features && formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.features.map((feat, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="flex items-center gap-1.5 py-1 px-2.5 bg-white"
                  >
                    <span>{feat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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
                  ? "Update Course"
                  : "Create Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
