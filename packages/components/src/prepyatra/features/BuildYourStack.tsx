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
    <div className="px-5 mt-3 pb-4 border-t border-[#e2e8f0] pt-3">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="flex items-center text-[#64748b]">
          <LayersIcon />
        </span>
        <span className="text-xs sm:text-sm font-bold text-[#0f172a]">
          Build Your Stack
        </span>
        <button
          onClick={() => setIsModalOpen(true)}
          className="ml-auto flex items-center justify-center w-6 h-6 rounded-lg bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] transition-all cursor-pointer"
          title="Add skills"
        >
          <PlusIcon />
        </button>
      </div>

      {/* Skills empty state */}
      {userSkills.length === 0 ? (
        <div className="rounded-xl p-4 flex flex-col items-center gap-2 bg-[#fff0ef] border border-[#fecdd3]">
          <span className="flex items-center text-[#e8372c]">
            <AlertTriangleIcon />
          </span>
          <span className="text-xs font-medium text-[#475569] text-center">
            No skills added yet
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-bold text-[#e8372c] hover:underline cursor-pointer"
          >
            Add your first skill
          </button>
        </div>
      ) : (
        /* Skills populated state */
        <div className="flex flex-wrap gap-2 px-1">
          {userSkills.map((skill) => (
            <span
              key={skill}
              className="rounded-lg text-xs font-semibold px-3 py-1 bg-[#f1f5f9] text-[#0f172a] border border-[#cbd5e1] shadow-xs"
            >
              {skill}
            </span>
          ))}
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg text-xs font-semibold px-2.5 py-1 text-[#475569] hover:text-[#0f172a] hover:bg-[#f1f5f9] border border-dashed border-[#cbd5e1] transition-all cursor-pointer"
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
