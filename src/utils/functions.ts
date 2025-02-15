import { envConfig, LINKS, YOUTUBE_API_PATH } from '@/constant';
import {
  BaseInterviewSheetResponseProps,
  BaseShikshaCourseResponseProps,
  FormatDateType,
  ProjectDocumentModel,
  ProjectPickedPageProps,
  User,
  Video,
  PlaylistModel,
} from '@/interfaces';

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
    timeZone: 'UTC',
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
  addtionalParams: any
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
        href: `/projects/${slug}?projectId=${_id}`,
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

const isAdmin = (adminSecret: string): boolean => {
  return envConfig.ADMIN_SECRET == adminSecret;
};

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
  const cookie = req.headers.cookie || req.headers.get('cookie');

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
) => {
  return coursesData?.map(
    ({
      _id,
      coverImageURL,
      name,
      description,
      liveOn = new Date(),
      slug,
      isEnrolled,
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
        href: `/shiksha/${slug}/?courseId=${_id}`,
        isEnrolled,
        active: isActive,
        ctaText,
        launchingOn,
      };
    }
  );
};

const mapInterviewSheetResponseToCard = (
  sheetsData: BaseInterviewSheetResponseProps[]
) => {
  return sheetsData?.map(
    ({
      _id,
      coverImageURL,
      name,
      description,
      liveOn = new Date(),
      slug,
      isEnrolled,
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
        href: `/interview-prep/${slug}/?sheetId=${_id}`,
        isEnrolled,
        active: isActive,
        ctaText,
        launchingOn,
      };
    }
  );
};

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

// fetches playlist data (metadata and videos)
const fetchPlaylistData = async (
  playlistId: string,
  pageToken = '',
  accumulatedVideos: Video[] = [],
  metadata: {
    playlistName?: string;
    description?: string;
    thumbnail?: string;
  } = {}
): Promise<PlaylistModel> => {
  const response = await fetch(
    `${YOUTUBE_API_PATH}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&pageToken=${pageToken}&key=${process.env.YOUTUBE_API_KEY}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to fetch playlist data: ${data.error.message}`);
  }

  // Extract playlist metadata if not already set
  if (!metadata.playlistName && data.items.length > 0) {
    metadata.playlistName = data.items[0].snippet.title || '';
    metadata.description =
      data.items[0].snippet.description || 'No Description Available';
    metadata.thumbnail = data.items[0].snippet.thumbnails?.maxres?.url || '';
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
    playlistName: metadata.playlistName || ' ',
    description: metadata.description || '',
    thumbnail: metadata.thumbnail || '',
    videos: allVideos,
  };
};

const extractPlaylistId = (url: string) => {
  const regex = /(?:list=|\/playlist\/)([a-zA-Z0-9_-]{10,})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const formatTimeUserLearning = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export {
  formatDate,
  formatTime,
  getDiscountPercentage,
  setLocalStorageItem,
  getLocalStorageItem,
  removeLocalStorageItem,
  mapProjectResponseToCard,
  getSelectedProjectChapterMeta,
  isAdmin,
  mapCourseResponseToCard,
  isUserAuthenticated,
  getSelectedCourseChapterMeta,
  getSelectedSheetQuestionMeta,
  mapInterviewSheetResponseToCard,
  isProgramActive,
  generatePublicCertificateLink,
  fetchAPIData,
  generateShareTemplate,
  fetchPlaylistData,
  extractPlaylistId,
  formatTimeUserLearning
};
