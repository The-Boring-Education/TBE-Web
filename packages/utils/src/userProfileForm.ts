/**
 * Maps API session + fetched user record into the platform profile form shape.
 * JWT/session often omits onboarding fields; GET /user fills them.
 */

export interface UserProfileFormFields {
  userName: string;
  occupation: string;
  purpose: string[];
  contactNo: string;
}

export interface UserProfileFormSource {
  userName?: string;
  occupation?: string;
  purpose?: string[];
  contactNo?: string;
}

/** Ensures contact uses "`<code> <number>`" when stored compactly (e.g. +9198… → +91 98…). */
export const normalizeContactNoForForm = (raw?: string | null): string => {
  if (!raw?.trim()) return "+91";
  const t = raw.trim();
  if (/\s/.test(t)) return t;
  if (t.startsWith("+91") && t.length > 3) return `+91 ${t.slice(3)}`;
  return t;
};

export const mergeApiAndSessionProfileForm = (
  api: UserProfileFormSource | null | undefined,
  session: UserProfileFormSource | null | undefined,
): UserProfileFormFields => ({
  userName: api?.userName ?? session?.userName ?? "",
  occupation: api?.occupation ?? session?.occupation ?? "",
  purpose: [...(api?.purpose ?? session?.purpose ?? [])],
  contactNo: normalizeContactNoForForm(api?.contactNo ?? session?.contactNo),
});
