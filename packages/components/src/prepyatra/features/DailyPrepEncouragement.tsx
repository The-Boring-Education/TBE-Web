import { usePrepLogs } from "@tbe/hooks";
import React from "react";

const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="13"
    viewBox="0 0 24 24"
    style={{ display: "block", flexShrink: 0 }}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3.69"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </g>
  </svg>
);

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="13"
    viewBox="0 0 24 24"
    style={{ display: "block", flexShrink: 0 }}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3.69"
    >
      <path d="M8 2v4m8-4v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </g>
  </svg>
);

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

interface DailyPrepEncouragementProps {
  userId: string;
  onAddPrepLog: () => void;
}

const motivationalMessages = [
  "Every expert was once a beginner. Start your journey today!",
  "Consistency is the key to success. Keep pushing forward!",
  "Small steps every day lead to big results. You've got this!",
  "Practice makes perfect. Log your session and keep growing!",
  "The best time to start was yesterday. The next best time is now!",
  "Your future self will thank you for the effort you put in today.",
  "Success is the sum of small efforts, repeated day in and day out.",
];

export const DailyPrepEncouragement: React.FC<DailyPrepEncouragementProps> = ({
  userId,
  onAddPrepLog,
}) => {
  const { logs } = usePrepLogs(userId);

  const today = new Date().toDateString();
  const hasLogToday = logs?.some(
    (l) => new Date(l.createdAt).toDateString() === today,
  );
  const totalHours = logs?.reduce((acc, l) => acc + (l.timeSpent || 0), 0) ?? 0;
  const message =
    motivationalMessages[new Date().getDay() % motivationalMessages.length];

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e8e8e8",
        borderRadius: "20px",
        padding: "20px 24px",
      }}
    >
      {/* Left: text info */}
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="select-none" style={{ fontSize: "17px" }}>
            🚀
          </span>
          <span
            className="font-semibold"
            style={{ fontSize: "15px", color: "#111111" }}
          >
            Daily Prep Check-in
          </span>
        </div>

        <p className="mt-0.5" style={{ fontSize: "13px", color: "#8a8a8a" }}>
          Ready to start your prep journey today?
        </p>
        <p style={{ fontSize: "11px", color: "#8a8a8a" }}>{message}</p>

        <div className="flex items-center gap-5 mt-3">
          <div
            className="flex items-center gap-1.5"
            style={{ fontSize: "11px", color: "#8a8a8a" }}
          >
            <ClockIcon />
            <span>{totalHours}h total</span>
          </div>
          <div
            className="flex items-center gap-1.5"
            style={{ fontSize: "11px", color: "#8a8a8a" }}
          >
            <CalendarIcon />
            <span>{hasLogToday ? "Logged today ✓" : "No log today"}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onAddPrepLog}
        className="flex items-center gap-2 whitespace-nowrap flex-shrink-0 font-medium transition-colors w-full sm:w-auto justify-center sm:justify-start"
        style={{
          backgroundColor: "#e8372c",
          color: "#ffffff",
          padding: "10px 16px",
          borderRadius: "12px",
          fontSize: "13px",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#d42e23")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#e8372c")
        }
      >
        {hasLogToday ? "Add Another Log" : "Log Your First Session"}
        <PlusIcon />
      </button>
    </div>
  );
};

export default DailyPrepEncouragement;
