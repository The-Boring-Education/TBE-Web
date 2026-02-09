import { useAuth } from "@tbe/auth"
import { useToast } from "@tbe/hooks"
import type { RecruiterContact } from "@tbe/types"
import { useEffect, useState } from "react"

import Button from "../../common/Buttons/Button"
import Text from "../../common/Typography/Text"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader
} from "../ui/dialog"
import { InputField } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"

interface AddRecruiterModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    onContactAdded: () => void
    onContactUpdated?: () => void
    editContact?: RecruiterContact | null
    mongoUserId: string
}

export const AddRecruiterModal = ({
    isOpen,
    onClose,
    onSuccess,
    onContactAdded,
    onContactUpdated,
    editContact,
    mongoUserId
}: AddRecruiterModalProps) => {
    const { toast } = useToast()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        recruiterName: "",
        email: "",
        phone: "",
        company: "",
        appliedPosition: "",
        applicationStatus: "Screening",
        follow_up_date: "",
        last_interview_date: "",
        link: "",
        comments: ""
    })

    useEffect(() => {
        if (editContact) {
            setFormData({
                recruiterName: editContact.recruiterName || "",
                email: editContact.email || "",
                phone: editContact.phone || "",
                company: editContact.company || "",
                appliedPosition: editContact.appliedPosition || "",
                applicationStatus: editContact.applicationStatus || "Screening",
                follow_up_date: editContact.follow_up_date || "",
                last_interview_date: editContact.last_interview_date || "",
                link: editContact.link || "",
                comments: editContact.comments || ""
            })
        } else {
            setFormData({
                recruiterName: "",
                email: "",
                phone: "",
                company: "",
                appliedPosition: "",
                applicationStatus: "Screening",
                follow_up_date: "",
                last_interview_date: "",
                link: "",
                comments: ""
            })
        }
    }, [editContact, isOpen])

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        console.log("🚀 SUBMITTING:", formData, "userId:", mongoUserId);
        try {
            if (!isAuthenticated) {
                console.error("❌ NOT AUTHENTICATED");
                toast({
                    title: "Error",
                    description: "User not authenticated.",
                    variant: "destructive"
                })
                return
            }

            const payload = {
                ...formData,
                userId: mongoUserId
            };
            console.log("📡 API URL:", `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/recruiter`);
            console.log("📦 SENDING PAYLOAD:", editContact ? { recruiterId: editContact._id, ...formData } : payload);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/recruiter`,
                {
                    method: editContact ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(
                        editContact
                            ? { recruiterId: editContact._id, ...formData }
                            : payload
                    )
                }
            );
            console.log("📥 RESPONSE STATUS:", response.status, response.statusText);
            console.log("📥 RESPONSE HEADERS:", Object.fromEntries(response.headers));

            const result = await response.json()
            console.log("📄 RESULT:", result);

            if (!result.status) {
                console.error("❌ API ERROR:", result.message);
                throw new Error(result.message)
            }

            toast({
                title: "Success",
                description: `Recruiter ${editContact ? "updated" : "added"
                    } successfully!`
            })

            if (onSuccess) {
                onSuccess()
            }

            if (editContact && onContactUpdated) {
                onContactUpdated()
            } else if (!editContact && onContactAdded) {
                onContactAdded()
            }
            onClose()
        } catch (err) {
            console.error("💥 FULL ERROR:", err);
            toast({
                title: "Error",
                description: err instanceof Error ? err.message : "Something went wrong",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="
    fixed
    left-1/2
    top-1/2
    -translate-x-1/2
    -translate-y-1/2
    sm:max-w-[560px]
    w-full
    max-h-[85vh]
    overflow-hidden
    glass
    border-greyLight
    p-4
  "
            >
                <DialogHeader pb-2 pt-1>
                    <h2 className="sr-only">Recruiter Contact</h2>
                    <Text level="h3" className='text-contentLight text-base font-semibold leading-tight'>
                        {editContact ? "Edit Recruiter Contact" : "Add New Recruiter Contact"}
                    </Text>
                    <p className='text-greyDark text-sm sr-only'>
                        {editContact
                            ? "Update recruiter information and progress."
                            : "Add a new recruiter contact to your prep journey."}
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className='space-y-1'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-1'>
                        <InputField
                            label='Name'
                            value={formData.recruiterName}
                            className='bg-white border-greyLight text-contentLight h-4 text-sm placeholder:text-greyDark'
                            field='recruiterName'
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label='Email'
                            type='email'
                            value={formData.email}
                            className='bg-white border-greyLight text-contentLight h-4 text-sm  placeholder:text-greyDark'
                            field='email'
                            placeholder='Optional'
                            onChange={handleInputChange}
                        />
                        <InputField
                            label='Phone'
                            placeholder='Optional'
                            value={formData.phone}
                            className='bg-white border-greyLight text-contentLight h-4 text-sm placeholder:text-greyDark'
                            field='phone'
                            onChange={handleInputChange}
                        />
                        <InputField
                            label='Company'
                            placeholder='Optional'
                            value={formData.company}
                            className='bg-white border-greyLight text-contentLight h-4 text-sm  placeholder:text-greyDark'
                            field='company'
                            onChange={handleInputChange}
                        />
                        <InputField
                            label='Applied Position'
                            placeholder='Optional'
                            value={formData.appliedPosition}
                            className='bg-white border-greyLight text-contentLight h-4 text-sm  placeholder:text-greyDark'
                            field='appliedPosition'
                            onChange={handleInputChange}
                        />
                        <div className='flex gap-2 flex-col'>
                            <Label
                                htmlFor='applicationStatus'
                                className='text-contentLight'>                                Status
                            </Label>
                            <select
                                value={formData.applicationStatus}
                                onChange={(e) =>
                                    handleInputChange(
                                        "applicationStatus",
                                        e.target.value
                                    )
                                }
                                className='bg-white border border-greyLight text-contentLight rounded-md px-0.5 py-0.5 text-sm h-4'>
                                <option value='Screening in Process'>
                                    Screening in Process
                                </option>
                                <option value='Interviewing'>
                                    Interviewing
                                </option>
                                <option value='Final Round Offer'>
                                    Final Round Offer
                                </option>
                                <option value='Offer Letter'>
                                    Offer Letter
                                </option>
                                <option value='Rejected'>Rejected</option>
                            </select>
                        </div>
                        <InputField
                            label='Follow-up Date'
                            type='date'
                            value={formData.follow_up_date}
                            className='bg-white border-greyLight text-contentLight h-4 text-sm  placeholder:text-greyDark'
                            field='follow_up_date'
                            onChange={handleInputChange}
                        />
                        <InputField
                            label='Last Interview Date'
                            type='date'
                            value={formData.last_interview_date}
                            className='bg-white border-greyLight text-contentLight h-4 text-sm  placeholder:text-greyDark'
                            field='last_interview_date'
                            onChange={handleInputChange}
                        />
                        <InputField
                            label='Link'
                            value={formData.link}
                            placeholder='Optional'
                            className='bg-white border-greyLight text-contentLight h-4 text-sm  placeholder:text-greyDark'
                            field='link'
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor='comments' className='text-contentLight'>Comments
                        </Label>
                        <Textarea
                            id='comments'
                            placeholder='Optional'
                            value={formData.comments}
                            onChange={(e: any) =>
                                handleInputChange("comments", e.target.value)
                            }
                            className='bg-white border-greyLight text-contentLight border resize-none h-5 text-sm  placeholder:text-greyDark'
                            rows={3}
                        />
                    </div>
                    <DialogFooter className='flex flex-col-reverse md:flex-row gap-1'>
                        <Button
                            variant="OUTLINE"
                            size="SMALL"
                            text="Cancel"
                            onClick={onClose}
                            className='text-sm h-5 px-3'
                            type="button"
                        />
                        <Button
                            variant="PRIMARY"
                            size="SMALL"
                            text={loading
                                ? editContact
                                    ? "Updating..."
                                    : "Creating..."
                                : editContact
                                    ? "Update Contact"
                                    : "Create Contact"}
                            disabled={loading}
                            className='text-sm h-5 px-3'
                            type="submit"
                        />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


