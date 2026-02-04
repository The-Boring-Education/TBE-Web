import crypto from "crypto"

import type { APIResponseType, BuildOrderPayloadProps, PlaylistModel, UserPointsActionType, Video, WebhookEvent } from "@/lib/interfaces"

import { envConfig, JOB_SKILL_NORMALIZER, SKILL_BLACKLIST, YOUTUBE_API_PATH } from "../constants"
import { POINTS_RULES, SUBSCRIPTION_FEATURES } from "../constants"
import { routes } from "../constants"

const sendAPIResponse = ({
    success,
    status,
    error,
    message,
    data
}: APIResponseType): APIResponseType => ({
    success,
    status,
    error,
    message,
    data
})

const fetchAPIData = async (url: string) => {
    const response = await fetch(`${envConfig.API_URL}/${url}`)

    return await response.json()
}

const calculateUserPointsForAction = (actionType: UserPointsActionType) => {
    const points = POINTS_RULES[actionType as UserPointsActionType] || 0
    return points
}

const constrainNumberToRange = (
    value: number,
    min: number,
    max: number
): number => Math.min(Math.max(value, min), max)

const isProgramActive = (liveOn: Date | string) =>
    new Date(liveOn) <= new Date()


const generatePaymentOrderId = (): string =>
    `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  
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
      order_currency: 'INR',
      customer_details: {
        customer_id: userId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: '0000000000',
      },
      order_meta: {
        return_url: `${envConfig.PLATFORM_URL}/payment/status?order_id=${orderId}`,
      },
    };
  };
  
  const createCashfreeOrder = async (
    orderPayload: ReturnType<typeof buildOrderPayload>
  ): Promise<{ data: any; ok: boolean }> => {
    const clientId = envConfig.CASHFREE_CLIENT_ID;
    const secretKey = envConfig.CASHFREE_SECRET_KEY;
  
    if (!clientId || !secretKey) {
      throw new Error('Cashfree credentials not configured');
    }
  
    const response = await fetch(`${envConfig.CASHFREE_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId,
        'x-client-secret': secretKey,
        'x-api-version': '2022-09-01',
      },
      body: JSON.stringify(orderPayload),
    });
  
    const data = await response.json();
  
    return { data, ok: response.ok };
  };


  // local helper to verify signature exactly per Cashfree docs
const verifyWebhookSignature = (
  rawPayload: string,
  signature: string | undefined,
  webhookSecret: string,
  timestamp: string | undefined
): { isValid: boolean; error?: string } => {
  if (!signature) return { isValid: false, error: "Missing webhook signature" };
  if (!timestamp || typeof timestamp !== "string")
    return { isValid: false, error: "Missing webhook timestamp" };

  // signed string = timestamp + rawBody (no separators)
  const signedString = timestamp + rawPayload;
  const generatedSignature = crypto.createHmac("sha256", webhookSecret).update(signedString).digest("base64");
  return { isValid: signature === generatedSignature, error: signature === generatedSignature ? undefined : "Invalid webhook signature" };
};
  
  
  const validateWebhookEvent = (
    event: any
  ): { isValid: boolean; error?: string; data?: WebhookEvent } => {
    const { order_id, payment_status } = event;
  
    if (!order_id || typeof payment_status !== 'string') {
      return {
        isValid: false,
        error: 'Missing order_id or invalid isPaid status in webhook payload',
      };
    }
  
    return {
      isValid: true,
      data: event as WebhookEvent,
    };
  };
  
  const checkUserCourseEnrollment = async (
    courseId: string,
    userId?: string
  ): Promise<boolean> => {
    if (!courseId || !userId) return false;
  
    try {
      const { status, data } = await fetchAPIData(
        routes.api.courseByIdWithUser(courseId, userId)
      );
  
      if (!status || !data) return false;
  
      return !!data.isEnrolled;
    } catch (error) {
      console.error('Enrollment check failed:', error);
      return false;
    }
  };
  
  const getPYSubscriptionFeaturesByType = (
    subscriptionType: string
  ): string[] => {
    const baseFeatures = SUBSCRIPTION_FEATURES.filter(
      (feature) =>
        !['ColdEmailAutomation', 'LinkedInAutomation'].includes(feature)
    );
  
    return subscriptionType === 'Lifetime' ? SUBSCRIPTION_FEATURES : baseFeatures;
  };

  const cleanJobSkillsData = (skills: string[]): string[] =>
    skills
      .map((s) => s.trim().toLowerCase())
      .filter((s) => !SKILL_BLACKLIST.includes(s))
      .map((s) => {
        const normalized = JOB_SKILL_NORMALIZER.find(({ label }) =>
          label.includes(s)
        );
        return normalized ? normalized.value : s;
      });
  
