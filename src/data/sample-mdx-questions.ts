import { Question } from "../types/quiz"

export const sampleMDXQuestions: Question[] = [
    {
        id: 1,
        question: `Given the following code snippet, what will be the output when the component is rendered?

\`\`\`jsx
import React, { useEffect, useState } from 'react';

const Counter = () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(count => count + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return <div>{count}</div>;
};

export default Counter;
\`\`\``,
        options: [
            "The counter will start at **0** and increment every second indefinitely",
            "The counter will start at **0** but will never increment",
            "The component will throw an error due to missing dependencies",
            "The counter will increment but will also cause memory leaks"
        ],
        correctAnswer: 0,
        explanation: `The component will work correctly and increment every second.

**Why this works:**

1. \`useState(0)\` initializes the counter to **0**
2. \`useEffect\` with an empty dependency array \`[]\` runs only once after mount
3. \`setCount(count => count + 1)\` uses the **functional update form**, which doesn't depend on the current \`count\` value in scope
4. The cleanup function \`clearInterval\` prevents memory leaks when the component unmounts

**Key Concept:** Using the functional update form \`setCount(count => count + 1)\` instead of \`setCount(count + 1)\` is crucial here because it doesn't rely on the \`count\` variable being in the dependency array.`,
        detailedExplanation: `This is a common React pattern that demonstrates proper use of \`useEffect\` with intervals and functional state updates.`,
        category: "React Hooks",
        difficulty: "medium"
    },
    {
        id: 2,
        question: `What does the following JavaScript code output?

\`\`\`javascript
const obj = { a: 1, b: 2, c: 3 };
const { a, ...rest } = obj;

console.log(a);
console.log(rest);
console.log(obj);
\`\`\``,
        options: [
            `\`\`\`
1
{ b: 2, c: 3 }
{ a: 1, b: 2, c: 3 }
\`\`\``,
            `\`\`\`
1
{ b: 2, c: 3 }
{ b: 2, c: 3 }
\`\`\``,
            `\`\`\`
undefined
{ a: 1, b: 2, c: 3 }
{ a: 1, b: 2, c: 3 }
\`\`\``,
            `\`\`\`
1
{ a: 1, b: 2, c: 3 }
{ b: 2, c: 3 }
\`\`\``
        ],
        correctAnswer: 0,
        explanation: `**Destructuring with rest operator:**

- \`const { a, ...rest } = obj\` extracts \`a\` and puts the remaining properties in \`rest\`
- \`a\` gets the value \`1\`
- \`rest\` gets \`{ b: 2, c: 3 }\` (all properties except \`a\`)
- \`obj\` remains **unchanged** - destructuring doesn't mutate the original object

**Output:**
\`\`\`
1
{ b: 2, c: 3 }
{ a: 1, b: 2, c: 3 }
\`\`\``,
        detailedExplanation:
            "Destructuring creates new variables without modifying the source object.",
        category: "JavaScript ES6+",
        difficulty: "easy"
    },
    {
        id: 3,
        question: `Which of the following **async/await** patterns is correct for handling multiple API calls?`,
        options: [
            `**Sequential execution:**
\`\`\`javascript
const result1 = await fetch('/api/1');
const result2 = await fetch('/api/2');
\`\`\``,
            `**Parallel execution:**
\`\`\`javascript
const [result1, result2] = await Promise.all([
    fetch('/api/1'),
    fetch('/api/2')
]);
\`\`\``,
            `**Both A and B are correct** - depends on the use case`,
            `**Neither** - both patterns have syntax errors`
        ],
        correctAnswer: 2,
        explanation: `**Both patterns are correct** but serve different purposes:

### Sequential Pattern (A)
\`\`\`javascript
const result1 = await fetch('/api/1');
const result2 = await fetch('/api/2');
\`\`\`
- **Use when:** The second call depends on the first result
- **Execution time:** Time for API 1 + Time for API 2

### Parallel Pattern (B)  
\`\`\`javascript
const [result1, result2] = await Promise.all([
    fetch('/api/1'),
    fetch('/api/2')
]);
\`\`\`
- **Use when:** Calls are independent
- **Execution time:** Max(Time for API 1, Time for API 2)

**Choose based on your requirements:**
- Use **sequential** for dependent calls
- Use **parallel** for independent calls to improve performance`,
        detailedExplanation:
            "Understanding when to use sequential vs parallel async patterns is crucial for optimal application performance.",
        category: "JavaScript Async",
        difficulty: "medium"
    }
]
