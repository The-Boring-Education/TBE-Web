import type { PatternQuizQuestion } from "@tbe/types";

export const PATTERN_QUIZ_QUESTIONS: PatternQuizQuestion[] = [
  // Two Pointers (5 questions)
  {
    id: "tp-1",
    question:
      "Given a sorted array, find two numbers that add up to a target sum. You need an O(n) time solution without extra space.",
    options: ["Sliding Window", "Two Pointers", "Binary Search", "Hashing"],
    correctAnswer: 1,
    explanation:
      "Two Pointers is ideal here. Place one pointer at the start and one at the end. If the sum is too large, move the right pointer left; if too small, move the left pointer right. This gives O(n) time and O(1) space on a sorted array.",
    difficulty: "easy",
    topic: "Two Pointers",
  },
  {
    id: "tp-2",
    question:
      "Remove duplicates from a sorted array in-place such that each element appears at most once. Return the new length.",
    options: ["Two Pointers", "Stack", "Hashing", "Binary Search"],
    correctAnswer: 0,
    explanation:
      "Use a slow pointer to track the position of the next unique element, and a fast pointer to scan through the array. When a new unique element is found, copy it to the slow pointer position.",
    difficulty: "easy",
    topic: "Two Pointers",
  },
  {
    id: "tp-3",
    question:
      "Given a linked list, determine if it contains a cycle. You must use O(1) memory.",
    options: ["BFS/DFS", "Two Pointers", "Hashing", "Stack"],
    correctAnswer: 1,
    explanation:
      "Floyd's cycle detection uses two pointers: a slow pointer moving one step at a time and a fast pointer moving two steps. If there's a cycle, the fast pointer will eventually meet the slow pointer.",
    difficulty: "medium",
    topic: "Two Pointers",
  },
  {
    id: "tp-4",
    question:
      "Given an array of integers, find all unique triplets that sum to zero. The solution must not contain duplicate triplets.",
    options: ["Dynamic Programming", "Two Pointers", "Backtracking", "Greedy"],
    correctAnswer: 1,
    explanation:
      "Sort the array, fix one element, then use two pointers on the remaining subarray to find pairs that sum to the negative of the fixed element. Skip duplicates to avoid repeated triplets.",
    difficulty: "medium",
    topic: "Two Pointers",
  },
  {
    id: "tp-5",
    question:
      "Given a container represented by an array of heights, find two lines that together with the x-axis form a container that holds the most water.",
    options: ["Greedy", "Dynamic Programming", "Two Pointers", "Sliding Window"],
    correctAnswer: 2,
    explanation:
      "Start with pointers at both ends. The area is determined by the shorter line times the distance. Move the pointer pointing to the shorter line inward, as that's the only way to potentially find a larger area.",
    difficulty: "medium",
    topic: "Two Pointers",
  },

  // Sliding Window (5 questions)
  {
    id: "sw-1",
    question:
      "Find the maximum sum of any contiguous subarray of size k in a given array of integers.",
    options: ["Two Pointers", "Sliding Window", "Prefix Sum", "Dynamic Programming"],
    correctAnswer: 1,
    explanation:
      "A fixed-size sliding window of size k slides across the array. Add the new element entering the window and subtract the element leaving. Track the maximum sum seen.",
    difficulty: "easy",
    topic: "Sliding Window",
  },
  {
    id: "sw-2",
    question:
      "Find the length of the longest substring without repeating characters in a given string.",
    options: ["Sliding Window", "Dynamic Programming", "Two Pointers", "Backtracking"],
    correctAnswer: 0,
    explanation:
      "Use a variable-size sliding window with a set/map to track characters. Expand the right boundary. When a duplicate is found, shrink from the left until the window has all unique characters again.",
    difficulty: "medium",
    topic: "Sliding Window",
  },
  {
    id: "sw-3",
    question:
      "Given a string and a pattern, find the smallest substring that contains all characters of the pattern (including duplicates).",
    options: ["Two Pointers", "Backtracking", "Sliding Window", "Hashing"],
    correctAnswer: 2,
    explanation:
      "Use a variable-size sliding window. Expand the right boundary until all pattern characters are included, then shrink the left boundary to minimize the window while still containing all required characters.",
    difficulty: "hard",
    topic: "Sliding Window",
  },
  {
    id: "sw-4",
    question:
      "Given an array of positive integers and a target sum S, find the minimal length subarray whose sum is greater than or equal to S.",
    options: ["Binary Search", "Sliding Window", "Prefix Sum", "Greedy"],
    correctAnswer: 1,
    explanation:
      "Use a variable-size sliding window. Expand the window by adding elements to the right. When the sum meets the target, try shrinking from the left to find a shorter valid subarray.",
    difficulty: "medium",
    topic: "Sliding Window",
  },
  {
    id: "sw-5",
    question:
      "Given a binary array, find the maximum number of consecutive 1s if you can flip at most k zeros.",
    options: ["Dynamic Programming", "Greedy", "Sliding Window", "Two Pointers"],
    correctAnswer: 2,
    explanation:
      "Use a sliding window that allows at most k zeros inside. Expand the window to the right. When more than k zeros are inside, shrink from the left. Track the maximum window size.",
    difficulty: "medium",
    topic: "Sliding Window",
  },

  // Binary Search (4 questions)
  {
    id: "bs-1",
    question:
      "A sorted array has been rotated at an unknown pivot. Find a given target element in O(log n) time.",
    options: ["Two Pointers", "Binary Search", "Linear Scan", "Divide and Conquer"],
    correctAnswer: 1,
    explanation:
      "Modified binary search works here. At each step, determine which half is sorted, then check if the target lies in the sorted half. If yes, search there; otherwise, search the other half.",
    difficulty: "medium",
    topic: "Binary Search",
  },
  {
    id: "bs-2",
    question:
      "Given n sorted arrays, find the kth smallest element across all arrays combined without merging them fully.",
    options: ["Merge Sort", "Binary Search", "Heap", "Two Pointers"],
    correctAnswer: 1,
    explanation:
      "Binary search on the answer. For a candidate value, count how many elements across all arrays are less than or equal to it (using binary search on each array). Adjust the search range accordingly.",
    difficulty: "hard",
    topic: "Binary Search",
  },
  {
    id: "bs-3",
    question:
      "You have n packages to ship within d days. Each day you load packages in order with a weight capacity. Find the minimum capacity needed to ship all packages within d days.",
    options: ["Greedy", "Dynamic Programming", "Binary Search", "Sliding Window"],
    correctAnswer: 2,
    explanation:
      "Binary search on the answer (capacity). For each candidate capacity, greedily simulate shipping to check if all packages can be shipped within d days. The search space is [max(weights), sum(weights)].",
    difficulty: "hard",
    topic: "Binary Search",
  },
  {
    id: "bs-4",
    question:
      "Find the square root of a non-negative integer x, rounded down to the nearest integer, without using built-in functions.",
    options: ["Binary Search", "Newton's Method", "Linear Search", "Two Pointers"],
    correctAnswer: 0,
    explanation:
      "Binary search between 0 and x. For each midpoint m, check if m*m <= x and (m+1)*(m+1) > x. Adjust the search boundaries accordingly to find the integer square root.",
    difficulty: "easy",
    topic: "Binary Search",
  },

  // BFS/DFS (4 questions)
  {
    id: "bfs-1",
    question:
      "Given a 2D grid of '1's (land) and '0's (water), count the number of distinct islands. Connected land cells form one island.",
    options: ["Union Find", "BFS/DFS", "Dynamic Programming", "Greedy"],
    correctAnswer: 1,
    explanation:
      "For each unvisited '1', perform DFS/BFS to mark all connected land cells as visited. Each time you start a new traversal, increment the island count.",
    difficulty: "medium",
    topic: "BFS/DFS",
  },
  {
    id: "bfs-2",
    question:
      "Find the shortest path from a source to a destination in an unweighted graph. All edges have equal cost.",
    options: ["DFS", "BFS/DFS", "Dijkstra", "Dynamic Programming"],
    correctAnswer: 1,
    explanation:
      "BFS is optimal for finding shortest paths in unweighted graphs. It explores nodes level by level, guaranteeing the first time a node is reached is via the shortest path.",
    difficulty: "easy",
    topic: "BFS/DFS",
  },
  {
    id: "bfs-3",
    question:
      "Given a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
    options: ["DFS", "BFS/DFS", "Stack", "Two Pointers"],
    correctAnswer: 1,
    explanation:
      "BFS with a queue naturally processes nodes level by level. Track the size of the queue at each level to group nodes by their depth in the tree.",
    difficulty: "easy",
    topic: "BFS/DFS",
  },
  {
    id: "bfs-4",
    question:
      "Clone a connected undirected graph. Each node has a value and a list of neighbors. Return a deep copy of the entire graph.",
    options: ["BFS/DFS", "Two Pointers", "Dynamic Programming", "Topological Sort"],
    correctAnswer: 0,
    explanation:
      "Use DFS or BFS with a hash map mapping original nodes to cloned nodes. For each node, create its clone and recursively/iteratively clone all unvisited neighbors.",
    difficulty: "medium",
    topic: "BFS/DFS",
  },

  // Dynamic Programming (4 questions)
  {
    id: "dp-1",
    question:
      "Given a set of coin denominations and a target amount, find the minimum number of coins needed to make that amount. You can use each denomination unlimited times.",
    options: ["Greedy", "BFS/DFS", "Dynamic Programming", "Backtracking"],
    correctAnswer: 2,
    explanation:
      "Classic unbounded knapsack DP. Define dp[i] as the minimum coins to make amount i. For each amount, try all coin denominations and take the minimum. dp[amount] = min(dp[amount - coin] + 1) for all coins.",
    difficulty: "medium",
    topic: "Dynamic Programming",
  },
  {
    id: "dp-2",
    question:
      "Find the length of the longest increasing subsequence in an unsorted array of integers.",
    options: ["Greedy", "Dynamic Programming", "Sliding Window", "Two Pointers"],
    correctAnswer: 1,
    explanation:
      "DP approach: dp[i] represents the length of the longest increasing subsequence ending at index i. For each i, check all j < i where arr[j] < arr[i] and update dp[i] = max(dp[j] + 1).",
    difficulty: "medium",
    topic: "Dynamic Programming",
  },
  {
    id: "dp-3",
    question:
      "Given two strings, find the length of their longest common subsequence. Characters don't need to be contiguous but must maintain relative order.",
    options: ["Two Pointers", "Dynamic Programming", "Sliding Window", "Greedy"],
    correctAnswer: 1,
    explanation:
      "2D DP where dp[i][j] represents the LCS length of the first i characters of string1 and first j characters of string2. If characters match, dp[i][j] = dp[i-1][j-1] + 1; otherwise, max of dp[i-1][j] and dp[i][j-1].",
    difficulty: "medium",
    topic: "Dynamic Programming",
  },
  {
    id: "dp-4",
    question:
      "You are given weights and values of n items. Put items in a knapsack of capacity W to maximize total value. Each item can only be used once.",
    options: ["Greedy", "Dynamic Programming", "Backtracking", "Branch and Bound"],
    correctAnswer: 1,
    explanation:
      "0/1 Knapsack is a classic DP problem. dp[i][w] = max value using first i items with capacity w. For each item, either include it (if it fits) or skip it, taking the maximum.",
    difficulty: "hard",
    topic: "Dynamic Programming",
  },

  // Stack/Queue (3 questions)
  {
    id: "sq-1",
    question:
      "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string has valid (properly nested) brackets.",
    options: ["Stack/Queue", "Two Pointers", "Recursion", "Greedy"],
    correctAnswer: 0,
    explanation:
      "A stack is perfect here. Push opening brackets onto the stack. For each closing bracket, check if the top of the stack has the matching opening bracket. The string is valid if the stack is empty at the end.",
    difficulty: "easy",
    topic: "Stack/Queue",
  },
  {
    id: "sq-2",
    question:
      "Given an array of integers, for each element find the next element that is greater than it (looking to the right). Return -1 if no such element exists.",
    options: ["Two Pointers", "Stack/Queue", "Binary Search", "Sliding Window"],
    correctAnswer: 1,
    explanation:
      "Use a monotonic decreasing stack. Iterate through the array; for each element, pop all stack elements smaller than it (the current element is their next greater). Push the current element onto the stack.",
    difficulty: "medium",
    topic: "Stack/Queue",
  },
  {
    id: "sq-3",
    question:
      "Design a data structure that supports push, pop, top, and retrieving the minimum element, all in O(1) time.",
    options: ["Heap", "Stack/Queue", "Linked List", "Binary Search Tree"],
    correctAnswer: 1,
    explanation:
      "Use two stacks: one for normal operations and one to track minimums. When pushing, also push to the min stack if the value is less than or equal to the current minimum. Pop from both when the top matches.",
    difficulty: "medium",
    topic: "Stack/Queue",
  },

  // Greedy (3 questions)
  {
    id: "gr-1",
    question:
      "Given a set of activities with start and end times, find the maximum number of non-overlapping activities you can attend.",
    options: ["Dynamic Programming", "Greedy", "Backtracking", "BFS/DFS"],
    correctAnswer: 1,
    explanation:
      "Sort activities by end time. Greedily select the activity that finishes earliest and doesn't overlap with the previously selected one. This always yields the maximum count.",
    difficulty: "easy",
    topic: "Greedy",
  },
  {
    id: "gr-2",
    question:
      "Given an array representing jump lengths at each position, determine the minimum number of jumps to reach the last index from the first.",
    options: ["BFS/DFS", "Dynamic Programming", "Greedy", "Two Pointers"],
    correctAnswer: 2,
    explanation:
      "Greedy approach: track the farthest reachable position and the end of the current jump. When you reach the end of the current jump, increment the count and update the boundary to the farthest reachable.",
    difficulty: "medium",
    topic: "Greedy",
  },
  {
    id: "gr-3",
    question:
      "Given an array of intervals, merge all overlapping intervals and return the non-overlapping intervals that cover all the input intervals.",
    options: ["Greedy", "Stack", "Two Pointers", "Divide and Conquer"],
    correctAnswer: 0,
    explanation:
      "Sort intervals by start time, then greedily merge: if the current interval overlaps with the last merged interval, extend the end; otherwise, add the current interval as a new merged interval.",
    difficulty: "medium",
    topic: "Greedy",
  },

  // Backtracking (3 questions)
  {
    id: "bt-1",
    question:
      "Generate all valid combinations of n pairs of parentheses. Each combination must be well-formed.",
    options: ["Dynamic Programming", "Backtracking", "Stack", "BFS/DFS"],
    correctAnswer: 1,
    explanation:
      "Backtracking with constraints: at each step, add '(' if open count < n, add ')' if close count < open count. When the string length reaches 2n, it's a valid combination.",
    difficulty: "medium",
    topic: "Backtracking",
  },
  {
    id: "bt-2",
    question:
      "Place N queens on an N×N chessboard so that no two queens threaten each other. Find all distinct solutions.",
    options: ["Greedy", "Dynamic Programming", "Backtracking", "BFS/DFS"],
    correctAnswer: 2,
    explanation:
      "Classic backtracking: place queens row by row. For each row, try each column. If placing a queen doesn't conflict with previously placed queens (check column, diagonals), recurse to the next row. Backtrack if no valid placement exists.",
    difficulty: "hard",
    topic: "Backtracking",
  },
  {
    id: "bt-3",
    question:
      "Given a collection of candidate numbers and a target, find all unique combinations where the chosen numbers sum to the target. Each number may be used multiple times.",
    options: ["Dynamic Programming", "Backtracking", "Greedy", "Two Pointers"],
    correctAnswer: 1,
    explanation:
      "Backtracking with pruning: sort candidates, then recursively try including each candidate (allowing repeats). If the running sum exceeds the target, prune that branch. Track combinations to collect all valid ones.",
    difficulty: "medium",
    topic: "Backtracking",
  },

  // Divide and Conquer (3 questions)
  {
    id: "dc-1",
    question:
      "Count the number of inversions in an array (pairs where i < j but arr[i] > arr[j]). Find an O(n log n) solution.",
    options: ["Two Pointers", "Divide and Conquer", "Binary Search", "Dynamic Programming"],
    correctAnswer: 1,
    explanation:
      "Modified merge sort counts inversions during the merge step. When an element from the right half is placed before elements from the left half, those form inversions. Split, recursively count, and count cross-inversions during merge.",
    difficulty: "hard",
    topic: "Divide and Conquer",
  },
  {
    id: "dc-2",
    question:
      "Find the kth largest element in an unsorted array. Achieve average O(n) time complexity.",
    options: ["Sorting", "Heap", "Divide and Conquer", "Binary Search"],
    correctAnswer: 2,
    explanation:
      "Quickselect (a divide and conquer approach) partitions the array around a pivot. If the pivot lands at the target position, return it. Otherwise, recurse only on the relevant partition. Average O(n) time.",
    difficulty: "medium",
    topic: "Divide and Conquer",
  },
  {
    id: "dc-3",
    question:
      "Given a list of points on a 2D plane, find the pair of points with the smallest Euclidean distance between them in O(n log n) time.",
    options: ["Brute Force", "Divide and Conquer", "Greedy", "Two Pointers"],
    correctAnswer: 1,
    explanation:
      "Divide the point set by x-coordinate into two halves. Recursively find the closest pair in each half. Then check pairs crossing the dividing line within a strip of width equal to the minimum distance found so far.",
    difficulty: "hard",
    topic: "Divide and Conquer",
  },

  // Topological Sort (2 questions)
  {
    id: "ts-1",
    question:
      "Given a list of courses and their prerequisites (directed edges), determine an order to take all courses, or report that it's impossible (cycle exists).",
    options: ["BFS/DFS", "Topological Sort", "Dynamic Programming", "Greedy"],
    correctAnswer: 1,
    explanation:
      "Topological sort using Kahn's algorithm (BFS with in-degree) or DFS-based ordering. Process nodes with zero in-degree first, reducing in-degrees of dependents. If not all nodes are processed, a cycle exists.",
    difficulty: "medium",
    topic: "Topological Sort",
  },
  {
    id: "ts-2",
    question:
      "Given a list of tasks with dependencies, find the minimum time to complete all tasks if independent tasks can run in parallel. Each task takes one unit of time.",
    options: ["Greedy", "Topological Sort", "Dynamic Programming", "BFS/DFS"],
    correctAnswer: 1,
    explanation:
      "Topological sort with level-based processing (BFS). Tasks at the same level can run in parallel. The minimum time equals the length of the longest path in the DAG (critical path).",
    difficulty: "hard",
    topic: "Topological Sort",
  },

  // Union Find (2 questions)
  {
    id: "uf-1",
    question:
      "Given n nodes and a list of undirected edges added one by one, determine after which edge addition a cycle is first formed in the graph.",
    options: ["BFS/DFS", "Union Find", "Topological Sort", "Two Pointers"],
    correctAnswer: 1,
    explanation:
      "Union Find (Disjoint Set Union) efficiently tracks connected components. When adding an edge, if both endpoints already belong to the same set, that edge creates a cycle. Union by rank and path compression give near O(1) per operation.",
    difficulty: "medium",
    topic: "Union Find",
  },
  {
    id: "uf-2",
    question:
      "Given a grid where some cells are connected, and queries asking whether two cells are in the same connected region, answer each query efficiently.",
    options: ["BFS/DFS", "Union Find", "Dynamic Programming", "Binary Search"],
    correctAnswer: 1,
    explanation:
      "Union Find is ideal for dynamic connectivity queries. Union connected cells, then each query is a simple find operation to check if two cells share the same root. Much faster than running BFS/DFS per query.",
    difficulty: "medium",
    topic: "Union Find",
  },

  // Trie (2 questions)
  {
    id: "tr-1",
    question:
      "Design a system that efficiently supports inserting words and searching for words with wildcard characters (e.g., '.' matches any single character).",
    options: ["Hashing", "Trie", "Binary Search", "BFS/DFS"],
    correctAnswer: 1,
    explanation:
      "A Trie stores words character by character. For wildcard search, when encountering '.', branch into all possible children at that level. This provides efficient prefix-based and pattern-based search.",
    difficulty: "medium",
    topic: "Trie",
  },
  {
    id: "tr-2",
    question:
      "Given a list of words, find the longest word that can be built one character at a time by other words in the list (each prefix must also be a valid word).",
    options: ["Sorting", "Trie", "Dynamic Programming", "Hashing"],
    correctAnswer: 1,
    explanation:
      "Insert all words into a Trie. Then DFS through the Trie, only following paths where each prefix node is marked as a complete word. The deepest valid path gives the longest buildable word.",
    difficulty: "hard",
    topic: "Trie",
  },
];
