"use client";

import { ContentFeedbackWidget } from "@tbe/components";

interface ResourceFeedbackButtonProps {
  slug: string;
  title?: string;
}

/**
 * Client-side wrapper to render ContentFeedbackWidget
 * inside the server-rendered resource page.
 */
export default function ResourceFeedbackButton({
  slug,
  title,
}: ResourceFeedbackButtonProps) {
  return (
    <ContentFeedbackWidget
      contentType="RESOURCE_GUIDE"
      contentId={slug}
      title="Rate this resource"
      meta={{
        resourceSlug: slug,
        resourceTitle: title || slug,
      }}
    />
  );
}
