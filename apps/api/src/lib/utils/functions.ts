import crypto from "crypto";

import type {
  APIResponseType,
  BuildOrderPayloadProps,
  PlaylistModel,
  UserPointsActionType,
  Video,
  WebhookEvent,
} from "@/lib/interfaces";

import {
  envConfig,
  JOB_SKILL_NORMALIZER,
  SKILL_BLACKLIST,
  YOUTUBE_API_PATH,
} from "../constants";
import { POINTS_RULES, SUBSCRIPTION_FEATURES } from "../constants";
import { routes } from "../constants";

const sendAPIResponse = ({
  success,
  status,
  error,
  message,
  data,
}: APIResponseType): APIResponseType => ({
  success,
  status,
  error,
  message,
  data,
});

const fetchAPIData = async (url: string) => {
  const response = await fetch(`${envConfig.API_URL}/${url}`);

  return await response.json();
};

const calculateUserPointsForAction = (actionType: UserPointsActionType) => {
  const points = POINTS_RULES[actionType as UserPointsActionType] || 0;
  return points;
};

const constrainNumberToRange = (
  value: number,
  min: number,
  max: number,
): number => Math.min(Math.max(value, min), max);

const isProgramActive = (liveOn: Date | string) =>
  new Date(liveOn) <= new Date();

const generatePaymentOrderId = (): string =>
  `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

/**
 * Cashfree requires `order_meta.return_url` to be an absolute URL. If
 * `NEXT_PUBLIC_PLATFORM_URL` is empty, `${base}/path` becomes a relative path only
 * (`/payment/status?...`), which Cashfree rejects as `order_meta.return_url_invalid`.
 */
const buildCashfreePaymentReturnUrl = (orderId: string): string => {
  const base = envConfig.PLATFORM_URL.trim().replace(/\/+$/, "");
  if (!base || !/^https?:\/\//i.test(base)) {
    throw new Error(
      "Set NEXT_PUBLIC_PLATFORM_URL on the API to the full Platform origin (e.g. http://localhost:3000). Cashfree requires an absolute return_url for order_meta.",
    );
  }
  return `${base}/payment/status?order_id=${encodeURIComponent(orderId)}`;
};

const buildOrderPayload = ({
  orderId,
  amount,
  userId,
  customerName,
  customerEmail,
}: BuildOrderPayloadProps) => {
  return {
    order_id: orderId,
    order_amount: amount,
    order_currency: "INR",
    customer_details: {
      customer_id: userId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: "0000000000",
    },
    order_meta: {
      return_url: buildCashfreePaymentReturnUrl(orderId),
    },
  };
};

/**
 * Cashfree Payment Gateway REST base must include `/pg` (e.g. `https://sandbox.cashfree.com/pg`).
 * If `CASHFREE_BASE_URL` is set to the host only (`https://sandbox.cashfree.com`), we append `/pg`
 * so `POST .../pg/orders` matches Cashfree routing. Without `/pg`, the gateway often responds with
 * "no Route matched with those values".
 */
const getCashfreePgBaseUrl = (): string => {
  const raw = envConfig.CASHFREE_BASE_URL.trim().replace(/\/+$/, "");
  if (!raw) return raw;
  return raw.endsWith("/pg") ? raw : `${raw}/pg`;
};

/** Hosted checkout page lives on the same host without the `/pg` API prefix. */
const buildCashfreeHostedCheckoutLink = (paymentSessionId: string): string => {
  const pg = getCashfreePgBaseUrl();
  const hostBase = pg.endsWith("/pg") ? pg.slice(0, -3) : pg;
  return `${hostBase}/checkout?paymentSessionId=${encodeURIComponent(paymentSessionId)}`;
};

