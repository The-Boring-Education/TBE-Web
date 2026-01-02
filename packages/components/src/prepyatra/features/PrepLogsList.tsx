import { prepLogsService } from "@tbe/services";
import { useState } from "react";

import Button from "../../common/Buttons/Button";
import Text from "../../common/Typography/Text";
import AddPrepLogModal from "../modals/AddPrepLogModal";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTrigger
} from "../ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { toast } from "../ui/use-toast";


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

const PrepLogCard = ({ logs, onLogUpdated, onLogDeleted, mongoUserId }: Props) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<PrepLog | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);


    const [visibleCount, setVisibleCount] = useState(7);


    const sortedLogs = [...logs].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const logsToShow = sortedLogs.slice(0, visibleCount);
    const hasMore = sortedLogs.length > visibleCount;


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
        if (!deleteId) { return; }

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
            <div className='mt-1'>
                <h2 className='text-lg font-semibold text-contentLight mb-1'>
                    Your Prep Logs
                </h2>
                <div className='glass rounded-1 p-4 text-center'>
                    <h3 className='text-base font-semibold text-contentLight mb-1'>
                        No PrepLogs Yet
                    </h3>
                    <p className='text-greyDark text-sm'>
                        Start building your recruiter network by adding your
                        first contact!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className=''>
                <h2 className='text-lg font-semibold text-contentLight mb-1'>
                    Your Prep Logs
                </h2>

                <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
                    {logsToShow.map((log) => (
                        <Card
                            key={log._id}
                            className='glass rounded-1 border border-greyLight transition-all'>
                            <CardHeader className='p-3 pb-2'>
                                <CardTitle className='text-contentLight text-base'>
                                    {log.title}
                                </CardTitle>
                                <p className='text-xs text-greyDark'>
                                    {new Date(
                                        log.createdAt
                                    ).toLocaleDateString()}{" "}
                                    • ⏱ {log.timeSpent} hr
                                </p>
                            </CardHeader>
                            <CardContent className='p-3 pt-2'>
                                <p className='text-greyDark text-sm mb-3'>
                                    {log.description || "No description"}
                                </p>
                                {log.mentorFeedback && (
                                    <div className='mb-3 rounded-md border border-purple-300/40 bg-purple-50 p-2'>
                                        <div className='text-[11px] font-semibold text-purple-800 mb-1'>
                                            Mentor Feedback
                                        </div>
                                        <p className='text-xs text-purple-900 whitespace-pre-line'>
                                            {log.mentorFeedback}
                                        </p>
                                    </div>
                                )}
                                <div className='flex gap-2 justify-start'>
                                    <Button
                                        variant="PRIMARY"
                                        size="SMALL"
                                        text="Edit"
                                        onClick={() =>
                                            openEditModal(log)
                                        }
                                    />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="OUTLINE"
                                                size="SMALL"
                                                text="Delete"
                                                onClick={() =>
                                                    setDeleteId(log._id)
                                                }
                                            />
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className='bg-white'>
                                            <AlertDialogHeader>
                                                <Text level="h3" className='text-contentLight text-base font-semibold'>
                                                    Delete Prep Log
                                                </Text>
                                                <Text level="p" className='text-greyDark text-sm'>
                                                    Are you sure you want to
                                                    delete this prep log? This
                                                    action cannot be undone.
                                                </Text>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
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
                <div className="mt-3 flex justify-center gap-3">
                    {visibleCount > 7 && (
                        <Button
                            variant="OUTLINE"
                            size="SMALL"
                            text="View less"
                            onClick={() => setVisibleCount(7)}
                        />
                    )}
                    {hasMore && (
                        <Button
                            variant="OUTLINE"
                            size="SMALL"
                            text="View more logs"
                            onClick={() => setVisibleCount((prev) => prev + 7)}
                        />
                    )}
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
