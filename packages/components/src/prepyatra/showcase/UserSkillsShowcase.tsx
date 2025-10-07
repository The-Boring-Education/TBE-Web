import {Award, Sparkles} from "lucide-react";
import React from "react";

import {Badge} from "../ui/badge";

interface UserSkillsShowcaseProps {
  userSkills: string[];
  lastUpdated?: string;
  title?: string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) {return null;}
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {year: "numeric", month: "short", day: "numeric"});
};

const UserSkillsShowcase: React.FC<UserSkillsShowcaseProps> = ({userSkills, lastUpdated, title}) => {
  return (
    <div className="w-full bg-gray-900/80 border border-yellow-400/40 rounded-1 p-4 mb-4 mt-2 shadow">
      <h3 className="text-base font-semibold text-primary/90 mb-4 flex items-center gap-2 justify-center">
        <Sparkles className="w-5 h-5 text-primary/70" />
        {title || "Skills Showcase"}
      </h3>
      {userSkills.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-3">
          <Award className="inline w-6 h-6 text-gray-600 mb-1" />
          <div>No skills added yet. Check back soon!</div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 justify-start">
          {userSkills.map((skill) => (
            <Badge
              key={skill}
              className="bg-gray-800 border border-gray-700 text-gray-200 font-medium px-3 py-1.5 text-sm rounded-full shadow-sm hover:bg-primary/10 transition-colors duration-200"
            >
              {skill}
            </Badge>
          ))}
        </div>
      )}
      {lastUpdated && (
        <div className="text-[11px] text-gray-400 text-center mt-3">
          Last updated: {formatDate(lastUpdated)}
        </div>
      )}
    </div>
  );
};

export default UserSkillsShowcase; 