/** Best-effort parse of Cashfree Orders API error JSON for clearer 400 responses. */
const extractCashfreeErrorMessage = (data: unknown): string | undefined => {
  if (!data || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown>;
  if (typeof d.message === "string" && d.message.trim())
    return d.message.trim();
  if (typeof d.error === "string" && d.error.trim()) return d.error.trim();
  if (Array.isArray(d.message) && d.message.length > 0) {
    const first = d.message[0];
    if (typeof first === "string") return first;
  }
  if (d.error && typeof d.error === "object" && d.error !== null) {
    const nested = d.error as Record<string, unknown>;
    if (typeof nested.message === "string" && nested.message.trim()) {
      return nested.message.trim();
    }
  }
  const sub = d.sub_code;
  if (typeof sub === "string" && sub.trim()) return sub.trim();
  return undefined;
};

type CreateCashfreeOrderResult = {
  data: unknown;
  ok: boolean;
  httpStatus: number;
  gatewayMessage?: string;
};

const createCashfreeOrder = async (
  orderPayload: ReturnType<typeof buildOrderPayload>,
): Promise<CreateCashfreeOrderResult> => {
  const clientId = envConfig.CASHFREE_CLIENT_ID;
  const secretKey = envConfig.CASHFREE_SECRET_KEY;

  if (!clientId || !secretKey) {
    throw new Error("Cashfree credentials not configured");
  }

  const response = await fetch(`${getCashfreePgBaseUrl()}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": clientId,
      "x-client-secret": secretKey,
      "x-api-version": "2022-09-01",
    },
    body: JSON.stringify(orderPayload),
  });

  const data = await response.json();
  const gatewayMessage = extractCashfreeErrorMessage(data);

  return {
    data,
    ok: response.ok,
    httpStatus: response.status,
    gatewayMessage,
  };
};

/**
 * Fetches live order state from Cashfree (GET /orders/{order_id}).
 * Use when DB is still PENDING — e.g. localhost cannot receive webhooks, or webhook is delayed.
 */
const fetchCashfreeOrderByOrderId = async (
  orderId: string,
): Promise<{
  ok: boolean;
  order_status?: string;
  httpStatus: number;
}> => {
  const clientId = envConfig.CASHFREE_CLIENT_ID;
  const secretKey = envConfig.CASHFREE_SECRET_KEY;

  if (!clientId || !secretKey) {
    return { ok: false, httpStatus: 0 };
  }

  const base = getCashfreePgBaseUrl();
  if (!base) {
    return { ok: false, httpStatus: 0 };
  }

  const url = `${base}/orders/${encodeURIComponent(orderId)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-client-id": clientId,
      "x-client-secret": secretKey,
      "x-api-version": "2022-09-01",
    },
  });

  let data: unknown = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    return { ok: false, httpStatus: response.status };
  }

  const order_status =
    data &&
    typeof data === "object" &&
    typeof (data as Record<string, unknown>).order_status === "string"
      ? (data as { order_status: string }).order_status
      : undefined;

  return { ok: true, order_status, httpStatus: response.status };
};

// local helper to verify signature exactly per Cashfree docs
const verifyWebhookSignature = (
  rawPayload: string,
  signature: string | undefined,
  webhookSecret: string,
  timestamp: string | undefined,
): { isValid: boolean; error?: string } => {
  if (!signature) return { isValid: false, error: "Missing webhook signature" };
  if (!timestamp || typeof timestamp !== "string")
    return { isValid: false, error: "Missing webhook timestamp" };

  // signed string = timestamp + rawBody (no separators)
  const signedString = timestamp + rawPayload;
  const generatedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(signedString)
    .digest("base64");
  return {
    isValid: signature === generatedSignature,
    error:
      signature === generatedSignature
        ? undefined
        : "Invalid webhook signature",
  };
};

const validateWebhookEvent = (
  event: any,
): { isValid: boolean; error?: string; data?: WebhookEvent } => {
  const { order_id, payment_status } = event;

  if (!order_id || typeof payment_status !== "string") {
    return {
      isValid: false,
      error: "Missing order_id or invalid payment status in webhook payload",
    };
  }

  return {
    isValid: true,
    data: event as WebhookEvent,
  };
};

const checkUserCourseEnrollment = async (
  courseId: string,
  userId?: string,
): Promise<boolean> => {
  if (!courseId || !userId) return false;

  try {
    const { status, data } = await fetchAPIData(
      routes.api.courseByIdWithUser(courseId, userId),
    );

    if (!status || !data) return false;

    return !!data.isEnrolled;
  } catch (error) {
    console.error("Enrollment check failed:", error);
    return false;
  }
};

const getPYSubscriptionFeaturesByType = (
  subscriptionType: string,
): string[] => {
  const baseFeatures = SUBSCRIPTION_FEATURES.filter(
    (feature) =>
      !["ColdEmailAutomation", "LinkedInAutomation"].includes(feature),
  );

  return subscriptionType === "Lifetime" ? SUBSCRIPTION_FEATURES : baseFeatures;
};

const cleanJobSkillsData = (skills: string[]): string[] =>
  skills
    .map((s) => s.trim().toLowerCase())
    .filter((s) => !SKILL_BLACKLIST.includes(s))
    .map((s) => {
      const normalized = JOB_SKILL_NORMALIZER.find(({ label }) =>
        label.includes(s),
      );
      return normalized ? normalized.value : s;
    });

