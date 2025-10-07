import {useState} from "react";

import AddPrepLogModal from "../modals/AddPrepLogModal";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from "../ui/alert-dialog";
import {Card, CardContent, CardHeader, CardTitle} from "../ui/card";
import {toast} from "../ui/use-toast";
import {prepLogsService} from "@tbe/services";
import Button from "../../common/Buttons/Button";
import Text from "../../common/Typography/Text";
import FlexContainer from "../../containers/Page/common/FlexContainer";

type PrepLog = {
    _id: string
    title: string
    description?: string
    timeSpent: number
    mentorFeedback?: string
    createdAt: string
}

interface Props {
    logs: PrepLog[]
    onLogUpdated: () => void
    onLogDeleted: (deletedLogId: string) => void
    mongoUserId: string
}

const PrepLogCard = ({logs, onLogUpdated, onLogDeleted, mongoUserId}: Props) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<PrepLog | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openEditModal = (log: PrepLog) => {
        setSelectedLog(log);
        setIsEditModalOpen(true);
    };

    const handleModalClose = () => {
        setIsEditModalOpen(false);
        setSelectedLog(null);
        // Trigger parent refresh when modal closes
        onLogUpdated();
    };

    const handleDelete = async () => {
        if (!deleteId) {return;}

        setIsDeleting(true);

        try {
            await prepLogsService.delete(deleteId);

            toast({
                title: "Log deleted",
                description: "Your prep log was successfully deleted.",
                variant: "default"
            });
            onLogDeleted(deleteId);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete log",
                variant: "destructive"
            });
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    if (logs.length === 0) {
        return (
            <div className='mt-8'>
                <h2 className='text-2xl font-bold text-white mb-4'>
                    📚 Your Prep Logs
                </h2>
                <div className='glass-dark rounded-2xl p-8 text-center'>
                    <h3 className='text-xl font-bold text-white mb-2'>
                        No PrepLogs Yet
                    </h3>
                    <p className='text-gray'>
                        Start building your recruiter network by adding your
                        first contact!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className='mt-8'>
                <h2 className='text-2xl font-bold text-white mb-4'>
                    📚 Your Prep Logs
                </h2>

                <div className='grid gap-4 md:grid-cols-2'>
                    {logs.map((log) => (
                        <Card
                            key={log._id}
                            className='glass-dark border border-primary/20 hover:border-primary/40 transition-all'>
                            <CardHeader>
                                <CardTitle className='text-white text-lg'>
                                    {log.title}
                                </CardTitle>
                                <p className='text-sm text-gray-400'>
                                    {new Date(
                                        log.createdAt
                                    ).toLocaleDateString()}{" "}
                                    • ⏱ {log.timeSpent} hr
                                </p>
                            </CardHeader>
                            <CardContent>
                                <p className='text-gray mb-4'>
                                    {log.description || "No description"}
                                </p>
                                 {log.mentorFeedback && (
                                     <div className='mb-4 rounded-md border border-purple-500/30 bg-purple-900/30 p-3'>
                                         <div className='text-xs font-semibold text-purple-200 mb-1'>
                                             Mentor Feedback
                                         </div>
                                         <p className='text-sm text-purple-100 whitespace-pre-line'>
                                             {log.mentorFeedback}
                                         </p>
                                     </div>
                                 )}
                                <div className='flex gap-2 justify-start'>
                                <button
                                                className='inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground border border-input rounded-md hover:bg-accent hover:text-accent-foreground'
                                                onClick={() =>
                                                    openEditModal(log)
                                                }>
                                                ✏️ Edit
                                            </button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button
                                                className='inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground border border-input rounded-md hover:bg-accent hover:text-accent-foreground'
                                                onClick={() =>
                                                    setDeleteId(log._id)
                                                }>
                                                ❌ Delete
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className='bg-gray-800 border-primary/20'>
                                            <AlertDialogHeader>
                                                <Text level="h3" className='text-white text-lg font-semibold'>
                                                    Delete Prep Log
                                                </Text>
                                                <Text level="p" className='text-gray-400 text-sm'>
                                                    Are you sure you want to
                                                    delete this prep log? This
                                                    action cannot be undone.
                                                </Text>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className='bg-muted border-primary/20 bg-gray-800 text-white '>
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    className='bg-red-600 text-white hover:bg-red-700'
                                                    onClick={handleDelete}
                                                    disabled={isDeleting}>
                                                    {isDeleting
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <AddPrepLogModal
                key={`edit-prep-log-${selectedLog?._id || "new"}`}
                isOpen={isEditModalOpen}
                onClose={handleModalClose}
                onLogAdded={onLogUpdated}
                mongoUserId={mongoUserId}
                editLog={selectedLog}
            />
        </>
    );
};

export default PrepLogCard;
