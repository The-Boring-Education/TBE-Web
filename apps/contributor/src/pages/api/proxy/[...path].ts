import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3004/api/v1";

  try {
    const { path } = req.query;
    const rawPath = Array.isArray(path) ? path.join("/") : path || "";
    const cleanPath = rawPath.replace(/^(api\/)?v1\/?/, "");
    const baseApi = apiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
    const targetUrl = `${baseApi}/api/v1/${cleanPath}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization as string;
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? JSON.stringify(req.body)
          : undefined,
    });

    const data = await response.json().catch(() => ({}));
    return res.status(response.status).json(data);
  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: "Proxy error",
      error: error.message,
    });
  }
}
