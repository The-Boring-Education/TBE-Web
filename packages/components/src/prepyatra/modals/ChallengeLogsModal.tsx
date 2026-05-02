import { challengesService } from "@tbe/services";
import type { Challenge, ChallengeLog } from "@tbe/types";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Copy,
  Facebook,
  Linkedin,
  Share2,
  Target,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import Button from "../../common/Buttons/Button";
import LoadingSpinner from "../../common/LoadingSpinner";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface ChallengeLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
}

const ChallengeLogsModal = ({
  isOpen,
  onClose,
  challenge,
}: ChallengeLogsModalProps) => {
  const [logs, setLogs] = useState<ChallengeLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ChallengeLog | null>(null);
  const [showSocialPreview, setShowSocialPreview] = useState(false);
  const [socialMessage, setSocialMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0);

  useEffect(() => {
    if (isOpen && challenge._id) {
      fetchLogs();
    }
  }, [isOpen, challenge._id]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const challengeLogs = await challengesService.getLogs(challenge._id);
      setLogs(challengeLogs.sort((a, b) => b.day - a.day)); // Sort by day descending
    } catch (error) {
      console.error("Error fetching challenge logs:", error);
      toast.error("Failed to fetch challenge logs");
    } finally {
      setLoading(false);
    }
  };

  const generateSocialMessage = (
    log: ChallengeLog,
    templateIndex: number = 0,
  ) => {
    const progressPercentage = Math.round(
      (log.day / challenge.totalDays) * 100,
    );
    const appUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const templates = [
      // Template 1: Casual and friendly
      `Just wrapped up Day ${log.day} of my ${challenge.name}! 🎉

Today was pretty productive - ${log.progressText}

Spent ${
        log.hoursSpent
      } hours grinding, and honestly feeling good about the progress! 

For tomorrow, I'm planning to:
${log.nextGoals.map((goal, index) => `${index + 1}. ${goal}`).join("\n")}

${
  progressPercentage >= 90
    ? "Almost there! 🏁"
    : progressPercentage >= 75
      ? "Getting close! 🔥"
      : progressPercentage >= 50
        ? "Halfway point! ⚡"
        : progressPercentage >= 25
          ? "Building momentum! 🚀"
          : "Just getting started! ✨"
}

${
  challenge.category ? `#${challenge.category} ` : ""
}#LearningJourney #PrepYatra

Check out Prep Yatra if you want to start your own challenge! ${appUrl}`,

      // Template 2: Professional and focused
      `📚 Learning Update: Day ${log.day}/${challenge.totalDays} - ${
        challenge.name
      }

✅ Today's Accomplishments:
${log.progressText}

⏱️ Time Investment: ${log.hoursSpent} hours
📊 Progress: ${progressPercentage}% complete

🎯 Next Session Goals:
${log.nextGoals.map((goal, index) => `• ${goal}`).join("\n")}

${
  progressPercentage >= 90
    ? "Final stretch - staying focused on the goal! 🎯"
    : progressPercentage >= 75
      ? "Strong progress - maintaining consistency! 💪"
      : progressPercentage >= 50
        ? "Milestone reached - building solid foundation! 🏗️"
        : progressPercentage >= 25
          ? "Establishing learning rhythm - every day counts! 📈"
          : "Setting the foundation - committed to the process! 🌱"
}

${
  challenge.category ? `#${challenge.category} ` : ""
}#ProfessionalDevelopment #ContinuousLearning #PrepYatra`,

      // Template 3: Motivational and inspiring
      `🚀 Day ${log.day} of my ${challenge.name} journey!

Today I learned: ${log.progressText}

${log.hoursSpent} hours of focused learning later, and I'm feeling inspired! 

My vision for tomorrow:
${log.nextGoals.map((goal, index) => `✨ ${goal}`).join("\n")}

${
  progressPercentage >= 90
    ? "The finish line is calling! 🏁"
    : progressPercentage >= 75
      ? "The momentum is real! 🔥"
      : progressPercentage >= 50
        ? "Halfway there - proving it's possible! ⚡"
        : progressPercentage >= 25
          ? "Every step forward is progress! 🚀"
          : "Just getting started! ✨"
}

Remember: Consistency beats perfection every time! 

${
  challenge.category ? `#${challenge.category} ` : ""
}#Motivation #GrowthMindset #PrepYatra #LearningJourney`,
    ];

    return templates[templateIndex] || templates[0];
  };

  const handleShareLog = (log: ChallengeLog) => {
    setSelectedLog(log);
    const message = generateSocialMessage(log, selectedTemplate);
    setSocialMessage(message || "");
    setShowSocialPreview(true);
  };

  const handleTemplateChange = (templateIndex: number) => {
    setSelectedTemplate(templateIndex);
    if (selectedLog) {
      const message = generateSocialMessage(selectedLog, templateIndex);
      setSocialMessage(message || "");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard! 📋");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const shareToSocial = (platform: string) => {
    // Use the local generateSocialMessage function with the selected log and template
    const message = selectedLog
      ? generateSocialMessage(selectedLog, selectedTemplate)
      : "";
    const encodedText = encodeURIComponent(message || "");
    const appUrl = process.env.NEXT_PUBLIC_BASE_URL;

    let shareUrl = "";
    switch (platform) {
      case "twitter":
        // Updated to use X (Twitter) sharing URL
        shareUrl = `https://x.com/intent/tweet?text=${encodedText}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          appUrl || "",
        )}&summary=${encodedText}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          appUrl || "",
        )}&quote=${encodedText}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
      toast.success(
        `Opening ${platform === "twitter" ? "X (Twitter)" : platform}... 🚀`,
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateOverallProgress = () => {
    if (logs.length === 0) {
      return 0;
    }
    const totalDays = logs.length;
    return Math.round((totalDays / challenge.totalDays) * 100);
  };

  const totalHoursSpent = logs.reduce((sum, log) => sum + log.hoursSpent, 0);
  const averageHoursPerDay =
    logs.length > 0 ? (totalHoursSpent / logs.length).toFixed(1) : 0;

  // Check if challenge is completed
  const isCompleted = challenge.currentDay >= challenge.totalDays;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto glass border-greyLight">
        {!showSocialPreview ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-contentLight flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Challenge Progress Logs
              </DialogTitle>
              <DialogDescription className="text-greyDark">
                View all progress logs for "{challenge.name}"
              </DialogDescription>
            </DialogHeader>

            {/* Challenge Summary */}
            <Card className="bg-white/30 border-greyLight">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-contentLight">
                      {challenge.name}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-greyDark">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {challenge.currentDay + 1} of {challenge.totalDays} days
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {calculateOverallProgress()}% Overall Progress
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {totalHoursSpent}h total • ~{averageHoursPerDay}h/day
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      {challenge.isActive ? "Active" : "Completed"}
                    </Badge>
                    {isCompleted && (
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        <Trophy className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Logs List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-contentLight">
                  Progress Logs ({logs.length})
                </h3>
                {logs.length > 0 && (
                  <Button
                    onClick={() =>
                      handleShareLog(logs[0] || ({} as ChallengeLog))
                    }
                    variant="PRIMARY"
                    size="SMALL"
                    text="Share Latest Progress"
                    className="text-sm h-5"
                  />
                )}
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <LoadingSpinner height={8} width={8} />
                  <p className="text-greyDark mt-2">Loading logs...</p>
                </div>
              ) : logs.length === 0 ? (
                <Card className="bg-white/30 border-greyLight">
                  <CardContent className="pt-6 text-center">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-contentLight mb-2">
                      No progress logs yet
                    </p>
                    <p className="text-greyDark text-sm">
                      Start logging your daily progress to see your journey
                      here!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <Card
                      key={log._id}
                      className="bg-white/30 border-greyLight"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className="bg-primary/20 text-primary border-primary/30">
                              Day {log.day}
                            </Badge>
                            <div className="text-sm text-greyDark">
                              {formatDate(log.loggedAt)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="border-greyLight h-5 text-greyDark"
                            >
                              <Clock className="w-2 h-2 mr-1" />
                              {log.hoursSpent}h
                            </Badge>
                            <Button
                              onClick={() => handleShareLog(log)}
                              variant="OUTLINE"
                              size="SMALL"
                              text="Share"
                              icon={<Share2 className="w-2 h-2 mr-2" />}
                              className="text-sm h-5"
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h4 className="text-contentLight font-medium mb-2">
                            What I worked on:
                          </h4>
                          <p className="text-greyDark text-sm">
                            {log.progressText}
                          </p>
                        </div>

                        {log.nextGoals.length > 0 && (
                          <div>
                            <h4 className="text-contentLight font-medium mb-2">
                              Next goals:
                            </h4>
                            <ul className="space-y-1">
                              {log.nextGoals.map((goal, index) => (
                                <li
                                  key={index}
                                  className="text-greyDark text-sm flex items-center gap-2"
                                >
                                  <span className="text-primary">•</span>
                                  {goal}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={onClose}
                variant="OUTLINE"
                size="SMALL"
                text="Close"
                className="text-sm h-5"
              />
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-contentLight flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                Share Your Progress
              </DialogTitle>
              <DialogDescription className="text-greyDark">
                Share Day {selectedLog?.day} progress on social media
              </DialogDescription>
            </DialogHeader>

            <Card className="bg-white/30 border-greyLight">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  Social Media Post
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Template Selection */}
                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      {
                        name: "Casual & Friendly",
                        icon: "😊",
                        desc: "Perfect for social media",
                      },
                      {
                        name: "Professional & Focused",
                        icon: "💼",
                        desc: "Great for LinkedIn",
                      },
                      {
                        name: "Motivational & Inspiring",
                        icon: "🚀",
                        desc: "Encourage others",
                      },
                    ].map((template, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedTemplate === index
                            ? "border-primary bg-primary/10"
                            : "border-gray-600 bg-gray-800/30 hover:border-gray-500"
                        }`}
                        onClick={() => handleTemplateChange(index)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{template.icon}</span>
                          <div className="flex-1">
                            <div className="text-white font-medium">
                              {template.name}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {template.desc}
                            </div>
                          </div>
                          {selectedTemplate === index && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-600 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans">
                      {socialMessage}
                    </pre>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Copy and Share Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => copyToClipboard(socialMessage || "")}
                      variant="OUTLINE"
                      size="SMALL"
                      text="Copy Text"
                      icon={<Copy className="w-4 h-4 mr-2" />}
                      className="text-sm h-5"
                    />

                    <Button
                      onClick={() => shareToSocial("twitter")}
                      variant="OUTLINE"
                      size="SMALL"
                      text="Copy & Share"
                      icon={<Share2 className="w-4 h-4 mr-2" />}
                      className="text-sm h-5"
                    />
                  </div>

                  {/* Direct Social Media Posting */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => shareToSocial("twitter")}
                        variant="OUTLINE"
                        size="SMALL"
                        text="Twitter"
                        icon={<X className="w-4 h-4 mr-2" />}
                        className="text-sm h-5"
                      />

                      <Button
                        onClick={() => shareToSocial("linkedin")}
                        variant="OUTLINE"
                        size="SMALL"
                        text="LinkedIn"
                        icon={<Linkedin className="w-4 h-4 mr-2" />}
                        className="text-sm h-5"
                      />
                      <Button
                        onClick={() => shareToSocial("facebook")}
                        variant="OUTLINE"
                        size="SMALL"
                        text="Facebook"
                        icon={<Facebook className="w-4 h-4 mr-2" />}
                        className="text-sm h-5"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                onClick={() => setShowSocialPreview(false)}
                variant="OUTLINE"
                size="SMALL"
                text="Back to Logs"
                icon={<ArrowLeft className="w-4 h-4 mr-2" />}
                className="text-sm h-5"
              />
              <Button
                onClick={onClose}
                variant="PRIMARY"
                size="SMALL"
                text="Done"
                icon={<Check className="w-4 h-4 mr-2" />}
                className="text-sm h-5"
              />
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeLogsModal;
