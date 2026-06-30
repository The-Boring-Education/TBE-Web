export const ADMIN_EMAILS = ["theboringeducation@gmail.com"] as const;

export type AdminEmail = (typeof ADMIN_EMAILS)[number];

export const isAdminEmail = (email: string | undefined | null): boolean =>
  !!email && (ADMIN_EMAILS as readonly string[]).includes(email);
