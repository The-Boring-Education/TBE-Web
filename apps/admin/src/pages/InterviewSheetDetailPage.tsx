import { Plus, Tag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  useAddSheetToCoupon,
  useCoupons,
  useRemoveSheetFromCoupon,
} from "@/api/couponsApi";
import {
  useInterviewSheet,
  useUpdateInterviewQuestion,
  useUpdateInterviewSheet,
} from "@/api/interviewPrepApi";
import {
  useAddInterviewQuestion,
  useDeleteInterviewQuestion,
} from "@/api/interviewPrepApi";
import InterviewSheetHeader from "@/components/InterviewSheetHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const InterviewSheetDetailPage = () => {
  const { sheetId } = useParams();
  const navigate = useNavigate();
  const { data: sheet, isLoading } = useInterviewSheet(sheetId);
  const { data: coupon } = useCoupons();
  const { toast } = useToast();
  const addSheetToCoupon = useAddSheetToCoupon();
  const removeSheetFromCoupon = useRemoveSheetFromCoupon();
  const updateSheet = useUpdateInterviewSheet();
  const updateQuestion = useUpdateInterviewQuestion();
  const addQuestion = useAddInterviewQuestion();
  const deleteQuestion = useDeleteInterviewQuestion();

  const [showCouponSelector, setShowCouponSelector] = useState(false);

  // Form state derived from sheet data
  const form = useMemo(
    () => ({
      isPremium: sheet?.isPremium || false,
      price: sheet?.price || 0,
      discountPercentage: (sheet as any)?.discountPercentage || 0,
    }),
    [sheet],
  );

  // Get coupon that are targeting this specific sheet
  const targetedCoupons = useMemo(() => {
    if (!coupon || !sheet) return [];
    return coupon.filter((coupon) =>
      coupon.applicableProducts.includes(sheet._id),
    );
  }, [coupon, sheet]);

  const handleAddCouponToSheet = async (couponId: string) => {
    try {
      await addSheetToCoupon.mutateAsync({ couponId, sheetId: sheet._id });
    } catch (error) {
      console.error("Failed to add coupon to sheet:", error);
    }
  };

  const handleRemoveCouponFromSheet = async (couponId: string) => {
    try {
      await removeSheetFromCoupon.mutateAsync({ couponId, sheetId: sheet._id });
    } catch (error) {
      console.error("Failed to remove coupon from sheet:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!sheet || !sheet._id) return <div>Not found</div>;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          ← Back to All Sheets
        </Button>
      </div>

      {/* Header with Editable Fields */}
      <InterviewSheetHeader
        sheet={sheet}
        onUpdate={async (updatedData) => {
          if (!sheetId) return;
          await updateSheet.mutateAsync({ sheetId, updatedData });
        }}
        isUpdating={updateSheet.isPending}
      />

      {/* Questions Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
        <h2 className="text-xl font-semibold mb-4">Questions</h2>
        {/* Add Question */}
        <AddQuestionForm
          onAdd={async (payload) => {
            if (!sheetId) return;
            await addQuestion.mutateAsync({ sheetId, question: payload });
          }}
        />
        <div className="h-4" />
        <Accordion type="multiple" className="w-full">
          {(sheet.questions || []).map((q) => (
            <AccordionItem key={q._id} value={q._id}>
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium text-left truncate pr-4">
                    {q.title}
                  </span>
                  {/* Add small info if needed */}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <DeleteQuestionButton
                      onConfirm={async () => {
                        if (!sheetId) return;
                        await deleteQuestion.mutateAsync({
                          sheetId,
                          questionId: q._id,
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Title
                    </label>
                    <InlineEditInput
                      initialValue={q.title}
                      onSave={async (value) => {
                        if (!sheetId) return;
                        await updateQuestion.mutateAsync({
                          sheetId,
                          questionId: q._id,
                          updated: { title: value },
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Question (MDX)
                    </label>
                    <InlineEditTextarea
                      initialValue={q.question}
                      onSave={async (value) => {
                        if (!sheetId) return;
                        await updateQuestion.mutateAsync({
                          sheetId,
                          questionId: q._id,
                          updated: { question: value },
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Answer (MDX)
                    </label>
                    <InlineEditTextarea
                      initialValue={q.answer}
                      onSave={async (value) => {
                        if (!sheetId) return;
                        await updateQuestion.mutateAsync({
                          sheetId,
                          questionId: q._id,
                          updated: { answer: value },
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Resources
                    </label>
                    <div className="space-y-2">
                      {q.resources && q.resources.length > 0 ? (
                        <div className="grid gap-2">
                          {q.resources.map((res: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded"
                            >
                              <Badge variant="outline">{res.type}</Badge>
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline truncate flex-1"
                              >
                                {res.label || res.url}
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          No resources available
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Coupon Management Section */}
      {form.isPremium && (
        <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Coupon Management</h2>
          </div>

          {/* Current Applied Coupons */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">
              Active Coupons for This Sheet
            </h3>
            {targetedCoupons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {targetedCoupons.map((coupon) => (
                  <div
                    key={coupon._id}
                    className="border rounded-lg p-4 bg-green-50 border-green-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="font-mono font-bold text-green-800 bg-green-100">
                        {coupon.code}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveCouponFromSheet(coupon._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {coupon.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{coupon.discountPercentage}% OFF</span>
                      <span>
                        {coupon.currentUsage}/{coupon.maxUsage || "∞"} used
                      </span>
                      <span
                        className={
                          new Date(coupon.expiryDate) < new Date()
                            ? "text-red-600"
                            : ""
                        }
                      >
                        Expires:{" "}
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <Tag className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No coupon specifically targeting this sheet</p>
                <p className="text-sm">
                  General coupon will still work for this premium sheet
                </p>
              </div>
            )}
          </div>

          {/* Available Coupons to Add */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Available Coupons</h3>
              <Button
                size="sm"
                onClick={() => setShowCouponSelector(!showCouponSelector)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Coupon to Sheet
              </Button>
            </div>

            {showCouponSelector && (
              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <p className="text-sm text-blue-700 mb-3">
                  Select coupon to specifically target this sheet. Users will be
                  able to apply these coupon when purchasing this sheet.
                </p>

                {!coupon ? (
                  <div className="text-center py-4">Loading coupons...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {coupon
                      ?.filter(
                        (coupon) =>
                          coupon.isActive &&
                          !coupon.applicableProducts.includes(sheet._id),
                      )
                      .map((coupon) => (
                        <div
                          key={coupon._id}
                          className="border rounded p-3 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="font-mono text-xs">
                                  {coupon.code}
                                </Badge>
                                <span className="text-sm font-medium text-green-600">
                                  {coupon.discountPercentage}% OFF
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 truncate">
                                {coupon.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <span>
                                  {coupon.currentUsage}/{coupon.maxUsage || "∞"}
                                </span>
                                <span>Min: ₹{coupon.minimumAmount}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddCouponToSheet(coupon._id)}
                              className="ml-2"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pricing Preview with Coupons */}
          {form.price > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Pricing Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>₹{form.price.toLocaleString("en-IN")}</span>
                </div>
                {form.discountPercentage > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Sheet Discount ({form.discountPercentage}%):</span>
                    <span>
                      -₹
                      {Math.round(
                        (form.price * form.discountPercentage) / 100,
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <hr className="border-gray-300" />
                <div className="flex justify-between font-medium">
                  <span>Final Price:</span>
                  <span>
                    ₹
                    {Math.round(
                      (form.price * (100 - form.discountPercentage)) / 100,
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
                {targetedCoupons.length > 0 && (
                  <p className="text-xs text-blue-600 mt-2">
                    * Additional discounts available with{" "}
                    {targetedCoupons.length} targeted coupon
                    {targetedCoupons.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const InlineEditTextarea = ({
  initialValue,
  onSave,
}: {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
}) => {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const handleSave = async () => {
    if (!dirty) return;
    setSaving(true);
    await onSave(value);
    setDirty(false);
    setSaving(false);
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setDirty(true);
        }}
        className="h-40"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setValue(initialValue);
            setDirty(false);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

const InlineEditInput = ({
  initialValue,
  onSave,
}: {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
}) => {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const handleSave = async () => {
    if (!dirty) return;
    setSaving(true);
    await onSave(value);
    setDirty(false);
    setSaving(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setDirty(true);
        }}
      />
      <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
        Save
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setValue(initialValue);
          setDirty(false);
        }}
      >
        Reset
      </Button>
    </div>
  );
};

export default InterviewSheetDetailPage;

// Add question form
const AddQuestionForm = ({
  onAdd,
}: {
  onAdd: (q: {
    title: string;
    question: string;
    answer: string;
    frequency: "Most Asked" | "Asked Frequently" | "Asked Sometimes";
  }) => Promise<void>;
}) => {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [frequency, setFrequency] = useState<
    "Most Asked" | "Asked Frequently" | "Asked Sometimes"
  >("Most Asked");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onAdd({ title, question, answer, frequency });
    setTitle("");
    setQuestion("");
    setAnswer("");
    setFrequency("Most Asked");
    setSaving(false);
  };

  return (
    <div className="rounded-md border p-4 space-y-3">
      <h3 className="text-lg font-medium">Add Question</h3>
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Question (MDX)</label>
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="h-24"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Answer (MDX)</label>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="h-24"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Frequency</label>
        <select
          className="border rounded-md h-10 px-3"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as any)}
        >
          <option value="Most Asked">Most Asked</option>
          <option value="Asked Frequently">Asked Frequently</option>
          <option value="Asked Sometimes">Asked Sometimes</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleAdd} disabled={saving}>
          Add
        </Button>
      </div>
    </div>
  );
};

// Delete button with confirmation dialog
const DeleteQuestionButton = ({
  onConfirm,
}: {
  onConfirm: () => Promise<void>;
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete Question
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this question?</AlertDialogTitle>
        </AlertDialogHeader>
        <p className="text-sm text-muted-foreground">
          This action cannot be undone.
        </p>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
