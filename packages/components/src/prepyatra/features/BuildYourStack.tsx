import React, { useState } from "react";

import AddSkillsModal from "../modals/AddSkillsModal";

const LayersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    style={{ display: "block", flexShrink: 0 }}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3.43"
    >
      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
      <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
      <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
    </g>
  </svg>
);

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    style={{ display: "block", flexShrink: 0 }}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="4"
      d="M5 12h14m-7-7v14"
    />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    style={{ display: "block", flexShrink: 0 }}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
      d="m21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4m0 4h.01"
    />
  </svg>
);

interface BuildYourStackProps {
  userId: string;
  userSkills: string[];
  lastUpdated?: string;
  onSkillsUpdated?: (skills: string[]) => void;
}

export const BuildYourStack: React.FC<BuildYourStackProps> = ({
  userId,
  userSkills,
  onSkillsUpdated,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSkillsUpdated = (skills: string[]) => {
    onSkillsUpdated?.(skills);
    setIsModalOpen(false);
  };

  return (
    <div className="px-4 mt-1.5 pb-2">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-2 px-2">
        <span className="flex items-center" style={{ color: "#8a8a8a" }}>
          <LayersIcon />
        </span>
        <span
          className="font-semibold"
          style={{ fontSize: "13px", color: "#111111" }}
        >
          Build Your Stack
        </span>
        <button
          onClick={() => setIsModalOpen(true)}
          className="ml-auto flex items-center justify-center transition-colors hover:bg-[#e8e8e8]"
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "8px",
            backgroundColor: "#f0f0f0",
            color: "#8a8a8a",
          }}
        >
          <PlusIcon />
        </button>
      </div>

      {/* Skills empty state */}
      {userSkills.length === 0 ? (
        <div
          className="rounded-lg p-4 flex flex-col items-center gap-2"
          style={{
            backgroundColor: "#fff0ef",
            border: "1px solid #fdecea",
          }}
        >
          <span className="flex items-center" style={{ color: "#e8372c" }}>
            <AlertTriangleIcon />
          </span>
          <span
            className="text-center"
            style={{ fontSize: "11px", color: "#8a8a8a" }}
          >
            No skills added yet
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="font-medium hover:underline"
            style={{ fontSize: "11px", color: "#e8372c" }}
          >
            Add your first skill
          </button>
        </div>
      ) : (
        /* Skills populated state */
        <div className="flex flex-wrap gap-1.5 px-2">
          {userSkills.map((skill) => (
            <span
              key={skill}
              className="rounded-md"
              style={{
                padding: "4px 10px",
                fontSize: "11px",
                backgroundColor: "#f0f0f0",
                color: "#111111",
              }}
            >
              {skill}
            </span>
          ))}
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-md transition-colors hover:bg-[#f0f0f0]"
            style={{
              padding: "4px 10px",
              fontSize: "11px",
              color: "#8a8a8a",
              border: "1px dashed #e8e8e8",
            }}
          >
            + Add
          </button>
        </div>
      )}

      <AddSkillsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        userSkills={userSkills}
        onSkillsUpdated={handleSkillsUpdated}
      />
    </div>
  );
};

export default BuildYourStack;
