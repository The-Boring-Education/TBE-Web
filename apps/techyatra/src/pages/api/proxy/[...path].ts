import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Proxy API route to forward requests to the actual API server.
 * Matches prep-yatra / dsayatra so `sendRequest` browser proxy calls work in E2E and prod.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3004/api/v1";

  try {
    const { path } = req.query;
    const apiPath = Array.isArray(path) ? path.join("/") : path || "";
    const url = `${apiUrl}/${apiPath}`;

    const response = await axios({
      method: req.method,
      url,
      headers: {
        ...req.headers,
        host: undefined,
        // Hop-by-hop / body headers must not be reused: axios re-serializes
        // the parsed body, so a stale content-length can stall the upstream
        // request (e.g. the POST /auth/token exchange during sign in).
        connection: undefined,
        "content-length": undefined,
        authorization: req.headers.authorization,
        "x-admin-secret": req.headers["x-admin-secret"],
      },
      data: req.body,
      params: { ...req.query, path: undefined },
      validateStatus: () => true,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: "Proxy error",
      message,
    });
  }
};

export default handler;
