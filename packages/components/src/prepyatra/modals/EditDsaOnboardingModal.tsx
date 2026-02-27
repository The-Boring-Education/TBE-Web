import {
    DSA_EXPERIENCE_LEVELS,
    DSA_GOALS,
    DSA_TIMELINES
} from "@tbe/constants"
import { ExternalLink, Github, Linkedin } from "lucide-react"
import { useEffect, useState } from "react"

import { useAuth } from "../contexts/useAuth"
import { Button } from "../ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "../ui/dialog"
import { useToast } from "../ui/use-toast"
import { cn, sendRequest } from "@tbe/utils"

interface EditDsaOnboardingModalProps {
    isOpen: boolean
    onClose: () => void
    onUpdate: (data: any) => void
    currentData?: any
    userId: string
}

const EditDsaOnboardingModal: React.FC<EditDsaOnboardingModalProps> = ({
    isOpen,
    onClose,
    onUpdate,
    currentData,
    userId
}) => {
    const { toast } = useToast()
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        linkedInUrl: "",
        githubUrl: "",
        leetCodeUrl: "",
        goal: "Product-based",
        timeline: "4-6 months",
        experienceLevel: "Fresher (0-1 yr)",
        preferredLanguage: "C++"
    })
    const [loading, setLoading] = useState(false)
    const [activeBtn, setActiveBtn] = useState("")

    useEffect(() => {
        if (currentData) {
            setFormData({
                name: currentData.name || user?.name || "",
                username: currentData.userName || user?.email?.split("@")[0] || "",
                linkedInUrl: currentData.linkedInUrl || "",
                githubUrl: currentData.githubUrl || "",
                leetCodeUrl: currentData.leetCodeUrl || "",
                goal: currentData.dsaYatra?.target || "Product-based",
                timeline: currentData.dsaYatra?.timeline || "4-6 months",
                experienceLevel: currentData.dsaYatra?.experienceLevel || "Fresher (0-1 yr)",
                preferredLanguage: currentData.dsaYatra?.preferredLanguage || "C++"
            })
        }
    }, [currentData, user])

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.username) {
            toast({
                title: "Validation Error",
                description: "Name and Username are required.",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        try {
            const requestBody = {
                userId,
                name: formData.name,
                username: formData.username,
                target: formData.goal,
                timeline: formData.timeline,
                experienceLevel: formData.experienceLevel,
                preferredLanguage: formData.preferredLanguage,
                linkedInUrl: formData.linkedInUrl,
                githubUrl: formData.githubUrl,
                leetCodeUrl: formData.leetCodeUrl
            }

            const result = await sendRequest({
                method: "POST",
                url: "/dsayatra/onboarding",
                body: requestBody
            });

            if (result.status) {
                toast({
                    title: "Success!",
                    description: "DSA journey preferences updated successfully."
                })
                onUpdate(result.data.user)
                onClose()
            } else {
                throw new Error(result.message || "Failed to update details")
            }
        } catch (error: any) {
            console.error("Error updating DSA details:", error)
            toast({
                title: "Error",
                description: error.message || "Failed to update details. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-w-lg max-h-[98vh] overflow-y-auto p-[2px] backdrop-blur-3xl bg-black/95 border-[#2a2a2a] shadow-[0_0_80px_-15px_rgba(255,87,87,0.15)] text-[#e0e0e0] border-2 rounded-2xl [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent [&>button]:right-2 [&>button]:top-2 [&>button]:text-[#ff5757] [&>button]:opacity-100 font-primary'>
                <DialogHeader className="relative pb-0.5 border-b border-[#2a2a2a]/30">
                    <DialogTitle className='text-center text-[#ff5757] text-lg font-black uppercase tracking-tighter'>
                        Tailor Your DSA Journey
                    </DialogTitle>
                    <div className='flex justify-center gap-0.5 mt-0.5'>
                        <div className='w-1 h-1 rounded-full bg-[#ff5757] animate-pulse' />
                        <div className='w-1 h-1 rounded-full bg-[#ff5757]/40' />
                        <div className='w-1 h-1 rounded-full bg-[#ff5757]/20' />
                    </div>
                </DialogHeader>

                <div className='space-y-2 mt-0.5 px-1.5 pb-3'>
                    {/* Basic Info */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                        <div className="space-y-0.5">
                            <label className='block text-[9px] font-black text-[#606060] uppercase tracking-[0.2em]'>Full Name</label>
                            <input
                                type='text'
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                className='w-full px-2 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-[#e0e0e0] text-xs font-bold focus:border-[#ff5757] outline-none transition-all'
                            />
                        </div>
                        <div className="space-y-0.5">
                            <label className='block text-[9px] font-black text-[#606060] uppercase tracking-[0.2em]'>Username</label>
                            <input
                                type='text'
                                value={formData.username}
                                onChange={(e) => handleInputChange("username", e.target.value)}
                                className='w-full px-2 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-[#e0e0e0] text-xs font-bold focus:border-[#ff5757] outline-none transition-all'
                            />
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className='space-y-0.5'>
                        <h3 className='text-[9px] font-black text-[#606060] uppercase tracking-[0.2em] flex items-center gap-1'>
                            Social Profiles
                        </h3>
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-1'>
                            <div className="space-y-0.5">
                                <label className='text-[9px] text-[#ff5757] flex items-center gap-1 uppercase font-black tracking-widest'>
                                    <Linkedin className='w-2.5 h-2.5' /> LinkedIn
                                </label>
                                <input
                                    type='url'
                                    placeholder='URL'
                                    value={formData.linkedInUrl}
                                    onChange={(e) => handleInputChange("linkedInUrl", e.target.value)}
                                    className='w-full px-2 py-1 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-[#e0e0e0] text-[9px] font-bold focus:border-[#ff5757] outline-none'
                                />
                            </div>
                            <div className="space-y-0.5">
                                <label className='text-[9px] text-[#ff5757] flex items-center gap-1 uppercase font-black tracking-widest'>
                                    <Github className='w-2.5 h-2.5' /> GitHub
                                </label>
                                <input
                                    type='url'
                                    placeholder='URL'
                                    value={formData.githubUrl}
                                    onChange={(e) => handleInputChange("githubUrl", e.target.value)}
                                    className='w-full px-2 py-1 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-[#e0e0e0] text-[9px] font-bold focus:border-[#ff5757] outline-none'
                                />
                            </div>
                            <div className="space-y-0.5">
                                <label className='text-[9px] text-[#ff5757] flex items-center gap-1 uppercase font-black tracking-widest'>
                                    <ExternalLink className='w-2.5 h-2.5' /> LeetCode
                                </label>
                                <input
                                    type='url'
                                    placeholder='URL'
                                    value={formData.leetCodeUrl}
                                    onChange={(e) => handleInputChange("leetCodeUrl", e.target.value)}
                                    className='w-full px-2 py-1 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-[#e0e0e0] text-[9px] font-bold focus:border-[#ff5757] outline-none'
                                />
                            </div>
                        </div>
                    </div>

                    <div className='h-px bg-gradient-to-r from-transparent via-[#2a2a2a] to-transparent' />

                    {/* Goal Selection */}
                    <div className='space-y-0.5'>
                        <h3 className='text-[9px] font-black text-[#e0e0e0] uppercase tracking-widest'>
                            Goal 🎯
                        </h3>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-1'>
                            {DSA_GOALS.map((goal) => {
                                const isSelected = formData.goal === goal.value;
                                return (
                                    <button
                                        key={goal.value}
                                        onClick={() => handleInputChange("goal", goal.value)}
                                        className={cn(
                                            "relative overflow-hidden p-2 rounded-lg border transition-all duration-300 group hover:scale-[1.01] active:scale-[0.98] flex items-center text-left min-h-[85px]",
                                            isSelected
                                                ? "border-[#ff5757] text-white shadow-[0_0_15px_rgba(255,87,87,0.15)]"
                                                : "bg-black/20 border-[#2a2a2a] text-[#a0a0a0] hover:border-[#ff5757]/20"
                                        )}
                                    >
                                        {/* Top-Right Decorative Cut/Glint - Softer */}
                                        <div className={cn(
                                            "absolute top-0 right-0 w-12 h-12 bg-white/10 transition-transform duration-1000 -rotate-45 translate-x-6 -translate-y-6 blur-xl group-hover:bg-white/20",
                                            isSelected ? "bg-white/30 scale-150" : ""
                                        )} />

                                        {/* Blurry Silver Background Transition */}
                                        <div className={cn(
                                            "absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_70%)] transition-all duration-1000 blur-2xl",
                                            isSelected ? "opacity-100 scale-110" : "opacity-0 scale-75"
                                        )} />

                                        <div className='relative z-10 flex items-center gap-3'>
                                            <span className={cn(
                                                "text-xl p-1.5 rounded-lg transition-colors",
                                                isSelected ? "bg-white/10" : "bg-black/40"
                                            )}>{goal.icon}</span>
                                            <div>
                                                <div className='font-black text-[12px] uppercase tracking-tighter leading-none'>{goal.label}</div>
                                                <div className={cn(
                                                    'text-[8px] font-bold mt-1 line-clamp-2',
                                                    isSelected ? "text-white/80" : "text-[#606060]"
                                                )}>{goal.description}</div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Timeline Selection */}
                    <div className='space-y-0.5'>
                        <h3 className='text-[9px] font-black text-[#e0e0e0] uppercase tracking-widest'>
                            Timeline ⏳
                        </h3>
                        <div className='grid grid-cols-3 gap-1'>
                            {DSA_TIMELINES.map((tm) => {
                                const isSelected = formData.timeline === tm.value;
                                return (
                                    <button
                                        key={tm.value}
                                        onClick={() => handleInputChange("timeline", tm.value)}
                                        className={cn(
                                            "relative overflow-hidden p-2 rounded-lg border transition-all duration-300 group hover:scale-[1.05] active:scale-[0.98] flex flex-col items-center justify-center min-h-[60px]",
                                            isSelected
                                                ? "border-[#ff5757] text-white shadow-[0_0_10px_rgba(255,87,87,0.2)]"
                                                : "bg-black/20 border-[#2a2a2a] text-[#a0a0a0] hover:border-[#ff5757]/30"
                                        )}
                                    >
                                        {/* Top-Right Decorative Cut/Glint - Softer */}
                                        <div className={cn(
                                            "absolute top-0 right-0 w-8 h-8 bg-white/10 transition-transform duration-1000 -rotate-45 translate-x-4 -translate-y-4 blur-lg group-hover:bg-white/20",
                                            isSelected ? "bg-white/30 scale-125" : ""
                                        )} />

                                        <div className={cn(
                                            "absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_60%)] transition-all duration-1000 blur-xl",
                                            isSelected ? "opacity-100 scale-110" : "opacity-0 scale-75"
                                        )} />
                                        <div className="relative z-10 flex flex-col items-center gap-1">
                                            <span className='text-xl'>{tm.icon}</span>
                                            <span className='text-[9px] font-black uppercase tracking-tighter leading-none'>{tm.label}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Experience Selection */}
                    <div className='space-y-0.5'>
                        <h3 className='text-[9px] font-black text-[#e0e0e0] uppercase tracking-widest'>
                            Experience 🚀
                        </h3>
                        <div className='grid grid-cols-2 sm:grid-cols-4 gap-1'>
                            {DSA_EXPERIENCE_LEVELS.map((exp) => {
                                const isSelected = formData.experienceLevel === exp.value;
                                return (
                                    <button
                                        key={exp.value}
                                        onClick={() => handleInputChange("experienceLevel", exp.value)}
                                        className={cn(
                                            "relative overflow-hidden p-1.5 rounded-lg border transition-all duration-300 group hover:scale-[1.05] active:scale-[0.98]",
                                            isSelected
                                                ? "border-[#ff5757] text-white shadow-[0_0_8px_rgba(255,87,87,0.2)]"
                                                : "bg-black/20 border-[#2a2a2a] text-[#a0a0a0] hover:border-[#ff5757]/30"
                                        )}
                                    >
                                        {/* Top-Right Decorative Cut/Glint - Softer */}
                                        <div className={cn(
                                            "absolute top-0 right-0 w-8 h-8 bg-white/10 transition-transform duration-1000 -rotate-45 translate-x-4 -translate-y-4 blur-lg group-hover:bg-white/20",
                                            isSelected ? "bg-white/30 scale-125" : ""
                                        )} />

                                        <div className={cn(
                                            "absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_60%)] transition-all duration-1000 blur-xl",
                                            isSelected ? "opacity-100 scale-110" : "opacity-0 scale-75"
                                        )} />
                                        <span className='relative z-10 text-[8px] font-black uppercase tracking-tight'>{exp.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className='pt-1 flex flex-col sm:flex-row gap-1'>
                        <Button
                            onClick={() => { setActiveBtn("update"); handleSubmit(); }}
                            disabled={loading}
                            className={cn(
                                "flex-1 py-1.5 h-auto font-black text-[11px] uppercase tracking-widest transition-all rounded-lg",
                                "bg-[#ff5757] text-white hover:bg-[#ff5252] shadow-[0_2px_10px_rgba(255,87,87,0.2)]"
                            )}
                        >
                            {loading ? "Updating..." : "Update Preferences"}
                        </Button>
                        <Button
                            onClick={() => { setActiveBtn("cancel"); onClose(); }}
                            variant="outline"
                            className={cn(
                                "flex-1 py-1.5 h-auto font-black text-[11px] uppercase tracking-widest border border-[#2a2a2a] bg-transparent text-[#a0a0a0] rounded-lg transition-all",
                                "hover:bg-white/5 hover:text-[#606060]",
                                "active:bg-black active:text-white active:border-black focus:bg-black focus:text-white focus:border-black"
                            )}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default EditDsaOnboardingModal
