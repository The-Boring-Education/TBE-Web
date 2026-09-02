import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Edit,
  FileText,
  Loader,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { useGetSession } from "@/api/interviewAgentsApi";
import {
  type IQuestion,
  useAddDatabaseQuestion,
  useDeleteDatabaseQuestion,
  useGetSheetDetail,
  useUpdateDatabaseQuestion,
} from "@/api/interviewSheetModifyApi";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { agentsClient } from "@/lib/agentsClient";

interface InterviewSheetEditorProps {
  id: string;
  type: "session" | "sheet";
  onComplete?: () => void;
}

const InterviewSheetEditor = ({
  id,
  type,
  onComplete,
}: InterviewSheetEditorProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- State for Add/Edit Modals ---
  const [editingQuestion, setEditingQuestion] = useState<IQuestion | null>(
    null,
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addQuestionDialogOpen, setAddQuestionDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  const [newQuestionForm, setNewQuestionForm] = useState<
    Omit<IQuestion, "id" | "created_at" | "updated_at">
  >({
    question: "",
    difficulty: "Medium",
    category: "",
    answer: "",
    resources: [],
  });

  const [editedQuestionForm, setEditedQuestionForm] = useState<
    Partial<IQuestion>
  >({
    question: "",
    difficulty: "Medium",
    category: "",
    answer: "",
    resources: [],
  });

  // --- Data Fetching ---
  const {
    data: dbSheet,
    isLoading: dbLoading,
    error: dbError,
    refetch: refetchDb,
  } = useGetSheetDetail(type === "sheet" ? id : "");

  const {
    data: sessionData,
    isLoading: sessionLoading,
    error: sessionError,
    refetch: refetchSession,
  } = useGetSession(type === "session" ? id : "");

  const isLoading = type === "sheet" ? dbLoading : sessionLoading;
  const error = type === "sheet" ? dbError : sessionError;
  const sheet =
    type === "sheet"
      ? dbSheet
      : sessionData?.sheet_data || sessionData?.sheetData || sessionData;

  // --- Mutations (Session Specific - Direct Axios for simplicity/consistency) ---
  const updateSessionQuestion = useMutation({
    mutationFn: async ({
      questionId,
      updates,
    }: {
      questionId: string;
      updates: Partial<IQuestion>;
    }) => {
      const response = await agentsClient.put(
        `/interview/session/${id}/questions/${questionId}`,
        updates,
      );
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Updated", description: "Question updated in session" });
      queryClient.invalidateQueries({ queryKey: ["interview-session", id] });
    },
    onError: (err: any) => {
      toast({
        title: "Update failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const deleteSessionQuestion = useMutation({
    mutationFn: async (questionId: string) => {
      const response = await agentsClient.delete(
        `/interview/session/${id}/questions/${questionId}`,
      );
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Question removed from session" });
      queryClient.invalidateQueries({ queryKey: ["interview-session", id] });
    },
    onError: (err: any) => {
      toast({
        title: "Delete failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const addSessionQuestion = useMutation({
    mutationFn: async (
      question: Omit<IQuestion, "id" | "created_at" | "updated_at">,
    ) => {
      const response = await agentsClient.post(
        `/interview/session/${id}/questions`,
        question,
      );
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Added", description: "Question added to session" });
      queryClient.invalidateQueries({ queryKey: ["interview-session", id] });
    },
    onError: (err: any) => {
      toast({
        title: "Add failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // --- Mutations (DB Sheet Specific) ---
  const dbUpdateMutation = useUpdateDatabaseQuestion();
  const dbDeleteMutation = useDeleteDatabaseQuestion();
  const dbAddMutation = useAddDatabaseQuestion();

  // --- Logic Helpers ---
  const getQuestionId = (q: IQuestion | any) => q.id || q._id || "";

  const handleEditSave = () => {
    if (!editingQuestion) return;
    const questionId = getQuestionId(editingQuestion);

    if (type === "sheet") {
      dbUpdateMutation.mutate({
        sheetId: id,
        questionId,
        updates: editedQuestionForm,
      });
    } else {
      updateSessionQuestion.mutate({
        questionId,
        updates: editedQuestionForm,
      });
    }
    setEditDialogOpen(false);
    setEditingQuestion(null);
  };

  const handleDeleteConfirm = () => {
    if (!questionToDelete) return;

    if (type === "sheet") {
      dbDeleteMutation.mutate({
        sheetId: id,
        questionId: questionToDelete,
      });
    } else {
      deleteSessionQuestion.mutate(questionToDelete);
    }
    setDeleteConfirmOpen(false);
    setQuestionToDelete(null);
  };

  const handleAddQuestion = () => {
    if (type === "sheet") {
      dbAddMutation.mutate({
        sheetId: id,
        question: newQuestionForm,
      });
    } else {
      addSessionQuestion.mutate(newQuestionForm);
    }
    setAddQuestionDialogOpen(false);
    setNewQuestionForm({
      question: "",
      difficulty: "Medium",
      category: "",
      answer: "",
      resources: [],
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center py-12">
          <Loader className="w-6 h-6 animate-spin mr-3 text-blue-500" />
          <span>Loading {type}...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6 flex flex-col items-center gap-4 py-8">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">Failed to load content</span>
          </div>
          <p className="text-sm text-gray-500">
            {(error as Error)?.message || "Unknown error"}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (type === "sheet" ? refetchDb() : refetchSession())}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!sheet) return null;

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl">
                {sheet.name || sheet.topic}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {type === "sheet" ? "Database Sheet" : "Generation Session"} •
                Questions:{" "}
                {sheet.questions?.length || sheet.question_count || 0}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setAddQuestionDialogOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
              {onComplete && (
                <Button variant="secondary" size="sm" onClick={onComplete}>
                  Done
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {sheet.questions && sheet.questions.length > 0 ? (
          sheet.questions.map((question: IQuestion, index: number) => (
            <Card
              key={getQuestionId(question)}
              className="hover:border-primary/50 transition-colors"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-400">
                        #{index + 1}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 px-1.5 font-normal uppercase tracking-wider"
                      >
                        {question.difficulty || "Medium"}
                      </Badge>
                      {question.category && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-5 px-1.5 font-normal"
                        >
                          {question.category}
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium text-sm leading-relaxed">
                      {question.question}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-blue-600"
                      onClick={() => {
                        setEditingQuestion(question);
                        setEditedQuestionForm({
                          question: question.question,
                          difficulty: question.difficulty || "Medium",
                          category: question.category || "",
                          answer: question.answer || "",
                          resources: question.resources || [],
                        });
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-600"
                      onClick={() => {
                        setQuestionToDelete(getQuestionId(question));
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {question.answer && (
                  <div className="pl-6 border-l-2 border-gray-100 py-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight mb-1">
                      Answer
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed italic line-clamp-3">
                      {question.answer}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center text-gray-400">
              <FileText className="w-12 h-12 mb-2 opacity-20" />
              <p>No questions found in this sheet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* --- ADD DIALOG --- */}
      <AlertDialog
        open={addQuestionDialogOpen}
        onOpenChange={setAddQuestionDialogOpen}
      >
        <AlertDialogContent className="max-w-4xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Question</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                Question
              </label>
              <Textarea
                value={newQuestionForm.question}
                onChange={(e) =>
                  setNewQuestionForm({
                    ...newQuestionForm,
                    question: e.target.value,
                  })
                }
                rows={6}
                placeholder="Type the question content here..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                  Difficulty
                </label>
                <Select
                  value={newQuestionForm.difficulty}
                  onValueChange={(v) =>
                    setNewQuestionForm({
                      ...newQuestionForm,
                      difficulty: v as any,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                  Category
                </label>
                <Input
                  value={newQuestionForm.category}
                  onChange={(e) =>
                    setNewQuestionForm({
                      ...newQuestionForm,
                      category: e.target.value,
                    })
                  }
                  placeholder="e.g. Behavioral"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                Answer/Hint
              </label>
              <Textarea
                value={newQuestionForm.answer}
                onChange={(e) =>
                  setNewQuestionForm({
                    ...newQuestionForm,
                    answer: e.target.value,
                  })
                }
                rows={10}
                placeholder="Optional detailed answer..."
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAddQuestionDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleAddQuestion}
              disabled={dbAddMutation.isPending || addSessionQuestion.isPending}
            >
              {dbAddMutation.isPending || addSessionQuestion.isPending
                ? "Adding..."
                : "Add Question"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- EDIT DIALOG --- */}
      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent className="max-w-4xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Question</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                Question
              </label>
              <Textarea
                value={editedQuestionForm.question}
                onChange={(e) =>
                  setEditedQuestionForm({
                    ...editedQuestionForm,
                    question: e.target.value,
                  })
                }
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                  Difficulty
                </label>
                <Select
                  value={editedQuestionForm.difficulty}
                  onValueChange={(v) =>
                    setEditedQuestionForm({
                      ...editedQuestionForm,
                      difficulty: v as any,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                  Category
                </label>
                <Input
                  value={editedQuestionForm.category}
                  onChange={(e) =>
                    setEditedQuestionForm({
                      ...editedQuestionForm,
                      category: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                Answer/Hint
              </label>
              <Textarea
                value={editedQuestionForm.answer}
                onChange={(e) =>
                  setEditedQuestionForm({
                    ...editedQuestionForm,
                    answer: e.target.value,
                  })
                }
                rows={10}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setEditDialogOpen(false);
                setEditingQuestion(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleEditSave}
              disabled={
                dbUpdateMutation.isPending || updateSessionQuestion.isPending
              }
            >
              {dbUpdateMutation.isPending || updateSessionQuestion.isPending
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- DELETE CONFIRM --- */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This question will be permanently
              removed from the {type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteConfirmOpen(false);
                setQuestionToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteConfirm}
              disabled={
                dbDeleteMutation.isPending || deleteSessionQuestion.isPending
              }
            >
              {dbDeleteMutation.isPending || deleteSessionQuestion.isPending
                ? "Deleting..."
                : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InterviewSheetEditor;