const normalizeAPIPayload = (
  value: string | string[],
  normalizerArray: { label: string[]; value: string }[],
): string | string[] => {
  const findNormalized = (input: string): string => {
    const key = input.trim().toLowerCase();
    for (const item of normalizerArray) {
      if (item.label.some((label) => label.toLowerCase() === key)) {
        return item.value;
      }
    }
    return input;
  };

  if (Array.isArray(value)) {
    return value.map(findNormalized);
  }

  return findNormalized(value);
};

const fetchPlaylistName = async (
  playlistId: string,
): Promise<{
  playlistName?: string;
  description?: string;
  thumbnail?: string;
}> => {
  try {
    const response = await fetch(
      `${YOUTUBE_API_PATH}/playlists?part=snippet&id=${playlistId}&key=${envConfig.YOUTUBE_API_KEY}`,
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Failed to fetch playlist metadata: ${data.error.message}`,
      );
    }

    if (data.items.length === 0) {
      throw new Error("No playlist found with the given ID");
    }

    const playlist = data.items[0].snippet;

    return {
      playlistName: playlist.title || "Unknown Playlist",
      description: playlist.description || "No Description Available",
      thumbnail:
        playlist.thumbnails?.maxres?.url ||
        playlist.thumbnails?.standard?.url ||
        playlist.thumbnails?.high?.url ||
        playlist.thumbnails?.medium?.url ||
        playlist.thumbnails?.default?.url ||
        "",
    };
  } catch (error) {
    console.error("Error fetching playlist name:", error);
    return {};
  }
};

const fetchPlaylistData = async (
  playlistId: string,
  pageToken = "",
  accumulatedVideos: Video[] = [],
  metadata: {
    playlistName?: string;
    description?: string;
    thumbnail?: string;
  } = {},
): Promise<PlaylistModel | undefined> => {
  try {
    if (!metadata.playlistName) {
      const playlistMetadata = await fetchPlaylistName(playlistId);
      metadata.playlistName =
        playlistMetadata.playlistName || "Unknown Playlist";
      metadata.description =
        playlistMetadata.description || "No Description Available";
      metadata.thumbnail = playlistMetadata.thumbnail || "";
    }

    // Fetch videos
    const response = await fetch(
      `${YOUTUBE_API_PATH}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&pageToken=${pageToken}&key=${envConfig.YOUTUBE_API_KEY}`,
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to fetch playlist data: ${data.error.message}`);
    }

    // Extract video details
    const videos: Video[] = data.items.map((item: any) => ({
      title: item.snippet.title,
      videoId: item.snippet.resourceId.videoId,
      thumbnail:
        item.snippet.thumbnails?.default?.url ||
        "https://via.placeholder.com/150",
    }));

    // Accumulate videos
    const allVideos = [...accumulatedVideos, ...videos];

    // Continue fetching if there's a nextPageToken
    if (data.nextPageToken) {
      return fetchPlaylistData(
        playlistId,
        data.nextPageToken,
        allVideos,
        metadata,
      );
    }

    // Return the complete data when no more pages
    return {
      playlistId,
      playlistName: metadata.playlistName || "",
      description: metadata.description || "",
      thumbnail: metadata.thumbnail || "",
      videos: allVideos,
    };
  } catch (error) {
    console.error("Error fetching playlist data:", error);
  }
};

const extractPlaylistId = (url: string) => {
  const regex = /(?:list=|\/playlist\/)([a-zA-Z0-9_-]{10,})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const generateYouTubeSearchLink = (questionTitle: string): string => {
  if (!questionTitle || questionTitle.trim() === "") {
    return "";
  }

  const searchQuery = `${questionTitle.trim()} leetcode solution`;
  const encodedQuery = encodeURIComponent(searchQuery);
  return `https://www.youtube.com/results?search_query=${encodedQuery}`;
};

export {
  buildCashfreeHostedCheckoutLink,
  buildOrderPayload,
  calculateUserPointsForAction,
  checkUserCourseEnrollment,
  cleanJobSkillsData,
  constrainNumberToRange,
  createCashfreeOrder,
  extractPlaylistId,
  fetchAPIData,
  fetchCashfreeOrderByOrderId,
  fetchPlaylistData,
  generatePaymentOrderId,
  generateYouTubeSearchLink,
  getPYSubscriptionFeaturesByType,
  isProgramActive,
  normalizeAPIPayload,
  sendAPIResponse,
  validateWebhookEvent,
  verifyWebhookSignature,
};
