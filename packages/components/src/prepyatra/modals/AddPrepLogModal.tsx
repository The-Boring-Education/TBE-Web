import {useEffect, useState} from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
    } from "../ui/dialog";
import {InputField} from "../ui/input";
import {Label} from "../ui/label";
import {Textarea} from "../ui/textarea";
import {useToast} from "../ui/use-toast";
import {prepLogsService} from "@tbe/services";
import Button from "../../common/Buttons/Button";
import Text from "../../common/Typography/Text";
import FlexContainer from "../../containers/Page/common/FlexContainer";

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
                description: err instanceof Error ? err.message : "Something went wrong",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass border-greyLight'>
                <DialogHeader>
                    <Text level="h3" className='text-contentLight text-lg font-semibold'>
                        {editLog ? "Edit Prep Log" : "Add New Prep Log"}
                    </Text>
                    <Text level="p" className='text-greyDark text-sm'>
                        {editLog
                            ? "Update your existing preparation log entry."
                            : "Log your daily preparation efforts."}
                    </Text>
                </DialogHeader>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <InputField
                        label='Title'
                        field='title'
                        value={formData.title}
                        className='bg-white border-greyLight text-contentLight' 
                        onChange={handleInputChange}
                        placeholder='E.g. Solved Leetcode Mediums'
                        required
                    />

                    <div className='flex flex-col gap-2'>
                        <Text level="label" className='text-contentLight'>
                            Description
                        </Text>
                        <Textarea
                            id='description'
                            value={formData.description}
                            onChange={(e) =>
                                handleInputChange("description", e.target.value)
                            }
                            placeholder='Briefly describe your preparation work...'
                            className='bg-white border-greyLight text-contentLight resize-none'
                            rows={3}
                        />
                    </div>

                    <InputField
                        label='Time Spent (in hours)'
                        field='timeSpent'
                        value={formData.timeSpent}
                        className='bg-white border-greyLight text-contentLight'
                        type='number'
                        onChange={handleInputChange}
                        placeholder='E.g. 1.5'
                        required
                    />

                    <DialogFooter className='flex flex-col-reverse md:flex-row gap-2'>
                        <Button
                            variant="OUTLINE"
                            text="Cancel"
                            onClick={onClose}
                            className='text-sm h-5'
                            size="SMALL"
                        />
                        <Button
                            variant="PRIMARY"
                            text={loading
                                ? editLog
                                    ? "Updating..."
                                    : "Creating..."
                                : editLog
                                ? "Update Log"
                                : "Add Log"}
                            disabled={loading}
                            size="SMALL"
                            className='text-sm h-5'
                        />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddPrepLogModal;
