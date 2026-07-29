import { useContentFeedback, useUser } from "@tbe/hooks";
import type { ContentFeedbackProps } from "@tbe/interface";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Star } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import Button from "../Buttons/Button";
import LoadingSpinner from "../LoadingSpinner";

type FeedbackTab = "EXISTING_CONTENT" | "NEW_CONTENT_SUGGESTION";

const TAB_LABELS: Record<FeedbackTab, string> = {
  EXISTING_CONTENT: "Report an issue",
  NEW_CONTENT_SUGGESTION: "Suggest new content",
};

const initialFormState = {
  message: "",
  suggestedEdit: "",
  rating: 0,
};

const ContentFeedback = ({
  contentType,
  contentId,
  title = "Was this helpful?",
  className,
}: ContentFeedbackProps) => {
  const { isAuth, loading: userLoading } = useUser();
  const [activeTab, setActiveTab] = useState<FeedbackTab>("EXISTING_CONTENT");
  const [form, setForm] = useState(initialFormState);
  const [showSuccess, setShowSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { submit, isSubmitting, submitError, reset } = useContentFeedback({
    contentType,
    contentId,
  });

  const canSubmit = useMemo(
    () => form.message.trim().length >= 5 && !isSubmitting,
    [form.message, isSubmitting],
  );

  const resetForm = useCallback(() => {
    setForm(initialFormState);
    setLocalError(null);
    reset();
  }, [reset]);

  const handleTabChange = useCallback(
    (tab: FeedbackTab) => {
      setActiveTab(tab);
      resetForm();
      setShowSuccess(false);
    },
    [resetForm],
  );

  const handleSubmit = useCallback(async () => {
    setLocalError(null);
    if (form.message.trim().length < 5) {
      setLocalError("Please write at least 5 characters.");
      return;
    }

    try {
      await submit({
        feedbackKind: activeTab,
        message: form.message.trim(),
        rating:
          activeTab === "EXISTING_CONTENT" && form.rating > 0
            ? form.rating
            : undefined,
        suggestedEdit:
          activeTab === "EXISTING_CONTENT" && form.suggestedEdit.trim()
            ? form.suggestedEdit.trim()
            : undefined,
      });
      setShowSuccess(true);
      setForm(initialFormState);
    } catch {
      // error surfaced via submitError
    }
  }, [activeTab, form.message, form.rating, form.suggestedEdit, submit]);

  const containerClass = [
    "mt-8 rounded-2xl border border-gray-800/70 bg-[#111] p-5 text-white",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if (userLoading) {
    return (
      <div className={containerClass}>
        <div className="flex items-center justify-center py-6">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={containerClass}
      aria-label="Content feedback"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-red-500">
          {title}
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-gray-500">
          Help us improve
        </span>
      </div>

      {!isAuth ? (
        <div className="rounded-xl border border-red-900/30 bg-red-900/10 p-4 text-sm text-red-300">
          Please sign in to share feedback or suggest new content.
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {(Object.keys(TAB_LABELS) as FeedbackTab[]).map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isActive
                      ? "border-red-500/60 bg-red-500/10 text-red-300"
                      : "border-gray-700 bg-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200"
                  }`}
                  aria-pressed={isActive}
                >
                  {TAB_LABELS[tab]}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl border border-green-900/40 bg-green-900/10 p-4 text-sm text-green-300"
              >
                <p className="mb-3 font-semibold">
                  Thanks! Your feedback has been recorded.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccess(false);
                    resetForm();
                  }}
                  className="text-xs font-bold uppercase tracking-wider text-green-400 underline underline-offset-4 hover:text-green-300"
                >
                  Send another
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {activeTab === "EXISTING_CONTENT" && (
                  <div>
                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Rating (optional)
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((value) => {
                        const isFilled = value <= form.rating;
                        return (
                          <button
                            key={value}
                            type="button"
                            aria-label={`Rate ${value} out of 5`}
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                rating: prev.rating === value ? 0 : value,
                              }))
                            }
                            className="p-1"
                          >
                            <Star
                              className={`h-5 w-5 transition-colors ${
                                isFilled
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-600 hover:text-gray-400"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="content-feedback-message"
                    className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-gray-400"
                  >
                    {activeTab === "EXISTING_CONTENT"
                      ? "What's wrong or could be better?"
                      : "What would you like us to add?"}
                  </label>
                  <textarea
                    id="content-feedback-message"
                    value={form.message}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, message: e.target.value }))
                    }
                    rows={4}
                    maxLength={2000}
                    placeholder={
                      activeTab === "EXISTING_CONTENT"
                        ? "Describe the issue or improvement you have in mind..."
                        : "Describe the new question, topic, or content you'd like to see..."
                    }
                    className="w-full resize-none rounded-xl border border-gray-800 bg-[#0a0a0a] p-3 text-sm text-gray-200 placeholder:text-gray-600 outline-none transition-all focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
                  />
                  <div className="mt-1 text-right text-[10px] text-gray-600">
                    {form.message.length}/2000
                  </div>
                </div>

                {activeTab === "EXISTING_CONTENT" && (
                  <div>
                    <label
                      htmlFor="content-feedback-edit"
                      className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-gray-400"
                    >
                      Suggested edit (optional)
                    </label>
                    <textarea
                      id="content-feedback-edit"
                      value={form.suggestedEdit}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          suggestedEdit: e.target.value,
                        }))
                      }
                      rows={3}
                      maxLength={5000}
                      placeholder="Paste the exact wording you'd suggest..."
                      className="w-full resize-none rounded-xl border border-gray-800 bg-[#0a0a0a] p-3 text-sm text-gray-200 placeholder:text-gray-600 outline-none transition-all focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
                    />
                  </div>
                )}

                {(localError || submitError) && (
                  <div className="rounded-lg border border-red-900/40 bg-red-900/10 p-3 text-xs text-red-300">
                    {localError || submitError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="PRIMARY"
                    size="SMALL"
                    onClick={handleSubmit}
                    active={canSubmit}
                    isLoading={isSubmitting}
                    text={isSubmitting ? "Submitting..." : "Submit feedback"}
                    icon={<Send className="h-3.5 w-3.5" />}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.section>
  );
};

export default ContentFeedback;
