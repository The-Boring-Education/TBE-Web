import type { RecruiterContact } from "@tbe/types";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

// Helper components
const ModalLabel: React.FC<{
  children: React.ReactNode;
  required?: boolean;
}> = ({ children, required }) => (
  <label
    className="block font-medium mb-1.5"
    style={{ fontSize: "13px", color: "#111111" }}
  >
    {children} {required && <span className="text-[#e8372c]">*</span>}
  </label>
);

const ModalInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <input
    ref={ref}
    {...props}
    className="w-full bg-white border border-[#e8e8e8] px-3.5 py-2 transition-all duration-200 outline-none rounded-md text-[13px] placeholder:text-[#8a8a8a] text-[#111111] focus:border-[#e8372c] focus:ring-1 focus:ring-[#e8372c]/10"
  />
));
ModalInput.displayName = "ModalInput";

const ModalTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>((props, ref) => (
  <textarea
    ref={ref}
    {...props}
    className="w-full bg-white border border-[#e8e8e8] px-3.5 py-2 transition-all duration-200 outline-none rounded-md text-[13px] placeholder:text-[#8a8a8a] text-[#111111] focus:border-[#e8372c] focus:ring-1 focus:ring-[#e8372c]/10 resize-none"
  />
));
ModalTextarea.displayName = "ModalTextarea";

const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, ...props }) => (
  <button
    {...props}
    className="px-4 py-2 font-medium text-white transition-colors duration-200 rounded-lg text-[13px]"
    style={{ backgroundColor: "#e8372c" }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d42e23")}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e8372c")}
  >
    {children}
  </button>
);

const OutlineButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, ...props }) => (
  <button
    {...props}
    className="px-4 py-2 font-medium transition-colors duration-200 border border-[#e8e8e8] hover:bg-[#f0f0f0] rounded-lg text-[13px]"
    style={{ backgroundColor: "#ffffff", color: "#111111" }}
  >
    {children}
  </button>
);

interface AddRecruiterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactAdded: () => void;
  onContactUpdated?: () => void;
  mongoUserId: string;
  editContact?: RecruiterContact | null;
}

export const AddRecruiterModal = ({
  isOpen,
  onClose,
  onContactAdded,
  onContactUpdated,
  mongoUserId,
  editContact,
}: AddRecruiterModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recruiterName: "",
    company: "",
    email: "",
    phone: "",
    link: "",
    comments: "",
    applicationStatus: "Screening",
  });

  useEffect(() => {
    if (editContact) {
      setFormData({
        recruiterName: editContact.recruiterName || "",
        company: editContact.company || "",
        email: editContact.email || "",
        phone: editContact.phone || "",
        link: editContact.link || "",
        comments: editContact.comments || "",
        applicationStatus: editContact.applicationStatus || "Screening",
      });
    } else {
      setFormData({
        recruiterName: "",
        company: "",
        email: "",
        phone: "",
        link: "",
        comments: "",
        applicationStatus: "Screening",
      });
    }
  }, [editContact, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recruiterName) {
      toast.error("Recruiter name is required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        userId: mongoUserId,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/recruiter`,
        {
          method: editContact ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            editContact
              ? { recruiterId: editContact._id, ...formData }
              : payload,
          ),
        },
      );

      const result = await response.json();
      if (!result.status) {
        throw new Error(result.message || "Failed to save recruiter");
      }

      toast.success(
        `Recruiter contact ${editContact ? "updated" : "added"} successfully!`,
      );
      if (editContact) {
        onContactUpdated?.();
      } else {
        onContactAdded();
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-2xl border border-[#e8e8e8] shadow-xl p-6 sm:max-w-[500px]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-[17px] font-semibold text-[#111111]">
            {editContact
              ? "Edit Recruiter Contact"
              : "Add New Recruiter Contact"}
          </DialogTitle>
          <p className="mt-1" style={{ fontSize: "13px", color: "#8a8a8a" }}>
            {editContact
              ? "Update recruiter details."
              : "Keep track of active recruiters and connections."}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <ModalLabel required>Name</ModalLabel>
              <ModalInput
                value={formData.recruiterName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    recruiterName: e.target.value,
                  }))
                }
                placeholder="E.g. Jane Doe"
                required
              />
            </div>
            <div>
              <ModalLabel>Company</ModalLabel>
              <ModalInput
                value={formData.company}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, company: e.target.value }))
                }
                placeholder="E.g. Google"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <ModalLabel>Email</ModalLabel>
              <ModalInput
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="jane@company.com"
              />
            </div>
            <div>
              <ModalLabel>Phone</ModalLabel>
              <ModalInput
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="+1 234 567 890"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <ModalLabel>Job Post Link</ModalLabel>
              <ModalInput
                value={formData.link}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, link: e.target.value }))
                }
                placeholder="https://jobs.linkedin.com/..."
              />
            </div>
            <div>
              <ModalLabel>Status</ModalLabel>
              <select
                value={formData.applicationStatus}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    applicationStatus: e.target.value,
                  }))
                }
                className="w-full bg-white border border-[#e8e8e8] px-3.5 py-2 transition-all duration-200 outline-none rounded-md text-[13px] text-[#111111] focus:border-[#e8372c] focus:ring-1 focus:ring-[#e8372c]/10"
              >
                <option value="Screening">Screening</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Final Round Done">Final Round Done</option>
                <option value="Offer Letter">Offer Letter</option>
                <option value="Rejected">Rejected</option>
                <option value="Not Interested">Not Interested</option>
              </select>
            </div>
          </div>
          <div>
            <ModalLabel>Comments / Notes</ModalLabel>
            <ModalTextarea
              value={formData.comments}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, comments: e.target.value }))
              }
              placeholder="Referral details, feedback, next steps..."
              rows={3}
            />
          </div>
          <DialogFooter className="flex gap-2 justify-end pt-2">
            <OutlineButton type="button" onClick={onClose}>
              Cancel
            </OutlineButton>
            <PrimaryButton type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : editContact
                  ? "Update Contact"
                  : "Add Contact"}
            </PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecruiterModal;
