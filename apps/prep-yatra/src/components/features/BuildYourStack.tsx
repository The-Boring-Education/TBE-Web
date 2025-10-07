import {Code, Plus, AlertTriangle} from "lucide-react";
import React, {useState} from "react";

import AddSkillsModal from "@/components/modals/AddSkillsModal";
import {Badge} from "@/components/ui/badge";
import {Button, Text, FlexContainer} from "@tbe/components";

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
        <div className='glass-dark rounded-2xl p-6 mb-8 shadow-lg'>
            <FlexContainer className='items-center gap-2 mb-4'>
                <Plus className='w-5 h-5 text-primary' />
                <Text level='h3' className='text-xl font-bold text-white'>
                    Build Your Stack
                </Text>
            </FlexContainer>
            {showWarning && (
                <FlexContainer className='items-center gap-2 bg-yellow-900/80 border border-yellow-600 text-yellow-300 rounded-lg px-4 py-2 mb-4'>
                    <AlertTriangle className='w-5 h-5 text-yellow-400' />
                    <Text level='span'>
                        You haven't added any skills yet. Please add your skills to build your stack!
                    </Text>
                </FlexContainer>
            )}
            <FlexContainer className='flex-wrap gap-2 mb-4'>
                {userSkills.length === 0 && (
                    <Text level='span' className='text-gray-400 text-sm'>
                        No skills added yet. Start building your stack!
                    </Text>
                )}
                {userSkills.map((skill) => (
                    <Badge
                        key={skill}
                        className='flex items-center gap-2 bg-primary/20 text-primary font-semibold px-4 py-1.5 rounded-full border border-primary/40 shadow-none'>
                        <Code className='w-4 h-4 text-primary' />
                        <Text level='span'>{skill}</Text>
                    </Badge>
                ))}
            </FlexContainer>
            <Button
                text="Add Skills"
                onClick={() => setModalOpen(true)}
                variant='PRIMARY'
                className='bg-primary text-black hover:bg-primary/90'
                icon={<Plus className='w-4 h-4 mr-2' />}
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
