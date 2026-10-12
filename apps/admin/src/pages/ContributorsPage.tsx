import { CheckCircle2, ExternalLink, Search, X, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  type ContributorSubmission,
  useAdminSubmissions,
  useReviewSubmission,
} from "@/api/contributorsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContributorsPage() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] =
    useState<ContributorSubmission | null>(null);

  // Review modal state
  const [awardedXpInput, setAwardedXpInput] = useState<number>(5);
  const [feedbackInput, setFeedbackInput] = useState("");

  const { data: submissions = [], isLoading } = useAdminSubmissions(
    statusFilter,
    searchTerm,
  );
  const reviewMutation = useReviewSubmission();

  const handleOpenReview = (item: ContributorSubmission) => {
    setSelectedSubmission(item);
    setAwardedXpInput(item.awardedXp > 0 ? item.awardedXp : item.standardXp);
    setFeedbackInput(item.adminFeedback || "");
  };

  const handleReview = async (action: "approve" | "reject") => {
    if (!selectedSubmission) return;

    try {
      await reviewMutation.mutateAsync({
        id: selectedSubmission._id,
        action,
        awardedXp: action === "approve" ? Number(awardedXpInput) : 0,
        feedback: feedbackInput,
      });

      toast.success(
        action === "approve"
          ? `Approved and awarded ${awardedXpInput} XP!`
          : "Submission rejected with feedback.",
      );
      setSelectedSubmission(null);
    } catch {
      toast.error("Failed to submit review. Please try again.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Contributor Submissions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review code PRs, bug reports, and social posts. Award XP and provide
            feedback.
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="bg-white border rounded-xl px-4 py-2 text-center shadow-sm">
            <span className="text-xs text-gray-500 block">Total</span>
            <span className="text-lg font-bold text-gray-900">
              {submissions.length}
            </span>
          </div>
          <div className="bg-white border rounded-xl px-4 py-2 text-center shadow-sm">
            <span className="text-xs text-amber-600 block font-semibold">
              Pending
            </span>
            <span className="text-lg font-bold text-amber-600">
              {submissions.filter((s) => s.status === "pending").length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {["All", "Pending", "Approved", "Rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === tab
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search contributor, title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-400">
            Loading submissions...
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            No submissions found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold text-xs border-b">
                <tr>
                  <th className="py-3 px-4">Contributor</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Title & Proof</th>
                  <th className="py-3 px-4">XP</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900">
                        {item.contributorName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.contributorEmail}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-mono font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="font-medium text-gray-900 truncate">
                        {item.title}
                      </p>
                      <a
                        href={item.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-0.5 truncate max-w-xs"
                      >
                        Proof Link <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900">
                        {item.status === "approved"
                          ? `+${item.awardedXp} XP`
                          : `${item.standardXp} XP (base)`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant={
                          item.status === "pending" ? "default" : "outline"
                        }
                        onClick={() => handleOpenReview(item)}
                        className="rounded-xl text-xs"
                      >
                        {item.status === "pending" ? "Review" : "Edit Review"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                Review Contribution
              </h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase">
                    Contributor
                  </span>
                  <p className="font-bold text-gray-900">
                    {selectedSubmission.contributorName} (
                    {selectedSubmission.contributorEmail})
                  </p>
                </div>

                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase">
                    Title
                  </span>
                  <p className="font-medium text-gray-900">
                    {selectedSubmission.title}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase">
                    Proof Link
                  </span>
                  <p>
                    <a
                      href={selectedSubmission.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline break-all text-xs inline-flex items-center gap-1 font-medium"
                    >
                      {selectedSubmission.proofUrl}{" "}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>

                {selectedSubmission.description && (
                  <div>
                    <span className="text-xs text-gray-500 font-semibold uppercase">
                      Contributor Notes
                    </span>
                    <p className="text-xs text-gray-700 mt-0.5">
                      {selectedSubmission.description}
                    </p>
                  </div>
                )}
              </div>

              {/* XP Award Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Awarded XP (Base: {selectedSubmission.standardXp} XP)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={awardedXpInput}
                  onChange={(e) => setAwardedXpInput(Number(e.target.value))}
                  className="rounded-xl text-sm"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  You can increase XP for exceptional quality, viral posts, or
                  major features.
                </span>
              </div>

              {/* Feedback Note Textarea */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Reviewer Notes / Rejection Reason
                </label>
                <textarea
                  rows={3}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="e.g. Great job on the clean tests! or PR is not merged yet, please re-submit after merge."
                  className="w-full text-sm border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  This note will be visible to the contributor on their
                  dashboard.
                </span>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="destructive"
                  disabled={reviewMutation.isPending}
                  onClick={() => handleReview("reject")}
                  className="rounded-xl text-xs flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> Reject with Feedback
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSelectedSubmission(null)}
                    className="rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={reviewMutation.isPending}
                    onClick={() => handleReview("approve")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & Award XP
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
