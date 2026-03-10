import type { DsaQuestion } from "@tbe/interface";

export const transformAptitudeQuestion = (question: any): DsaQuestion => {
    // Format options into a markdown list
    const optionsMarkdown =
        question.options && question.options.length > 0
            ? "\n\n**Options:**\n" +
            question.options
                .map((opt: any, idx: number) => {
                    const label = String.fromCharCode(65 + idx); // A, B, C, D
                    return `- **${label}:** ${opt.text}`;
                })
                .join("\n")
            : "";

    // Find the correct option label if available
    const correctOptionIndex = question.options?.findIndex(
        (opt: any) => opt.isCorrect,
    );
    const correctLabel =
        correctOptionIndex !== -1
            ? String.fromCharCode(65 + correctOptionIndex)
            : null;

    const explanation = question.answer || "No explanation provided.";

    return {
        id: question._id,
        name: question.question,
        difficultyLevel: question.difficulty || "MEDIUM",
        answer: optionsMarkdown,
        examples: [
            {
                inputText: "Result / Explanation",
                outputText: correctLabel
                    ? `**Correct Answer: ${correctLabel}**\n\n${explanation}`
                    : explanation,
            },
        ],
        topics: [question.topic],
        resources: {},
    };
};
