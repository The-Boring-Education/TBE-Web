/**
 * `sendRequest` resolves HTTP failures instead of rejecting. Throw on a failed
 * response so React Query exposes it as an error rather than as empty data.
 */
export const unwrapData = <T>(res: unknown): T => {
  const r = (res ?? {}) as {
    success?: boolean;
    status?: unknown;
    message?: string;
    data?: unknown;
  };
  if (!res || r.success === false || r.status === false) {
    throw new Error(r.message || "Request failed");
  }
  return (r.data ?? null) as T;
};
