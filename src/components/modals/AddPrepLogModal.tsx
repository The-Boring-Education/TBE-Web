import {useEffect, useState} from "react";

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
import {prepLogsService} from "@/services/prep-logs";

interface AddPrepLogModalProps {
    isOpen: boolean
    onClose: () => void
    onLogAdded: () => void
    mongoUserId: string
    editLog?: {
        _id: string
        title: string
        description?: string
        timeSpent: number
    } | null
}

const AddPrepLogModal = ({
    isOpen,
    onClose,
    onLogAdded,
    mongoUserId,
    editLog
}: AddPrepLogModalProps) => {
    const {toast} = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        timeSpent: ""
    });

    useEffect(() => {
        if (editLog) {
            setFormData({
                title: editLog.title || "",
                description: editLog.description || "",
                timeSpent: editLog.timeSpent.toString() || ""
            });
        } else {
            setFormData({title: "", description: "", timeSpent: ""});
        }
    }, [editLog, isOpen]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const {title, description, timeSpent} = formData;

        if (!title || !timeSpent) {
            toast({
                title: "Error",
                description: "Title and Time Spent are required",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        try {
            if (editLog) {
                // Update existing log
                await prepLogsService.update({
                    title,
                    description,
                    timeSpent: Number(timeSpent),
                    prepLogId: editLog._id
                });
            } else {
                // Create new log
                await prepLogsService.create({
                    title,
                    description,
                    timeSpent: Number(timeSpent),
                    userId: mongoUserId
                });
            }

            toast({
                title: "Success",
                description: `Prep Log ${
                    editLog ? "updated" : "added"
                } successfully!`
            });

            onLogAdded();
            onClose();
        } catch (err) {
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
                        {editLog ? "✏️ Edit Prep Log" : "📝 Add New Prep Log"}
                    </DialogTitle>
                    <DialogDescription className='text-gray'>
                        {editLog
                            ? "Update your existing preparation log entry."
                            : "Log your daily preparation efforts."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <InputField
                        label='Title'
                        field='title'
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder='E.g. Solved Leetcode Mediums'
                        required
                    />

                    <div className='flex gap-2 flex-col'>
                        <Label htmlFor='description' className='text-white'>
                            Description
                        </Label>
                        <Textarea
                            id='description'
                            value={formData.description}
                            onChange={(e) =>
                                handleInputChange("description", e.target.value)
                            }
                            placeholder='Briefly describe your preparation work...'
                            className='bg-gray-800 border-gray-600 text-white resize-none'
                            rows={3}
                        />
                    </div>

                    <InputField
                        label='Time Spent (in hours)'
                        field='timeSpent'
                        value={formData.timeSpent}
                        type='number'
                        onChange={handleInputChange}
                        placeholder='E.g. 1.5'
                        required
                    />

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
                                ? editLog
                                    ? "Updating..."
                                    : "Creating..."
                                : editLog
                                ? "Update Log"
                                : "Add Log"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddPrepLogModal;
