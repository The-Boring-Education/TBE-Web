import {useState, useEffect} from "react";

import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {InputField} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {useToast} from "@/hooks/use-toast";
import {useUser} from "@/hooks/use-user";
import {RecruiterContact} from "@/types/recruiters";

interface AddRecruiterModalProps {
    isOpen: boolean
    onClose: () => void
    onContactAdded: () => void
    onContactUpdated?: () => void
    editContact?: RecruiterContact | null
    mongoUserId: string
}

const AddRecruiterModal = ({
    isOpen,
    onClose,
    onContactAdded,
    onContactUpdated,
    editContact,
    mongoUserId
}: AddRecruiterModalProps) => {
    const {toast} = useToast();
    const {isAuthenticated} = useUser();
    const [loading, setLoading] = useState(false);
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
    });

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
            });
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
            });
        }
    }, [editContact, isOpen]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!isAuthenticated) {
                toast({
                    title: "Error",
                    description: "User not authenticated.",
                    variant: "destructive"
                });
                return;
            }

            const payload = {
                ...formData,
                userId: mongoUserId
            };

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_TBE_WEBAPP_API_URL}/prepyatra/recruiter`,
                {
                    method: editContact ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(
                        editContact
                            ? {recruiterId: editContact._id, ...formData}
                            : payload
                    )
                }
            );

            const result = await response.json();

            if (!result.status) {throw new Error(result.message);}

            toast({
                title: "Success",
                description: `Recruiter ${
                    editContact ? "updated" : "added"
                } successfully!`
            });

            if (editContact && onContactUpdated) {
                onContactUpdated();
            } else if (!editContact && onContactAdded) {
                onContactAdded();
            }
            onClose();
        } catch (err) {
            console.error(err);
            toast({
                title: "Error",
                description: err.message || "Something went wrong",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass-dark border-primary/20'>
                <DialogHeader>
                    <DialogTitle className='text-white'>
                        {editContact
                            ? "Edit Recruiter Contact"
                            : "Add New Recruiter Contact"}
                    </DialogTitle>
                    <DialogDescription className='text-gray'>
                        {editContact
                            ? "Update recruiter information and progress."
                            : "Add a new recruiter contact to your prep journey."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <InputField
                            label='Name'
                            value={formData.recruiterName}
                            field='recruiterName'
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label='Email'
                            type='email'
                            value={formData.email}
                            field='email'
                            placeholder='Optional'
                            onChange={handleInputChange}
                        />
                        <InputField
                            label='Phone'
                            placeholder='Optional'
                            value={formData.phone}
                            field='phone'
                            onChange={handleInputChange}
                        />
                        <InputField
                            label='Company'
                            placeholder='Optional'
                            value={formData.company}
                            field='company'
                            onChange={handleInputChange}
                        />
                        <InputField
                            label='Applied Position'
                            placeholder='Optional'
                            value={formData.appliedPosition}
                            field='appliedPosition'
                            onChange={handleInputChange}
                        />
                        <div className='flex gap-2 flex-col'>
                            <Label
                                htmlFor='applicationStatus'
                                className='text-white'>
                                Status
                            </Label>
                            <select
                                value={formData.applicationStatus}
                                onChange={(e) =>
                                    handleInputChange(
                                        "applicationStatus",
                                        e.target.value
                                    )
                                }
                                className='bg-gray-800 border border-primary/20 text-white rounded-md px-2 py-2'>
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
                            field='follow_up_date'
                            onChange={handleInputChange}
                        />
                        <InputField
                            label='Last Interview Date'
                            type='date'
                            value={formData.last_interview_date}
                            field='last_interview_date'
                            onChange={handleInputChange}
                        />
                        <InputField
                            label='Link'
                            value={formData.link}
                            placeholder='Optional'
                            field='link'
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor='comments' className='text-white'>
                            Comments
                        </Label>
                        <Textarea
                            id='comments'
                            placeholder='Optional'
                            value={formData.comments}
                            onChange={(e) =>
                                handleInputChange("comments", e.target.value)
                            }
                            className='bg-gray-800 border-gray-600 text-white resize-none'
                            rows={3}
                        />
                    </div>
                    <DialogFooter className='flex flex-col-reverse md:flex-row gap-2'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={onClose}
                            className='border-gray-300 text-white hover:bg-gray-100'>
                            Cancel
                        </Button>
                        <Button
                            type='submit'
                            disabled={loading}
                            className='bg-primary text-primary-foreground'>
                            {loading
                                ? editContact
                                    ? "Updating..."
                                    : "Creating..."
                                : editContact
                                ? "Update Contact"
                                : "Create Contact"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddRecruiterModal;
