import type { UserProfile } from "@tbe/interface";
import type { PrepLog, RecruiterContact } from "@tbe/types";
import React, { useState } from "react";

import ChallengeSection from "../features/ChallengeSection";
import PrepLogsList from "../features/PrepLogsList";
import RecruiterContactsTable from "../features/RecruiterContactsTable";
import UserSkillsShowcase from "../showcase/UserSkillsShowcase";

type TabId = "challenges" | "prep-logs" | "recruiters" | "skills";

const TABS: { id: TabId; label: string }[] = [
  { id: "challenges", label: "Challenges" },
  { id: "prep-logs", label: "Prep Logs" },
  { id: "recruiters", label: "Recruiters" },
  { id: "skills", label: "Skills" },
];

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

interface DashboardTabsProps {
  prepLogs: PrepLog[];
  recruiterContacts: RecruiterContact[];
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
  userProfile?: UserProfile;
  onPrepLogModalOpen: () => void;
  onRecruiterModalOpen: () => void;
  onSkillsModalOpen: () => void;
  onContactUpdated: () => void;
  onLogDeleted: (deletedLogId: string) => void;
  onContactDeleted: (deletedContactId: string) => void;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  prepLogs,
  recruiterContacts,
  user,
  userProfile,
  onPrepLogModalOpen,
  onRecruiterModalOpen,
  onSkillsModalOpen,
  onContactUpdated,
  onLogDeleted,
  onContactDeleted,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("challenges");

  return (
    <div className="flex flex-col gap-6">
      {/* Tab navigation — active tab: solid red; inactive tabs: outlined white */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="font-semibold transition-all duration-200"
              style={{
                padding: "10px 20px",
                borderRadius: "12px",
                fontSize: "13px",
                backgroundColor: isActive ? "#e8372c" : "#ffffff",
                color: isActive ? "#ffffff" : "#555555",
                border: isActive ? "1px solid #e8372c" : "1px solid #e8e8e8",
                boxShadow: isActive
                  ? "0 4px 12px rgba(232,55,44,0.15)"
                  : "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                  e.currentTarget.style.color = "#111111";
                  e.currentTarget.style.borderColor = "#dcdcdc";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.color = "#555555";
                  e.currentTarget.style.borderColor = "#e8e8e8";
                }
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {/* Challenges tab */}
        {activeTab === "challenges" && (
          <ChallengeSection userId={user?.id || ""} />
        )}

        {/* Prep Logs tab */}
        {activeTab === "prep-logs" && (
          <div
            className="flex flex-col"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e8e8e8",
              borderRadius: "20px",
              padding: "20px",
            }}
          >
            {/* Header */}
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4"
              style={{ borderBottom: "1px solid #e8e8e8" }}
            >
              <div>
                <h3
                  className="font-semibold"
                  style={{ fontSize: "15px", color: "#111111" }}
                >
                  Preparation Logs
                </h3>
                <p
                  className="mt-0.5"
                  style={{ fontSize: "11px", color: "#8a8a8a" }}
                >
                  Track your learning progress and preparation milestones
                </p>
              </div>
              <button
                onClick={onPrepLogModalOpen}
                className="flex items-center gap-1.5 font-medium transition-colors self-start sm:self-auto"
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
                Add Log
              </button>
            </div>
            <PrepLogsList
              logs={prepLogs}
              onLogUpdated={() => {}}
              onLogDeleted={onLogDeleted}
              mongoUserId={user?.id || ""}
            />
          </div>
        )}

        {/* Recruiters tab */}
        {activeTab === "recruiters" && (
          <div
            className="flex flex-col"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e8e8e8",
              borderRadius: "20px",
              padding: "20px",
            }}
          >
            {/* Header */}
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4"
              style={{ borderBottom: "1px solid #e8e8e8" }}
            >
              <div>
                <h3
                  className="font-semibold"
                  style={{ fontSize: "15px", color: "#111111" }}
                >
                  Recruiter Contacts
                </h3>
                <p
                  className="mt-0.5"
                  style={{ fontSize: "11px", color: "#8a8a8a" }}
                >
                  Manage your network of recruiting professionals and
                  opportunities
                </p>
              </div>
              <button
                onClick={onRecruiterModalOpen}
                className="flex items-center gap-1.5 font-medium transition-colors self-start sm:self-auto"
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
                Add Contact
              </button>
            </div>
            <RecruiterContactsTable
              contacts={recruiterContacts}
              onContactUpdated={onContactUpdated}
              onContactDeleted={onContactDeleted}
              mongoUserId={user?.id || ""}
            />
          </div>
        )}

        {/* Skills tab */}
        {activeTab === "skills" && (
          <div
            className="flex flex-col"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e8e8e8",
              borderRadius: "20px",
              padding: "20px",
            }}
          >
            {/* Header */}
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4"
              style={{ borderBottom: "1px solid #e8e8e8" }}
            >
              <div>
                <h3
                  className="font-semibold"
                  style={{ fontSize: "15px", color: "#111111" }}
                >
                  Skills & Technologies
                </h3>
                <p
                  className="mt-0.5"
                  style={{ fontSize: "11px", color: "#8a8a8a" }}
                >
                  Manage and display your technical skillset and expertise
                </p>
              </div>
              <button
                onClick={onSkillsModalOpen}
                className="flex items-center gap-1.5 font-medium transition-colors self-start sm:self-auto"
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
                Add Skills
              </button>
            </div>
            <UserSkillsShowcase
              userSkills={userProfile?.userSkills || []}
              lastUpdated={userProfile?.userSkillsLastUpdated}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTabs;
