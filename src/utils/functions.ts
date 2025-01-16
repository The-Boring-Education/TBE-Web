import { envConfig, LINKS } from '@/constant';
import {
  BaseInterviewSheetResponseProps,
  BaseShikshaCourseResponseProps,
  FormatDateType,
  ProjectDocumentModel,
  ProjectPickedPageProps,
  User,
  Video
} from '@/interfaces';
import { Playlist, checkPlaylistExistsByPlaylistId } from '@/database';

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

const mapProjectResponseToCard = (projectsData: ProjectDocumentModel[]) => {
  return projectsData?.map(
    ({ _id, coverImageURL, name, description, slug, isActive }) => ({
      id: _id,
      image: coverImageURL,
      imageAltText: name,
      title: name,
      content: description,
      href: `/projects/${slug}?projectId=${_id}`,
      active: isActive,
      ctaText: isActive ? 'Start The Project' : 'Coming Soon',
    })
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

      if (isEnrolled) {
        ctaText = 'Continue Learning';
      }

      if (isActive) {
        ctaText = 'View Course';
      } else {
        const date = new Date(liveOn);
        const dateAndTime = formatDate({
          dateAndTime: date.toString(),
        });
        launchingOn = `Launching on ${dateAndTime.date} at ${dateAndTime.time}`;
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

      if (isEnrolled) {
        ctaText = 'Continue Learning';
      }

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

//Add Youtube Playlist add 
const addPlaylist = async (playlistUrl: string) => {
  const playlistId = extractPlaylistId(playlistUrl);

  if (!playlistId) {
    throw new Error('Invalid playlist URL');
  }

  const existingPlaylist = await checkPlaylistExistsByPlaylistId(playlistId);

  if (existingPlaylist.exists) {
    return existingPlaylist.message;
  }

  const metadata = await fetchPlaylistMetadata(playlistId);

  if (!metadata || metadata.success === false) {
    throw new Error('Failed to fetch playlist metadata from YouTube');
  }

  const allVideos = await fetchPlaylistVideos(playlistId);

  await Playlist.create({
    playlistId,
    playlistName: metadata.playlistName,
    description: metadata.description,
    videos: allVideos,
  });

  return 'Playlist added successfully';
};

// Fetch metadata for a YouTube playlist using its ID.
const fetchPlaylistMetadata = async (playlistId: string) => {
  try {
    const metadataResponse: any = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${process.env.YOUTUBE_API_KEY}`
    );
    const metadata = await metadataResponse.json();

    if (!metadataResponse.ok) {
      throw new Error(`Failed to fetch playlist metadata: ${metadata.error.message}`);
    }

    if (!metadata.items || metadata.items.length === 0) {
      throw new Error('No playlist metadata found.');
    }

    const playlistName = metadata.items[0].snippet.title;
    const description = metadata.items[0].snippet.description;

    return { playlistName, description };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to fetch playlist metadata',
    };
  }
};

// Recursively fetch videos from a YouTube playlist.
const fetchPlaylistVideos = async (
  playlistId: string,
  pageToken: string = '',
  accumulatedVideos: Video[] = []
): Promise<Video[]> => {
  try {
    const response: any = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&pageToken=${pageToken}&key=${process.env.YOUTUBE_API_KEY}`
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to fetch data from YouTube: ${data.error.message}`);
    }

    const videos: Video[] = data.items.map((item: any) => {
      const thumbnail = item.snippet.thumbnails?.default?.url || '';
      return {
        title: item.snippet.title,
        videoId: item.snippet.resourceId.videoId,
        thumbnail,
      };
    });

    const allVideos = [...accumulatedVideos, ...videos];

    if (data.nextPageToken) {
      return fetchPlaylistVideos(playlistId, data.nextPageToken, allVideos);
    }

    return allVideos;
  } catch (error) {
    console.error(error);
    return accumulatedVideos;
  }
};

const extractPlaylistId = (url: string) => {
  const regex = /(?:list=|\/playlist\/)([a-zA-Z0-9_-]{10,})/;
  const match = url.match(regex);
  return match ? match[1] : null;
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
  addPlaylist,
};
