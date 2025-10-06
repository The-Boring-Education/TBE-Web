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
    <div className="bg-gray-900/80 border border-yellow-400/60 rounded-2xl p-6 mb-12 mt-6 shadow-md shadow-[0_0_24px_0_rgba(255,215,0,0.15)]">
      <h3 className="text-lg font-semibold text-primary/90 mb-6 flex items-center gap-2 justify-center">
        <Sparkles className="w-5 h-5 text-primary/70" />
        {title || "Skills Showcase"}
      </h3>
      {userSkills.length === 0 ? (
        <div className="text-center text-gray-400 text-base py-4">
          <Award className="inline w-6 h-6 text-gray-600 mb-1" />
          <div>No skills added yet. Check back soon!</div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 justify-center">
          {userSkills.map((skill) => (
            <Badge
              key={skill}
              className="bg-gray-800 border border-gray-700 text-gray-200 font-medium px-4 py-2 text-base rounded-full shadow-sm hover:bg-primary/10 transition-colors duration-200"
            >
              {skill}
            </Badge>
          ))}
        </div>
      )}
      {lastUpdated && (
        <div className="text-xs text-gray-500 text-center mt-4">
          Last updated: {formatDate(lastUpdated)}
        </div>
      )}
    </div>
  );
};

export default UserSkillsShowcase; 