import { useToast } from "@tbe/hooks";
import { trackEvent } from "@tbe/utils";
import { AlertTriangle, Plus, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import Button from "../../common/Buttons/Button";
import Text from "../../common/Typography/Text";
import FlexContainer from "../../containers/Page/common/FlexContainer";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import { InputField } from "../ui/input";

interface AddSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userSkills: string[];
  lastUpdated?: string;
  onSkillsUpdated?: (updatedSkills: string[]) => void;
}

function isOlderThan60Days(dateString: string | undefined) {
  if (!dateString) {
    return true;
  }
  const last = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - last.getTime();
  return diff > 60 * 24 * 60 * 60 * 1000; // 60 days in ms
}

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

const AddSkillsModal = ({
  isOpen,
  onClose,
  userId,
  userSkills,
  onSkillsUpdated,
}: AddSkillsModalProps) => {
  const [skills, setSkills] = useState<string[]>(userSkills);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state with props when modal opens or props change
  useEffect(() => {
    setSkills(userSkills);
  }, [userSkills, isOpen]);

  // Show warning only if no skills
  const showWarning = skills.length === 0;

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const skill = inputValue.trim();
    if (!skill || skills.includes(skill)) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${NEXT_PUBLIC_API_URL}/prepyatra/userskills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userSkills: [skill] }),
      });
      const result = await res.json();
      if (result.status) {
        const updatedSkills = [...skills, skill];
        setSkills(updatedSkills);
        setInputValue("");
        toast({
          title: "Skill added!",
          description: `${skill} added to your stack.`,
        });
        try {
          trackEvent("skill_add", { category: "skills", skill });
        } catch {}
        if (onSkillsUpdated) {
          onSkillsUpdated(updatedSkills);
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add skill.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add skill.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleRemoveSkill = async (skill: string) => {
    if (removing) return;
    setRemoving(skill);
    try {
      const res = await fetch(`${NEXT_PUBLIC_API_URL}/prepyatra/userskills`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, skill }),
      });
      const result = await res.json();
      if (result.status) {
        const updatedSkills = skills.filter((s) => s !== skill);
        setSkills(updatedSkills);
        toast({
          title: "Skill removed",
          description: `${skill} removed from your stack.`,
        });
        try {
          trackEvent("skill_remove", { category: "skills", skill });
        } catch {}
        if (onSkillsUpdated) {
          onSkillsUpdated(updatedSkills);
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to remove skill.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove skill.",
        variant: "destructive",
      });
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto glass p-6 border-greyLight rounded-xl">
        <DialogHeader>
          <Text level="h3" className="text-contentLight text-lg font-semibold">
            ✨ Add Skills
          </Text>
          <Text level="p" className="text-greyDark text-sm">
            Build your skills stack to showcase your expertise
          </Text>
        </DialogHeader>

        {showWarning && (
          <FlexContainer className="items-center gap-2 bg-yellow-900/80 border border-yellow-600 text-yellow-300 rounded-lg px-4 py-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <Text level="span">
              You haven't added any skills yet. Please add your skills to build
              your stack!
            </Text>
          </FlexContainer>
        )}

        <form onSubmit={handleAddSkill} className="space-y-4">
          <InputField
            label="Skill Name"
            field="skill"
            value={inputValue}
            onChange={(field, value) => setInputValue(value)}
            placeholder="Type a skill and press Add Skill..."
            className="bg-white border-greyLight text-contentLight"
            required
          />

          <div className="flex flex-wrap gap-2 justify-start items-start">
            {skills.length === 0 && (
              <Text level="span" className="text-greyDark text-sm">
                No skills added yet. Start building your stack!
              </Text>
            )}
            {skills.map((skill) => (
              <div key={skill} className="relative inline-flex items-center">
                <Button
                  variant="OUTLINE"
                  size="SMALL"
                  text={skill}
                  className="font-medium px-4 py-2 text-sm rounded-full text-black pr-6"
                />
                <button
                  type="button"
                  className="absolute right-2 text-primary hover:text-red-500 focus:outline-none transition-colors"
                  onClick={() => handleRemoveSkill(skill)}
                  disabled={removing === skill}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <DialogFooter className="flex flex-col-reverse md:flex-row gap-2">
            <Button
              variant="OUTLINE"
              size="SMALL"
              text="Cancel"
              onClick={onClose}
              className="text-sm h-5"
              isLoading={loading}
              animationType="BOUNCE"
            />
            <Button
              variant="PRIMARY"
              size="SMALL"
              text={loading ? "Adding..." : "Add Skill"}
              disabled={loading || !inputValue.trim()}
              className="text-sm h-5"
              icon={<Plus className="w-4 h-4" />}
              isLoading={loading}
              animationType="BOUNCE"
              type="submit"
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSkillsModal;
