import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  type QuizData,
  type QuizQuestion,
  useQuizData,
  useUpdateQuiz,
} from "@/api/quizApi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";

// Types are imported from quizApi

const QuizEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // API hooks
  const { data: quiz, isLoading: loading, error } = useQuizData(id || "");
  const updateQuizMutation = useUpdateQuiz();

  const [localQuiz, setLocalQuiz] = useState<QuizData | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set(),
  );

  // Sync API data with local state
  useEffect(() => {
    if (quiz) {
      setLocalQuiz(quiz);
    }
  }, [quiz]);

  // Handle API errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load quiz data",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const updateQuizField = (field: keyof QuizData, value: any) => {
    if (!localQuiz) return;
    setLocalQuiz({ ...localQuiz, [field]: value });
  };

  const updateQuestion = (
    index: number,
    field: keyof QuizQuestion,
    value: any,
  ) => {
    if (!localQuiz) return;
    const updatedQuestions = [...localQuiz.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setLocalQuiz({ ...localQuiz, questions: updatedQuestions });
  };

  const updateQuestionOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    if (!localQuiz) return;
    const updatedQuestions = [...localQuiz.questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = value;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: updatedOptions,
    };
    setLocalQuiz({ ...localQuiz, questions: updatedQuestions });
  };

  const addQuestion = () => {
    if (!localQuiz) return;
    const newQuestion: QuizQuestion = {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      detailedExplanation: "",
      difficulty: "medium",
    };
    setLocalQuiz({
      ...localQuiz,
      questions: [...localQuiz.questions, newQuestion],
    });
  };

  const removeQuestion = (index: number) => {
    if (!localQuiz) return;
    const updatedQuestions = localQuiz.questions.filter((_, i) => i !== index);
    setLocalQuiz({ ...localQuiz, questions: updatedQuestions });
  };

  const addOption = (questionIndex: number) => {
    if (!localQuiz) return;
    const updatedQuestions = [...localQuiz.questions];
    updatedQuestions[questionIndex].options.push("");
    setLocalQuiz({ ...localQuiz, questions: updatedQuestions });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    if (!localQuiz) return;
    const question = localQuiz.questions[questionIndex];
    if (question.options.length <= 2) return; // Keep at least 2 options

    const updatedQuestions = [...localQuiz.questions];
    updatedQuestions[questionIndex].options = question.options.filter(
      (_, i) => i !== optionIndex,
    );

    // Adjust correct answer if needed
    if (question.correctAnswer >= optionIndex) {
      updatedQuestions[questionIndex].correctAnswer = Math.max(
        0,
        question.correctAnswer - 1,
      );
    }

    setLocalQuiz({ ...localQuiz, questions: updatedQuestions });
  };

  const toggleQuestionExpanded = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const saveQuiz = async () => {
    if (!localQuiz || !id) return;

    try {
      const { _id, createdAt, updatedAt, ...dataToUpdate } = localQuiz;
      await updateQuizMutation.mutateAsync({
        id,
        updatedData: dataToUpdate,
      });

      // Invalidate and refetch quiz data
      queryClient.invalidateQueries({ queryKey: ["quiz-data", id] });
      queryClient.invalidateQueries({ queryKey: ["quiz-categories"] });

      toast({
        title: "Success",
        description: "Quiz saved successfully",
      });
    } catch (error) {
      console.error("Failed to save quiz:", error);
      toast({
        title: "Error",
        description: "Failed to save quiz",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Loading quiz...</div>
      </div>
    );
  }

  if (!localQuiz) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg text-red-600">Quiz not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/content/modifications")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Edit Quiz: {localQuiz.categoryName || "Untitled"}
            </h1>
            <p className="text-gray-600">Quiz ID: {localQuiz._id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {localQuiz.isActive ? (
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Active
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-red-100 text-red-800 flex items-center gap-1"
              >
                <EyeOff className="w-3 h-3" />
                Inactive
              </Badge>
            )}
          </div>
          <Button
            onClick={saveQuiz}
            disabled={updateQuizMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {updateQuizMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Quiz Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Category Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={localQuiz.categoryName}
                onChange={(e) =>
                  updateQuizField("categoryName", e.target.value)
                }
                placeholder="Enter category name"
              />
            </div>
            <div>
              <Label htmlFor="categoryIcon">Category Icon</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="categoryIcon"
                  value={localQuiz.categoryIcon}
                  onChange={(e) =>
                    updateQuizField("categoryIcon", e.target.value)
                  }
                  placeholder="Enter emoji or icon"
                  className="flex-1"
                />
                {localQuiz.categoryIcon && (
                  <span className="text-2xl">{localQuiz.categoryIcon}</span>
                )}
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="categoryDescription">Category Description</Label>
            <Textarea
              id="categoryDescription"
              value={localQuiz.categoryDescription}
              onChange={(e) =>
                updateQuizField("categoryDescription", e.target.value)
              }
              placeholder="Enter category description"
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={localQuiz.isActive}
              onCheckedChange={(checked) =>
                updateQuizField("isActive", checked)
              }
            />
            <Label htmlFor="isActive">
              Quiz is active and visible to users
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Questions ({localQuiz.questions.length})</CardTitle>
            <Button onClick={addQuestion} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {localQuiz.questions.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No questions added yet. Click "Add Question" to get started.
              </AlertDescription>
            </Alert>
          ) : (
            localQuiz.questions.map((question, questionIndex) => (
              <Card
                key={questionIndex}
                className="border-l-4 border-l-blue-500"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        Question {questionIndex + 1}
                      </span>
                      <Badge
                        variant={
                          question.difficulty === "easy"
                            ? "default"
                            : question.difficulty === "medium"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {question.difficulty}
                      </Badge>
                      {question.question &&
                        question.options.every((o) => o.trim()) &&
                        question.explanation &&
                        question.detailedExplanation && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleQuestionExpanded(questionIndex)}
                      >
                        {expandedQuestions.has(questionIndex)
                          ? "Collapse"
                          : "Expand"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuestion(questionIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Question Text */}
                  <div>
                    <Label>Question Text</Label>
                    <Textarea
                      value={question.question}
                      onChange={(e) =>
                        updateQuestion(
                          questionIndex,
                          "question",
                          e.target.value,
                        )
                      }
                      placeholder="Enter your question here..."
                      rows={2}
                    />
                  </div>

                  {/* Options */}
                  <div>
                    <Label>Answer Options</Label>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center gap-2"
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name={`correct-${questionIndex}`}
                              checked={question.correctAnswer === optionIndex}
                              onChange={() =>
                                updateQuestion(
                                  questionIndex,
                                  "correctAnswer",
                                  optionIndex,
                                )
                              }
                              className="mr-2"
                            />
                            <span className="text-sm font-medium">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                          </div>
                          <Input
                            value={option}
                            onChange={(e) =>
                              updateQuestionOption(
                                questionIndex,
                                optionIndex,
                                e.target.value,
                              )
                            }
                            placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            className="flex-1"
                          />
                          {question.options.length > 2 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                removeOption(questionIndex, optionIndex)
                              }
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(questionIndex)}
                        className="mt-2"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <Label>Difficulty Level</Label>
                    <Select
                      value={question.difficulty}
                      onValueChange={(value: "easy" | "medium" | "hard") =>
                        updateQuestion(questionIndex, "difficulty", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Explanations - Show when expanded */}
                  {expandedQuestions.has(questionIndex) && (
                    <>
                      <div>
                        <Label>Brief Explanation</Label>
                        <Textarea
                          value={question.explanation}
                          onChange={(e) =>
                            updateQuestion(
                              questionIndex,
                              "explanation",
                              e.target.value,
                            )
                          }
                          placeholder="Brief explanation of the correct answer..."
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Detailed Explanation</Label>
                        <Textarea
                          value={question.detailedExplanation}
                          onChange={(e) =>
                            updateQuestion(
                              questionIndex,
                              "detailedExplanation",
                              e.target.value,
                            )
                          }
                          placeholder="Detailed explanation with context and reasoning..."
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizEditPage;
