import { Calendar, Check, Edit, FileText, Image, Type, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { InterviewSheet } from "@/types";

interface InterviewSheetHeaderProps {
  sheet: InterviewSheet;
  onUpdate: (updatedData: Partial<InterviewSheet>) => Promise<void>;
  isUpdating: boolean;
}

interface EditableField {
  name: string;
  label: string;
  icon: React.ReactNode;
  type: "text" | "textarea" | "date" | "url";
  value: string;
}

const EditableField: React.FC<{
  field: EditableField;
  isEditing: boolean;
  value: string;
  onEdit: () => void;
  onSave: (value: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ field, isEditing, value, onEdit, onSave, onCancel, isLoading }) => {
  const [tempValue, setTempValue] = useState(value);

  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {field.label}
        </label>
        <div className="flex gap-2">
          {field.type === "textarea" ? (
            <Textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="flex-1"
              rows={3}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          ) : (
            <Input
              type={field.type}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="flex-1"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          )}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                onSave(tempValue);
                setTempValue(value);
              }}
              disabled={isLoading || tempValue === value}
              className="gap-1"
            >
              <Check className="w-4 h-4" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onCancel();
                setTempValue(value);
              }}
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-2 group">
      <div className="flex-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {field.label}
        </label>
        <div className="mt-1">
          {field.type === "textarea" ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-2">
              {value || (
                <span className="text-gray-400 italic">
                  No {field.label.toLowerCase()}
                </span>
              )}
            </p>
          ) : field.type === "date" ? (
            <p className="text-sm font-medium text-gray-900">
              {value ? (
                new Date(value).toLocaleDateString()
              ) : (
                <span className="text-gray-400 italic">Not set</span>
              )}
            </p>
          ) : (
            <p className="text-sm font-medium text-gray-900">
              {value || <span className="text-gray-400 italic">Not set</span>}
            </p>
          )}
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={onEdit}
        disabled={isLoading}
        className="opacity-0 group-hover:opacity-100 transition-opacity gap-1"
      >
        <Edit className="w-4 h-4" />
        Edit
      </Button>
    </div>
  );
};

export default function InterviewSheetHeader({
  sheet,
  onUpdate,
  isUpdating,
}: InterviewSheetHeaderProps) {
  const { toast } = useToast();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: sheet?.name || "",
    description: sheet?.description || "",
    coverImageURL: sheet?.coverImageURL || "",
    liveOn: sheet?.liveOn
      ? new Date(sheet.liveOn).toISOString().split("T")[0]
      : "",
  });

  const editableFields: EditableField[] = [
    {
      name: "name",
      label: "Sheet Name",
      icon: <Type className="w-4 h-4" />,
      type: "text",
      value: formData.name,
    },
    {
      name: "description",
      label: "Description",
      icon: <FileText className="w-4 h-4" />,
      type: "textarea",
      value: formData.description,
    },
    {
      name: "coverImageURL",
      label: "Cover Image URL",
      icon: <Image className="w-4 h-4" />,
      type: "url",
      value: formData.coverImageURL,
    },
    {
      name: "liveOn",
      label: "Live On Date",
      icon: <Calendar className="w-4 h-4" />,
      type: "date",
      value: formData.liveOn,
    },
  ];

  const handleSaveField = async (fieldName: string, newValue: string) => {
    if (newValue === formData[fieldName as keyof typeof formData]) {
      setEditingField(null);
      return;
    }

    try {
      await onUpdate({
        [fieldName]: fieldName === "liveOn" ? new Date(newValue) : newValue,
      } as Partial<InterviewSheet>);

      setFormData((prev) => ({
        ...prev,
        [fieldName]: newValue,
      }));

      setEditingField(null);
      toast({
        title: "Success",
        description: `${
          editableFields.find((f) => f.name === fieldName)?.label
        } updated successfully`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update field";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mb-6">
      <Card>
        <CardContent className="pt-6">
          {/* Header with Title and Badge */}
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {sheet?.name}
                </h1>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">
                    {sheet?.questions?.length || 0} Questions
                  </Badge>
                  {sheet?.liveOn && (
                    <Badge variant="secondary" className="text-xs">
                      Live: {new Date(sheet.liveOn).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Editable Fields Grid */}
          <div className="grid grid-cols-1 gap-6">
            {editableFields.map((field) => (
              <div
                key={field.name}
                className="border-b last:border-0 pb-4 last:pb-0"
              >
                <EditableField
                  field={field}
                  isEditing={editingField === field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onEdit={() => setEditingField(field.name)}
                  onSave={(value) => handleSaveField(field.name, value)}
                  onCancel={() => setEditingField(null)}
                  isLoading={isUpdating}
                />
              </div>
            ))}
          </div>

          {/* Cover Image Preview */}
          {formData.coverImageURL && (
            <div className="mt-6 pt-6 border-t">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">
                Cover Image Preview
              </label>
              <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={formData.coverImageURL}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Ctext x='50%' y='50%' font-size='14' fill='%239ca3af' text-anchor='middle' dy='.3em'%3EInvalid URL%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
