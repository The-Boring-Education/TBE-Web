import { withAdminAuth as withAdminAuthBase } from "@tbe/auth"

import { authOptions } from "@/pages/api/auth/[...nextauth]"

const ADMIN_EMAILS = [
    "theboringeducation@gmail.com"
    // Add more admin emails here
]

export const withAdminAuth = withAdminAuthBase(authOptions, ADMIN_EMAILS)
