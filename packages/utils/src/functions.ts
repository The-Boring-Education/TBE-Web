import crypto from 'crypto';

import {
  envConfig,
  JOB_SKILL_NORMALIZER,
  LINKS,
  POINTS_RULES, 
  routes,
  SKILL_BLACKLIST,
  SUBSCRIPTION_FEATURES,
  USER_LEVELS,
  YOUFOCUS_SKILL_PLAYLISTS,
  YOUTUBE_API_PATH,
} from '@tbe/constants';
import type {
  BaseInterviewSheetResponseProps,
  BaseShikshaCourseResponseProps,
  BuildOrderPayloadProps,
  FormatDateType,
  PlaylistModel,
  ProjectDocumentModel,
  ProjectPickedPageProps,
  User,
  UserPlaylistResponseProps,
  UserPointsActionType,
  Video,
  WebhookEvent,
} from '@tbe/interface';

const fetchAPIData = async (url: string) => {
  const response = await fetch(`${envConfig.BASE_API_URL}/${url}`);

  return await response.json();
};

const formatDate = ({
  dateAndTime = new Date().toISOString(),
  dateFormat = {
    day: 'numeric',
    month: 'short',
    weekday: 'long',
  },
  timeFormat = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  },
}: FormatDateType) => {
  const date = new Date(dateAndTime);
  return {
    date: date.toLocaleDateString('en-US', dateFormat),
    time: date.toLocaleTimeString('en-US', timeFormat),
  };
};

const formatTime = (time: number) => time.toString().padStart(2, '0');

// Get % of Discount on Program
const getDiscountPercentage = (basePrice: number, sellingPrice: number) =>
  Math.floor(((basePrice - sellingPrice) / basePrice) * 100);

// Store data in Local Storage
const setLocalStorageItem = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error storing data in local storage:', error);
  }
};

// Get data from Local Storage
const getLocalStorageItem = (key: string): any | null => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error fetching data from local storage:', error);
    return;
  }
};

// Remove Data from Local Stoarge
const removeLocalStorageItem = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data from local storage:', error);
  }
};

const mapProjectResponseToCard = (
  projectsData: ProjectDocumentModel[],
  addtionalParams: any = { isEnrolled: false }
) => {
  const { isEnrolled } = addtionalParams;

  return projectsData?.map(
    ({ _id, coverImageURL, name, description, slug, isActive }) => {
      let ctaText = 'Start The Project';

      if (!isActive) {
        ctaText = 'Coming Soon';
      }

      if (isEnrolled) {
        ctaText = 'Continue Building';
      }

      return {
        id: _id,
        image: coverImageURL,
        imageAltText: name,
        title: name,
        content: description,
        href: `/projects/${slug}`,
        active: isActive,
        ctaText,
      };
    }
  );
};

const getSelectedProjectChapterMeta = (
  project: ProjectPickedPageProps,
  sectionId: string,
  chapterId: string
) => {
  const selectedSection = project.sections.find(
    (section) => section.sectionId === sectionId
  );

  const selectedChapter = selectedSection?.chapters.find(
    (chapter) => chapter.chapterId === chapterId
  );

  return selectedChapter?.content ?? '';
};

const getSelectedCourseChapterMeta = (
  course: BaseShikshaCourseResponseProps,
  chapterId: string
) => {
  if (!course.chapters) return null;

  const selectedChapter = course?.chapters.find(
    (chapter) => chapter._id.toString() === chapterId
  );

  return selectedChapter?.content ?? '';
};

const isAdmin = (adminSecret: string): boolean =>
  envConfig.ADMIN_SECRET == adminSecret;

const getSelectedSheetQuestionMeta = (
  sheet: BaseInterviewSheetResponseProps,
  questionId: string
) => {
  if (!sheet.questions) return null;

  const selectedQuestion = sheet.questions.find(
    (question) => question._id.toString() === questionId
  );

  return selectedQuestion?.question ?? '';
};

