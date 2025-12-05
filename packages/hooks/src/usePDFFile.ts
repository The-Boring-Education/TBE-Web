import { useState } from "react";

// Common programming skills to look for
const PROGRAMMING_SKILLS = [
  // Languages
  "javascript",
  "typescript",
  "python",
  "java",
  "c++",
  "c#",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "go",
  "rust",
  "scala",
  "r",
  "matlab",
  "perl",
  "shell",
  "bash",
  "powershell",
  // Frontend
  "react",
  "reactjs",
  "react.js",
  "vue",
  "vuejs",
  "vue.js",
  "angular",
  "angularjs",
  "nextjs",
  "next.js",
  "nuxt",
  "svelte",
  "jquery",
  "html",
  "html5",
  "css",
  "css3",
  "sass",
  "scss",
  "less",
  "tailwind",
  "tailwindcss",
  "bootstrap",
  "material-ui",
  "mui",
  // Backend
  "node",
  "nodejs",
  "node.js",
  "express",
  "expressjs",
  "nestjs",
  "fastapi",
  "flask",
  "django",
  "spring",
  "spring boot",
  "springboot",
  ".net",
  "dotnet",
  "asp.net",
  "laravel",
  "rails",
  // Databases
  "mongodb",
  "mysql",
  "postgresql",
  "postgres",
  "redis",
  "cassandra",
  "dynamodb",
  "sqlite",
  "oracle",
  "mssql",
  "sql server",
  "firebase",
  "firestore",
  "elasticsearch",
  // Cloud & DevOps
  "aws",
  "azure",
  "gcp",
  "google cloud",
  "docker",
  "kubernetes",
  "k8s",
  "jenkins",
  "gitlab",
  "github actions",
  "ci/cd",
  "terraform",
  "ansible",
  "nginx",
  "apache",
  // Mobile
  "react native",
  "flutter",
  "android",
  "ios",
  "swift",
  "kotlin",
  // Tools & Others
  "git",
  "github",
  "gitlab",
  "bitbucket",
  "jira",
  "webpack",
  "vite",
  "babel",
  "graphql",
  "rest api",
  "restful",
  "grpc",
  "websocket",
  "microservices",
  "agile",
  "scrum",
  "tdd",
  "jest",
  "mocha",
  "cypress",
  "selenium",
  "redux",
  "mobx",
  "zustand",
  "rxjs",
  "socket.io",
];

const usePDFFile = () => {
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const extractSkillsFromText = (text: string): string[] => {
    const lowerText = text.toLowerCase();
    const foundSkills = new Set<string>();

    PROGRAMMING_SKILLS.forEach((skill) => {
      const skillLower = skill.toLowerCase();
      // Use word boundary regex to match whole words
      const regex = new RegExp(
        `\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "i"
      );
      if (regex.test(lowerText)) {
        foundSkills.add(skill);
      }
    });

    return Array.from(foundSkills);
  };

  const extractTextFromPDF = async (file: File) => {
    console.log(
      "🔍 extractTextFromPDF called with:",
      file.name,
      file.type,
      file.size
    );

    // Only run on client side
    if (typeof window === "undefined") {
      console.error("❌ PDF extraction only works on client side");
      return;
    }

    console.log("✅ Client-side check passed, starting extraction...");
    setIsExtracting(true);
    try {
      console.log("📦 Attempting to dynamically import pdfjs-dist...");
      // Dynamic import to avoid server-side rendering issues
      const pdfjs = await import("pdfjs-dist");
      console.log(
        "✅ pdfjs-dist imported successfully, version:",
        pdfjs.version
      );

      // Configure worker for client-side
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      console.log("✅ Worker configured");

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";

      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + " ";
      }

      // Extract skills from the full text
      const skills = extractSkillsFromText(fullText);

      console.log("📄 Extracted Text Preview:", fullText.substring(0, 500));
      console.log("🎯 Found Programming Skills:", skills);
      console.log("📊 Total Skills Found:", skills.length);

      setExtractedSkills(skills);
    } catch (error) {
      console.error("❌ Failed to extract text from PDF:", error);
      setExtractedSkills([]);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    console.log("📂 File upload triggered:", uploadedFile?.name);
    if (uploadedFile) {
      console.log("✅ File selected, starting extraction...");
      setFile(uploadedFile);
      extractTextFromPDF(uploadedFile);
    } else {
      console.warn("⚠️ No file selected");
    }
  };

  return { extractedSkills, file, handleFileUpload, isExtracting };
};

export default usePDFFile;
