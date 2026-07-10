import "react-datepicker/dist/react-datepicker.css";

import type { RecruiterContact } from "@tbe/types";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { toast } from "sonner";

import AddRecruiterModal from "../modals/AddRecruiterModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import {
  EditIcon,
  ExternalLinkIcon,
  MailIcon,
  PhoneIcon,
  Trash2Icon,
} from "./SVGIcons";

interface RecruiterContactsTableProps {
  contacts: RecruiterContact[];
  onContactAdded?: () => void;
  onContactUpdated?: () => void;
  onContactDeleted?: (deletedContactId: string) => void;
  mongoUserId?: string;
}

export const RecruiterContactsTable = ({
  contacts,
  onContactAdded,
  onContactUpdated,
  onContactDeleted,
  mongoUserId,
}: RecruiterContactsTableProps) => {
  const [editingContact, setEditingContact] = useState<RecruiterContact | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hideInactiveContacts, setHideInactiveContacts] = useState(false);

  const visibleContacts = hideInactiveContacts
    ? contacts.filter(
        (c) =>
          c.applicationStatus !== "Rejected" &&
          c.applicationStatus !== "Not Interested",
      )
    : contacts;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Screening":
      case "Screening in Process":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Interviewing":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Final Round Done":
      case "Final Round Offer":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "Offer Letter":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-100";
      case "Not Interested":
        return "bg-slate-50 text-slate-600 border-slate-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const handleDelete = async (recruiterId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/recruiter?recruiterId=${recruiterId}`,
        {
          method: "DELETE",
        },
      );

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message);
      }

      toast.success("Recruiter deleted successfully");

      if (onContactDeleted) onContactDeleted(recruiterId);
      if (onContactUpdated) onContactUpdated();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete recruiter",
      );
    }
  };

  const handleStatusChange = async (recruiterId: string, newStatus: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/recruiter`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recruiterId,
            applicationStatus: newStatus,
          }),
        },
      );

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message);
      }

      toast.success("Status updated successfully");

      if (onContactUpdated) onContactUpdated();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status",
      );
    }
  };

  const handleDateChange = async (
    recruiterId: string,
    field: "follow_up_date" | "last_interview_date",
    newDate: Date | null,
  ) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/recruiter`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recruiterId,
            [field]: newDate ? newDate.toISOString() : null,
          }),
        },
      );

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message);
      }

      toast.success("Date updated successfully");

      if (onContactUpdated) onContactUpdated();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update date",
      );
    }
  };

  const handleEdit = (contact: RecruiterContact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setEditingContact(null);
    setIsModalOpen(false);
    if (onContactUpdated) onContactUpdated();
  };

  if (contacts.length === 0) {
    return (
      <div className="w-full bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-8 text-center mt-2">
        <span className="text-3xl mb-2.5 block select-none">📞</span>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          No Contacts Yet
        </h3>
        <p className="text-slate-500 text-xs max-w-sm mx-auto">
          Start building your professional recruiter network by adding your
          first contact above!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Network Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-slate-700 font-bold text-sm">
            Total Network size:
          </span>
          <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
            {visibleContacts.length} Contact
            {visibleContacts.length !== 1 ? "s" : ""}
          </span>
        </div>

        <button
          onClick={() => setHideInactiveContacts((prev) => !prev)}
          className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 active:scale-[0.98]"
        >
          {hideInactiveContacts
            ? "Show All Contacts"
            : "Hide Inactive Contacts"}
        </button>
      </div>

      {/* MOBILE LIST VIEW (shown on screens < md) */}
      <div className="md:hidden space-y-3.5">
        {visibleContacts.map((contact) => (
          <div
            key={contact._id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-4 hover:border-primary/20 transition-all duration-300"
          >
            {/* Header info: Name and Company */}
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-slate-800 leading-tight">
                  {contact.recruiterName}
                </h4>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  {contact.company || "No Company Specified"}
                </p>
              </div>

              {/* Status Badge */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getStatusColor(
                  contact.applicationStatus,
                )}`}
              >
                {contact.applicationStatus || "No Status"}
              </span>
            </div>

            {/* Contact channels */}
            {(contact.email || contact.phone) && (
              <div className="text-xs space-y-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                {contact.email && (
                  <div className="flex items-center gap-2 text-slate-600 break-all">
                    <MailIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a
                      href={`mailto:${contact.email}`}
                      className="hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 text-slate-650">
                    <PhoneIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a
                      href={`tel:${contact.phone}`}
                      className="hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Quick selectors: Status, Follow Up */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Status change select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Update Status
                </label>
                <select
                  className="w-full bg-white border border-slate-200 text-slate-705 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  value={contact.applicationStatus || ""}
                  onChange={(e) =>
                    handleStatusChange(contact._id, e.target.value)
                  }
                >
                  <option value="" disabled>
                    Select status
                  </option>
                  <option value="Screening">Screening</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Final Round Done">Final Round Done</option>
                  <option value="Offer Letter">Offer Letter</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Not Interested">Not Interested</option>
                </select>
              </div>

              {/* Follow up date picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Follow Up Date
                </label>
                <div className="relative">
                  <DatePicker
                    selected={
                      contact.follow_up_date
                        ? new Date(contact.follow_up_date)
                        : null
                    }
                    onChange={(date: Date | null) =>
                      handleDateChange(contact._id, "follow_up_date", date)
                    }
                    className="w-full bg-white border border-slate-200 text-slate-750 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    dateFormat="MMM d, yyyy"
                    placeholderText="Set date"
                    isClearable
                  />
                </div>
              </div>
            </div>

            {/* Comments block if exists */}
            {contact.comments && (
              <div className="text-xs text-slate-500 bg-slate-50/20 border border-slate-100 p-2.5 rounded-xl leading-relaxed whitespace-pre-wrap">
                {contact.comments}
              </div>
            )}

            {/* Card Action footer panel */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100/80">
              <div className="flex gap-2">
                {contact.link && (
                  <a
                    href={contact.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-7 h-7 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-lg transition-colors"
                    title="External Link"
                  >
                    <ExternalLinkIcon className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
                <button
                  onClick={() => handleEdit(contact)}
                  className="inline-flex items-center justify-center w-7 h-7 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-lg transition-colors"
                  title="Edit Recruiter"
                >
                  <EditIcon className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl text-xs font-semibold transition-all duration-200">
                    <Trash2Icon className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white rounded-2xl p-6 max-w-sm md:max-w-md mx-auto">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-800 text-base font-bold">
                      Delete Recruiter
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500 text-xs mt-2 leading-relaxed">
                      Are you sure you want to delete this contact? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-6 flex flex-row gap-3 justify-end">
                    <AlertDialogCancel className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-all duration-200">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(contact._id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition-all duration-200"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABULAR VIEW (shown on screens >= md) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/85">
                <th className="px-4 py-3.5 font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3.5 font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 py-3.5 font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3.5 font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3.5 font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Follow Up
                </th>
                <th className="px-4 py-3.5 font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Last Interview
                </th>
                <th className="px-4 py-3.5 font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Comments
                </th>
                <th className="px-4 py-3.5 font-bold text-slate-700 text-xs uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleContacts.map((contact) => (
                <tr
                  key={contact._id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  {/* Name column */}
                  <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                    {contact.recruiterName}
                  </td>

                  {/* Company column */}
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap font-medium">
                    {contact.company || "-"}
                  </td>

                  {/* Contact channels */}
                  <td className="px-4 py-3.5 text-xs text-slate-500 max-w-[160px] truncate">
                    <div className="space-y-0.5">
                      {contact.email && (
                        <div className="flex items-center gap-1.5">
                          <MailIcon className="w-3 h-3 text-slate-400 shrink-0" />
                          <a
                            href={`mailto:${contact.email}`}
                            className="hover:underline text-slate-650 truncate"
                          >
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <PhoneIcon className="w-3 h-3 text-slate-400 shrink-0" />
                          <a
                            href={`tel:${contact.phone}`}
                            className="hover:underline text-slate-650 font-medium"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="px-4 py-3.5">
                    <select
                      className="bg-white border border-slate-200 text-slate-700 rounded-xl px-2 py-1 text-xs focus:outline-none focus:border-primary"
                      value={contact.applicationStatus || ""}
                      onChange={(e) =>
                        handleStatusChange(contact._id, e.target.value)
                      }
                    >
                      <option value="" disabled>
                        Status
                      </option>
                      <option value="Screening">Screening</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Final Round Done">Final Round Done</option>
                      <option value="Offer Letter">Offer Letter</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Not Interested">Not Interested</option>
                    </select>
                  </td>

                  {/* Follow Up Date Picker */}
                  <td className="px-4 py-3.5">
                    <DatePicker
                      selected={
                        contact.follow_up_date
                          ? new Date(contact.follow_up_date)
                          : null
                      }
                      onChange={(date: Date | null) =>
                        handleDateChange(contact._id, "follow_up_date", date)
                      }
                      className="bg-white border border-slate-200 rounded-xl px-2 py-1 text-slate-750 w-[110px] text-xs focus:outline-none focus:border-primary"
                      dateFormat="MMM d, yyyy"
                      placeholderText="Set date"
                      isClearable
                    />
                  </td>

                  {/* Last Interview Date Picker */}
                  <td className="px-4 py-3.5">
                    <DatePicker
                      selected={
                        contact.last_interview_date
                          ? new Date(contact.last_interview_date)
                          : null
                      }
                      onChange={(date: Date | null) =>
                        handleDateChange(
                          contact._id,
                          "last_interview_date",
                          date,
                        )
                      }
                      className="bg-white border border-slate-200 rounded-xl px-2 py-1 text-slate-750 w-[110px] text-xs focus:outline-none focus:border-primary"
                      dateFormat="MMM d, yyyy"
                      placeholderText="Set date"
                      isClearable
                    />
                  </td>

                  {/* Comments column */}
                  <td
                    className="px-4 py-3.5 text-xs text-slate-500 max-w-[150px] truncate"
                    title={contact.comments}
                  >
                    {contact.comments || "-"}
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {contact.link && (
                        <a
                          href={contact.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-7 h-7 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors"
                          title="Open Link"
                        >
                          <ExternalLinkIcon className="w-3.5 h-3.5 text-slate-400 hover:text-slate-650" />
                        </a>
                      )}
                      <button
                        onClick={() => handleEdit(contact)}
                        className="inline-flex items-center justify-center w-7 h-7 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors"
                        title="Edit Contact"
                      >
                        <EditIcon className="w-3.5 h-3.5 text-slate-400 hover:text-slate-650" />
                      </button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="inline-flex items-center justify-center w-7 h-7 hover:bg-red-50 text-slate-500 hover:text-red-650 rounded-lg transition-colors"
                            title="Delete Contact"
                          >
                            <Trash2Icon className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white rounded-2xl p-6 max-w-sm md:max-w-md mx-auto">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-slate-800 text-base font-bold">
                              Delete Recruiter
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500 text-xs mt-2 leading-relaxed">
                              Are you sure you want to delete this contact? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-6 flex flex-row gap-3 justify-end">
                            <AlertDialogCancel className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-all duration-200">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(contact._id)}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition-all duration-200"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddRecruiterModal
        key={`edit-recruiter-${editingContact?._id || "new"}`}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onContactAdded={onContactAdded ?? (() => {})}
        onContactUpdated={onContactUpdated ?? (() => {})}
        editContact={editingContact}
        mongoUserId={mongoUserId ?? ""}
      />
    </div>
  );
};

export default RecruiterContactsTable;
