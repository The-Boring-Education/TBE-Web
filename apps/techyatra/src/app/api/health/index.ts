import type { EnvHealthResponse, EnvVarCheck } from "@tbe/utils"
import { buildEnvHealthResponse } from "@tbe/utils"
import { NextResponse } from "next/server"

const envChecks: EnvVarCheck[] = [
    { name: "NEXT_PUBLIC_API_URL" },
    { name: "NEXT_PUBLIC_AUTH_URL" },
    { name: "GOOGLE_AUTH_CLIENT_ID" },
    { name: "GOOGLE_AUTH_CLIENT_SECRET" }
]

export async function GET() {
    const { httpStatus, report } = buildEnvHealthResponse(envChecks, {
        serviceName: "environment"
    })

    return NextResponse.json(report, { status: httpStatus })
}
