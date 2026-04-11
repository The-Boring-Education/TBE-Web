import type { DsaQuestion } from "@tbe/interface";

import { generateYouTubeSearchLink } from "./functions";

export const transformDsaQuestion = (question: any): DsaQuestion => {
  const escapeRegExp = (str: string) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const titleRegex = new RegExp(
    `^\\s*#*\\s*${escapeRegExp(question.title)}\\s*`,
    "i",
  );

  let answer = question.answer ? question.answer.replace(titleRegex, "") : "";

  answer = answer
    .split(/Example \d+:/)[0]
    .split(/Constraints:/)[0]
    .replace(/(\r\n|\n|\r)\s*(##|###|\*\*|)\s*Examples?[\s\S]*$/, "");

  const examples = extractExamples(question.answer || "");
  const constraints = extractConstraints(question.answer || "");

  const result: DsaQuestion = {
    id: question._id,
    name: question.title,
    difficultyLevel: question.difficulty,
    answer: answer,
    resources: {
      ...question.resources,
      youtubeURL:
        question.resources?.youtubeURL ||
        generateYouTubeSearchLink(question.title),
    },
    topics: question.topics,
    companyType: question.companyTypes,
    domain: question.domain,
    examples: examples,
    constraints: constraints as string[],
    sections: question.sections
      ? JSON.parse(JSON.stringify(question.sections))
      : null,
    notes: question.notes,
    _priorityScore: question._priorityScore,
    isRealWorldProblem: !!(
      question.isRealWorldProblem || question.isrealworldproblem
    ),
    isRealWorld: !!(question.isRealWorldProblem || question.isrealworldproblem),
  };

  // Fix messy indentation/newlines in real-world sections (often caused by literal \n strings)
  if (result.sections) {
    const unescapeStr = (str: string) =>
      typeof str === "string" ? str.replace(/\\n/g, "\n") : str;

    const walk = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      for (const key in obj) {
        if (
          typeof obj[key] === "string" &&
          (key === "code" || key.endsWith("_code") || key === "fix")
        ) {
          obj[key] = unescapeStr(obj[key]);
        } else if (typeof obj[key] === "object") {
          walk(obj[key]);
        }
      }
    };
    walk(result.sections);
  }

  return result;
};

export const extractExamples = (markdown: string) => {
  const exampleRegex =
    /Example \d+:[\s\S]*?(?=(Example \d+:|Constraints:|#|$))/g;
  const matches = markdown.match(exampleRegex);

  if (!matches) return [];

  return matches.map((match) => {
    const inputRegex =
      /(?:Input|Input\s*):?\s*([\s\S]*?)(?=\n\s*(?:\*\*|\*)?Output)/i;
    const outputRegex =
      /(?:Output|Output\s*):?\s*([\s\S]*?)(?=\n\s*(?:\*\*|\*)?Explanation|\n$|$)/i;
    const explanationRegex =
      /(?:Explanation|Explanation\s*):?\s*([\s\S]*?)(?=$)/i;

    const inputTextMatch = match.match(inputRegex);
    const outputTextMatch = match.match(outputRegex);
    const explanationMatch = match.match(explanationRegex);

    const cleanText = (text: string) =>
      text.replace(/^[\s*`:_]+|[\s*`:_]+$/g, "").trim();

    return {
      inputText: inputTextMatch ? cleanText(inputTextMatch?.[1] || "") : "",
      outputText: outputTextMatch ? cleanText(outputTextMatch?.[1] || "") : "",
      explanation: explanationMatch
        ? cleanText(explanationMatch?.[1] || "")
        : "",
    };
  });
};

export const extractConstraints = (markdown: string) => {
  const constraintsRegex =
    /(?:Constraints|Constraints\s*):?\s*([\s\S]*?)(?=$)/i;
  const match = markdown.match(constraintsRegex);

  if (!match) return [];

  const rawText = match[1] || "";

  return rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        (line.startsWith("-") ||
          line.startsWith("*") ||
          /^\d+\./.test(line) ||
          line.length > 2),
    )
    .map((line) => line.replace(/^[-*]\s*|\d+\.\s*/, "").trim())
    .filter(Boolean);
};
