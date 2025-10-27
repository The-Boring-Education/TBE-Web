import {Award, Sparkles} from "lucide-react";
import React from "react";

import Button from "../../common/Buttons/Button";

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
    <div className="w-full bg-white border border-greyLight rounded-2xl p-4 mb-4 mt-2 shadow">
      <h3 className="text-base font-semibold text-primary mb-4 flex items-center gap-2 justify-center">
        <Sparkles className="w-5 h-5 text-primary" />
        {title || "Skills Showcase"}
      </h3>
      {userSkills.length === 0 ? (
        <div className="text-center text-greyDark text-sm py-3">
          <Award className="inline w-6 h-6 text-greyDark mb-1" />
          <div>No skills added yet. Check back soon!</div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 justify-start">
          {userSkills.map((skill) => (
            <Button
              key={skill}
              variant="OUTLINE"
              className="font-medium px-3 py-1.5 text-sm rounded-full text-black"
            >
              {skill}
            </Button>
          ))}
        </div>
      )}
      {lastUpdated && (
        <div className="text-[11px] text-greyDark text-center mt-3">
          Last updated: {formatDate(lastUpdated)}
        </div>
      )}
    </div>
  );
};

export default UserSkillsShowcase; 