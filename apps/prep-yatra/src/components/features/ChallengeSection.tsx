import { 
  Calendar,
  Flame,
  Plus, 
  Share2,
  Star,
  Target, 
  TrendingUp, 
  Trophy} from "lucide-react";
import {useState} from "react";

import ChallengeCard from "@/components/cards/ChallengeCard";
import ChallengeLogModal from "@/components/modals/ChallengeLogModal";
import ChallengeLogsModal from "@/components/modals/ChallengeLogsModal";
import CreateChallengeModal from "@/components/modals/CreateChallengeModal";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {useChallenges} from "@/hooks/use-challenges";
import type {Challenge} from "@/types/challenges";

interface ChallengeSectionProps {
  userId: string;
  className?: string;
}

const ChallengeSection = ({userId, className = ""}: ChallengeSectionProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const {
    challenges,
    activeChallenges,
    completedChallenges,
    currentChallenge,
    totalDaysCommitted,
    completionRate,
    loading,
    error,
    refetch
  } = useChallenges(userId);

  const handleChallengeCreated = () => {
    refetch();
  };

  const handleChallengeUpdated = () => {
    refetch();
  };

  const handleLogProgress = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsLogModalOpen(true);
  };

  const handleProgressLogged = () => {
    refetch();
    setIsLogModalOpen(false);
    setSelectedChallenge(null);
  };

  const handleViewLogs = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsLogsModalOpen(true);
  };

  // Check if any challenges are completed
  const hasCompletedChallenges = challenges.some(challenge => challenge.currentDay >= challenge.totalDays);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <Card className="border-red-500/20 bg-red-500/10">
          <CardContent className="pt-6">
            <p className="text-red-400">Failed to load challenges: {error}</p>
            <Button onClick={refetch} variant="outline" size="sm" className="mt-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show the "Create Your First Challenge" section if no challenges exist
  if (challenges.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Simple Hero Card */}
        <Card className="bg-gradient-to-br from-primary/20 to-purple-600/20 border-primary/30">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold text-white mb-3">
              Ready to Transform Your Skills?
            </CardTitle>
            <CardDescription className="text-gray-300 text-base max-w-lg mx-auto">
              Create structured learning challenges to stay consistent, track progress, and share your journey with the world.
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-white font-medium">Daily Consistency</div>
                <div className="text-gray-400 text-xs">Build lasting habits</div>
              </div>
              
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-white font-medium">Track Progress</div>
                <div className="text-gray-400 text-xs">See your growth</div>
              </div>
              
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-white font-medium">Share Journey</div>
                <div className="text-gray-400 text-xs">Inspire others</div>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Challenge
            </Button>
          </CardContent>
        </Card>

        {/* Create Challenge Modal for no-challenges view */}
        <CreateChallengeModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onChallengeCreated={handleChallengeCreated}
          userId={userId}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            My Challenges
          </h2>
          <p className="text-gray-400 mt-1">
            {activeChallenges.length} active • {completedChallenges.length} completed
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Challenge
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="text-xl font-bold text-white">{challenges.length}</div>
                <div className="text-xs text-gray-400">Total Challenges</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <div>
                <div className="text-xl font-bold text-white">{activeChallenges.length}</div>
                <div className="text-xs text-gray-400">Active Now</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-xl font-bold text-white">{totalDaysCommitted}</div>
                <div className="text-xs text-gray-400">Days Committed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-xl font-bold text-white">{completionRate}%</div>
                <div className="text-xs text-gray-400">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Challenges Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">All Challenges</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge._id}
              challenge={challenge}
              onChallengeUpdated={handleChallengeUpdated}
              onLogProgress={handleLogProgress}
              onViewLogs={handleViewLogs}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <CreateChallengeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onChallengeCreated={handleChallengeCreated}
        userId={userId}
      />

      {selectedChallenge && (
        <>
          <ChallengeLogModal
            isOpen={isLogModalOpen}
            onClose={() => setIsLogModalOpen(false)}
            onProgressLogged={handleProgressLogged}
            challenge={selectedChallenge}
            userId={userId}
          />
          
          <ChallengeLogsModal
            isOpen={isLogsModalOpen}
            onClose={() => setIsLogsModalOpen(false)}
            challenge={selectedChallenge}
          />
        </>
      )}
    </div>
  );
  };
  
  export default ChallengeSection;