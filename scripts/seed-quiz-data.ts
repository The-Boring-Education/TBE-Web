import mongoose from 'mongoose';

import { envConfig } from '../src/constant';
import Quiz from '../src/database/models/Quiz/Quiz';

// Quiz data from The-Boring-Quizes app
const quizCategories = [
  {
    categoryId: 'javascript',
    categoryName: 'JavaScript Fundamentals',
    categoryDescription:
      'Test your core JavaScript knowledge including types, operators, and language quirks',
    categoryIcon: 'Code',
    questions: [
      {
        question: 'What is the output of: console.log(typeof null)?',
        options: ['null', 'undefined', 'object', 'string'],
        correctAnswer: 2,
        explanation:
          "In JavaScript, typeof null returns 'object'. This is actually a well-known bug in JavaScript that has been kept for backward compatibility.",
        detailedExplanation:
          "This is one of JavaScript's most famous quirks. The typeof operator returns 'object' for null, which is technically incorrect since null is a primitive value, not an object.",
        difficulty: 'medium' as const,
      },
      {
        question:
          'Which of the following is NOT a valid way to create an array in JavaScript?',
        options: [
          'let arr = []',
          'let arr = new Array()',
          'let arr = Array.of()',
          'let arr = Array.create()',
        ],
        correctAnswer: 3,
        explanation:
          'Array.create() is not a valid method in JavaScript. The correct ways to create arrays are: literal notation ([]), Array constructor (new Array()), and Array.of() method.',
        detailedExplanation:
          'JavaScript provides several ways to create arrays: 1) Array literal notation (let arr = []) - the most common and recommended way. 2) Array constructor (let arr = new Array()).',
        difficulty: 'easy' as const,
      },
      {
        question: 'What will be the output of: console.log(0.1 + 0.2 === 0.3)?',
        options: ['true', 'false', 'undefined', 'Error'],
        correctAnswer: 1,
        explanation:
          'This will output false due to floating-point precision issues in JavaScript. 0.1 + 0.2 actually equals 0.30000000000000004, not exactly 0.3.',
        detailedExplanation:
          'This is a classic example of floating-point arithmetic precision issues. JavaScript uses IEEE 754 double-precision floating-point format to represent numbers.',
        difficulty: 'medium' as const,
      },
      {
        question: 'What is closure in JavaScript?',
        options: [
          'A way to close functions',
          'A function that has access to variables in its outer scope',
          'A method to end loops',
          'A type of error handling',
        ],
        correctAnswer: 1,
        explanation:
          'A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned.',
        detailedExplanation:
          "Closures are one of JavaScript's most powerful features. A closure gives you access to an outer function's scope from an inner function.",
        difficulty: 'medium' as const,
      },
      {
        question:
          "What is the main difference between '==' and '===' in JavaScript?",
        options: [
          'No difference',
          '=== is stricter than ==',
          "== checks type, === doesn't",
          '=== is faster than ==',
        ],
        correctAnswer: 1,
        explanation:
          '=== (strict equality) compares both value and type without type coercion, while == (loose equality) performs type coercion before comparison.',
        detailedExplanation:
          'The == operator performs type coercion, meaning it converts operands to the same type before comparison. The === operator performs strict comparison without type coercion.',
        difficulty: 'easy' as const,
      },
    ],
  },
  {
    categoryId: 'react',
    categoryName: 'React Development',
    categoryDescription:
      'Explore React hooks, components, and modern React patterns',
    categoryIcon: 'Zap',
    questions: [
      {
        question: "What does the 'useState' hook return in React?",
        options: [
          'A single value',
          'An object with value and setter',
          'An array with value and setter function',
          'A function',
        ],
        correctAnswer: 2,
        explanation:
          'useState returns an array with exactly two elements: the current state value and a function to update it.',
        detailedExplanation:
          'The useState hook is fundamental to React functional components. It returns an array with exactly two elements: [state, setState].',
        difficulty: 'easy' as const,
      },
      {
        question: "What is the purpose of the 'key' prop in React lists?",
        options: [
          'To style list items',
          'To help React identify which items have changed',
          'To set the order of items',
          'To make items clickable',
        ],
        correctAnswer: 1,
        explanation:
          "The 'key' prop helps React identify which list items have changed, been added, or removed. This enables React to efficiently update the DOM.",
        detailedExplanation:
          "The key prop is crucial for React's reconciliation algorithm. When rendering lists, React uses keys to determine which items have changed.",
        difficulty: 'medium' as const,
      },
      {
        question: 'What is the useEffect hook used for in React?',
        options: [
          'To create side effects only',
          'To manage component lifecycle and side effects',
          'To update state',
          'To render components',
        ],
        correctAnswer: 1,
        explanation:
          'useEffect is used to perform side effects and manage component lifecycle events like mounting, updating, and unmounting.',
        detailedExplanation:
          'useEffect serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount combined in class components.',
        difficulty: 'medium' as const,
      },
    ],
  },
  {
    categoryId: 'algorithms',
    categoryName: 'Algorithms & Data Structures',
    categoryDescription:
      'Challenge yourself with algorithm complexity and data structure concepts',
    categoryIcon: 'Brain',
    questions: [
      {
        question:
          'What is the time complexity of accessing an element in an array by index?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correctAnswer: 0,
        explanation:
          'Accessing an array element by index is O(1) - constant time. This is because arrays store elements in contiguous memory locations.',
        detailedExplanation:
          'Array access by index is O(1) because arrays are stored in contiguous memory locations. When you access arr[i], the computer calculates the memory address.',
        difficulty: 'easy' as const,
      },
      {
        question:
          'Which sorting algorithm has the best average-case time complexity?',
        options: [
          'Bubble Sort',
          'Quick Sort',
          'Insertion Sort',
          'Selection Sort',
        ],
        correctAnswer: 1,
        explanation:
          'Quick Sort has an average-case time complexity of O(n log n), which is better than the O(n²) complexity of the other options.',
        detailedExplanation:
          'Quick Sort is generally considered one of the most efficient sorting algorithms with an average-case time complexity of O(n log n).',
        difficulty: 'medium' as const,
      },
    ],
  },
  {
    categoryId: 'webdev',
    categoryName: 'Web Development',
    categoryDescription:
      'Cover HTTP, APIs, and general web development concepts',
    categoryIcon: 'Globe',
    questions: [
      {
        question: 'Which HTTP status code indicates a successful GET request?',
        options: ['200', '201', '204', '304'],
        correctAnswer: 0,
        explanation:
          'HTTP status code 200 (OK) indicates that a GET request was successful and the server returned the requested resource.',
        detailedExplanation:
          "HTTP status codes are three-digit numbers that indicate the result of an HTTP request. The 200 status code means 'OK' and indicates success.",
        difficulty: 'easy' as const,
      },
      {
        question: 'What is the correct way to handle promises in JavaScript?',
        options: [
          'promise.then().catch()',
          'promise.catch().then()',
          'Both A and B are correct',
          'Neither A nor B',
        ],
        correctAnswer: 2,
        explanation:
          'Both are correct ways to handle promises. .then().catch() handles success first then errors, while .catch().then() handles errors first then continues.',
        detailedExplanation:
          'Promise chaining allows multiple ways to handle success and error cases. .then().catch() is the most common pattern.',
        difficulty: 'medium' as const,
      },
    ],
  },
];

async function seedQuizData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(envConfig.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing quiz data
    await Quiz.deleteMany({});
    console.log('Cleared existing quiz data');

    // Insert new quiz data
    for (const category of quizCategories) {
      const quiz = new Quiz(category);
      await quiz.save();
      console.log(`Created quiz category: ${category.categoryName}`);
    }

    console.log('Quiz data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding quiz data:', error);
    process.exit(1);
  }
}

seedQuizData();
