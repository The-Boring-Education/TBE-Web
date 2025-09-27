import { X, Plus, Code, AlertTriangle } from "lucide-react"
import React, { useState, useRef } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { InputField } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { trackEvent } from "@/lib/analytics"

interface AddSkillsModalProps {
    isOpen: boolean
    onClose: () => void
    userId: string
    userSkills: string[]
    lastUpdated?: string
    onSkillsUpdated?: () => void
}

function isOlderThan60Days(dateString: string | undefined) {
    if (!dateString) {
        return true
    }
    const last = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - last.getTime()
    return diff > 60 * 24 * 60 * 60 * 1000 // 60 days in ms
}

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL

const AddSkillsModal: React.FC<AddSkillsModalProps> = ({
    isOpen,
    onClose,
    userId,
    userSkills,
    lastUpdated,
    onSkillsUpdated
}) => {
    const [skills, setSkills] = useState<string[]>(userSkills)
    const [inputValue, setInputValue] = useState("")
    const [loading, setLoading] = useState(false)
    const [removing, setRemoving] = useState<string | null>(null)
    const { toast } = useToast()
    const inputRef = useRef<HTMLInputElement>(null)

    // Show warning only if no skills
    const showWarning = skills.length === 0

    const handleAddSkill = async (e: React.FormEvent) => {
        e.preventDefault()
        const skill = inputValue.trim()
        if (!skill || skills.includes(skill)) {
            return
        }
        setLoading(true)
        try {
            const res = await fetch(
                `${NEXT_PUBLIC_API_URL}/prepyatra/userskills`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, userSkills: [skill] })
                }
            )
            const result = await res.json()
            if (result.status) {
                setSkills((prev) => [...prev, skill])
                setInputValue("")
                toast({
                    title: "Skill added!",
                    description: `${skill} added to your stack.`
                })
                try {
                    trackEvent("skill_add", { category: "skills", skill })
                } catch {}
                if (onSkillsUpdated) {
                    onSkillsUpdated()
                }
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to add skill.",
                    variant: "destructive"
                })
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to add skill.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
            inputRef.current?.focus()
        }
    }

    const handleRemoveSkill = async (skill: string) => {
        setRemoving(skill)
        try {
            // Remove skill from backend (implement API if needed)
            // For now, just remove locally
            setSkills((prev) => prev.filter((s) => s !== skill))
            toast({
                title: "Skill removed",
                description: `${skill} removed from your stack.`
            })
            try {
                trackEvent("skill_remove", { category: "skills", skill })
            } catch {}
            if (onSkillsUpdated) {
                onSkillsUpdated()
            }
        } finally {
            setRemoving(null)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass-dark border-primary/20'>
                <DialogHeader>
                    <DialogTitle className='text-white'>
                        ✨ Add Skills
                    </DialogTitle>
                    <DialogDescription className='text-gray'>
                        Build your skills stack to showcase your expertise
                    </DialogDescription>
                </DialogHeader>

                {showWarning && (
                    <div className='flex items-center gap-2 bg-yellow-900/80 border border-yellow-600 text-yellow-300 rounded-lg px-4 py-3 mb-4'>
                        <AlertTriangle className='w-5 h-5 text-yellow-400' />
                        <span>
                            You haven't added any skills yet. Please add your
                            skills to build your stack!
                        </span>
                    </div>
                )}

                <form onSubmit={handleAddSkill} className='space-y-4'>
                    <InputField
                        label='Skill Name'
                        field='skill'
                        value={inputValue}
                        onChange={(field, value) => setInputValue(value)}
                        placeholder='Type a skill and press Enter...'
                        required
                    />

                    <div className='flex flex-wrap gap-2'>
                        {skills.length === 0 && (
                            <span className='text-gray-400 text-sm'>
                                No skills added yet. Start building your stack!
                            </span>
                        )}
                        {skills.map((skill) => (
                            <Badge
                                key={skill}
                                className='flex items-center gap-2 bg-primary/20 text-primary font-semibold px-4 py-1.5 rounded-full border border-primary/40 transition hover:bg-primary/40 hover:border-primary hover:text-primary-foreground cursor-pointer shadow-none'>
                                <Code className='w-4 h-4 text-primary' />
                                <span>{skill}</span>
                                <button
                                    type='button'
                                    className='ml-2 text-primary/70 hover:text-red-400 focus:outline-none'
                                    onClick={() => handleRemoveSkill(skill)}
                                    disabled={removing === skill}>
                                    <X className='w-3 h-3' />
                                </button>
                            </Badge>
                        ))}
                    </div>

                    <DialogFooter className='flex flex-col-reverse md:flex-row gap-2'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={onClose}
                            className='border-gray-300 text-white hover:bg-gray-100 hover:text-gray-900'>
                            Cancel
                        </Button>
                        <Button
                            type='submit'
                            disabled={loading || !inputValue.trim()}
                            className='bg-primary text-primary-foreground'>
                            {loading ? "Adding..." : "Add Skill"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddSkillsModal
