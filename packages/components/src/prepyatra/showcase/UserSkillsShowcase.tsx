import React from "react";

const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const LayersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    style={{ display: "block" }}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
      <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
      <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
    </g>
  </svg>
);

interface UserSkillsShowcaseProps {
  userSkills: string[];
  lastUpdated?: string;
  title?: string;
}

export const UserSkillsShowcase: React.FC<UserSkillsShowcaseProps> = ({
  userSkills,
  lastUpdated,
  title,
}) => {
  if (userSkills.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-3 py-12 text-center"
        style={{ color: "#8a8a8a" }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            backgroundColor: "#f0f0f0",
            color: "#8a8a8a",
          }}
        >
          <LayersIcon />
        </div>
        <div>
          <p
            className="font-medium"
            style={{ fontSize: "13px", color: "#111111" }}
          >
            No skills added yet
          </p>
          <p className="mt-1" style={{ fontSize: "11px", color: "#8a8a8a" }}>
            Click &quot;Add Skills&quot; above to populate your tech stack
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h4
          className="font-semibold mb-3"
          style={{ fontSize: "13px", color: "#111111" }}
        >
          {title}
        </h4>
      )}

      <div className="flex flex-wrap gap-2">
        {userSkills.map((skill) => (
          <span
            key={skill}
            className="rounded-md font-medium transition-colors"
            style={{
              padding: "6px 14px",
              fontSize: "13px",
              backgroundColor: "#f0f0f0",
              color: "#111111",
              cursor: "default",
            }}
          >
            {skill}
          </span>
        ))}
      </div>

      {lastUpdated && (
        <p
          className="mt-4 pt-3"
          style={{
            fontSize: "11px",
            color: "#8a8a8a",
            borderTop: "1px solid #e8e8e8",
          }}
        >
          Last updated: {formatDate(lastUpdated)}
        </p>
      )}
    </div>
  );
};

export default UserSkillsShowcase;
