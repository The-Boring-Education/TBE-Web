import { getAccessToken, getAuthApiUrl } from "@tbe/auth";

export const getBaseApiUrl = (): string => {
  const url = getAuthApiUrl();
  if (url) return url;
  if (typeof window !== "undefined") {
    // If local dev port is 3008, API dev port is 3004
    if (window.location.hostname === "localhost") {
      return "http://localhost:3004/api/v1";
    }
  }
  return "https://tbe-dev-git-production-tbe.vercel.app/api/v1";
};

export const fetchContributorProfile = async () => {
  const token = getAccessToken();
  const apiUrl = getBaseApiUrl();
  const res = await fetch(`${apiUrl}/contributor/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.json();
};

export const fetchMySubmissions = async (
  category?: string,
  status?: string,
) => {
  const token = getAccessToken();
  const apiUrl = getBaseApiUrl();
  const params = new URLSearchParams();
  if (category && category !== "All") params.append("category", category);
  if (status && status !== "All") params.append("status", status);

  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${apiUrl}/contributor/submissions${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.json();
};

export const createContributionSubmission = async (data: {
  category: string;
  title: string;
  proofUrl: string;
  description?: string;
}) => {
  const token = getAccessToken();
  const apiUrl = getBaseApiUrl();
  const res = await fetch(`${apiUrl}/contributor/submissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
};
