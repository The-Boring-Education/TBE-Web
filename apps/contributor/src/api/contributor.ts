import { getAccessToken } from "@tbe/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3004/api/v1";

const authHeaders = () => {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchContributorProfile = async () => {
  const res = await fetch(`${API_BASE}/contributor/profile`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const fetchUserSubmissions = async (
  typeGroup?: string,
  page = 1,
  limit = 20,
) => {
  const params = new URLSearchParams();
  if (typeGroup && typeGroup !== "all") {
    params.set("typeGroup", typeGroup);
  }
  params.set("page", String(page));
  params.set("limit", String(limit));
  const query = `?${params.toString()}`;
  const res = await fetch(`${API_BASE}/contributor/submissions${query}`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const submitContribution = async (payload: {
  category: string;
  title: string;
  proofUrl: string;
  description?: string;
}) => {
  const res = await fetch(`${API_BASE}/contributor/submissions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
};
