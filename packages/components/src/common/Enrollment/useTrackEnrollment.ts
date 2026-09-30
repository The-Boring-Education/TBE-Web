import { routes } from "@tbe/constants";
import { useGamifiedAction } from "@tbe/gamification";
import { useAnalytics, useUser } from "@tbe/hooks";
import { useMutation } from "@tbe/query";
import { sendRequest } from "@tbe/utils";
import { useCallback, useState } from "react";

export type TrackEnrollmentType = "course" | "sheet";

export interface UseTrackEnrollmentParams {
  /** Course or sheet identifier the learner is enrolling into. */
  id: string;
  /** Human readable track name, used for gamification metadata. */
  name: string;
  trackType?: TrackEnrollmentType;
}

export interface UseTrackEnrollmentResult {
  /** Performs the enrolment request. Resolves `true` only when the server recorded it. */
  enroll: () => Promise<boolean>;
  isEnrolling: boolean;
}

/**
 * Single source of truth for Shiksha course / interview sheet enrolment.
 *
 * Every enrolment entry point must go through this hook so an "unlocked" UI
 * always reflects an enrolment record that actually exists on the server.
 */
const useTrackEnrollment = ({
  id,
  name,
  trackType = "sheet",
}: UseTrackEnrollmentParams): UseTrackEnrollmentResult => {
  const { user } = useUser();
  const { trackEvent } = useAnalytics();
  const { triggerGamifiedAction } = useGamifiedAction();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const { mutateAsync: makeRequest } = useMutation({
    mutationFn: (params: Parameters<typeof sendRequest>[0]) =>
      sendRequest(params),
  });

  const enroll = useCallback(async () => {
    const isCourse = trackType === "course";
    setIsEnrolling(true);

    try {
      const response = await makeRequest({
        method: "POST",
        url: isCourse ? routes.api.enrollCourse : routes.api.enrollSheet,
        body: isCourse
          ? { userId: user?.id, courseId: id }
          : { userId: user?.id, sheetId: id },
      });

      // `sendRequest` resolves with the error payload instead of throwing, so
      // the response envelope is the only reliable success signal. An enrolment
      // that already exists is the state we want, so it counts as success too.
      const isEnrolledNow =
        Boolean(response?.status) ||
        /already enrolled/i.test(response?.message ?? "");

      if (!isEnrolledNow) return false;

      const actionName = isCourse ? "COURSE_ENROLL" : "INTERVIEW_SHEET_ENROLL";
      const categoryName = isCourse ? "Course" : "InterviewSheet";
      const labelName = isCourse
        ? "Course Enrolled"
        : "Interview Sheet Enrolled";

      trackEvent({
        action: actionName,
        category: categoryName,
        label: labelName,
        value: { userId: user?.id, id },
      });

      await triggerGamifiedAction({
        gamificationAction: isCourse ? "ENROLL_COURSE" : "ENROLL_SHEET",
        analytics: {
          action: actionName,
          category: categoryName,
          label: labelName,
        },
        customMessage: isCourse
          ? "Course enrolled! Happy learning!"
          : "Interview sheet enrolled! Time to practice!",
        metadata: { id, name },
      });

      return true;
    } finally {
      setIsEnrolling(false);
    }
  }, [
    id,
    makeRequest,
    name,
    trackEvent,
    trackType,
    triggerGamifiedAction,
    user?.id,
  ]);

  return { enroll, isEnrolling };
};

export default useTrackEnrollment;
