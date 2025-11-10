import {Code, Plus, AlertTriangle} from "lucide-react";
import React, {useState} from "react";

import AddSkillsModal from "../modals/AddSkillsModal";
import {Badge} from "../ui/badge";
import Button from "../../common/Buttons/Button";
import Text from "../../common/Typography/Text";
import FlexContainer from "../../containers/Page/common/FlexContainer";

interface BuildYourStackProps {
    userId: string
    userSkills: string[]
    onSkillsUpdated?: () => void
    lastUpdated?: string
}

function isOlderThan60Days(dateString: string | undefined) {
    if (!dateString) {return true;}
    const last = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - last.getTime();
    return diff > 60 * 24 * 60 * 60 * 1000; // 60 days in ms
}

const BuildYourStack: React.FC<BuildYourStackProps> = ({
    userId,
    userSkills,
    onSkillsUpdated,
    lastUpdated
}) => {
    const [modalOpen, setModalOpen] = useState(false);

    // Show warning only if no skills
    const showWarning = userSkills.length === 0;

    return (
        <div className='glass rounded-1 p-5 mb-6 shadow border border-greyLight'>
            <div className='flex items-center gap-2 mb-3 justify-start'>
                <Plus className='w-4 h-4 text-primary' />
                <Text level="h3" className='text-base font-semibold text-contentLight'>
                    Build Your Stack
                </Text>
            </div>
            {showWarning && (
                <FlexContainer className='items-center gap-2 bg-yellow-900/80 border border-yellow-600 text-yellow-300 rounded-md px-3 py-1.5 mb-3'>
                    <AlertTriangle className='w-4 h-4 text-yellow-400' />
                    <Text level="span">
                        You haven't added any skills yet. Please add your skills to build your stack!
                    </Text>
                </FlexContainer>
            )}
            <div className='flex flex-wrap gap-2 mb-3 justify-start items-start'>
                {userSkills.length === 0 && (
                    <Text level="span" className='text-greyDark text-xs'>
                        No skills added yet. Start building your stack!
                    </Text>
                )}
                {userSkills.map((skill) => (
                    <Badge
                        key={skill}
                        className='flex items-center gap-1.5 bg-primary/20 text-primary font-medium px-3 py-1 rounded-full border border-primary/40 shadow-none text-xs'>
                        <Code className='w-3.5 h-3.5 text-primary' />
                        <Text level="span">{skill}</Text>
                    </Badge>
                ))}
            </div>
            <Button
                onClick={() => setModalOpen(true)}
                variant="PRIMARY"
                size="SMALL"
                text="Add Skills"
                icon={<Plus className='w-4 h-4' />}
                className='text-sm h-5'
            />
            <AddSkillsModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    if (onSkillsUpdated) {onSkillsUpdated();}
                }}
                userId={userId}
                userSkills={userSkills}
                lastUpdated={lastUpdated}
                onSkillsUpdated={onSkillsUpdated}
            />
        </div>
    );
};

export default BuildYourStack;