const isUserAuthenticated = async (req: any): Promise<User | null> => {
  const cookie = req.headers.cookie;

  try {
    const response = await fetch(`${envConfig.BASE_AUTH_API_URL}/session`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie || '',
      },
    });

    const session = await response.json();
    return session && session.user ? session.user : null;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
};

const isProgramActive = (liveOn: Date | string) =>
  new Date(liveOn) <= new Date();

const mapCourseResponseToCard = (
  coursesData: BaseShikshaCourseResponseProps[]
) =>
  coursesData?.map(
    ({
      _id,
      coverImageURL,
      name,
      description,
      liveOn = new Date(),
      slug,
      isEnrolled,
      isPremium,
    }) => {
      const isActive = isProgramActive(liveOn);

      let ctaText = 'Coming Soon';
      let launchingOn = '';

      if (isActive) {
        ctaText = 'View Course';
      } else {
        const date = new Date(liveOn);
        const dateAndTime = formatDate({
          dateAndTime: date.toString(),
        });
        launchingOn = `Launching on ${dateAndTime.date} at ${dateAndTime.time}`;
      }

      if (isEnrolled) {
        ctaText = 'Continue Learning';
      }

      return {
        id: _id,
        image: coverImageURL,
        title: name,
        imageAltText: name,
        content: description,
        href: `/shiksha/${slug}`,
        isEnrolled,
        active: isActive,
        ctaText,
        launchingOn,
        isPremium,
      };
    }
  );

const mapInterviewSheetResponseToCard = (
  sheetsData: BaseInterviewSheetResponseProps[]
) =>
  sheetsData?.map(
    ({
      _id,
      coverImageURL,
      name,
      description,
      liveOn = new Date(),
      slug,
      isEnrolled,
      isPremium,
    }) => {
      const isActive = isProgramActive(liveOn);

      let ctaText = 'Coming Soon';
      let launchingOn = '';

      if (isActive) {
        ctaText = 'View Sheet';
      } else {
        const date = new Date(liveOn);
        launchingOn = `Launching on ${date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
        })}`;
      }

      if (isEnrolled) {
        ctaText = 'Continue Preparing';
      }

      return {
        id: _id,
        image: coverImageURL,
        title: name,
        imageAltText: name,
        content: description,
        href: `/interview-prep/${slug}/landing`,
        isEnrolled,
        active: isActive,
        ctaText,
        launchingOn,
        isPremium,
      };
    }
  );

const mapUserPlaylistResponseToCard = (
  playlists: UserPlaylistResponseProps[]
) =>
  playlists?.map(({ _id, playlistName, description, thumbnail }) => ({
    id: _id,
    title: playlistName,
    image: thumbnail,
    imageAltText: playlistName,
    content: description,
    ctaText: 'Continue Learning',
    active: true,
    href: `/youfocus/playlist/${_id}`,
  }));

const generatePublicCertificateLink = (host: string, certificateId: string) =>
  `${host}/certificate/${certificateId}`;

const generateShareTemplate = (
  programName: string,
  userName: string,
  type: 'SHIKSHA' | 'WEBINAR'
) => {
  const keyLearnings = '[mention key learnings]';
  const specificAreas = '[mention specific areas or topics]';
  const likedAboutProgram = '[mention what you liked about the program]';
  const howItHelped = '[mention how it has helped you or your career]';

  const baseMessage = `
    Hello LinkedIn Connections,

    I am thrilled to announce that I have successfully completed the ${programName} in ${type} at The Boring Education!

    During this Program, I have gained invaluable knowledge and skills in ${keyLearnings}. The comprehensive curriculum and hands-on projects have significantly enhanced my understanding of ${specificAreas}.

    I particularly enjoyed ${likedAboutProgram}, which has been instrumental in ${howItHelped}.

    I would like to extend my heartfelt gratitude to Sachin(Tag me - ${LINKS.sachinLinkedIn}) and The Boring Education(Tag us - ${LINKS.officialLinkedIn}) for their unwavering support and guidance throughout this journey.

    Thank you for your support!

    Best regards,
    ${userName}
    `;

  return baseMessage;
};

