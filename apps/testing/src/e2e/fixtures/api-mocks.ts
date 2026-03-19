/**
 * Mock API responses for E2E tests.
 *
 * Client-side API calls in the Platform go through `/api/proxy/{path}`,
 * so we intercept that route in Playwright to return deterministic data
 * without needing the real API server.
 */

export const mockCourses = {
  status: true,
  data: [
    {
      _id: "course-1",
      name: "Logic Building for Everyone",
      title: "Logic Building for Everyone",
      slug: "logic-building-for-everyone",
      description:
        "Build a strong foundation in programming logic with hands-on exercises.",
      thumbnail: "https://placehold.co/400x300",
      totalChapters: 12,
      totalStudents: 250,
      difficulty: "Beginner",
      isPublished: true,
    },
    {
      _id: "course-2",
      name: "Zero to One Frontend Development",
      title: "Zero to One Frontend Development",
      slug: "zero-to-one-frontend-development",
      description:
        "Learn frontend development from scratch with HTML, CSS, and JavaScript.",
      thumbnail: "https://placehold.co/400x300",
      totalChapters: 24,
      totalStudents: 180,
      difficulty: "Intermediate",
      isPublished: true,
    },
  ],
};

export const mockInterviewSheets = {
  status: true,
  data: [
    {
      _id: "sheet-1",
      name: "JavaScript Interview Questions",
      title: "JavaScript Interview Questions",
      slug: "javascript-interview-questions",
      description: "Comprehensive JS interview preparation sheet.",
      thumbnail: "https://placehold.co/400x300",
      totalQuestions: 50,
      difficulty: "Intermediate",
      isPublished: true,
    },
    {
      _id: "sheet-2",
      name: "React Interview Questions",
      title: "React Interview Questions",
      slug: "react-interview-questions",
      description: "Top React interview questions for frontend roles.",
      thumbnail: "https://placehold.co/400x300",
      totalQuestions: 40,
      difficulty: "Intermediate",
      isPublished: true,
    },
  ],
};

export const mockProjects = {
  status: true,
  data: [
    {
      _id: "project-1",
      title: "PharmaSift I",
      slug: "pharmasift-i",
      description: "Build a pharmacy management system from scratch.",
      thumbnail: "https://placehold.co/400x300",
      totalSections: 5,
      difficulty: "Advanced",
      isPublished: true,
    },
  ],
};

export const mockEmptyResponse = {
  status: true,
  data: [],
};
