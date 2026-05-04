import { AlertTriangle, Code, Plus } from "lucide-react";
import React, { useState } from "react";

import Button from "../../common/Buttons/Button";
import Text from "../../common/Typography/Text";
import FlexContainer from "../../containers/Page/common/FlexContainer";
import AddSkillsModal from "../modals/AddSkillsModal";
import { Badge } from "../ui/badge";

interface BuildYourStackProps {
  userId: string;
  userSkills: string[];
  onSkillsUpdated?: (updatedSkills: string[]) => void;
  lastUpdated?: string;
}

const BuildYourStack = ({
  userId,
  userSkills,
  onSkillsUpdated,
  lastUpdated,
}: BuildYourStackProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  // Show warning only if no skills
  const showWarning = userSkills.length === 0;

  return (
    <div className="mt-1 max-w-md mx-auto rounded-1 p-3 mb-4 shadow border border-greyLight hover:border-[#FF5757]/60 transition-all duration-200 bg-gradient-to-b from-white to-[#FF5757]/10">
      <div className="flex items-center gap-2 mb-2 justify-start">
        <Plus className="mt-1 w-4 h-4 text-primary" />
        <Text level="h3" className="text-base font-semibold text-contentLight">
          Build Your Stack
        </Text>
      </div>
      {showWarning && (
        <FlexContainer className="items-center gap-2 bg-yellow-900/80 border border-yellow-600 text-yellow-300 rounded-md px-3 py-1 mb-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <Text level="span">
            You haven't added any skills yet. Please add your skills to build
            your stack!
          </Text>
        </FlexContainer>
      )}
      <div className="flex flex-wrap gap-1.5 mb-2 justify-start items-start">
        {userSkills.length === 0 && (
          <Text level="span" className="text-greyDark text-xs">
            No skills added yet. Start building your stack!
          </Text>
        )}
        {userSkills.map((skill) => (
          <Badge
            key={skill}
            className="flex items-center gap-1.5 bg-white text-[#FF5757] font-medium px-3 py-1 rounded-full border border-[#FF5757]/40 hover:bg-[#FF5757] hover:text-white hover:border-[#FF5757] transition-all duration-200 shadow-none text-xs"
          >
            <Code className="w-3.5 h-3.5 text-inherit transition-colors" />
            <Text level="span">{skill}</Text>
          </Badge>
        ))}
      </div>
      <Button
        onClick={() => setModalOpen(true)}
        variant="PRIMARY"
        size="SMALL"
        text="Add Skills"
        icon={<Plus className="w-3 h-3 -ml-1" />}
        className="text-xs h-4 pr-1"
      />
      <AddSkillsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={userId}
        userSkills={userSkills}
        lastUpdated={lastUpdated}
        onSkillsUpdated={onSkillsUpdated}
      />
    </div>
  );
};

export default BuildYourStack;
