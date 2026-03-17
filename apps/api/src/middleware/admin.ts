import { withAdminAuth as withAdminAuthBase } from "@tbe/auth";

const ADMIN_EMAILS = [
  "theboringeducation@gmail.com",
  // Add more admin emails here
];

export const withAdminAuth = withAdminAuthBase(ADMIN_EMAILS);
