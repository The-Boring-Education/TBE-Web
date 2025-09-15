import { Question, QuizCategory } from '../types/quiz';

const javascriptQuestions: Question[] = [
  {
    id: 1,
    question: "What is the output of: console.log(typeof null)?",
    options: ["null", "undefined", "object", "string"],
    correctAnswer: 2,
    explanation: "In JavaScript, typeof null returns 'object'. This is actually a well-known bug in JavaScript that has been kept for backward compatibility.",
    detailedExplanation: "This is one of JavaScript's most famous quirks. The typeof operator returns 'object' for null, which is technically incorrect since null is a primitive value, not an object. This behavior exists due tojbjkbjbbbjkbjbjbjk a bug in the original JavaScript implementation. In the first version of JavaScript, values were represented as a type tag and a value. The type tag for objects was 0, and null was represented as the NULL pointer (0x00 in most platforms). Consequently, null had 0 as type tag, hence the 'object' typeof return value. This bug has been kept for backward compatibility reasons, even though it was acknowledged as a mistake.",
    category: "JavaScript Fundamentals",
    difficulty: "medium"
  },
  {
    id: 2,
    question: "Which of the following is NOT a valid way to create an array in JavaScript?",
    options: ["let arr = []", "let arr = new Array()", "let arr = Array.of()", "let arr = Array.create()"],
    correctAnswer: 3,
    explanation: "Array.create() is not a valid method in JavaScript. The correct ways to create arrays are: literal notation ([]), Array constructor (new Array()), and Array.of() method.",
    detailedExplanation: "JavaScript provides several ways to create arrays: 1) Array literal notation (let arr = []) - the most common and recommended way. 2) Array constructor (let arr = new Array()) - can create empty arrays or arrays with specific length. 3) Array.of() method - creates an array with the given elements as arguments. 4) Array.from() method - creates arrays from array-like or iterable objects. However, Array.create() does not exist in JavaScript. Be careful with the Array constructor as new Array(3) creates an array with 3 empty slots, while new Array(1,2,3) creates [1,2,3].",
    category: "JavaScript Fundamentals",
    difficulty: "easy"
  },
  {
    id: 3,
    question: "What will be the output of: console.log(0.1 + 0.2 === 0.3)?",
    options: ["true", "false", "undefined", "Error"],
    correctAnswer: 1,
    explanation: "This will output false due to floating-point precision issues in JavaScript. 0.1 + 0.2 actually equals 0.30000000000000004, not exactly 0.3.",
    detailedExplanation: "This is a classic example of floating-point arithmetic precision issues. JavaScript uses IEEE 754 double-precision floating-point format to represent numbers. In this format, some decimal numbers cannot be represented exactly in binary. When you add 0.1 + 0.2, the result is 0.30000000000000004, not exactly 0.3. This happens because 0.1 and 0.2 cannot be represented exactly in binary floating-point. To handle this, you can use methods like: Number.parseFloat((0.1 + 0.2).toFixed(10)) or Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON for comparisons.",
    category: "JavaScript Fundamentals",
    difficulty: "medium"
  },
  {
    id: 4,
    question: "What is closure in JavaScript?",
    options: [
      "A way to close functions",
      "A function that has access to variables in its outer scope",
      "A method to end loops",
      "A type of error handling"
    ],
    correctAnswer: 1,
    explanation: "A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned.",
    detailedExplanation: "Closures are one of JavaScript's most powerful features. A closure gives you access to an outer function's scope from an inner function. In JavaScript, closures are created every time a function is created, at function creation time. The closure has three scope chains: 1) Its own scope (variables defined between its curly brackets), 2) The outer function's variables, 3) The global variables. Closures are useful for: data privacy (creating private variables), function factories, callbacks, and module patterns. Example: function outer(x) { return function inner(y) { return x + y; }; } - the inner function has access to 'x' even after outer() returns.",
    category: "JavaScript Advanced",
    difficulty: "medium"
  },
  {
    id: 5,
    question: "What is the main difference between '==' and '===' in JavaScript?",
    options: [
      "No difference",
      "=== is stricter than ==",
      "== checks type, === doesn't",
      "=== is faster than =="
    ],
    correctAnswer: 1,
    explanation: "=== (strict equality) compares both value and type without type coercion, while == (loose equality) performs type coercion before comparison.",
    detailedExplanation: "The == operator performs type coercion, meaning it converts operands to the same type before comparison. The === operator performs strict comparison without type coercion. Examples: '5' == 5 returns true (string '5' is coerced to number 5), but '5' === 5 returns false (different types). Other examples: null == undefined (true), null === undefined (false), 0 == false (true), 0 === false (false). The === operator is generally preferred because it's more predictable and avoids unexpected type conversions that can lead to bugs.",
    category: "JavaScript Fundamentals",
    difficulty: "easy"
  }
];