const fetchPlaylistName = async (
  playlistId: string
): Promise<{
  playlistName?: string;
  description?: string;
  thumbnail?: string;
}> => {
  try {
    const response = await fetch(
      `${YOUTUBE_API_PATH}/playlists?part=snippet&id=${playlistId}&key=${envConfig.YOUTUBE_API_KEY}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Failed to fetch playlist metadata: ${data.error.message}`
      );
    }

    if (data.items.length === 0) {
      throw new Error('No playlist found with the given ID');
    }

    const playlist = data.items[0].snippet;

    return {
      playlistName: playlist.title || 'Unknown Playlist',
      description: playlist.description || 'No Description Available',
      thumbnail:
        playlist.thumbnails?.maxres?.url ||
        playlist.thumbnails?.standard?.url ||
        playlist.thumbnails?.high?.url ||
        playlist.thumbnails?.medium?.url ||
        playlist.thumbnails?.default?.url ||
        '',
    };
  } catch (error) {
    console.error('Error fetching playlist name:', error);
    return {};
  }
};

const fetchPlaylistData = async (
  playlistId: string,
  pageToken = '',
  accumulatedVideos: Video[] = [],
  metadata: {
    playlistName?: string;
    description?: string;
    thumbnail?: string;
  } = {}
): Promise<PlaylistModel | undefined> => {
  try {
    if (!metadata.playlistName) {
      const playlistMetadata = await fetchPlaylistName(playlistId);
      metadata.playlistName =
        playlistMetadata.playlistName || 'Unknown Playlist';
      metadata.description =
        playlistMetadata.description || 'No Description Available';
      metadata.thumbnail = playlistMetadata.thumbnail || '';
    }

    // Fetch videos
    const response = await fetch(
      `${YOUTUBE_API_PATH}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&pageToken=${pageToken}&key=${envConfig.YOUTUBE_API_KEY}`
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
        'https://via.placeholder.com/150',
    }));

    // Accumulate videos
    const allVideos = [...accumulatedVideos, ...videos];

    // Continue fetching if there's a nextPageToken
    if (data.nextPageToken) {
      return fetchPlaylistData(
        playlistId,
        data.nextPageToken,
        allVideos,
        metadata
      );
    }

    // Return the complete data when no more pages
    return {
      playlistId,
      playlistName: metadata.playlistName || '',
      description: metadata.description || '',
      thumbnail: metadata.thumbnail || '',
      videos: allVideos,
    };
  } catch (error) {
    console.error('Error fetching playlist data:', error);
  }
};

