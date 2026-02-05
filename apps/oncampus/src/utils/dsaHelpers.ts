import type { DsaQuestion } from "@tbe/interface";

export const transformDsaQuestion = (question: any): DsaQuestion => {
    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const titleRegex = new RegExp(`^\\s*#*\\s*${escapeRegExp(question.title)}\\s*`, 'i');

    let answer = question.answer ? question.answer.replace(titleRegex, '') : "";

    answer = answer.split(/Example \d+:/)[0].split(/Constraints:/)[0].replace(/(\r\n|\n|\r)\s*(##|###|\*\*|)\s*Examples?[\s\S]*$/, "");

    const examples = extractExamples(question.answer || "");
    const constraints = extractConstraints(question.answer || "");

    return {
        id: question._id,
        name: question.title,
        difficultyLevel: question.difficulty,
        answer: answer,
        resources: question.resources,
        topics: question.topics,
        companyType: question.companyTypes,
        domain: question.domain,
        examples: examples,
        constraints: constraints
    };
};

const extractExamples = (markdown: string) => {
    const exampleRegex = /Example \d+:[\s\S]*?(?=(Example \d+:|Constraints:|#|$))/g;
    const matches = markdown.match(exampleRegex);

    if (!matches) return [];

    return matches.map(match => {
        const inputRegex = /(?:Input|Input\s*):?\s*([\s\S]*?)(?=\n\s*(?:\*\*|\*)?Output)/i;
        const outputRegex = /(?:Output|Output\s*):?\s*([\s\S]*?)(?=\n\s*(?:\*\*|\*)?Explanation|\n$|$)/i;
        const explanationRegex = /(?:Explanation|Explanation\s*):?\s*([\s\S]*?)(?=$)/i;

        const inputTextMatch = match.match(inputRegex);
        const outputTextMatch = match.match(outputRegex);
        const explanationMatch = match.match(explanationRegex);

        const cleanText = (text: string) => text.replace(/^[\s*`:_]+|[\s*`:_]+$/g, '').trim();

        return {
            inputText: inputTextMatch ? cleanText(inputTextMatch[1]) : "",
            outputText: outputTextMatch ? cleanText(outputTextMatch[1]) : "",
            explanation: explanationMatch ? cleanText(explanationMatch[1]) : undefined
        };
    });
};

const extractConstraints = (markdown: string) => {
    const constraintsRegex = /(?:Constraints|Constraints\s*):?\s*([\s\S]*?)(?=$)/i;
    const match = markdown.match(constraintsRegex);

    if (!match) return [];

    return match[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && (line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line) || line.length > 2))
        .map(line => line.replace(/^[-*]\s*|\d+\.\s*/, '').trim())
        .filter(Boolean);
};