const normalizeAPIPayload = (
        value: string | string[],
        normalizerArray: { label: string[]; value: string }[]
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
    playlistId: string
): Promise<{
    playlistName?: string
    description?: string
    thumbnail?: string
}> => {
    try {
        const response = await fetch(
            `${YOUTUBE_API_PATH}/playlists?part=snippet&id=${playlistId}&key=${envConfig.YOUTUBE_API_KEY}`
        )

        const data = await response.json()

        if (!response.ok) {
            throw new Error(
                `Failed to fetch playlist metadata: ${data.error.message}`
            )
        }

        if (data.items.length === 0) {
            throw new Error("No playlist found with the given ID")
        }

        const playlist = data.items[0].snippet

        return {
            playlistName: playlist.title || "Unknown Playlist",
            description: playlist.description || "No Description Available",
            thumbnail:
                playlist.thumbnails?.maxres?.url ||
                playlist.thumbnails?.standard?.url ||
                playlist.thumbnails?.high?.url ||
                playlist.thumbnails?.medium?.url ||
                playlist.thumbnails?.default?.url ||
                ""
        }
    } catch (error) {
        console.error("Error fetching playlist name:", error)
        return {}
    }
}


const fetchPlaylistData = async (
    playlistId: string,
    pageToken = "",
    accumulatedVideos: Video[] = [],
    metadata: {
        playlistName?: string
        description?: string
        thumbnail?: string
    } = {}
): Promise<PlaylistModel | undefined> => {
    try {
        if (!metadata.playlistName) {
            const playlistMetadata = await fetchPlaylistName(playlistId)
            metadata.playlistName =
                playlistMetadata.playlistName || "Unknown Playlist"
            metadata.description =
                playlistMetadata.description || "No Description Available"
            metadata.thumbnail = playlistMetadata.thumbnail || ""
        }

        // Fetch videos
        const response = await fetch(
            `${YOUTUBE_API_PATH}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&pageToken=${pageToken}&key=${envConfig.YOUTUBE_API_KEY}`
        )

        const data = await response.json()

        if (!response.ok) {
            throw new Error(
                `Failed to fetch playlist data: ${data.error.message}`
            )
        }

        // Extract video details
        const videos: Video[] = data.items.map((item: any) => ({
            title: item.snippet.title,
            videoId: item.snippet.resourceId.videoId,
            thumbnail:
                item.snippet.thumbnails?.default?.url ||
                "https://via.placeholder.com/150"
        }))

        // Accumulate videos
        const allVideos = [...accumulatedVideos, ...videos]

        // Continue fetching if there's a nextPageToken
        if (data.nextPageToken) {
            return fetchPlaylistData(
                playlistId,
                data.nextPageToken,
                allVideos,
                metadata
            )
        }

        // Return the complete data when no more pages
        return {
            playlistId,
            playlistName: metadata.playlistName || "",
            description: metadata.description || "",
            thumbnail: metadata.thumbnail || "",
            videos: allVideos
        }
    } catch (error) {
        console.error("Error fetching playlist data:", error)
    }
}

const extractPlaylistId = (url: string) => {
    const regex = /(?:list=|\/playlist\/)([a-zA-Z0-9_-]{10,})/
    const match = url.match(regex)
    return match ? match[1] : null
}

const isVercelInternalIP = (ip?: string) => {
  if (!ip) return false;
  return (
      ip.startsWith("::ffff:10.") ||    // Vercel internal LB
      ip.startsWith("10.") ||
      ip.startsWith("192.168.") ||
      ip.startsWith("172.") ||
      ip === "::1" ||
      ip.startsWith("::ffff:172.") ||
      ip.startsWith("::ffff:192.168.")
  );
};  
  

const generateYouTubeSearchLink = (questionTitle: string): string => {
    if (!questionTitle || questionTitle.trim() === "") {
        return ""
    }

    const searchQuery = `${questionTitle.trim()} leetcode solution`
    const encodedQuery = encodeURIComponent(searchQuery)
    return `https://www.youtube.com/results?search_query=${encodedQuery}`
}

export {
    buildOrderPayload,
    calculateUserPointsForAction,
    checkUserCourseEnrollment,
    cleanJobSkillsData,
    constrainNumberToRange,
    createCashfreeOrder,
    extractPlaylistId,
    fetchAPIData,
    fetchPlaylistData,
    generatePaymentOrderId,
    generateYouTubeSearchLink,
    getPYSubscriptionFeaturesByType,
    isProgramActive,
    isVercelInternalIP,
    normalizeAPIPayload,
    sendAPIResponse,
    validateWebhookEvent,
    verifyWebhookSignature
}