const extractPlaylistId = (url: string) => {
  const regex = /(?:list=|\/playlist\/)([a-zA-Z0-9_-]{10,})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const convertSecondsToMinutes = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

const generateSitemap = () => {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const sitemapRoutes = flattenRoutesForSitemap(routes);

  sitemapRoutes.forEach((url) => {
    sitemap += `<url><loc>${url}</loc></url>\n`;
  });

  sitemap += `</urlset>`;

  return sitemap;
};

const flattenRoutesForSitemap = (routesObj: Record<string, any>): string[] => {
  const SITE_URL = 'https://theboringeducation.com';

  let urls: string[] = [];

  for (const key in routesObj) {
    if (key === 'api' || key === 'internals' || key === '404') continue;

    const value = routesObj[key];

    if (typeof value === 'string') urls.push(`${SITE_URL}${value}`);
    else if (typeof value === 'object')
      urls = urls.concat(flattenRoutesForSitemap(value));
  }

  return urls;
};

const getYoufocusSkillName = (query?: string) => {
  if (!query) return 'Explore';

  return YOUFOCUS_SKILL_PLAYLISTS.find((skill) => skill.value === query)?.label;
};

const calculateUserPointsForAction = (actionType: UserPointsActionType) => {
  const points = POINTS_RULES[actionType as UserPointsActionType] || 0;
  return points;
};

const getUserGamificationLevel = (userPoints: number) => {
  let currentLevel = USER_LEVELS[0];
  let nextLevel: typeof USER_LEVELS[0] | null = null;

  for (let i = 0; i < USER_LEVELS.length; i++) {
    const level = USER_LEVELS[i];
    if (level && userPoints >= level.minPoints) {
      currentLevel = level;
      nextLevel = USER_LEVELS[i + 1] || null;
    } else {
      break;
    }
  }
  const pointsLeftToNextLevel = nextLevel
    ? nextLevel.minPoints - userPoints
    : 0;

  const nextMinPoints = nextLevel?.minPoints || 0;

  const percentageProgress = calculateProgressPercentage(
    userPoints,
    nextMinPoints
  );

  return {
    currentLevel: currentLevel?.level || 0,
    currentLevelName: currentLevel?.name || 'Unknown',
    pointsLeftToNextLevel,
    nextLevelName: nextLevel?.name,
    percentageProgress: Math.min(percentageProgress, 100),
  };
};

const calculateProgressPercentage = (
  progress: number,
  nextMinPoints: number
): number => {
  if (nextMinPoints === 0) {
    return 100;
  }
  return (progress / nextMinPoints) * 100;
};

const getRedirectUrl = (url?: string) => {
  const redirectTo =
    new URL(url || window.location.href).searchParams.get('redirectTo') ||
    routes.user.dashboard;

  return redirectTo;
};

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

const extractSkillsFromText = (text: string): string[] => {
  const lowerText = text.toLowerCase();
  const matchedSkills = new Set<string>();
  JOB_SKILL_NORMALIZER.forEach(({ label, value }) => {
    if (label.some((alt: string) => lowerText.includes(alt.toLowerCase()))) {
      matchedSkills.add(value);
    }
  });
  return Array.from(matchedSkills);
};

// Constrains a number to be within a minimum and maximum boundary
const constrainNumberToRange = (
  value: number,
  min: number,
  max: number
): number => Math.min(Math.max(value, min), max);

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

const generatePaymentOrderId = (): string =>
  `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

const buildOrderPayload = ({
  orderId,
  amount,
  userId,
  customerName,
  customerEmail,
}: BuildOrderPayloadProps) => ({
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
    return_url: `${envConfig.NEXT_PUBLIC_BASE_URL}/payment/status?order_id=${orderId}`,
  },
});

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

const verifyWebhookSignature = (
  payloadString: string,
  signature: string | undefined,
  webhookSecret: string
): { isValid: boolean; error?: string } => {
  if (!signature) {
    return { isValid: false, error: 'Missing webhook signature' };
  }

  const generatedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payloadString)
    .digest('base64');

  return { isValid: signature === generatedSignature };
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

export {
  type WebhookEvent,
  buildOrderPayload,
  calculateProgressPercentage,
  calculateUserPointsForAction,
  checkUserCourseEnrollment,
  cleanJobSkillsData,
  constrainNumberToRange,
  convertSecondsToMinutes,
  createCashfreeOrder,
  extractPlaylistId,
  extractSkillsFromText,
  fetchAPIData,
  fetchPlaylistData,
  flattenRoutesForSitemap,
  formatDate,
  formatTime,
  generatePaymentOrderId,
  generatePublicCertificateLink,
  generateShareTemplate,
  generateSitemap,
  getDiscountPercentage,
  getLocalStorageItem,
  getPYSubscriptionFeaturesByType,
  getRedirectUrl,
  getSelectedCourseChapterMeta,
  getSelectedProjectChapterMeta,
  getSelectedSheetQuestionMeta,
  getUserGamificationLevel,
  getYoufocusSkillName,
  isAdmin,
  isProgramActive,
  isUserAuthenticated,
  mapCourseResponseToCard,
  mapInterviewSheetResponseToCard,
  mapProjectResponseToCard,
  mapUserPlaylistResponseToCard,
  normalizeAPIPayload,
  removeLocalStorageItem,
  setLocalStorageItem,
  validateWebhookEvent,
  verifyWebhookSignature,
};
