import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCreateInterviewSheet } from "@/api/interviewPrepApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const InterviewSheetCreatePage = () => {
  const navigate = useNavigate();
  const createSheet = useCreateInterviewSheet();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    coverImageURL: "",
    liveOn: new Date().toISOString().slice(0, 10),
    meta: "",
    roadmap: "Tech" as "Frontend" | "Backend" | "Fullstack" | "Tech",
    isPremium: false,
    price: 0,
    features: [] as string[],
  });

  const handleCreate = async () => {
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      coverImageURL: form.coverImageURL,
      liveOn: form.liveOn,
      meta: form.meta,
      roadmap: form.roadmap,
      isPremium: form.isPremium,
      price: form.price || undefined,
      features: form.features?.length ? form.features : undefined,
    };
    const created = await createSheet.mutateAsync(payload);
    if (created && created._id) {
      navigate(`/lab/interview-sheets/${created._id}`);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create Interview Sheet</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Cover Image URL
          </label>
          <Input
            value={form.coverImageURL}
            onChange={(e) =>
              setForm({ ...form, coverImageURL: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Live On</label>
          <Input
            type="date"
            value={form.liveOn}
            onChange={(e) => setForm({ ...form, liveOn: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Meta</label>
          <Textarea
            value={form.meta}
            onChange={(e) => setForm({ ...form, meta: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={createSheet.isPending}>
            Create & Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewSheetCreatePage;
