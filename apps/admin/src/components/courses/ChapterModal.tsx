import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { useCreateChapter, useUpdateChapter } from "@/api/coursesApi";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { type ChapterFormData, type CourseChapter } from "@/types";

interface ChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  chapterToEdit?: CourseChapter | null;
}

const DEFAULT_CHAPTER_FORM: ChapterFormData = {
  key: "",
  name: "",
  content: "",
  isOptional: false,
};

export const ChapterModal: React.FC<ChapterModalProps> = ({
  isOpen,
  onClose,
  courseId,
  chapterToEdit,
}) => {
  const [formData, setFormData] =
    useState<ChapterFormData>(DEFAULT_CHAPTER_FORM);

  const createChapter = useCreateChapter();
  const updateChapter = useUpdateChapter();

  const isEditing = Boolean(chapterToEdit);
  const isSubmitting = createChapter.isPending || updateChapter.isPending;

  useEffect(() => {
    if (chapterToEdit) {
      setFormData({
        key: chapterToEdit.key || "",
        name: chapterToEdit.name || "",
        content: chapterToEdit.content || "",
        isOptional: Boolean(chapterToEdit.isOptional),
      });
    } else {
      setFormData(DEFAULT_CHAPTER_FORM);
    }
  }, [chapterToEdit, isOpen]);

  const handleSlugifyKey = () => {
    if (!formData.name) return;
    const generatedKey = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData((prev) => ({ ...prev, key: generatedKey }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Chapter title is required");
      return;
    }
    if (!formData.key.trim()) {
      toast.error("Chapter key is required");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Chapter content is required");
      return;
    }

    try {
      const chapterIdentifier =
        chapterToEdit?._id || (chapterToEdit as any)?.id || chapterToEdit?.key;

      if (isEditing && chapterIdentifier) {
        await updateChapter.mutateAsync({
          courseId,
          chapterId: chapterIdentifier,
          data: formData,
        });
        toast.success("Chapter updated successfully");
      } else {
        await createChapter.mutateAsync({
          courseId,
          data: formData,
        });
        toast.success("Chapter added successfully");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save chapter");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? `Edit Chapter: ${chapterToEdit?.name}`
              : "Add New Chapter"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chapterName">Chapter Title *</Label>
              <Input
                id="chapterName"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Prompt Engineering & Structured Outputs"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="chapterKey">Chapter Key (kebab-case) *</Label>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={handleSlugifyKey}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Generate from title
                  </button>
                )}
              </div>
              <Input
                id="chapterKey"
                value={formData.key}
                disabled={isEditing} // Key is immutable identity per Course contract
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    key: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  }))
                }
                placeholder="e.g. prompt-engineering-structured-outputs"
                required
              />
              {isEditing && (
                <p className="text-xs text-gray-500">
                  Chapter key is immutable to preserve student progress
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
            <Switch
              id="isOptional"
              checked={formData.isOptional}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isOptional: checked }))
              }
            />
            <Label htmlFor="isOptional">
              Optional Chapter (does not block certificate completion)
            </Label>
          </div>

          {/* Markdown Content with Preview Tab */}
          <div className="space-y-2">
            <Label>Chapter Content (Markdown / MDX) *</Label>
            <Tabs defaultValue="editor" className="w-full">
              <TabsList>
                <TabsTrigger value="editor">Write Markdown</TabsTrigger>
                <TabsTrigger value="preview">Live Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="editor">
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="# Lesson Overview&#10;&#10;Write comprehensive educational content with code blocks, diagrams, and exercises..."
                  rows={14}
                  className="font-mono text-sm leading-relaxed"
                  required
                />
              </TabsContent>

              <TabsContent value="preview">
                <div className="p-4 border rounded-md min-h-[300px] max-h-[500px] overflow-y-auto bg-gray-50 prose prose-sm max-w-none whitespace-pre-wrap">
                  {formData.content || (
                    <span className="text-gray-400 italic">
                      No content written yet
                    </span>
                  )}
                </div>
              </TabsContent>
            </Tabs>
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
                  ? "Update Chapter"
                  : "Add Chapter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
