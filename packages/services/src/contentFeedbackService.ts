import type {
  ContentFeedbackType,
  CreateContentFeedbackRequestPayloadProps,
  GetContentFeedbackResponsePayloadProps,
} from "@tbe/types";
import { type APIResponseType, sendRequest } from "@tbe/utils";

const CONTENT_FEEDBACK_URL = "/feedback/content";

export const contentFeedbackService = {
  async create(
    payload: CreateContentFeedbackRequestPayloadProps,
  ): Promise<APIResponseType> {
    return sendRequest({
      url: CONTENT_FEEDBACK_URL,
      method: "POST",
      data: payload,
    });
  },

  async list({
    contentType,
    contentId,
  }: {
    contentType: ContentFeedbackType;
    contentId: string;
  }): Promise<
    APIResponseType & { data?: GetContentFeedbackResponsePayloadProps }
  > {
    const params = new URLSearchParams({ contentType, contentId });
    return sendRequest({
      url: `${CONTENT_FEEDBACK_URL}?${params.toString()}`,
      method: "GET",
    });
  },
};
