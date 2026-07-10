import { useChallenges } from "@tbe/hooks";
import type { Challenge } from "@tbe/types";
import React, { useState } from "react";

import ChallengeCard from "../cards/ChallengeCard";
import ChallengeLogModal from "../modals/ChallengeLogModal";
import ChallengeLogsModal from "../modals/ChallengeLogsModal";
import CreateChallengeModal from "../modals/CreateChallengeModal";

// SVG Icons (inline)
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    style={{ display: "block", flexShrink: 0 }}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3.43"
      d="M5 12h14m-7-7v14"
    />
  </svg>
);

const TargetRingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    style={{ display: "block" }}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </g>
  </svg>
);

const TrophyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    style={{ display: "block", flexShrink: 0 }}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </g>
  </svg>
);

const FlameIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    style={{ display: "block", flexShrink: 0 }}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6.5c.5 2.5 2 4.9 4 6.5c2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    style={{ display: "block", flexShrink: 0 }}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M8 2v4m8-4v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </g>
  </svg>
);

const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    style={{ display: "block", flexShrink: 0 }}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
    />
  </svg>
);

interface ChallengeSectionProps {
  userId: string;
  className?: string;
}

export const ChallengeSection = ({
  userId,
  className = "",
}: ChallengeSectionProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null,
  );

  const {
    challenges,
    activeChallenges,
    completedChallenges,
    totalDaysCommitted,
    completionRate,
    loading,
    error,
    refetch,
  } = useChallenges(userId);

  const handleChallengeUpdated = () => refetch();
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

  // Loading skeleton
  if (loading) {
    return (
      <div className={`space-y-4 animate-pulse ${className}`}>
        <div
          className="rounded-xl"
          style={{ height: "56px", backgroundColor: "#f0f0f0" }}
        />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl"
              style={{ height: "120px", backgroundColor: "#f0f0f0" }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`p-6 text-center rounded-xl ${className}`}
        style={{
          backgroundColor: "#fff0ef",
          border: "1px solid #fdecea",
        }}
      >
        <p
          className="font-semibold"
          style={{ fontSize: "13px", color: "#e8372c" }}
        >
          Failed to load challenges: {error}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-3 font-medium transition-colors"
          style={{
            padding: "8px 16px",
            borderRadius: "12px",
            backgroundColor: "#e8372c",
            color: "#ffffff",
            fontSize: "13px",
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state — matching exact design with concentric circles
  if (challenges.length === 0) {
    return (
      <div className={className}>
        <div
          className="flex flex-col items-center"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e8e8e8",
            borderRadius: "20px",
            padding: "64px 32px",
            gap: "24px",
          }}
        >
          {/* Concentric target rings — exact from design */}
          <div
            className="flex items-center justify-center"
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              border: "2px solid #e8372c",
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "2px solid #e8372c",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#e8372c",
                }}
              />
            </div>
          </div>

          {/* Text */}
          <div
            className="text-center flex flex-col gap-1"
            style={{ maxWidth: "384px" }}
          >
            <h3
              className="font-semibold"
              style={{ fontSize: "15px", color: "#111111" }}
            >
              No active challenges
            </h3>
            <p style={{ fontSize: "13px", color: "#8a8a8a" }}>
              Start a challenge to track your interview prep progress
            </p>
          </div>

          {/* CTA button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 font-medium transition-colors"
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              backgroundColor: "#e8372c",
              color: "#ffffff",
              fontSize: "13px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#d42e23")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#e8372c")
            }
          >
            Start a Challenge
            <PlusIcon />
          </button>
        </div>

        <CreateChallengeModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onChallengeCreated={() => refetch()}
          userId={userId}
        />
      </div>
    );
  }

  // Populated state
  const metrics = [
    { icon: <TrophyIcon />, value: challenges.length, label: "Total Goals" },
    {
      icon: <FlameIcon />,
      value: activeChallenges.length,
      label: "Active Now",
    },
    { icon: <CalendarIcon />, value: totalDaysCommitted, label: "Days Logged" },
    { icon: <StarIcon />, value: `${completionRate}%`, label: "Success Rate" },
  ];

  return (
    <div className={`flex flex-col gap-5 ${className}`}>
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3
            className="font-semibold flex items-center gap-2"
            style={{ fontSize: "15px", color: "#111111" }}
          >
            <span style={{ color: "#e8372c" }}>
              <TargetRingsIcon />
            </span>
            My Challenges
          </h3>
          <p className="mt-0.5" style={{ fontSize: "11px", color: "#8a8a8a" }}>
            {activeChallenges.length} active • {completedChallenges.length}{" "}
            completed
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 font-medium transition-colors"
          style={{
            padding: "8px 16px",
            borderRadius: "12px",
            backgroundColor: "#e8372c",
            color: "#ffffff",
            fontSize: "13px",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#d42e23")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#e8372c")
          }
        >
          <PlusIcon />
          New Challenge
        </button>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex items-center gap-3"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e8e8e8",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#fff0ef",
                color: "#e8372c",
              }}
            >
              {m.icon}
            </div>
            <div>
              <div
                className="font-bold leading-tight"
                style={{ fontSize: "15px", color: "#111111" }}
              >
                {m.value}
              </div>
              <div
                className="font-medium uppercase tracking-wider"
                style={{ fontSize: "10px", color: "#8a8a8a" }}
              >
                {m.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Challenge cards grid */}
      <div>
        <h4
          className="font-semibold mb-3"
          style={{ fontSize: "13px", color: "#111111" }}
        >
          All Active & Paused Challenges
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        onChallengeCreated={() => refetch()}
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
