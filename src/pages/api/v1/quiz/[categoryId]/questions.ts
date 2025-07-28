import type { NextApiRequest, NextApiResponse } from 'next';
import { apiStatusCodes } from '@/constant';
import { connectDB } from '@/middlewares';
import { cors, sendAPIResponse } from '@/utils';

// Sample questions - in production this would come from database
const questionsByCategory: Record<string, any> = {
  javascript: {
    categoryId: 'javascript',
    categoryName: 'JavaScript Fundamentals',
    questions: [
      {
        question: 'What is the output of: console.log(typeof null)?',
        options: ['null', 'undefined', 'object', 'string'],
        correctAnswer: 2,
        explanation:
          "In JavaScript, typeof null returns 'object'. This is actually a well-known bug in JavaScript that has been kept for backward compatibility.",
        detailedExplanation:
          "This is one of JavaScript's most famous quirks. The typeof operator returns 'object' for null, which is technically incorrect since null is a primitive value, not an object.",
        difficulty: 'medium',
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
        difficulty: 'easy',
      },
      {
        question: 'What will be the output of: console.log(0.1 + 0.2 === 0.3)?',
        options: ['true', 'false', 'undefined', 'Error'],
        correctAnswer: 1,
        explanation:
          'This will output false due to floating-point precision issues in JavaScript. 0.1 + 0.2 actually equals 0.30000000000000004, not exactly 0.3.',
        difficulty: 'medium',
      },
    ],
  },
  react: {
    categoryId: 'react',
    categoryName: 'React Development',
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
        difficulty: 'easy',
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
          "The 'key' prop helps React identify which list items have changed, been added, or removed.",
        difficulty: 'medium',
      },
    ],
  },
  algorithms: {
    categoryId: 'algorithms',
    categoryName: 'Algorithms & Data Structures',
    questions: [
      {
        question:
          'What is the time complexity of accessing an element in an array by index?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correctAnswer: 0,
        explanation:
          'Accessing an array element by index is O(1) - constant time.',
        difficulty: 'easy',
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
          'Quick Sort has an average-case time complexity of O(n log n).',
        difficulty: 'medium',
      },
    ],
  },
  webdev: {
    categoryId: 'webdev',
    categoryName: 'Web Development',
    questions: [
      {
        question: 'Which HTTP status code indicates a successful GET request?',
        options: ['200', '201', '204', '304'],
        correctAnswer: 0,
        explanation:
          'HTTP status code 200 (OK) indicates that a GET request was successful.',
        difficulty: 'easy',
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
        explanation: 'Both are correct ways to handle promises.',
        difficulty: 'medium',
      },
    ],
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();

  if (req.method !== 'GET') {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      })
    );
  }

  const { categoryId } = req.query;

  if (!categoryId || typeof categoryId !== 'string') {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: 'Category ID is required',
      })
    );
  }

  const quiz = questionsByCategory[categoryId];

  if (!quiz) {
    return res.status(apiStatusCodes.NOT_FOUND).json(
      sendAPIResponse({
        status: false,
        message: 'Quiz category not found',
      })
    );
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: quiz,
    })
  );
};

export default handler;
