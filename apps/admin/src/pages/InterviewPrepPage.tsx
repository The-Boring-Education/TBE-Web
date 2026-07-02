import {
  BookOpen,
  BrainCircuit,
  CheckCircle,
  Clock,
  Code,
  Database,
  Delete,
  Edit,
  FileText,
  Loader,
  Play,
  Plus,
  RefreshCw,
  Square,
  Target,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  type BulkGenerationRequest,
  type InterviewGenerationSession,
  useCancelSession,
  useDeleteSession,
  useGenerateTopicQuestions,
  useGetSession,
  useInterviewSessions,
  usePushToDatabase,
  useRetrySession,
  useRoadmapSuggestions,
  useStartBulkGeneration,
  useTopicTemplates,
  useUpdateSessionSheet,
} from "@/api/interviewAgentsApi";
import { useUserInterviewPreps } from "@/api/interviewPrepApi";
import {
  useDeleteInterviewSheet,
  useInterviewSheets,
  useUpdateInterviewSheet,
} from "@/api/interviewPrepApi";
import {
  useAddDatabaseQuestion,
  useDeleteDatabaseQuestion,
  useDeleteSheet,
  useUpdateDatabaseQuestion,
  useUpdateSheetMetadata,
} from "@/api/interviewSheetModifyApi";
import InterviewSheetEditor from "@/components/InterviewSheetEditor";
import InterviewSheetReviewer from "@/components/InterviewSheetReviewer";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { usePushSessionFlow } from "@/hooks/usePushSessionFlow";

// Helper function to get question ID from question object
const getQuestionId = (question: any): string => {
  return question?.id || question?._id || "";
};

const InterviewPrepPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("create");
  const [modifySessionId, setModifySessionId] = useState<string | null>(null);
  const [modifySheetId, setModifySheetId] = useState<string | null>(null);
  const [editOrigin, setEditOrigin] = useState<"sessions" | "sheets" | null>(
    null,
  );

  // User progress data
  const {
    data: userProgressData,
    pagination,
    isLoading,
  } = useUserInterviewPreps(page, 10);

  // Generation sessions and data
  const {
    data: sessions = [],
    isLoading: sessionsLoading,
    refetch: refetchSessions,
  } = useInterviewSessions();
  const { data: topicTemplates = [] } = useTopicTemplates();
  const { data: roadmapSuggestions = [] } = useRoadmapSuggestions();

  // Database sheets
  const {
    data: dbSheets = [],
    isLoading: sheetsLoading,
    refetch: refetchSheets,
  } = useInterviewSheets();

  // JSON Review state
  const [reviewSheetId, setReviewSheetId] = useState<string | null>(null);
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);

  // Mutations
  const startBulkGeneration = useStartBulkGeneration();
  const generateTopicQuestions = useGenerateTopicQuestions();
  const cancelSession = useCancelSession();
  const retrySession = useRetrySession();
  const deleteSession = useDeleteSession();
  const pushToDatabase = usePushToDatabase();
  const deleteSheetMutation = useDeleteInterviewSheet();
  const updateInterviewSheetMutation = useUpdateInterviewSheet();
  const updateSessionSheetMutation = useUpdateSessionSheet();

  // Form states
  const [bulkGenerationForm, setBulkGenerationForm] =
    useState<BulkGenerationRequest>({
      topics: [],
      generateAnswers: true,
      autoPublish: false,
    });

  const [singleTopicForm, setSingleTopicForm] = useState({
    topic: "",
    agentType: "tech" as InterviewGenerationSession["agentType"],
    technology: "",
    questionCount: 20,
    roadmap: "Tech",
    difficulty: "Medium" as const,
    generateAnswers: true,
  });

  const [newTopic, setNewTopic] = useState({
    name: "",
    agentType: "tech" as InterviewGenerationSession["agentType"],
    technology: "",
    questionCount: 20,
    roadmap: "Tech",
    difficulty: "Medium" as const,
  });

  // Database push dialog state
  const [pushDialogOpen, setPushDialogOpen] = useState(false);
  const [sessionIdForPush, setSessionIdForPush] = useState<string | null>(null);
  const [selectedSessionForPush, setSelectedSessionForPush] =
    useState<InterviewGenerationSession | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);
  const {
    data: sessionDataForPush,
    isLoading: isLoadingSessionData,
    error: sessionFetchError,
  } = useGetSession(sessionIdForPush || "");

  // Handler to reset state when dialog closes
  const handlePushDialogOpenChange = (open: boolean) => {
    setPushDialogOpen(open);
    if (!open) {
      // Reset states when dialog closes
      setSessionIdForPush(null);
      setSelectedSessionForPush(null);
      setPushError(null);
    }
  };
  const [pushMetadata, setPushMetadata] = useState({
    name: "",
    description: "",
    isPremium: false,
    price: 0,
    coverImageURL: "",
    meta: "",
    slug: "",
    roadmap: "Tech",
    discountPercentage: 0,
    appliedCoupon: null as string | null,
    features: [] as string[],
    liveOn: new Date(),
    frequency: "",
    priority: "",
    companyTypes: [] as string[],
    resources: [] as any[],
    questions: [] as any[],
  });

  const [sheetToDelete, setSheetToDelete] = useState<string | null>(null);
  const [deleteSheetConfirmOpen, setDeleteSheetConfirmOpen] = useState(false);

  // Edit sheet metadata state
  const [editSheetDialogOpen, setEditSheetDialogOpen] = useState(false);
  const [sheetToEdit, setSheetToEdit] = useState<any | null>(null);
  const [editSheetMetadata, setEditSheetMetadata] = useState({
    name: "",
    description: "",
    isPremium: false,
    price: 0,
    coverImageURL: "",
    meta: "",
    slug: "",
    roadmap: "Tech",
    discountPercentage: 0,
    appliedCoupon: null as string | null,
    features: [] as string[],
    liveOn: new Date(),
    frequency: "",
    priority: "",
    companyTypes: [] as string[],
    resources: [] as any[],
  });
  const [editSheetError, setEditSheetError] = useState<string | null>(null);

  // JSON Review state (quiz-style)

  // Effect to populate push metadata when session data is fetched
  useEffect(() => {
    if (sessionFetchError) {
      return;
    }

    if (!sessionDataForPush) {
      return;
    }

    try {
      // Handle different response structures
      const sheetData = sessionDataForPush.sheet_data || sessionDataForPush;

      const topic = sheetData.name || sheetData.topic || "Interview";

      if (!topic) {
        return;
      }

      const slug = topic
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      setPushMetadata({
        name: sheetData.name || `${topic} Interview Questions`,
        description:
          sheetData.description || `Comprehensive ${topic} interview questions`,
        meta:
          sheetData.meta ||
          `Interview questions for ${topic}. Roadmap: ${
            sheetData.roadmap || "Tech"
          }.`,
        slug,
        roadmap: sheetData.roadmap || "Tech",
        isPremium: sheetData.isPremium || false,
        price: sheetData.price || 0,
        discountPercentage: sheetData.discountPercentage || 0,
        appliedCoupon: sheetData.appliedCoupon || null,
        coverImageURL:
          sheetData.coverImageURL ||
          "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop&crop=center&q=80",
        features: sheetData.features || [],
        liveOn: sheetData.liveOn ? new Date(sheetData.liveOn) : new Date(),
        frequency: sheetData.frequency || "",
        priority: sheetData.priority || "",
        companyTypes: sheetData.companyTypes || [],
        resources: sheetData.resources || [],
        questions: (sheetData.questions || []).map((q: any) => {
          const { id, ...rest } = q;
          return rest;
        }),
      });
      setSelectedSessionForPush({
        ...sessionDataForPush,
        sessionId: sessionIdForPush,
      });
      setPushDialogOpen(true);
    } catch (error) {
      // Error handled silently
    }
  }, [sessionDataForPush, sessionFetchError, sessionIdForPush]);

  // Database sheet mutations
  const updateQuestion = useUpdateDatabaseQuestion();
  const deleteQuestion = useDeleteDatabaseQuestion();
  const addQuestion = useAddDatabaseQuestion();
  const deleteSheet = useDeleteSheet();
  const updateSheetMetadata = useUpdateSheetMetadata();

  const userProgressColumns = useMemo(
    () => [
      {
        id: "user",
        header: "User",
        cell: (row: any) => {
          const userName = row.user?.userName || "-";
          const userEmail = row.user?.userEmail || "-";
          const userContactNo = row.user?.userContactNo || "-";
          return (
            <div>
              <div className="font-medium">{userName}</div>
              <div className="text-sm text-gray-500">{userEmail}</div>
              <div className="text-sm text-gray-500">{userContactNo}</div>
            </div>
          );
        },
        sortable: true,
      },
      {
        id: "sheet",
        header: "Sheet",
        cell: (row: any) => (
          <div className="font-medium">{row.sheet?.name || "-"}</div>
        ),
        sortable: true,
      },
      {
        id: "progress",
        header: "Progress",
        cell: (row: any) => {
          const progress = row.progress || {
            completed: 0,
            total: 0,
            percentage: 0,
          };
          return (
            <div className="space-y-2">
              <div className="text-sm font-medium">
                {progress.completed}/{progress.total} questions
              </div>
              <Progress value={progress.percentage} className="w-full" />
              <div className="text-xs text-gray-500">
                {progress.percentage.toFixed(1)}% complete
              </div>
            </div>
          );
        },
      },
      {
        id: "lastUpdated",
        header: "Last Updated",
        cell: (row: any) => {
          if (!row.lastUpdated) return <div>-</div>;
          return <div>{new Date(row.lastUpdated).toLocaleDateString()}</div>;
        },
        sortable: true,
      },
    ],
    [],
  );

  const sessionColumns = useMemo(
    () => [
      {
        id: "topic",
        header: "Topic",
        cell: (row: InterviewGenerationSession) => (
          <div>
            <div className="font-medium">{row.topic}</div>
            <div className="text-sm text-gray-500 capitalize">
              {row.agentType} • {row.roadmap}
              {row.technology && ` • ${row.technology}`}
            </div>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (row: InterviewGenerationSession) => {
          const statusConfig = {
            pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
            in_progress: {
              color: "bg-blue-100 text-blue-800",
              icon: RefreshCw,
            },
            completed: {
              color: "bg-green-100 text-green-800",
              icon: CheckCircle,
            },
            failed: { color: "bg-red-100 text-red-800", icon: XCircle },
          };
          const config = statusConfig[row.status] || statusConfig.pending;
          const Icon = config.icon;

          return (
            <Badge className={`${config.color} flex items-center gap-1`}>
              <Icon className="w-3 h-3" />
              {row.status?.replace("_", " ") || "pending"}
            </Badge>
          );
        },
      },
      {
        id: "progress",
        header: "Progress",
        cell: (row: InterviewGenerationSession) => (
          <div className="space-y-2 min-w-[200px]">
            {(() => {
              const completed = row?.progress?.completed_questions ?? 0;
              const total = row?.progress?.total_questions ?? 0;
              let percent = Number(row?.progress?.percent ?? 0);
              const step = row?.progress?.current_step || "-";

              // If status is completed, set percent to 100
              if (row.status === "completed" && percent === 0) {
                percent = 100;
              }

              // Calculate display values based on available data
              let displayTotal = total;
              let displayCompleted = completed;

              // If we have sheetData with questions, use that for the count
              if (row.sheetData?.questions) {
                displayTotal = row.sheetData.questions.length;
                displayCompleted = row.sheetData.questions.length;
              } else if (
                completed === 0 &&
                total === 0 &&
                row.status === "completed"
              ) {
                // Fallback: use questionCount if progress fields are empty but session is completed
                displayTotal = row.questionCount;
                displayCompleted = row.questionCount;
              }

              return (
                <>
                  <div className="flex justify-between text-sm">
                    <span>
                      {displayCompleted}/{displayTotal}
                    </span>
                    <span>{percent.toFixed(1)}%</span>
                  </div>
                  <Progress value={percent} className="w-full" />
                  <div className="text-xs text-gray-500">{step}</div>
                </>
              );
            })()}
          </div>
        ),
      },
      {
        id: "timing",
        header: "Timing",
        cell: (row: InterviewGenerationSession) => (
          <div className="text-sm">
            <div>Started: {new Date(row.startedAt).toLocaleString()}</div>
            {row.completedAt && (
              <div>Completed: {new Date(row.completedAt).toLocaleString()}</div>
            )}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: (row: InterviewGenerationSession) => (
          <div className="flex items-center gap-2 flex-wrap">
            {row.status === "completed" && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setReviewSessionId(row.sessionId)}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Review
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setModifySessionId(row.sessionId);
                    setEditOrigin("sessions");
                    setActiveTab("modify");
                  }}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSessionIdForPush(row.sessionId);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isLoadingSessionData}
                >
                  <Database className="w-4 h-4 mr-1" />
                  {isLoadingSessionData ? "Loading..." : "Push to DB"}
                </Button>
              </>
            )}
            {row.status === "in_progress" && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => cancelSession.mutate(row.sessionId)}
                disabled={cancelSession.isPending}
              >
                <Square className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            )}
            {row.status === "failed" && (
              <Button
                size="sm"
                onClick={() => retrySession.mutate(row.sessionId)}
                disabled={retrySession.isPending}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deleteSession.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Session?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the session for "{row.topic}
                    "? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteSession.mutate(row.sessionId)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ),
      },
    ],
    [cancelSession, retrySession, deleteSession, isLoadingSessionData],
  );

  const handleAddTopic = () => {
    if (!newTopic.name.trim()) {
      toast({
        title: "Error",
        description: "Topic name is required",
        variant: "destructive",
      });
      return;
    }

    if (newTopic.questionCount < 1) {
      toast({
        title: "Error",
        description: "Question count must be at least 1",
        variant: "destructive",
      });
      return;
    }

    setBulkGenerationForm((prev) => ({
      ...prev,
      topics: [...prev.topics, { ...newTopic }],
    }));

    setNewTopic({
      name: "",
      agentType: "tech",
      technology: "",
      questionCount: 20,
      roadmap: "Tech",
      difficulty: "Medium",
    });
  };

  const handleRemoveTopic = (index: number) => {
    setBulkGenerationForm((prev) => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index),
    }));
  };

  const handleStartBulkGeneration = () => {
    if (bulkGenerationForm.topics.length === 0) {
      toast({
        title: "Error",
        description: "Add at least one topic",
        variant: "destructive",
      });
      return;
    }

    // Validate all topics have required fields
    const invalidTopics = bulkGenerationForm.topics.filter(
      (t) => !t.name || !t.roadmap || !t.difficulty || t.questionCount < 1,
    );

    if (invalidTopics.length > 0) {
      toast({
        title: "Validation Error",
        description:
          "Some topics are missing required fields or have invalid question counts (min 1)",
        variant: "destructive",
      });
      return;
    }

    // Show initial feedback that request is being sent
    toast({
      title: "Sending request...",
      description: "Please wait while we process your request.",
    });

    startBulkGeneration.mutate(bulkGenerationForm);
  };

  const handleGenerateSingleTopic = () => {
    if (!singleTopicForm.topic.trim()) {
      toast({
        title: "Error",
        description: "Topic name is required",
        variant: "destructive",
      });
      return;
    }

    // Show initial feedback that request is being sent
    toast({
      title: "Sending request...",
      description: "Please wait while we process your request.",
    });

    generateTopicQuestions.mutate(singleTopicForm, {
      onSuccess: () => {
        setActiveTab("sessions");
      },
    });
  };

  // Sync to Agents API then Push to DB
  const { executePushFlow } = usePushSessionFlow({
    updateSessionSheetMutation,
    pushToDatabase,
    deleteSession,
  });

  const handlePushToDatabase = async () => {
    if (!selectedSessionForPush) return;
    setPushError(null);

    await executePushFlow(
      selectedSessionForPush,
      pushMetadata,
      () => {
        // onSuccess
        handlePushDialogOpenChange(false);
        setSessionIdForPush(null);
        setSelectedSessionForPush(null);
        refetchSessions();
      },
      (error: any) => {
        // onError
        setPushError(error.message || "Failed to push to database");
      },
    );
  };

  const handleUpdateSheetMetadata = () => {
    if (!sheetToEdit) return;

    const sheetId = sheetToEdit.id || sheetToEdit._id;
    if (!sheetId) {
      toast({
        title: "Error",
        description: "Sheet ID not found",
        variant: "destructive",
      });
      return;
    }

    setEditSheetError(null);

    updateSheetMetadata.mutate(
      {
        sheetId,
        metadata: editSheetMetadata,
      },
      {
        onSuccess: () => {
          setEditSheetDialogOpen(false);
          setSheetToEdit(null);
          refetchSheets();
          toast({
            title: "Success",
            description: "Sheet metadata updated successfully",
          });
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Failed to update sheet metadata";
          setEditSheetError(errorMessage);
        },
      },
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Interview Prep Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create
          </TabsTrigger>
          <TabsTrigger value="modify" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Modify
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" />
            Sessions
          </TabsTrigger>
          {/* <TabsTrigger value="user-progress" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        User Progress
                    </TabsTrigger> */}
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Create Tab */}
        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Single Topic Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Single Topic Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Topic
                  </label>
                  <Input
                    value={singleTopicForm.topic}
                    onChange={(e) =>
                      setSingleTopicForm((prev) => ({
                        ...prev,
                        topic: e.target.value,
                      }))
                    }
                    placeholder="e.g., React.js, Node.js, DSA"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Agent Type
                    </label>
                    <Select
                      value={singleTopicForm.agentType}
                      onValueChange={(value: any) =>
                        setSingleTopicForm((prev) => ({
                          ...prev,
                          agentType: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech">Tech</SelectItem>
                        <SelectItem value="dsa">DSA</SelectItem>
                        <SelectItem value="generic">Generic</SelectItem>
                        <SelectItem value="system_design">
                          System Design
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Question Count
                    </label>
                    <Input
                      type="number"
                      min="5"
                      max="100"
                      value={singleTopicForm.questionCount}
                      onChange={(e) =>
                        setSingleTopicForm((prev) => ({
                          ...prev,
                          questionCount: parseInt(e.target.value) || 20,
                        }))
                      }
                    />
                  </div>
                </div>

                {singleTopicForm.agentType === "tech" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Technology
                    </label>
                    <Input
                      value={singleTopicForm.technology}
                      onChange={(e) =>
                        setSingleTopicForm((prev) => ({
                          ...prev,
                          technology: e.target.value,
                        }))
                      }
                      placeholder="Specific technology (optional)"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Roadmap
                    </label>
                    <Select
                      value={singleTopicForm.roadmap}
                      onValueChange={(value) =>
                        setSingleTopicForm((prev) => ({
                          ...prev,
                          roadmap: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Frontend">Frontend</SelectItem>
                        <SelectItem value="Backend">Backend</SelectItem>
                        <SelectItem value="Fullstack">Fullstack</SelectItem>
                        <SelectItem value="Tech">Tech</SelectItem>
                        <SelectItem value="DSA">DSA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Difficulty
                    </label>
                    <Select
                      value={singleTopicForm.difficulty}
                      onValueChange={(value: any) =>
                        setSingleTopicForm((prev) => ({
                          ...prev,
                          difficulty: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                        <SelectItem value="Mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="generateAnswers"
                    checked={singleTopicForm.generateAnswers}
                    onChange={(e) =>
                      setSingleTopicForm((prev) => ({
                        ...prev,
                        generateAnswers: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <label
                    htmlFor="generateAnswers"
                    className="text-sm font-medium"
                  >
                    Generate detailed answers
                  </label>
                </div>

                <Button
                  onClick={handleGenerateSingleTopic}
                  disabled={generateTopicQuestions.isPending}
                  className="w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {generateTopicQuestions.isPending
                    ? "Starting..."
                    : "Generate Questions"}
                </Button>
              </CardContent>
            </Card>

            {/* Bulk Generation */}
          </div>
        </TabsContent>

        {/* Modify Tab */}
        <TabsContent value="modify" className="space-y-6">
          {modifySessionId ? (
            <InterviewSheetEditor
              id={modifySessionId}
              type="session"
              onComplete={() => {
                setModifySessionId(null);
                if (editOrigin === "sessions") {
                  setActiveTab("sessions");
                }
                setEditOrigin(null);
              }}
            />
          ) : modifySheetId ? (
            <InterviewSheetEditor
              id={modifySheetId}
              type="sheet"
              onComplete={() => setModifySheetId(null)}
            />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      <CardTitle>All Interview Sheets</CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchSheets()}
                      disabled={sheetsLoading}
                    >
                      <RefreshCw
                        className={`w-4 h-4 mr-2 ${
                          sheetsLoading ? "animate-spin" : ""
                        }`}
                      />
                      {sheetsLoading ? "Refreshing..." : "Refresh"}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Select a sheet to edit its questions
                  </p>
                </CardHeader>
                <CardContent>
                  {sheetsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-6 h-6 animate-spin mr-3" />
                      <span>Loading sheets...</span>
                    </div>
                  ) : dbSheets.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No interview sheets found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Create sheets in the Create tab
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dbSheets.map((sheet: any, idx: number) => (
                        <div
                          key={sheet.id || sheet._id || idx}
                          className="p-4 border rounded-lg hover:shadow-md hover:border-primary transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div
                              className="flex-1 cursor-pointer"
                              onClick={() => {
                                const sheetId = sheet.id || sheet._id;
                                if (sheetId) {
                                  setModifySheetId(sheetId);
                                } else {
                                  toast({
                                    title: "Error",
                                    description: "Sheet ID not found",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <h4 className="font-semibold text-lg hover:text-primary transition-colors">
                                {sheet.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Topic: {sheet.name} • Questions:{" "}
                                {sheet.question_count || 0}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Created At:{" "}
                                {new Date(sheet.liveOn).toLocaleDateString(
                                  "en-IN",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReviewSheetId(sheet.id || sheet._id);
                                }}
                                variant="outline"
                                size="sm"
                              >
                                <Code className="w-4 h-4 mr-2" />
                                Review
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const sheetId = sheet.id || sheet._id;
                                  if (sheetId) {
                                    setSheetToEdit(sheet);
                                    setEditSheetMetadata({
                                      name: sheet.name || "",
                                      description: sheet.description || "",
                                      isPremium: sheet.isPremium || false,
                                      price: sheet.price || 0,
                                      coverImageURL: sheet.coverImageURL || "",
                                      meta: sheet.meta || "",
                                      slug: sheet.slug || "",
                                      roadmap: sheet.roadmap || "Tech",
                                      discountPercentage:
                                        sheet.discountPercentage || 0,
                                      appliedCoupon:
                                        sheet.appliedCoupon || null,
                                      features: sheet.features || [],
                                      liveOn: sheet.liveOn
                                        ? new Date(sheet.liveOn)
                                        : new Date(),
                                      frequency: sheet.frequency || "",
                                      priority: sheet.priority || "",
                                      companyTypes: sheet.companyTypes || [],
                                      resources: sheet.resources || [],
                                    });
                                    setEditSheetError(null);
                                    setEditSheetDialogOpen(true);
                                  } else {
                                    toast({
                                      title: "Error",
                                      description: "Sheet ID not found",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                variant="outline"
                                size="sm"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const sheetId = sheet.id || sheet._id;
                                  if (sheetId) {
                                    setSheetToDelete(sheetId);
                                    setDeleteSheetConfirmOpen(true);
                                  } else {
                                    toast({
                                      title: "Error",
                                      description: "Sheet ID not found",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                variant="destructive"
                                size="sm"
                              >
                                <Delete className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Delete Sheet Confirmation Dialog */}
              <AlertDialog open={deleteSheetConfirmOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Sheet</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the entire sheet "
                      {dbSheets.find(
                        (s: any) =>
                          s.id === sheetToDelete || s._id === sheetToDelete,
                      )?.name || "this sheet"}
                      " and all its questions. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={() => {
                        setDeleteSheetConfirmOpen(false);
                        setSheetToDelete(null);
                      }}
                      disabled={deleteSheet.isPending}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (!sheetToDelete) {
                          toast({
                            title: "Error",
                            description:
                              "Sheet ID not found. Please try again.",
                            variant: "destructive",
                          });
                          return;
                        }

                        deleteSheet.mutate(sheetToDelete, {
                          onSuccess: () => {
                            toast({
                              title: "Success",
                              description: "Sheet deleted successfully",
                            });
                            setDeleteSheetConfirmOpen(false);
                            setSheetToDelete(null);
                            refetchSheets();
                          },
                          onError: (error: any) => {
                            toast({
                              title: "Error",
                              description:
                                error?.response?.data?.message ||
                                error?.message ||
                                "Failed to delete sheet",
                              variant: "destructive",
                            });
                          },
                        });
                      }}
                      disabled={deleteSheet.isPending}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleteSheet.isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5" />
                Generation Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={sessionColumns}
                data={sessions}
                isLoading={sessionsLoading}
                searchable
                pagination={{
                  pageSize: 10,
                  pageIndex: 0,
                  pageCount: Math.ceil(sessions.length / 10),
                  onPageChange: () => {},
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Progress Tab */}
        <TabsContent value="user-progress">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={userProgressColumns}
                data={userProgressData || []}
                isLoading={isLoading}
                searchable
                pagination={{
                  pageSize: 10,
                  pageIndex: page - 1,
                  pageCount: pagination?.totalPages || 1,
                  onPageChange: (newPage) => setPage(newPage + 1),
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topicTemplates.map((template, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSingleTopicForm((prev) => ({
                    ...prev,
                    topic: template.name,
                    questionCount: template.suggestedQuestionCount,
                    agentType: template
                      .agentTypes[0] as InterviewGenerationSession["agentType"],
                    roadmap: template.roadmaps[0] || "Tech",
                  }));
                  setActiveTab("create");
                }}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {template.agentTypes.map((type) => (
                        <Badge
                          key={type}
                          variant="secondary"
                          className="text-xs"
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500">
                      Suggested: {template.suggestedQuestionCount} questions
                    </div>
                    <div className="text-sm text-gray-500">
                      Difficulty: {template.difficulty}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Push to Database Dialog */}
      <AlertDialog
        open={pushDialogOpen}
        onOpenChange={handlePushDialogOpenChange}
      >
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Push to Database</AlertDialogTitle>
            <AlertDialogDescription>
              Configure the interview sheet metadata before publishing to
              database.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Error Display */}
          {pushError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-700 font-medium">Error:</p>
              <p className="text-sm text-red-600 mt-1">{pushError}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoadingSessionData && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
              <p className="text-sm text-blue-700">Loading session data...</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Information Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-3 text-gray-700">
                Basic Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name *
                  </label>
                  <Input
                    value={pushMetadata.name}
                    onChange={(e) =>
                      setPushMetadata((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Interview sheet name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Slug *
                  </label>
                  <Input
                    value={pushMetadata.slug}
                    onChange={(e) =>
                      setPushMetadata((prev) => ({
                        ...prev,
                        slug: e.target.value,
                      }))
                    }
                    placeholder="auto-generated from name"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL-friendly identifier
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Roadmap *
                  </label>
                  <Input
                    value={pushMetadata.roadmap}
                    onChange={(e) =>
                      setPushMetadata((prev) => ({
                        ...prev,
                        roadmap: e.target.value,
                      }))
                    }
                    placeholder="e.g., Tech, DSA, Frontend"
                  />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-3 text-gray-700">
                Content
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Textarea
                    value={pushMetadata.description}
                    onChange={(e) =>
                      setPushMetadata((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Sheet description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Meta Information
                  </label>
                  <Textarea
                    value={pushMetadata.meta}
                    onChange={(e) =>
                      setPushMetadata((prev) => ({
                        ...prev,
                        meta: e.target.value,
                      }))
                    }
                    placeholder="Additional metadata (auto-generated)"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    SEO and additional information
                  </p>
                </div>
              </div>
            </div>

            {/* Media Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-3 text-gray-700">
                Media
              </h3>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cover Image URL
                </label>
                <Input
                  value={pushMetadata.coverImageURL}
                  onChange={(e) =>
                    setPushMetadata((prev) => ({
                      ...prev,
                      coverImageURL: e.target.value,
                    }))
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-3 text-gray-700">
                Pricing
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPremium"
                    checked={pushMetadata.isPremium}
                    onChange={(e) =>
                      setPushMetadata((prev) => ({
                        ...prev,
                        isPremium: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <label htmlFor="isPremium" className="text-sm font-medium">
                    Premium Sheet
                  </label>
                </div>

                {pushMetadata.isPremium && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Price (₹)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={pushMetadata.price}
                        onChange={(e) =>
                          setPushMetadata((prev) => ({
                            ...prev,
                            price: parseInt(e.target.value) || 0,
                          }))
                        }
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Discount Percentage (%)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={pushMetadata.discountPercentage}
                        onChange={(e) =>
                          setPushMetadata((prev) => ({
                            ...prev,
                            discountPercentage: parseInt(e.target.value) || 0,
                          }))
                        }
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Applied Coupon (Optional)
                      </label>
                      <Input
                        value={pushMetadata.appliedCoupon || ""}
                        onChange={(e) =>
                          setPushMetadata((prev) => ({
                            ...prev,
                            appliedCoupon: e.target.value || null,
                          }))
                        }
                        placeholder="Coupon code"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Features Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-3 text-gray-700">
                Features (Optional)
              </h3>
              <div className="space-y-2">
                {pushMetadata.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...pushMetadata.features];
                        newFeatures[index] = e.target.value;
                        setPushMetadata((prev) => ({
                          ...prev,
                          features: newFeatures,
                        }));
                      }}
                      placeholder="Feature name"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newFeatures = pushMetadata.features.filter(
                          (_, i) => i !== index,
                        );
                        setPushMetadata((prev) => ({
                          ...prev,
                          features: newFeatures,
                        }));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPushMetadata((prev) => ({
                      ...prev,
                      features: [...prev.features, ""],
                    }));
                  }}
                >
                  + Add Feature
                </Button>
              </div>
            </div>

            {/* Publication Settings Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-3 text-gray-700">
                Publication Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Go Live Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={pushMetadata.liveOn.toISOString().slice(0, 16)}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      setPushMetadata((prev) => ({
                        ...prev,
                        liveOn: date,
                      }));
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    When this sheet goes live
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Frequency (Optional)
                  </label>
                  <Input
                    value={pushMetadata.frequency}
                    onChange={(e) =>
                      setPushMetadata((prev) => ({
                        ...prev,
                        frequency: e.target.value,
                      }))
                    }
                    placeholder="e.g., Daily, Weekly, Monthly"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Priority (Optional)
                  </label>
                  <Input
                    value={pushMetadata.priority}
                    onChange={(e) =>
                      setPushMetadata((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                    placeholder="e.g., High, Medium, Low"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Company Types (Optional)
                  </label>
                  <Input
                    value={pushMetadata.companyTypes.join(", ")}
                    onChange={(e) =>
                      setPushMetadata((prev) => ({
                        ...prev,
                        companyTypes: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter((t) => t),
                      }))
                    }
                    placeholder="e.g., FAANG, Startups, MNC (comma-separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Resource Link (Optional)
                  </label>
                  <Input
                    value=""
                    onChange={(e) =>
                      setPushMetadata((prev) => ({
                        ...prev,
                        resources: [],
                      }))
                    }
                    placeholder="https://..."
                    type="url"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Link to external resources for this sheet
                  </p>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            {pushError && (
              <Button
                onClick={handlePushToDatabase}
                disabled={pushToDatabase.isPending || isLoadingSessionData}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {pushToDatabase.isPending ? "Retrying..." : "Retry"}
              </Button>
            )}

            <AlertDialogAction
              onClick={handlePushToDatabase}
              disabled={pushToDatabase.isPending || isLoadingSessionData}
            >
              {pushToDatabase.isPending
                ? "Publishing..."
                : "Publish to Database"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Sheet Metadata Dialog */}
      <AlertDialog
        open={editSheetDialogOpen}
        onOpenChange={setEditSheetDialogOpen}
      >
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Sheet Metadata</AlertDialogTitle>
            <AlertDialogDescription>
              Update the interview sheet metadata and settings.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Error Display */}
          {editSheetError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-700 font-medium">Error:</p>
              <p className="text-sm text-red-600 mt-1">{editSheetError}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Information Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-3 text-gray-700">
                Basic Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name *
                  </label>
                  <Input
                    value={editSheetMetadata.name}
                    onChange={(e) =>
                      setEditSheetMetadata((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Interview sheet name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Slug *
                  </label>
                  <Input
                    value={editSheetMetadata.slug}
                    onChange={(e) =>
                      setEditSheetMetadata((prev) => ({
                        ...prev,
                        slug: e.target.value,
                      }))
                    }
                    placeholder="URL-friendly identifier"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL-friendly identifier
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Roadmap *
                  </label>
                  <Input
                    value={editSheetMetadata.roadmap}
                    onChange={(e) =>
                      setEditSheetMetadata((prev) => ({
                        ...prev,
                        roadmap: e.target.value,
                      }))
                    }
                    placeholder="e.g., Tech, DSA, Frontend"
                  />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-3 text-gray-700">
                Content
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Textarea
                    value={editSheetMetadata.description}
                    onChange={(e) =>
                      setEditSheetMetadata((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Sheet description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Meta Information
                  </label>
                  <Textarea
                    value={editSheetMetadata.meta}
                    onChange={(e) =>
                      setEditSheetMetadata((prev) => ({
                        ...prev,
                        meta: e.target.value,
                      }))
                    }
                    placeholder="Additional metadata"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    SEO and additional information
                  </p>
                </div>
              </div>
            </div>

            {/* Media Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-3 text-gray-700">
                Media
              </h3>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cover Image URL
                </label>
                <Input
                  value={editSheetMetadata.coverImageURL}
                  onChange={(e) =>
                    setEditSheetMetadata((prev) => ({
                      ...prev,
                      coverImageURL: e.target.value,
                    }))
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-3 text-gray-700">
                Pricing
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editIsPremium"
                    checked={editSheetMetadata.isPremium}
                    onChange={(e) =>
                      setEditSheetMetadata((prev) => ({
                        ...prev,
                        isPremium: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <label
                    htmlFor="editIsPremium"
                    className="text-sm font-medium"
                  >
                    Premium Sheet
                  </label>
                </div>

                {editSheetMetadata.isPremium && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Price (₹)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={editSheetMetadata.price}
                        onChange={(e) =>
                          setEditSheetMetadata((prev) => ({
                            ...prev,
                            price: parseInt(e.target.value) || 0,
                          }))
                        }
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Discount Percentage (%)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editSheetMetadata.discountPercentage}
                        onChange={(e) =>
                          setEditSheetMetadata((prev) => ({
                            ...prev,
                            discountPercentage: parseInt(e.target.value) || 0,
                          }))
                        }
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Applied Coupon (Optional)
                      </label>
                      <Input
                        value={editSheetMetadata.appliedCoupon || ""}
                        onChange={(e) =>
                          setEditSheetMetadata((prev) => ({
                            ...prev,
                            appliedCoupon: e.target.value || null,
                          }))
                        }
                        placeholder="Coupon code"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Features Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-3 text-gray-700">
                Features (Optional)
              </h3>
              <div className="space-y-2">
                {editSheetMetadata.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...editSheetMetadata.features];
                        newFeatures[index] = e.target.value;
                        setEditSheetMetadata((prev) => ({
                          ...prev,
                          features: newFeatures,
                        }));
                      }}
                      placeholder="Feature name"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newFeatures = editSheetMetadata.features.filter(
                          (_, i) => i !== index,
                        );
                        setEditSheetMetadata((prev) => ({
                          ...prev,
                          features: newFeatures,
                        }));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditSheetMetadata((prev) => ({
                      ...prev,
                      features: [...prev.features, ""],
                    }));
                  }}
                >
                  + Add Feature
                </Button>
              </div>
            </div>

            {/* Publication Settings Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-3 text-gray-700">
                Publication Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Go Live Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={editSheetMetadata.liveOn.toISOString().slice(0, 16)}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      setEditSheetMetadata((prev) => ({
                        ...prev,
                        liveOn: date,
                      }));
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    When this sheet goes live
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Frequency (Optional)
                  </label>
                  <Input
                    value={editSheetMetadata.frequency}
                    onChange={(e) =>
                      setEditSheetMetadata((prev) => ({
                        ...prev,
                        frequency: e.target.value,
                      }))
                    }
                    placeholder="e.g., Daily, Weekly, Monthly"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Priority (Optional)
                  </label>
                  <Input
                    value={editSheetMetadata.priority}
                    onChange={(e) =>
                      setEditSheetMetadata((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                    placeholder="e.g., High, Medium, Low"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Company Types (Optional)
                  </label>
                  <Input
                    value={editSheetMetadata.companyTypes.join(", ")}
                    onChange={(e) =>
                      setEditSheetMetadata((prev) => ({
                        ...prev,
                        companyTypes: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter((t) => t),
                      }))
                    }
                    placeholder="e.g., FAANG, Startups, MNC (comma-separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Resource Link (Optional)
                  </label>
                  <Input
                    value=""
                    onChange={(e) =>
                      setEditSheetMetadata((prev) => ({
                        ...prev,
                        resources: [],
                      }))
                    }
                    placeholder="https://..."
                    type="url"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Link to external resources for this sheet
                  </p>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="flex gap-2 justify-end">
            <AlertDialogCancel
              onClick={() => {
                setEditSheetDialogOpen(false);
                setSheetToEdit(null);
                setEditSheetError(null);
              }}
            >
              Cancel
            </AlertDialogCancel>

            {editSheetError && (
              <Button
                onClick={handleUpdateSheetMetadata}
                disabled={updateSheetMetadata.isPending}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {updateSheetMetadata.isPending ? "Retrying..." : "Retry"}
              </Button>
            )}

            <AlertDialogAction
              onClick={handleUpdateSheetMetadata}
              disabled={updateSheetMetadata.isPending}
            >
              {updateSheetMetadata.isPending ? "Updating..." : "Update Sheet"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Review Dialog */}
      <InterviewSheetReviewer
        id={reviewSheetId || reviewSessionId}
        type={reviewSheetId ? "sheet" : reviewSessionId ? "session" : null}
        onClose={() => {
          setReviewSheetId(null);
          setReviewSessionId(null);
        }}
      />
    </div>
  );
};

export default InterviewPrepPage;
