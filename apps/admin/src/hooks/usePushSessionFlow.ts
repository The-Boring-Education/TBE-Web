import { useToast } from "@/components/ui/use-toast";

export interface PushSessionFlowProps {
  updateSessionSheetMutation: any;
  pushToDatabase: any;
  deleteSession: any;
}

export const usePushSessionFlow = ({
  updateSessionSheetMutation,
  pushToDatabase,
  deleteSession,
}: PushSessionFlowProps) => {
  const { toast } = useToast();

  const executePushFlow = async (
    selectedSessionForPush: any,
    pushMetadata: any,
    onSuccess: () => void,
    onError: (error: any) => void,
  ) => {
    if (!selectedSessionForPush) return;

    try {
      toast({
        title: "Syncing...",
        description: "Updating session data with your changes...",
      });

      // 1. Sync metadata back to Agents API
      const sheetDataUpdate = {
        name: pushMetadata.name,
        slug: pushMetadata.slug,
        description: pushMetadata.description,
        meta: pushMetadata.meta,
        coverImageURL: pushMetadata.coverImageURL,
        roadmap: pushMetadata.roadmap,
        isPremium: pushMetadata.isPremium,
        price: pushMetadata.price,
        discountPercentage: pushMetadata.discountPercentage,
        appliedCoupon: pushMetadata.appliedCoupon,
        features: pushMetadata.features,
        frequency: pushMetadata.frequency,
        priority: pushMetadata.priority,
        companyTypes: pushMetadata.companyTypes,
        resources: pushMetadata.resources,
      };

      const targetSessionId =
        selectedSessionForPush.sessionId || selectedSessionForPush.session_id;

      await updateSessionSheetMutation.mutateAsync({
        sessionId: targetSessionId,
        sheetData: sheetDataUpdate,
      });

      toast({
        title: "Publishing...",
        description: "Pushing to database...",
      });

      // 2. Push to tbe-web DB endpoint
      await pushToDatabase.mutateAsync({
        sessionId: targetSessionId,
        payload: {
          metadata: pushMetadata,
          sheetData:
            selectedSessionForPush.sheet_data ||
            selectedSessionForPush.sheetData ||
            selectedSessionForPush,
        },
      });

      // 3. ONLY after successful DB push, delete the session from Agents API
      try {
        await deleteSession.mutateAsync(targetSessionId);
        toast({
          title: "Published!",
          description: "Session successfully published and queue cleared.",
        });
        onSuccess();
      } catch (deleteErr: any) {
        console.error(
          "Failed to delete from queue after publishing:",
          deleteErr,
        );
        toast({
          title: "Published (with warning)",
          description: "Saved to DB, but failed to clean up the queue.",
        });
        onSuccess(); // Still treat as push success
      }
    } catch (err: any) {
      console.error("Push to DB flow failed:\n", err);
      toast({
        title: "Publish Failed",
        description:
          err.response?.data?.message ||
          err.message ||
          "Failed to push to database",
        variant: "destructive",
      });
      onError(err);
    }
  };

  return { executePushFlow };
};
