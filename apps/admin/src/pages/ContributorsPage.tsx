import axios from "axios";
import { ExternalLink, Search } from "lucide-react";
import React, { useState } from "react";

import {
  useAdminContributions,
  useReviewContribution,
} from "@/api/contributorApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { AdminContributionItem } from "@/types/contributor";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "PR_BUG_FIX", label: "PR / Bug Fix" },
  { value: "CREATE_ISSUE", label: "Create Issue" },
  { value: "REVIEW_PR", label: "Review PR" },
  { value: "BLOG", label: "Blog" },
  { value: "POST", label: "Social Post" },
  { value: "EVENT_SESSION", label: "Event / Session" },
];

export default function ContributorsPage() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] =
    useState<AdminContributionItem | null>(null);
  const [awardedXp, setAwardedXp] = useState<number>(5);
  const [feedback, setFeedback] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading } = useAdminContributions(
    statusFilter,
    categoryFilter,
    search,
    page,
    20,
  );
  const reviewMutation = useReviewContribution();

  const handleOpenReview = (item: AdminContributionItem) => {
    setSelectedItem(item);
    setAwardedXp(item.standardXp);
    setFeedback("");
    setActionError(null);
  };

  const handleReviewAction = async (action: "approve" | "reject") => {
    if (!selectedItem) return;
    setActionError(null);

    if (action === "approve") {
      const parsedXp = Number(awardedXp);
      if (
        isNaN(parsedXp) ||
        !Number.isInteger(parsedXp) ||
        parsedXp < 0 ||
        parsedXp > 100
      ) {
        setActionError("Awarded XP must be an integer between 0 and 100.");
        return;
      }
    }

    const safeXp = Math.max(
      0,
      Math.min(100, Math.floor(Number(awardedXp) || 0)),
    );

    if (action === "reject" && !feedback.trim()) {
      setActionError("A rejection feedback reason is required.");
      return;
    }

    try {
      await reviewMutation.mutateAsync({
        id: selectedItem._id,
        payload: {
          action,
          awardedXp: action === "approve" ? safeXp : 0,
          feedback: feedback.trim(),
        },
      });
      setSelectedItem(null);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setActionError(
          err.response?.data?.message || "Failed to submit review action.",
        );
      } else if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Contributor Moderation
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review submissions, award XP, and provide feedback to contributors.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Tabs
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
                className="w-full sm:w-auto"
              >
                <TabsList>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </Tabs>

              <Select
                value={categoryFilter}
                onValueChange={(val) => {
                  setCategoryFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[160px] text-xs h-9">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, title..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 text-xs"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-400">
              Loading submissions...
            </div>
          ) : !data?.items || data.items.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No submissions found for the selected filter.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contributor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Title & Proof</TableHead>
                      <TableHead>XP</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <div className="font-semibold text-gray-900 text-sm">
                            {item.contributorName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.contributorEmail}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="capitalize text-xs"
                          >
                            {item.category.replace(/_/g, " ").toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="font-medium text-gray-900 text-sm truncate">
                            {item.title}
                          </div>
                          <a
                            href={item.proofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-purple-600 hover:underline mt-0.5"
                          >
                            <span>View Proof</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-semibold">
                            {item.status === "approved"
                              ? `${item.awardedXp} XP`
                              : `${item.standardXp} XP (Base)`}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.status === "approved" && (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              Approved
                            </Badge>
                          )}
                          {item.status === "rejected" && (
                            <Badge className="bg-red-50 text-red-700 border-red-200">
                              Rejected
                            </Badge>
                          )}
                          {item.status === "pending" && (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.status === "pending" ? (
                            <Button
                              size="sm"
                              onClick={() => handleOpenReview(item)}
                              className="bg-purple-600 hover:bg-purple-700 text-xs h-8"
                            >
                              Review
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Reviewed
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4 mt-4 text-xs font-medium text-gray-500">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {page} of {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= data.totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(data.totalPages, p + 1))
                    }
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Accessible Review Dialog */}
      <Dialog
        open={Boolean(selectedItem)}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Contribution</DialogTitle>
            <DialogDescription>
              {selectedItem
                ? `Submitted by ${selectedItem.contributorName} (${selectedItem.contributorEmail})`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {actionError && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 font-medium">
              {actionError}
            </div>
          )}

          {selectedItem && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Submission Title
                </label>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {selectedItem.title}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Proof URL
                </label>
                <div className="mt-0.5">
                  <a
                    href={selectedItem.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:underline break-all"
                  >
                    <span>{selectedItem.proofUrl}</span>
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                  </a>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">
                  Awarded XP (Base: {selectedItem.standardXp} XP)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={awardedXp}
                  onChange={(e) =>
                    setAwardedXp(parseInt(e.target.value, 10) || 0)
                  }
                  className="mt-1"
                />
                <span className="text-[11px] text-gray-400">
                  You can adjust XP higher for exceptional quality.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">
                  Review / Feedback Note
                </label>
                <Textarea
                  rows={3}
                  placeholder="Required if rejecting (e.g. 'PR unmerged', 'Invalid proof URL')"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedItem(null)}
                  disabled={reviewMutation.isPending}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReviewAction("reject")}
                  disabled={reviewMutation.isPending}
                  size="sm"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleReviewAction("approve")}
                  disabled={reviewMutation.isPending}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Approve ({awardedXp} XP)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