const reactQuestions: Question[] = [
  {
    id: 6,
    question: "What does the 'useState' hook return in React?",
    options: ["A single value", "An object with value and setter", "An array with value and setter function", "A function"],
    correctAnswer: 2,
    explanation: "useState returns an array with exactly two elements: the current state value and a function to update it.",
    detailedExplanation: "The useState hook is fundamental to React functional components. It returns an array with exactly two elements: [state, setState]. The first element is the current state value, and the second is a function to update that state. We use array destructuring to assign these: const [count, setCount] = useState(0). The setter function can accept either a new value or a function that receives the previous state and returns the new state. When you call the setter, React will re-render the component with the new state. The initial state is only used during the first render.",
    category: "React Hooks",
    difficulty: "easy"
  },
  {
    id: 7,
    question: "What is the purpose of the 'key' prop in React lists?",
    options: [
      "To style list items",
      "To help React identify which items have changed",
      "To set the order of items",
      "To make items clickable"
    ],
    correctAnswer: 1,
    explanation: "The 'key' prop helps React identify which list items have changed, been added, or removed. This enables React to efficiently update the DOM.",
    detailedExplanation: "The key prop is crucial for React's reconciliation algorithm. When rendering lists, React uses keys to determine which items have changed, been added, or removed. Without proper keys, React might unnecessarily re-render entire lists or lose component state. Keys should be: 1) Unique among siblings, 2) Stable (don't change between renders), 3) Predictable (same item should have same key). Avoid using array indices as keys when the list can change, as this can cause performance issues and bugs with component state. Good keys are usually unique IDs from your data.",
    category: "React Core",
    difficulty: "medium"
  },
  {
    id: 8,
    question: "What is the useEffect hook used for in React?",
    options: [
      "To create side effects only",
      "To manage component lifecycle and side effects",
      "To update state",
      "To render components"
    ],
    correctAnswer: 1,
    explanation: "useEffect is used to perform side effects and manage component lifecycle events like mounting, updating, and unmounting.",
    detailedExplanation: "useEffect serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount combined in class components. It runs after every completed render by default. You can control when it runs using the dependency array: 1) No dependency array: runs after every render, 2) Empty dependency array []: runs only once after initial render (like componentDidMount), 3) With dependencies [dep1, dep2]: runs when any dependency changes. useEffect can return a cleanup function that runs before the component unmounts or before the effect runs again, useful for cleaning up subscriptions, timers, or event listeners.",
    category: "React Hooks",
    difficulty: "medium"
  }
];

