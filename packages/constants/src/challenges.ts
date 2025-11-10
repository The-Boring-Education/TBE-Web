export interface PredefinedChallengeTemplate {
    id: string;
    name: string;
    description: string;
    totalDays: number;
    category: string;
    icon: string;
    gradient: string;
    color: string;
    tags: string[];
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    estimatedHoursPerDay: number;
    learningPath: string[];
  }
  
  export const PREDEFINED_CHALLENGES: PredefinedChallengeTemplate[] = [
    {
      id: "21DaysPython",
      name: "21 Days of Learning Python",
      description: "Master Python fundamentals in 21 days with hands-on practice and projects. Perfect for beginners starting their programming journey.",
      totalDays: 21,
      category: "Programming",
      icon: "🐍",
      gradient: "from-blue-500 to-cyan-500",
      color: "blue",
      tags: ["Python", "Programming", "Beginner", "Web Development"],
      difficulty: "Beginner",
      estimatedHoursPerDay: 2,
      learningPath: [
        "Python basics and syntax",
        "Data structures and algorithms",
        "Object-oriented programming",
        "File handling and modules",
        "Web scraping with requests",
        "Building simple applications"
      ]
    },
    {
      id: "21DaysJava",
      name: "21 Days of Learning Java",
      description: "Build a strong foundation in Java programming with daily coding challenges and real-world projects.",
      totalDays: 21,
      category: "Programming",
      icon: "☕",
      gradient: "from-orange-500 to-red-500",
      color: "orange",
      tags: ["Java", "Programming", "Intermediate", "Enterprise"],
      difficulty: "Intermediate",
      estimatedHoursPerDay: 3,
      learningPath: [
        "Java fundamentals and syntax",
        "Object-oriented programming concepts",
        "Collections framework",
        "Exception handling",
        "Multithreading basics",
        "Building console applications"
      ]
    },
    {
      id: "50DaysInternship",
      name: "50 Days of Cracking Internship",
      description: "Comprehensive preparation for internship interviews including DSA, system design, and projects. Your roadmap to landing the perfect internship.",
      totalDays: 50,
      category: "Career",
      icon: "💼",
      gradient: "from-green-500 to-emerald-500",
      color: "green",
      tags: ["DSA", "System Design", "Interview Prep", "Career"],
      difficulty: "Advanced",
      estimatedHoursPerDay: 4,
      learningPath: [
        "Data Structures and Algorithms",
        "System Design fundamentals",
        "Database design and optimization",
        "API design and development",
        "Project building and deployment",
        "Mock interviews and feedback"
      ]
    },
    {
      id: "30DaysReact",
      name: "30 Days of React Development",
      description: "Master React.js from basics to advanced concepts with daily coding challenges and project building.",
      totalDays: 30,
      category: "Web Development",
      icon: "⚛️",
      gradient: "from-purple-500 to-pink-500",
      color: "purple",
      tags: ["React", "JavaScript", "Frontend", "Web Development"],
      difficulty: "Intermediate",
      estimatedHoursPerDay: 2.5,
      learningPath: [
        "React fundamentals and JSX",
        "Components and props",
        "State management with hooks",
        "Routing and navigation",
        "API integration",
        "Building full-stack applications"
      ]
    },
    {
      id: "100DaysDSA",
      name: "100 Days of Data Structures & Algorithms",
      description: "Master DSA concepts with daily problem-solving. Perfect for technical interview preparation and competitive programming.",
      totalDays: 100,
      category: "Programming",
      icon: "🧮",
      gradient: "from-indigo-500 to-purple-500",
      color: "indigo",
      tags: ["DSA", "Algorithms", "Competitive Programming", "Interview Prep"],
      difficulty: "Advanced",
      estimatedHoursPerDay: 3,
      learningPath: [
        "Arrays and strings",
        "Linked lists and trees",
        "Graph algorithms",
        "Dynamic programming",
        "Advanced algorithms",
        "Competitive programming problems"
      ]
    },
    {
      id: "45DaysDevOps",
      name: "45 Days of DevOps Mastery",
      description: "Learn DevOps practices, tools, and methodologies to become a DevOps engineer. From CI/CD to cloud deployment.",
      totalDays: 45,
      category: "DevOps",
      icon: "🚀",
      gradient: "from-yellow-500 to-orange-500",
      color: "yellow",
      tags: ["DevOps", "CI/CD", "Cloud", "Infrastructure"],
      difficulty: "Intermediate",
      estimatedHoursPerDay: 2.5,
      learningPath: [
        "Linux fundamentals",
        "Docker and containers",
        "Kubernetes basics",
        "CI/CD pipelines",
        "Cloud platforms (AWS/Azure)",
        "Monitoring and logging"
      ]
    }
  ];
  
  export const getChallengeTemplateById = (id: string): PredefinedChallengeTemplate | undefined => {
    return PREDEFINED_CHALLENGES.find(challenge => challenge.id === id);
  };
  
  export const getChallengesByCategory = (category: string): PredefinedChallengeTemplate[] => {
    return PREDEFINED_CHALLENGES.filter(challenge => challenge.category === category);
  };
  
  export const getChallengesByDifficulty = (difficulty: string): PredefinedChallengeTemplate[] => {
    return PREDEFINED_CHALLENGES.filter(challenge => challenge.difficulty === difficulty);
  };
  