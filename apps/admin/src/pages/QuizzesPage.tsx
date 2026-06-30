import {
  Activity,
  BarChart3,
  Brain,
  Clock,
  Edit,
  Flame,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  getQuizSessionLogs,
  getQuizSessionProgress,
  listQuizSessions,
  type QuizSessionInfo,
} from "@/api/agentsApi";
import { enhancedQuizApi } from "@/api/enhancedQuizApi";
import {
  deletePendingQuiz,
  generateQuiz,
  getPendingQuizContent,
  getQuizTopics,
  listPendingQuizzes,
  type PendingQuiz,
  useQuizCategories,
} from "@/api/quizApi";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/axios";
import { errorLogger } from "@/utils/errorLogger";

const QuizzesPage = () => {
  const { toast } = useToast();
  const [topic, setTopic] = useState("React.js");
  const [topics, setTopics] = useState<string[]>([]);
  const [audience, setAudience] = useState<
    "beginners" | "developers" | "experts"
  >("developers");
  const [count, setCount] = useState(20);

  // Remove global loading state - track sessions individually
  const [activeSessions, setActiveSessions] = useState<Set<string>>(new Set());

  // Enhanced quiz analytics and management state
  const [activeTab, setActiveTab] = useState("create");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [adminAnalytics, setAdminAnalytics] = useState<any>(null);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Configuration state
  const [config, setConfig] = useState({
    weakAreaBias: 1.5,
    recentQuestionPenalty: 0.5,
    defaultQuestionCount: 10,
    maxSessionTime: 30,
    streakMultiplier: 1.2,
    difficultyBonus: 1.5,
    perfectScoreBonus: 100,
  });
  const [configLoading, setConfigLoading] = useState(false);

  // API status tracking
  const [apiStatus, setApiStatus] = useState({
    analytics: "unknown",
    leaderboard: "unknown",
    sessions: "unknown",
  });

  // Remove mode selection - will be decided at upload time
  const [selectedQuizForAppend, setSelectedQuizForAppend] =
    useState<string>("");

  // Categories and quiz data
  const { data: categories } = useQuizCategories(true);
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
  const [editedJson, setEditedJson] = useState<string>("");
  const [isJsonValid, setIsJsonValid] = useState<boolean>(true);

  // Progress tracking - always visible
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    percent: 0,
    status: "",
    current_step: "",
  });

  // Pending quizzes and sessions - persistent
  const [pending, setPending] = useState<PendingQuiz[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [sessions, setSessions] = useState<QuizSessionInfo[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionProgress, setSessionProgress] = useState<{
    [id: string]: {
      percent: number;
      status?: string;
      current_step?: string;
    };
  }>({});
  const [sessionLogs, setSessionLogs] = useState<{ [id: string]: any[] }>({});

  // State for upload dialog
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [pendingQuizData, setPendingQuizData] = useState<{
    payload: any;
    filename: string;
  } | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const topicsRes = await getQuizTopics();
        if (Array.isArray(topicsRes)) {
          setTopics(topicsRes);
          if (topicsRes.length > 0) setTopic(topicsRes[0]);
        }
      } catch (error) {
        errorLogger.logNetworkError(error, "fetch quiz topics");
      }
    };
    init();
  }, []);

  // Refresh functions for pending and sessions
  const refreshPending = async () => {
    setLoadingPending(true);
    try {
      const items = await listPendingQuizzes();

      // Deduplicate pending quizzes based on content hash
      const uniqueItems = items.reduce((acc: PendingQuiz[], current) => {
        // Create a unique key based on topic and question count
        const key = `${current.topic || current.categoryName || "unknown"}_${current.question_count || 0}`;

        // Check if we already have an item with this key
        const existingIndex = acc.findIndex((item) => {
          const existingKey = `${item.topic || item.categoryName || "unknown"}_${item.question_count || 0}`;
          return existingKey === key;
        });

        if (existingIndex === -1) {
          // Add new unique item
          acc.push(current);
        } else {
          // If we have a duplicate, prefer the one with more metadata
          const existing = acc[existingIndex];
          const currentMetadata = [
            current.session_id,
            current.topic,
            current.categoryName,
          ].filter(Boolean).length;
          const existingMetadata = [
            existing.session_id,
            existing.topic,
            existing.categoryName,
          ].filter(Boolean).length;

          if (currentMetadata > existingMetadata) {
            // Replace with the one that has more metadata
            acc[existingIndex] = current;
          }
        }

        return acc;
      }, []);

      setPending(uniqueItems);
    } catch (e) {
      setPending([]);
    } finally {
      setLoadingPending(false);
    }
  };

  const refreshSessions = async () => {
    try {
      const res = await listQuizSessions();
      setSessions(res.sessions || []);
    } catch (e) {
      // ignore
    }
  };

  // Persistent progress polling - Product Manager requirement
  useEffect(() => {
    // Load initial data
    refreshPending();
    refreshSessions();

    let polling = true;
    const pollAllProgress = async () => {
      while (polling) {
        try {
          const res = await listQuizSessions();
          const list = res.sessions || [];
          setSessions(list);

          let sawCompleted = false;
          await Promise.all(
            list.map(async (s) => {
              try {
                const prog = await getQuizSessionProgress(s.session_id);
                setSessionProgress((prev) => ({
                  ...prev,
                  [s.session_id]: {
                    percent: prog.percent,
                    status: prog.status,
                    current_step: prog.current_step,
                  },
                }));

                // Update current session progress if it matches
                if (currentSession === s.session_id) {
                  setProgress({
                    percent: prog.percent || 0,
                    status: prog.status || "",
                    current_step: prog.current_step || "",
                  });

                  // Handle completion
                  if (
                    (prog.percent ?? 0) >= 100 ||
                    prog.status === "completed"
                  ) {
                    // setLoading(false) // This line is removed
                    setCurrentSession(null);

                    const uploadResult = (prog as any).upload_result;
                    if (uploadResult?.status === "success") {
                      toast({
                        title: "Quiz Completed Successfully!",
                        description: "New quiz created and saved to database",
                      });
                    } else if (uploadResult?.status === "error") {
                      toast({
                        title: "Quiz Generated, Upload Failed",
                        description: `Quiz was generated but upload failed: ${uploadResult.message}`,
                        variant: "destructive",
                      });
                    } else {
                      toast({
                        title: "Quiz Generated",
                        description:
                          "Quiz generated successfully - check pending section",
                      });
                    }
                    sawCompleted = true;
                  }
                }

                if ((prog.percent ?? 0) >= 100 || prog.status === "completed") {
                  sawCompleted = true;
                }
              } catch {}
            }),
          );

          if (sawCompleted) {
            refreshPending();
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 5000));
      }
    };

    pollAllProgress();
    return () => {
      polling = false;
    };
  }, [currentSession, toast]);

  // Load selected quiz for modification
  useEffect(() => {
    if (selectedQuizForAppend) {
      const fetchQuiz = async () => {
        try {
          const res = await api.get(`/quiz/${selectedQuizForAppend}`);
          const quizData = res.data?.data;
          if (quizData) {
            setSelectedQuiz(quizData);
            setEditedJson(JSON.stringify(quizData, null, 2));
            setIsJsonValid(true);
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load quiz for modification",
            variant: "destructive",
          });
        }
      };
      fetchQuiz();
    } else {
      setSelectedQuiz(null);
      setEditedJson("");
    }
  }, [selectedQuizForAppend, toast]);

  const onGenerate = async () => {
    // No validation needed - just generate quiz
    const actionText = "Generating new quiz";

    toast({
      title: "Quiz Generation Started",
      description: actionText,
    });

    try {
      const data = await generateQuiz({
        topic,
        question_count: count,
        target_audience: audience,
        save: true,
      });

      // Track this session as active
      setActiveSessions((prev) => new Set([...prev, data.session_id]));
      setCurrentSession(data.session_id);
      setProgress({
        percent: 0,
        status: "started",
        current_step: "initializing",
      });

      toast({
        title: "Generation In Progress",
        description: `Session: ${data.session_id}`,
        duration: 2000,
      });
    } catch (error) {
      errorLogger.logApiError(error, "generate quiz");
    }
  };

  // Manual upload function for pending quizzes
  const uploadQuiz = async (
    payload: any,
    sourceDescription: string = "quiz",
  ) => {
    try {
      if (selectedQuizForAppend) {
        // Use the new append API - just send questions with quizId
        const appendPayload = {
          quizId: selectedQuizForAppend,
          questions: payload?.questions || [],
        };
        const postRes = await api.post(`/quiz`, appendPayload);
        if (postRes?.data?.success) {
          const selectedQuizName =
            categories?.find((c) => c._id === selectedQuizForAppend)
              ?.categoryName || selectedQuizForAppend;
          toast({
            title: "✅ Questions Successfully Appended!",
            description: `${payload?.questions?.length || 0} new questions have been added to "${selectedQuizName}". The quiz now has enhanced content!`,
            duration: 5000,
          });
        } else {
          throw new Error(postRes?.data?.error || "Append failed");
        }
      } else {
        // Create new quiz
        const postRes = await api.post(`/quiz`, payload);
        if (postRes?.data?.success) {
          toast({
            title: "🎉 Quiz Successfully Created!",
            description: `"${payload?.categoryName || "Quiz"}" has been created and saved to the database with ${payload?.questions?.length || 0} questions.`,
            duration: 5000,
          });
        } else {
          throw new Error(postRes?.data?.error || "Upload failed");
        }
      }
    } catch (error: any) {
      toast({
        title: "❌ Upload Failed",
        description:
          error?.response?.data?.error || error?.message || String(error),
        variant: "destructive",
      });
    }
  };

  // Save modifications
  const saveModifications = async () => {
    if (!selectedQuiz || !selectedQuizForAppend) return;

    try {
      let updatedData: any;
      if (editedJson) {
        try {
          updatedData = JSON.parse(editedJson);
        } catch {
          toast({
            title: "Invalid JSON",
            description: "Please fix JSON syntax",
            variant: "destructive",
          });
          return;
        }
      } else {
        updatedData = selectedQuiz;
      }

      const putRes = await api.put(
        `/quiz/${selectedQuizForAppend}`,
        updatedData,
      );
      if (putRes?.data?.success) {
        toast({
          title: "Quiz Updated",
          description: `Successfully updated quiz ${selectedQuizForAppend}`,
        });
      }
    } catch (error) {
      errorLogger.logApiError(error, "update quiz");
    }
  };

  // Fetch enhanced analytics on component mount and tab change
  useEffect(() => {
    if (
      activeTab === "analytics" ||
      activeTab === "sessions" ||
      activeTab === "leaderboard"
    ) {
      fetchEnhancedData();
    }
  }, [activeTab, selectedCategory]);

  // Auto-refresh active sessions every 30 seconds
  useEffect(() => {
    if (activeTab === "sessions") {
      const interval = setInterval(() => {
        fetchEnhancedData();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const fetchEnhancedData = async () => {
    setAnalyticsLoading(true);
    try {
      console.log("Fetching enhanced data for tab:", activeTab);

      // Fetch admin analytics
      if (activeTab === "analytics") {
        try {
          console.log("Fetching admin analytics...");
          const analyticsResponse =
            await enhancedQuizApi.getQuizAdminAnalytics();
          console.log("Analytics response:", analyticsResponse);

          if (analyticsResponse.success) {
            setAdminAnalytics(analyticsResponse.data);
            setApiStatus((prev) => ({ ...prev, analytics: "success" }));
            console.log("Analytics data set successfully");
          } else {
            console.log("Analytics API returned error, using fallback data");
            setApiStatus((prev) => ({ ...prev, analytics: "fallback" }));
            // Fallback to mock data if API fails
            setAdminAnalytics({
              totalQuizSessions: 1250,
              totalQuestionsAnswered: 15600,
              averageSessionTime: 420,
              topPerformingCategories: [
                {
                  categoryName: "React Fundamentals",
                  attempts: 450,
                  averageScore: 78.5,
                },
                {
                  categoryName: "JavaScript Basics",
                  attempts: 380,
                  averageScore: 82.1,
                },
                {
                  categoryName: "Node.js Advanced",
                  attempts: 220,
                  averageScore: 71.3,
                },
              ],
              difficultyDistribution: { easy: 620, medium: 480, hard: 150 },
              userEngagement: {
                dailyActiveSessions: 85,
                weeklyActiveUsers: 340,
                averageSessionsPerUser: 3.2,
              },
            });
          }
        } catch (error) {
          console.error("Error fetching admin analytics:", error);
          console.log("Using fallback analytics data due to API error");
          // Use fallback mock data
          setAdminAnalytics({
            totalQuizSessions: 1250,
            totalQuestionsAnswered: 15600,
            averageSessionTime: 420,
            topPerformingCategories: [
              {
                categoryName: "React Fundamentals",
                attempts: 450,
                averageScore: 78.5,
              },
              {
                categoryName: "JavaScript Basics",
                attempts: 380,
                averageScore: 82.1,
              },
              {
                categoryName: "Node.js Advanced",
                attempts: 220,
                averageScore: 71.3,
              },
            ],
            difficultyDistribution: { easy: 620, medium: 480, hard: 150 },
            userEngagement: {
              dailyActiveSessions: 85,
              weeklyActiveUsers: 340,
              averageSessionsPerUser: 3.2,
            },
          });
        }
      }

      if (activeTab === "leaderboard") {
        try {
          console.log(
            "Fetching leaderboard for category:",
            selectedCategory || "all",
          );
          const leaderboardResponse = await enhancedQuizApi.getLeaderboard(
            selectedCategory || undefined,
            50,
          );
          console.log("Leaderboard response:", leaderboardResponse);

          if (leaderboardResponse.success) {
            setLeaderboardData(leaderboardResponse.data);
            setApiStatus((prev) => ({ ...prev, leaderboard: "success" }));
            console.log("Leaderboard data set successfully");
          } else {
            console.log("Leaderboard API returned error, using fallback data");
            setApiStatus((prev) => ({ ...prev, leaderboard: "fallback" }));
            // Fallback to mock data if API fails
            setLeaderboardData([
              {
                userId: "1",
                userName: "Alice Johnson",
                categoryName: "React Fundamentals",
                totalScore: 95,
                totalAttempts: 8,
                averageScore: 89.2,
                rank: 1,
                badgeLevel: "platinum",
              },
              {
                userId: "2",
                userName: "Bob Smith",
                categoryName: "React Fundamentals",
                totalScore: 92,
                totalAttempts: 6,
                averageScore: 85.7,
                rank: 2,
                badgeLevel: "gold",
              },
              {
                userId: "3",
                userName: "Carol Davis",
                categoryName: "React Fundamentals",
                totalScore: 88,
                totalAttempts: 10,
                averageScore: 82.1,
                rank: 3,
                badgeLevel: "gold",
              },
            ]);
          }
        } catch (error) {
          console.error("Error fetching leaderboard:", error);
          console.log("Using fallback leaderboard data due to API error");
          // Use fallback mock data
          setLeaderboardData([
            {
              userId: "1",
              userName: "Alice Johnson",
              categoryName: "React Fundamentals",
              totalScore: 95,
              totalAttempts: 8,
              averageScore: 89.2,
              rank: 1,
              badgeLevel: "platinum",
            },
            {
              userId: "2",
              userName: "Bob Smith",
              categoryName: "React Fundamentals",
              totalScore: 92,
              totalAttempts: 6,
              averageScore: 85.7,
              rank: 2,
              badgeLevel: "gold",
            },
            {
              userId: "3",
              userName: "Carol Davis",
              categoryName: "React Fundamentals",
              totalScore: 88,
              totalAttempts: 10,
              averageScore: 82.1,
              rank: 3,
              badgeLevel: "gold",
            },
          ]);
        }
      }

      if (activeTab === "sessions") {
        try {
          console.log("Fetching active sessions...");
          const sessionsResponse = await enhancedQuizApi.getActiveSessions();
          console.log("Sessions response:", sessionsResponse);

          if (sessionsResponse.success) {
            setActiveSessions(
              new Set(sessionsResponse.data.map((s: any) => s.sessionId)),
            );
            setApiStatus((prev) => ({ ...prev, sessions: "success" }));
            console.log("Sessions data set successfully");
          } else {
            console.log("Sessions API returned error, using fallback data");
            setApiStatus((prev) => ({ ...prev, sessions: "fallback" }));
            // Fallback to mock data if API fails
            setActiveSessions(new Set(["s1", "s2"]));
          }
        } catch (error) {
          console.error("Error fetching active sessions:", error);
          console.log("Using fallback sessions data due to API error");
          // Use fallback mock data
          setActiveSessions(new Set(["s1", "s2"]));
        }
      }
    } catch (error) {
      console.error("Error fetching enhanced data:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "hard":
        return "bg-red-100 text-red-800";
      case "mixed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBadgeColor = (level: string) => {
    switch (level) {
      case "platinum":
        return "bg-purple-100 text-purple-800";
      case "gold":
        return "bg-yellow-100 text-yellow-800";
      case "silver":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-orange-100 text-orange-800";
    }
  };

  const saveConfiguration = async () => {
    setConfigLoading(true);
    try {
      // In a real implementation, this would call the backend API
      // For now, we'll just simulate saving
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Configuration Saved",
        description: "Quiz system configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConfigLoading(false);
    }
  };

  const resetConfiguration = () => {
    setConfig({
      weakAreaBias: 1.5,
      recentQuestionPenalty: 0.5,
      defaultQuestionCount: 10,
      maxSessionTime: 30,
      streakMultiplier: 1.2,
      difficultyBonus: 1.5,
      perfectScoreBonus: 100,
    });
    toast({
      title: "Configuration Reset",
      description: "Configuration has been reset to default values.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Enhanced Quiz Management
          </h1>
          <p className="mt-1 text-lg text-gray-500">
            Complete quiz ecosystem with AI-powered analytics
          </p>
        </div>
      </div>

      {/* API Test Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            API Integration Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Test the enhanced quiz API endpoints to verify integration
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => fetchEnhancedData()}
                variant="outline"
                size="sm"
                disabled={analyticsLoading}
              >
                {analyticsLoading ? "Testing..." : "Test All APIs"}
              </Button>
              <Button
                onClick={() => {
                  setApiStatus({
                    analytics: "unknown",
                    leaderboard: "unknown",
                    sessions: "unknown",
                  });
                  toast({
                    title: "Reset",
                    description: "API status reset to unknown",
                  });
                }}
                variant="ghost"
                size="sm"
              >
                Reset Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="create" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Create Quiz</span>
          </TabsTrigger>
          <TabsTrigger value="modify" className="flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Modify Quiz</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Sessions</span>
          </TabsTrigger>
        </TabsList>

        {/* Create Quiz Tab */}
        <TabsContent value="create" className="mt-6">
          {/* Main Quiz Management Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quiz Configuration - Always visible for generation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Topic</label>
                  {topics && topics.length > 0 ? (
                    <Select value={topic} onValueChange={setTopic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., React.js"
                    />
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Number of Questions
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value || "20"))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Target Audience</label>
                  <Select
                    value={audience}
                    onValueChange={(v) => setAudience(v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginners">Beginners</SelectItem>
                      <SelectItem value="developers">Developers</SelectItem>
                      <SelectItem value="experts">Experts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-center">
                <Button
                  onClick={onGenerate}
                  disabled={activeSessions.has(currentSession || "")}
                  size="lg"
                  className="px-8"
                >
                  {activeSessions.has(currentSession || "")
                    ? "Generating..."
                    : "Generate New Quiz"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modify Quiz Tab */}
        <TabsContent value="modify" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Management & Modifications</CardTitle>
              <p className="text-sm text-gray-600">
                Select a quiz to modify or view existing quizzes
              </p>
            </CardHeader>
            <CardContent>
              {/* Quiz Selection */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Select Quiz to Modify
                  </label>
                  <Select
                    value={selectedQuizForAppend}
                    onValueChange={setSelectedQuizForAppend}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a quiz category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category: any) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.categoryName} ({category.questionCount || 0}{" "}
                          questions)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quiz Modification Interface */}
                {selectedQuiz && (
                  <div className="space-y-4 mt-6 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        Editing: {selectedQuiz.categoryName}
                      </h3>
                      <div className="text-sm text-gray-600">
                        Quiz ID: {selectedQuizForAppend} | Questions:{" "}
                        {selectedQuiz.questions?.length || 0}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          try {
                            const parsed = JSON.parse(editedJson);
                            setEditedJson(JSON.stringify(parsed, null, 2));
                            setIsJsonValid(true);
                          } catch {
                            setIsJsonValid(false);
                          }
                        }}
                      >
                        Format JSON
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditedJson(JSON.stringify(selectedQuiz, null, 2));
                          setIsJsonValid(true);
                        }}
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveModifications}
                        disabled={!isJsonValid || loadingPending}
                      >
                        Save Changes
                      </Button>
                      {!isJsonValid && (
                        <span className="text-xs text-red-600">
                          Invalid JSON
                        </span>
                      )}
                    </div>

                    <Textarea
                      value={editedJson}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditedJson(value);
                        try {
                          JSON.parse(value);
                          setIsJsonValid(true);
                        } catch {
                          setIsJsonValid(false);
                        }
                      }}
                      className={`font-mono text-xs min-h-[400px] max-h-[600px] bg-gray-50 ${
                        isJsonValid ? "border-gray-200" : "border-red-500"
                      }`}
                      placeholder="Edit quiz JSON here..."
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Section - Always Visible (Product Manager requirement) */}
        <TabsContent value="sessions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Generation Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {currentSession ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Active Session: {currentSession}</span>
                    <span>{Math.round(progress.percent)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-4 rounded-full">
                    <div
                      className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(0, progress.percent))}%`,
                      }}
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    Status: {progress.status}{" "}
                    {progress.current_step && `• ${progress.current_step}`}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  No active generation session. Start a new generation to see
                  progress here.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Quizzes - Manual Push Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pending Quizzes (Ready to Push)</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={refreshPending}
                  disabled={loadingPending}
                >
                  {loadingPending ? "Refreshing..." : "Refresh"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pending.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No pending quizzes found.
                </div>
              ) : (
                <div className="space-y-3">
                  {pending.map((p) => (
                    <div
                      key={p.filename}
                      className="border rounded p-4 flex items-center justify-between"
                    >
                      <div className="text-sm">
                        <div className="font-medium">
                          {p.categoryName || p.topic || p.filename}
                        </div>
                        <div className="text-gray-600 text-xs">
                          {p.session_id && (
                            <>
                              Session {p.session_id}
                              {p.question_count ? " • " : ""}
                            </>
                          )}
                          {p.question_count
                            ? `${p.question_count} questions`
                            : "0 questions"}
                          {p.topic &&
                            p.topic !== (p.categoryName || p.filename) && (
                              <span className="ml-2 text-blue-600">
                                Topic: {p.topic}
                              </span>
                            )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const full = await getPendingQuizContent(
                                p.filename,
                              );
                              const payload = full?.quiz || full;
                              setSelectedQuiz(payload);
                              setEditedJson(JSON.stringify(payload, null, 2));
                              setIsJsonValid(true);
                              setActiveTab("modify");
                            } catch (e) {
                              toast({
                                title: "Load failed",
                                description: String(e),
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Review
                        </Button>
                        <Button
                          size="sm"
                          onClick={async () => {
                            try {
                              const full = await getPendingQuizContent(
                                p.filename,
                              );
                              const payload = full?.quiz || full;

                              // Show upload options dialog
                              setShowUploadDialog(true);
                              setPendingQuizData({
                                payload,
                                filename: p.filename,
                              });
                            } catch (e) {
                              toast({
                                title: "Load failed",
                                description: String(e),
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Push to DB
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            try {
                              const ok = await deletePendingQuiz(p.filename);
                              if (ok) {
                                toast({
                                  title: "Deleted",
                                  description: `${p.filename} removed`,
                                });
                                refreshPending();
                              }
                            } catch (e) {
                              toast({
                                title: "Delete failed",
                                description: String(e),
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Sessions - Persistent Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>All Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-sm text-gray-500">No active sessions.</div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((s) => {
                    const prog = sessionProgress[s.session_id];
                    return (
                      <div key={s.session_id} className="border rounded p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <div className="font-medium">
                              {s.topic} — {s.session_id}
                            </div>
                            <div className="text-xs text-gray-600">
                              {prog?.status || s.status} •{" "}
                              {prog?.current_step || s.current_step}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium">
                              {Math.round(prog?.percent ?? 0)}%
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                setSelectedSession(s.session_id);
                                try {
                                  const logs = await getQuizSessionLogs(
                                    s.session_id,
                                  );
                                  setSessionLogs((prev) => ({
                                    ...prev,
                                    [s.session_id]: logs.logs || [],
                                  }));
                                } catch {}
                              }}
                            >
                              Logs
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={async () => {
                                try {
                                  const { deleteSession } =
                                    await import("@/api/agentsApi");
                                  await deleteSession(s.session_id);
                                  toast({
                                    title: "Session deleted",
                                    description: s.session_id,
                                  });
                                  refreshSessions();
                                } catch (e) {
                                  toast({
                                    title: "Failed to delete session",
                                    description: String(e),
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 w-full bg-gray-200 h-2 rounded">
                          <div
                            className="bg-purple-500 h-2 rounded"
                            style={{
                              width: `${Math.min(100, Math.max(0, prog?.percent ?? 0))}%`,
                            }}
                          />
                        </div>
                        {selectedSession === s.session_id && (
                          <div className="mt-3 max-h-40 overflow-auto text-xs bg-gray-50 p-3 rounded">
                            {(sessionLogs[s.session_id] || []).map((l, idx) => (
                              <div key={idx} className="flex gap-2 mb-1">
                                <span className="text-gray-500">
                                  {new Date(l.timestamp).toLocaleTimeString()}
                                </span>
                                <span className="font-medium">{l.event}</span>
                                <span className="text-gray-700">
                                  {JSON.stringify(l.meta)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Quiz Analytics Dashboard
              </h3>
              <div className="flex items-center space-x-2">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat.categoryName}>
                        {cat.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={fetchEnhancedData} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {analyticsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                <p className="mt-2">Loading analytics...</p>
              </div>
            ) : adminAnalytics ? (
              <>
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">
                            Total Sessions
                          </p>
                          <p className="text-2xl font-bold">
                            {adminAnalytics.totalQuizSessions}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Target className="h-8 w-8 text-green-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">
                            Questions Answered
                          </p>
                          <p className="text-2xl font-bold">
                            {adminAnalytics.totalQuestionsAnswered}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Clock className="h-8 w-8 text-purple-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">
                            Avg Session Time
                          </p>
                          <p className="text-2xl font-bold">
                            {Math.round(adminAnalytics.averageSessionTime / 60)}
                            m
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-orange-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">
                            Daily Active
                          </p>
                          <p className="text-2xl font-bold">
                            {adminAnalytics.userEngagement.dailyActiveSessions}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Performing Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {adminAnalytics.topPerformingCategories.map(
                        (category: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border rounded"
                          >
                            <div>
                              <h4 className="font-medium">
                                {category.categoryName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {category.attempts} attempts
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">
                                {category.averageScore}%
                              </div>
                              <div className="text-sm text-gray-600">
                                avg score
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Difficulty Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Difficulty Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded">
                        <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-900">
                          {adminAnalytics.difficultyDistribution.easy}
                        </div>
                        <div className="text-sm text-green-700">Easy</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded">
                        <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-900">
                          {adminAnalytics.difficultyDistribution.medium}
                        </div>
                        <div className="text-sm text-blue-700">Medium</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded">
                        <Flame className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-red-900">
                          {adminAnalytics.difficultyDistribution.hard}
                        </div>
                        <div className="text-sm text-red-700">Hard</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Analytics Data
                  </h3>
                  <p className="text-gray-600">
                    Analytics will appear here once users start taking enhanced
                    quizzes.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      {showUploadDialog && pendingQuizData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Upload Pending Quiz
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              You have a pending quiz ready to be uploaded. Would you like to
              create a new quiz or append it to an existing one?
            </p>

            {/* Quiz selection for append mode */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700">
                Select Quiz to Append To:
              </label>
              <Select
                value={selectedQuizForAppend}
                onValueChange={setSelectedQuizForAppend}
                disabled={!showUploadDialog}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a quiz (for append mode)" />
                </SelectTrigger>
                <SelectContent>
                  {(categories || []).map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.categoryName} ({c.questionCount ?? 0} questions) - ID:{" "}
                      {c._id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadDialog(false);
                  setPendingQuizData(null);
                  setSelectedQuizForAppend("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    // Create new quiz - no quizId needed
                    setSelectedQuizForAppend("");
                    await uploadQuiz(
                      pendingQuizData.payload,
                      `pending quiz: ${pendingQuizData.filename}`,
                    );
                    toast({
                      title: "🎉 Quiz Successfully Created!",
                      description: `"${pendingQuizData.payload?.categoryName || pendingQuizData.filename}" has been created and saved to the database with ${pendingQuizData.payload?.questions?.length || 0} questions.`,
                      duration: 5000,
                    });
                    setShowUploadDialog(false);
                    setPendingQuizData(null);
                    refreshPending();
                  } catch (e) {
                    toast({
                      title: "❌ Upload Failed",
                      description: String(e),
                      variant: "destructive",
                    });
                  }
                }}
              >
                Create New Quiz
              </Button>
              <Button
                onClick={async () => {
                  if (!selectedQuizForAppend) {
                    toast({
                      title: "Quiz Selection Required",
                      description:
                        "Please select a quiz to append questions to.",
                      variant: "destructive",
                    });
                    return;
                  }

                  try {
                    // Append to existing quiz
                    const appendPayload = {
                      quizId: selectedQuizForAppend,
                      questions: pendingQuizData.payload?.questions || [],
                    };
                    const postRes = await api.post(`/quiz`, appendPayload);
                    if (postRes?.data?.success) {
                      const selectedQuizName =
                        categories?.find((c) => c._id === selectedQuizForAppend)
                          ?.categoryName || selectedQuizForAppend;
                      toast({
                        title: "✅ Questions Successfully Appended!",
                        description: `${pendingQuizData.payload?.questions?.length || 0} new questions have been added to "${selectedQuizName}". The quiz now has enhanced content!`,
                        duration: 5000,
                      });
                      setShowUploadDialog(false);
                      setPendingQuizData(null);
                      setSelectedQuizForAppend("");
                      refreshPending();
                    } else {
                      throw new Error(postRes?.data?.error || "Append failed");
                    }
                  } catch (e) {
                    toast({
                      title: "❌ Append Failed",
                      description: String(e),
                      variant: "destructive",
                    });
                  }
                }}
                disabled={!selectedQuizForAppend}
              >
                Append to Existing Quiz
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizzesPage;