const algorithmQuestions: Question[] = [
  {
    id: 9,
    question: "What is the time complexity of accessing an element in an array by index?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correctAnswer: 0,
    explanation: "Accessing an array element by index is O(1) - constant time. This is because arrays store elements in contiguous memory locations.",
    detailedExplanation: "Array access by index is O(1) because arrays are stored in contiguous memory locations. When you access arr[i], the computer calculates the memory address as: base_address + (i * element_size). This calculation takes constant time regardless of the array size. This is different from linked lists where you'd need to traverse from the head to reach the ith element (O(n) time). However, operations like insertion or deletion in the middle of an array are O(n) because elements need to be shifted. Dynamic arrays (like JavaScript arrays) maintain this O(1) access time even as they grow.",
    category: "Data Structures",
    difficulty: "easy"
  },
  {
    id: 10,
    question: "Which sorting algorithm has the best average-case time complexity?",
    options: ["Bubble Sort", "Quick Sort", "Insertion Sort", "Selection Sort"],
    correctAnswer: 1,
    explanation: "Quick Sort has an average-case time complexity of O(n log n), which is better than the O(n²) complexity of the other options.",
    detailedExplanation: "Quick Sort is generally considered one of the most efficient sorting algorithms with an average-case time complexity of O(n log n). It works by selecting a 'pivot' element and partitioning the array around it. However, its worst-case complexity is O(n²) when the pivot is always the smallest or largest element. Other complexities: Bubble Sort - O(n²) average and worst case, Insertion Sort - O(n²) average and worst case (but O(n) best case), Selection Sort - O(n²) in all cases. Merge Sort also has O(n log n) in all cases but uses more memory. Modern implementations often use hybrid approaches like Introsort (introspective sort) which starts with Quick Sort and switches to Heap Sort for worst-case scenarios.",
    category: "Algorithms",
    difficulty: "medium"
  }
];

const webDevQuestions: Question[] = [
  {
    id: 11,
    question: "Which HTTP status code indicates a successful GET request?",
    options: ["200", "201", "204", "304"],
    correctAnswer: 0,
    explanation: "HTTP status code 200 (OK) indicates that a GET request was successful and the server returned the requested resource.",
    detailedExplanation: "HTTP status codes are three-digit numbers that indicate the result of an HTTP request. The 200 status code means 'OK' and indicates that the request was successful. For GET requests specifically, 200 means the requested resource was found and returned in the response body. Other status codes: 201 (Created) - used for successful POST requests that create a new resource, 204 (No Content) - successful request but no content to return, 304 (Not Modified) - resource hasn't changed since last request (used for caching). The 2xx range indicates success, 3xx indicates redirection, 4xx indicates client errors, and 5xx indicates server errors.",
    category: "Web Development",
    difficulty: "easy"
  },
  {
    id: 12,
    question: "What is the correct way to handle promises in JavaScript?",
    options: [
      "promise.then().catch()",
      "promise.catch().then()",
      "Both A and B are correct",
      "Neither A nor B"
    ],
    correctAnswer: 2,
    explanation: "Both are correct ways to handle promises. .then().catch() handles success first then errors, while .catch().then() handles errors first then continues.",
    detailedExplanation: "Promise chaining allows multiple ways to handle success and error cases. .then().catch() is the most common pattern - handle success in .then() and any errors in .catch(). The .catch() will handle errors from both the original promise and the .then() handler. .catch().then() first handles any errors, then continues with success handling. This can be useful when you want to provide fallback values for errors. You can also use async/await with try/catch for cleaner syntax. Modern best practice often favors async/await for readability, but understanding promise chaining is crucial for working with existing codebases and certain scenarios where async/await isn't suitable.",
    category: "Web Development",
    difficulty: "medium"
  }
];

export const quizCategories: QuizCategory[] = [
  {
    id: 'javascript',
    name: 'JavaScript Fundamentals',
    description: 'Test your core JavaScript knowledge including types, operators, and language quirks',
    icon: 'Code',
    questions: javascriptQuestions,
    color: 'yellow'
  },
  {
    id: 'react',
    name: 'React Development',
    description: 'Explore React hooks, components, and modern React patterns',
    icon: 'Zap',
    questions: reactQuestions,
    color: 'blue'
  },
  {
    id: 'algorithms',
    name: 'Algorithms & Data Structures',
    description: 'Challenge yourself with algorithm complexity and data structure concepts',
    icon: 'Brain',
    questions: algorithmQuestions,
    color: 'purple'
  },
  {
    id: 'webdev',
    name: 'Web Development',
    description: 'Cover HTTP, APIs, and general web development concepts',
    icon: 'Globe',
    questions: webDevQuestions,
    color: 'green'
  }
];

// Keep the original combined questions for backward compatibility
export const sampleQuestions: Question[] = [
  ...javascriptQuestions,
  ...reactQuestions,
  ...algorithmQuestions,
  ...webDevQuestions
];