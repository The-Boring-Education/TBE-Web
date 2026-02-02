import { ResourceItem } from '@tbe/interface';

export interface Question {
  title: string;
  resources?: ResourceItem[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Topic {
  topic: string;
  emoji: string;
  questions: Question[];
}

export const targetBasedData = {
  startup: [
    {
      topic: "Arrays & Basic Operations",
      emoji: "📝",
      questions: [
        {
          title: "Two Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/two-sum/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Running Sum of 1d Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/running-sum-of-1d-array/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Find Pivot Index",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/find-pivot-index/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Contains Duplicate",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/contains-duplicate/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Maximum Subarray",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/maximum-subarray/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Best Time to Buy and Sell Stock",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Product of Array Except Self",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/product-of-array-except-self/" }],
          difficulty: "Medium" as const
        },
        {
          title: "3Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/3sum/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "Strings & Pattern Matching",
      emoji: "🔤",
      questions: [
        {
          title: "Valid Anagram",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/valid-anagram/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Valid Palindrome",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/valid-palindrome/" }],
          difficulty: "Easy" as const
        },
        {
          title: "First Unique Character in a String",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/first-unique-character-in-a-string/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Longest Common Prefix",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/longest-common-prefix/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Group Anagrams",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/group-anagrams/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Longest Substring Without Repeating Characters",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "Hash Maps & Hash Sets",
      emoji: "🗂️",
      questions: [
        {
          title: "Two Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/two-sum/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Ransom Note",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/ransom-note/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Jewels and Stones",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/jewels-and-stones/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Top K Frequent Elements",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/top-k-frequent-elements/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Subarray Sum Equals K",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/subarray-sum-equals-k/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "Stack & Queue Fundamentals",
      emoji: "📚",
      questions: [
        {
          title: "Valid Parentheses",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/valid-parentheses/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Implement Queue using Stacks",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/implement-queue-using-stacks/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Baseball Game",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/baseball-game/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Min Stack",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/min-stack/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Evaluate Reverse Polish Notation",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Daily Temperatures",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/daily-temperatures/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "Binary Trees - Basics",
      emoji: "🌳",
      questions: [
        {
          title: "Maximum Depth of Binary Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Same Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/same-tree/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Invert Binary Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/invert-binary-tree/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Binary Tree Inorder Traversal",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/binary-tree-inorder-traversal/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Binary Tree Level Order Traversal",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "Basic Dynamic Programming",
      emoji: "🧮",
      questions: [
        {
          title: "Climbing Stairs",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/climbing-stairs/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Fibonacci Number",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/fibonacci-number/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Min Cost Climbing Stairs",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/min-cost-climbing-stairs/" }],
          difficulty: "Easy" as const
        },
        {
          title: "House Robber",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/house-robber/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Coin Change",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/coin-change/" }],
          difficulty: "Medium" as const
        }
      ]
    }
  ],
  mnc: [
    {
      topic: "Arrays & Two Pointers",
      emoji: "📝",
      questions: [
        {
          title: "Two Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/two-sum/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Remove Duplicates from Sorted Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Merge Sorted Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/merge-sorted-array/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Move Zeroes",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/move-zeroes/" }],
          difficulty: "Easy" as const
        },
        {
          title: "3Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/3sum/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Container With Most Water",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/container-with-most-water/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Sort Colors",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/sort-colors/" }],
          difficulty: "Medium" as const
        },
        {
          title: "4Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/4sum/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "String Algorithms",
      emoji: "🔤",
      questions: [
        {
          title: "Valid Palindrome",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/valid-palindrome/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Implement strStr()",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/implement-strstr/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Count and Say",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/count-and-say/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Longest Palindromic Substring",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/longest-palindromic-substring/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Palindromic Substrings",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/palindromic-substrings/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Minimum Window Substring",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/minimum-window-substring/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Binary Trees & BST",
      emoji: "🌳",
      questions: [
        {
          title: "Maximum Depth of Binary Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Symmetric Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/symmetric-tree/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Path Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/path-sum/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Minimum Depth of Binary Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/minimum-depth-of-binary-tree/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Validate Binary Search Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/validate-binary-search-tree/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Kth Smallest Element in a BST",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Lowest Common Ancestor of a Binary Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Binary Tree Right Side View",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/binary-tree-right-side-view/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "Graph Algorithms",
      emoji: "🕸️",
      questions: [
        {
          title: "Flood Fill",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/flood-fill/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Find the Town Judge",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/find-the-town-judge/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Number of Islands",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/number-of-islands/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Clone Graph",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/clone-graph/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Course Schedule",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/course-schedule/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Pacific Atlantic Water Flow",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/pacific-atlantic-water-flow/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Network Delay Time",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/network-delay-time/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "Sliding Window",
      emoji: "🪟",
      questions: [
        {
          title: "Best Time to Buy and Sell Stock",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Maximum Average Subarray I",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/maximum-average-subarray-i/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Permutation in String",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/permutation-in-string/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Find All Anagrams in a String",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Longest Repeating Character Replacement",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/longest-repeating-character-replacement/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Sliding Window Maximum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/sliding-window-maximum/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Dynamic Programming",
      emoji: "🧮",
      questions: [
        {
          title: "Climbing Stairs",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/climbing-stairs/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Pascal's Triangle",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/pascals-triangle/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Maximum Product Subarray",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/maximum-product-subarray/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Unique Paths",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/unique-paths/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Longest Increasing Subsequence",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/longest-increasing-subsequence/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Word Break",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/word-break/" }],
          difficulty: "Medium" as const
        }
      ]
    }
  ],
  faang: [
    {
      topic: "Array Fundamentals",
      emoji: "📝",
      questions: [
        {
          title: "Two Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/two-sum/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Best Time to Buy and Sell Stock",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Contains Duplicate",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/contains-duplicate/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Maximum Subarray",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/maximum-subarray/" }],
          difficulty: "Easy" as const
        },
        {
          title: "3Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/3sum/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Container With Most Water",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/container-with-most-water/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Product of Array Except Self",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/product-of-array-except-self/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Median of Two Sorted Arrays",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Trapping Rain Water",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/trapping-rain-water/" }],
          difficulty: "Hard" as const
        },
        {
          title: "First Missing Positive",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/first-missing-positive/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "String Processing",
      emoji: "🔤",
      questions: [
        {
          title: "Valid Anagram",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/valid-anagram/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Valid Palindrome",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/valid-palindrome/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Longest Common Prefix",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/longest-common-prefix/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Group Anagrams",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/group-anagrams/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Longest Palindromic Substring",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/longest-palindromic-substring/" }],
          difficulty: "Medium" as const
        },
        {
          title: "String to Integer (atoi)",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/string-to-integer-atoi/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Regular Expression Matching",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/regular-expression-matching/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Edit Distance",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/edit-distance/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Linked Lists",
      emoji: "🔗",
      questions: [
        {
          title: "Reverse Linked List",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/reverse-linked-list/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Merge Two Sorted Lists",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/merge-two-sorted-lists/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Linked List Cycle",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/linked-list-cycle/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Remove Nth Node From End of List",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Add Two Numbers",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/add-two-numbers/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Copy List with Random Pointer",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/copy-list-with-random-pointer/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Merge k Sorted Lists",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/merge-k-sorted-lists/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Binary Trees",
      emoji: "🌳",
      questions: [
        {
          title: "Maximum Depth of Binary Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Same Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/same-tree/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Invert Binary Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/invert-binary-tree/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Binary Tree Level Order Traversal",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Validate Binary Search Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/validate-binary-search-tree/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Construct Binary Tree from Preorder and Inorder Traversal",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Binary Tree Maximum Path Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Serialize and Deserialize Binary Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Dynamic Programming",
      emoji: "🧮",
      questions: [
        {
          title: "Climbing Stairs",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/climbing-stairs/" }],
          difficulty: "Easy" as const
        },
        {
          title: "House Robber",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/house-robber/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Coin Change",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/coin-change/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Longest Increasing Subsequence",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/longest-increasing-subsequence/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Word Break",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/word-break/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Combination Sum IV",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/combination-sum-iv/" }],
          difficulty: "Medium" as const
        },
        {
          title: "House Robber II",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/house-robber-ii/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Decode Ways",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/decode-ways/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Unique Paths",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/unique-paths/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Jump Game",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/jump-game/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "Graph Algorithms",
      emoji: "🕸️",
      questions: [
        {
          title: "Number of Islands",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/number-of-islands/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Clone Graph",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/clone-graph/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Course Schedule",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/course-schedule/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Pacific Atlantic Water Flow",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/pacific-atlantic-water-flow/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Graph Valid Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/graph-valid-tree/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Word Ladder",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/word-ladder/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Alien Dictionary",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/alien-dictionary/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Tries & Advanced Strings",
      emoji: "🌿",
      questions: [
        {
          title: "Implement Trie (Prefix Tree)",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/implement-trie-prefix-tree/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Design Add and Search Words Data Structure",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/design-add-and-search-words-data-structure/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Word Search II",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/word-search-ii/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Maximum XOR of Two Numbers in an Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "Heaps & Priority Queues",
      emoji: "⛰️",
      questions: [
        {
          title: "Kth Largest Element in a Stream",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/kth-largest-element-in-a-stream/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Last Stone Weight",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/last-stone-weight/" }],
          difficulty: "Easy" as const
        },
        {
          title: "K Closest Points to Origin",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/k-closest-points-to-origin/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Kth Largest Element in an Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/kth-largest-element-in-an-array/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Task Scheduler",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/task-scheduler/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Find Median from Data Stream",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/find-median-from-data-stream/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Backtracking",
      emoji: "🔄",
      questions: [
        {
          title: "Subsets",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/subsets/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Combination Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/combination-sum/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Permutations",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/permutations/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Letter Combinations of a Phone Number",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Word Search",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/word-search/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Palindrome Partitioning",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/palindrome-partitioning/" }],
          difficulty: "Medium" as const
        },
        {
          title: "N-Queens",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/n-queens/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Advanced Topics",
      emoji: "💎",
      questions: [
        {
          title: "LRU Cache",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/lru-cache/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Time Based Key-Value Store",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/time-based-key-value-store/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Insert Delete GetRandom O(1)",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/insert-delete-getrandom-o1/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Design Twitter",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/design-twitter/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Largest Rectangle in Histogram",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/largest-rectangle-in-histogram/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Sliding Window Maximum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/sliding-window-maximum/" }],
          difficulty: "Hard" as const
        }
      ]
    }
  ]
};

export const domainBasedData = {
  fullstack: [
    {
      topic: "Arrays & Basic Operations",
      emoji: "💻",
      questions: [
        {
          title: "Two Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/two-sum/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Running Sum of 1d Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/running-sum-of-1d-array/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Shuffle the Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/shuffle-the-array/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Kids With the Greatest Number of Candies",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/kids-with-the-greatest-number-of-candies/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Number of Good Pairs",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/number-of-good-pairs/" }],
          difficulty: "Easy" as const
        },
        {
          title: "How Many Numbers Are Smaller Than the Current Number",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/how-many-numbers-are-smaller-than-the-current-number/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Create Target Array in the Given Order",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/create-target-array-in-the-given-order/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Check If N and Its Double Exist",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/check-if-n-and-its-double-exist/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Valid Mountain Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/valid-mountain-array/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Replace Elements with Greatest Element on Right Side",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/replace-elements-with-greatest-element-on-right-side/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Move Zeroes",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/move-zeroes/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Sort Array By Parity",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/sort-array-by-parity/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Remove Duplicates from Sorted Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Height Checker",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/height-checker/" }],
          difficulty: "Easy" as const
        }
      ]
    },
    {
      topic: "String Manipulation",
      emoji: "🔤",
      questions: [
        {
          title: "Defanging an IP Address",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/defanging-an-ip-address/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Split a String in Balanced Strings",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/split-a-string-in-balanced-strings/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Goal Parser Interpretation",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/goal-parser-interpretation/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Count Items Matching a Rule",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/count-items-matching-a-rule/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Sorting the Sentence",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/sorting-the-sentence/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Check if Binary String Has at Most One Segment of Ones",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/check-if-binary-string-has-at-most-one-segment-of-ones/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Decrypt String from Alphabet to Integer Mapping",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/decrypt-string-from-alphabet-to-integer-mapping/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Number of Strings That Appear as Substrings in Word",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/number-of-strings-that-appear-as-substrings-in-word/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Replace All Digits with Characters",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/replace-all-digits-with-characters/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Determine if String Halves Are Alike",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/determine-if-string-halves-are-alike/" }],
          difficulty: "Easy" as const
        }
      ]
    },
    {
      topic: "Hash Maps & Hash Sets",
      emoji: "🗂️",
      questions: [
        {
          title: "Two Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/two-sum/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Contains Duplicate",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/contains-duplicate/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Valid Anagram",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/valid-anagram/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Group Anagrams",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/group-anagrams/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Top K Frequent Elements",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/top-k-frequent-elements/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Product of Array Except Self",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/product-of-array-except-self/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Valid Sudoku",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/valid-sudoku/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Encode and Decode Strings",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/encode-and-decode-strings/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Longest Consecutive Sequence",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/longest-consecutive-sequence/" }],
          difficulty: "Medium" as const
        },
        {
          title: "LRU Cache",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/lru-cache/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "Stacks & Queues",
      emoji: "📚",
      questions: [
        {
          title: "Valid Parentheses",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/valid-parentheses/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Implement Queue using Stacks",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/implement-queue-using-stacks/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Implement Stack using Queues",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/implement-stack-using-queues/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Min Stack",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/min-stack/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Evaluate Reverse Polish Notation",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Generate Parentheses",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/generate-parentheses/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Daily Temperatures",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/daily-temperatures/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Car Fleet",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/car-fleet/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Design Circular Queue",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/design-circular-queue/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Largest Rectangle in Histogram",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/largest-rectangle-in-histogram/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Recursion & Backtracking",
      emoji: "🔄",
      questions: [
        {
          title: "Fibonacci Number",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/fibonacci-number/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Power of Two",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/power-of-two/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Power of Three",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/power-of-three/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Reverse String",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/reverse-string/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Generate Parentheses",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/generate-parentheses/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Letter Combinations of a Phone Number",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Permutations",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/permutations/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Subsets",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/subsets/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Combination Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/combination-sum/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Word Search",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/word-search/" }],
          difficulty: "Medium" as const
        }
      ]
    }
  ],
  datascience: [
    {
      topic: "Mathematical Foundations",
      emoji: "📊",
      questions: [
        {
          title: "Factorial Trailing Zeroes",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/factorial-trailing-zeroes/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Excel Sheet Column Number",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/excel-sheet-column-number/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Sqrt(x)",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/sqrtx/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Power of Two",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/power-of-two/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Happy Number",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/happy-number/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Pow(x, n)",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/powx-n/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Divide Two Integers",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/divide-two-integers/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Integer to Roman",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/integer-to-roman/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Roman to Integer",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/roman-to-integer/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Reverse Integer",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/reverse-integer/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "Matrix Operations",
      emoji: "🔢",
      questions: [
        {
          title: "Matrix Diagonal Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/matrix-diagonal-sum/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Reshape the Matrix",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/reshape-the-matrix/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Transpose Matrix",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/transpose-matrix/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Flipping an Image",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/flipping-an-image/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Rotate Image",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/rotate-image/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Spiral Matrix",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/spiral-matrix/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Set Matrix Zeroes",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/set-matrix-zeroes/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Search a 2D Matrix",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/search-a-2d-matrix/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Valid Sudoku",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/valid-sudoku/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Word Search",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/word-search/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "Statistical Analysis",
      emoji: "📈",
      questions: [
        {
          title: "Maximum Subarray",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/maximum-subarray/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Missing Number",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/missing-number/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Single Number",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/single-number/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Majority Element",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/majority-element/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Find Peak Element",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/find-peak-element/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Kth Largest Element in an Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/kth-largest-element-in-an-array/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Top K Frequent Elements",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/top-k-frequent-elements/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Random Pick with Weight",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/random-pick-with-weight/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Median of Two Sorted Arrays",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Find Median from Data Stream",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/find-median-from-data-stream/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Graph Analysis",
      emoji: "🕸️",
      questions: [
        {
          title: "Find the Town Judge",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/find-the-town-judge/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Flood Fill",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/flood-fill/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Number of Islands",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/number-of-islands/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Clone Graph",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/clone-graph/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Course Schedule",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/course-schedule/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Network Delay Time",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/network-delay-time/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Cheapest Flights Within K Stops",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Min Cost to Connect All Points",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/min-cost-to-connect-all-points/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Critical Connections in a Network",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/critical-connections-in-a-network/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Word Ladder",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/word-ladder/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Data Processing",
      emoji: "⚙️",
      questions: [
        {
          title: "Sort Colors",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/sort-colors/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Merge Intervals",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/merge-intervals/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Insert Interval",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/insert-interval/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Non-overlapping Intervals",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/non-overlapping-intervals/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Meeting Rooms",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/meeting-rooms/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Meeting Rooms II",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/meeting-rooms-ii/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Group Anagrams",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/group-anagrams/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Find All Anagrams in a String",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Frequency of the Most Frequent Element",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/frequency-of-the-most-frequent-element/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Sliding Window Maximum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/sliding-window-maximum/" }],
          difficulty: "Hard" as const
        }
      ]
    }
  ],
  appdev: [
    {
      topic: "Basic Data Structures",
      emoji: "📱",
      questions: [
        {
          title: "Design Parking System",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/design-parking-system/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Implement Queue using Stacks",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/implement-queue-using-stacks/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Implement Stack using Queues",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/implement-stack-using-queues/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Design HashSet",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/design-hashset/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Design HashMap",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/design-hashmap/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Min Stack",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/min-stack/" }],
          difficulty: "Medium" as const
        },
        {
          title: "LRU Cache",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/lru-cache/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Insert Delete GetRandom O(1)",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/insert-delete-getrandom-o1/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Design Circular Queue",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/design-circular-queue/" }],
          difficulty: "Medium" as const
        },
        {
          title: "LFU Cache",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/lfu-cache/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Priority Queues & Heaps",
      emoji: "⛰️",
      questions: [
        {
          title: "Kth Largest Element in a Stream",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/kth-largest-element-in-a-stream/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Last Stone Weight",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/last-stone-weight/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Relative Ranks",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/relative-ranks/" }],
          difficulty: "Easy" as const
        },
        {
          title: "K Closest Points to Origin",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/k-closest-points-to-origin/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Kth Largest Element in an Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/kth-largest-element-in-an-array/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Task Scheduler",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/task-scheduler/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Top K Frequent Words",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/top-k-frequent-words/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Find K Pairs with Smallest Sums",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/find-k-pairs-with-smallest-sums/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Merge k Sorted Lists",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/merge-k-sorted-lists/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Find Median from Data Stream",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/find-median-from-data-stream/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "System Design Patterns",
      emoji: "🔧",
      questions: [
        {
          title: "Design Log Storage System",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/design-log-storage-system/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Design Hit Counter",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/design-hit-counter/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Time Based Key-Value Store",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/time-based-key-value-store/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Design Twitter",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/design-twitter/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Design Phone Directory",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/design-phone-directory/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Design Tic-Tac-Toe",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/design-tic-tac-toe/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Design Snake Game",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/design-snake-game/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Design In-Memory File System",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/design-in-memory-file-system/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Design Search Autocomplete System",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/design-search-autocomplete-system/" }],
          difficulty: "Hard" as const
        },
        {
          title: "All O`one Data Structure",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/all-oone-data-structure/" }],
          difficulty: "Hard" as const
        }
      ]
    }
  ],
  ml: [
    {
      topic: "Mathematical Optimization",
      emoji: "🤖",
      questions: [
        {
          title: "Maximum Subarray",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/maximum-subarray/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Best Time to Buy and Sell Stock",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Climbing Stairs",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/climbing-stairs/" }],
          difficulty: "Easy" as const
        },
        {
          title: "House Robber",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/house-robber/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Coin Change",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/coin-change/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Maximum Product Subarray",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/maximum-product-subarray/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Unique Paths",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/unique-paths/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Minimum Path Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/minimum-path-sum/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Edit Distance",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/edit-distance/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Maximal Square",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/maximal-square/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "Algorithm Efficiency",
      emoji: "⚡",
      questions: [
        {
          title: "Binary Search",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/binary-search/" }],
          difficulty: "Easy" as const
        },
        {
          title: "First Bad Version",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/first-bad-version/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Search Insert Position",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/search-insert-position/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Sqrt(x)",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/sqrtx/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Find Peak Element",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/find-peak-element/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Search in Rotated Sorted Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Find Minimum in Rotated Sorted Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Search a 2D Matrix",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/search-a-2d-matrix/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Kth Smallest Element in a Sorted Matrix",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Median of Two Sorted Arrays",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" }],
          difficulty: "Hard" as const
        }
      ]
    }
  ],
  analyst: [
    {
      topic: "Data Manipulation",
      emoji: "📈",
      questions: [
        {
          title: "Two Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/two-sum/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Running Sum of 1d Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/running-sum-of-1d-array/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Find Pivot Index",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/find-pivot-index/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Maximum Subarray",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/maximum-subarray/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Product of Array Except Self",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/product-of-array-except-self/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Container With Most Water",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/container-with-most-water/" }],
          difficulty: "Medium" as const
        },
        {
          title: "3Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/3sum/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Sort Colors",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/sort-colors/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Merge Intervals",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/merge-intervals/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Insert Interval",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/insert-interval/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "Statistical Operations",
      emoji: "📊",
      questions: [
        {
          title: "Single Number",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/single-number/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Majority Element",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/majority-element/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Missing Number",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/missing-number/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Top K Frequent Elements",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/top-k-frequent-elements/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Kth Largest Element in an Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/kth-largest-element-in-an-array/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Find All Numbers Disappeared in an Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/" }],
          difficulty: "Easy" as const
        },
        {
          title: "First Missing Positive",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/first-missing-positive/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Find the Duplicate Number",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/find-the-duplicate-number/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Set Matrix Zeroes",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/set-matrix-zeroes/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Rotate Image",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/rotate-image/" }],
          difficulty: "Medium" as const
        }
      ]
    }
  ],
  ai: [
    {
      topic: "Search Algorithms",
      emoji: "🧠",
      questions: [
        {
          title: "Binary Search",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/binary-search/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Search Insert Position",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/search-insert-position/" }],
          difficulty: "Easy" as const
        },
        {
          title: "First Bad Version",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/first-bad-version/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Search in Rotated Sorted Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Find Peak Element",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/find-peak-element/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Search in Rotated Sorted Array II",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/search-in-rotated-sorted-array-ii/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Find Minimum in Rotated Sorted Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Search a 2D Matrix",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/search-a-2d-matrix/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Search a 2D Matrix II",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/search-a-2d-matrix-ii/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Median of Two Sorted Arrays",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Graph Algorithms",
      emoji: "🕸️",
      questions: [
        {
          title: "Flood Fill",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/flood-fill/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Number of Islands",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/number-of-islands/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Clone Graph",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/clone-graph/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Course Schedule",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/course-schedule/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Course Schedule II",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/course-schedule-ii/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Pacific Atlantic Water Flow",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/pacific-atlantic-water-flow/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Number of Connected Components in an Undirected Graph",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Graph Valid Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/graph-valid-tree/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Word Ladder",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/word-ladder/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Alien Dictionary",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/alien-dictionary/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Advanced Algorithms",
      emoji: "⚡",
      questions: [
        {
          title: "Implement Trie (Prefix Tree)",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/implement-trie-prefix-tree/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Design Add and Search Words Data Structure",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/design-add-and-search-words-data-structure/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Word Break",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/word-break/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Word Break II",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/word-break-ii/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Word Search II",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/word-search-ii/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Palindrome Partitioning",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/palindrome-partitioning/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Palindrome Partitioning II",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/palindrome-partitioning-ii/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Maximum XOR of Two Numbers in an Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Concatenated Words",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/concatenated-words/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Word Squares",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/word-squares/" }],
          difficulty: "Hard" as const
        }
      ]
    }
  ]
};

export const timeBasedData = {
  "2months": [
    {
      topic: "Array Essentials",
      emoji: "📝",
      questions: [
        {
          title: "Two Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/two-sum/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Running Sum of 1d Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/running-sum-of-1d-array/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Find Pivot Index",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/find-pivot-index/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Best Time to Buy and Sell Stock",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Contains Duplicate",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/contains-duplicate/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Maximum Subarray",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/maximum-subarray/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Product of Array Except Self",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/product-of-array-except-self/" }],
          difficulty: "Medium" as const
        },
        {
          title: "3Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/3sum/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "String Basics",
      emoji: "🔤",
      questions: [
        {
          title: "Valid Anagram",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/valid-anagram/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Valid Palindrome",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/valid-palindrome/" }],
          difficulty: "Easy" as const
        },
        {
          title: "First Unique Character in a String",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/first-unique-character-in-a-string/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Longest Common Prefix",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/longest-common-prefix/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Group Anagrams",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/group-anagrams/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Longest Substring Without Repeating Characters",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "Stack & Queue Fundamentals",
      emoji: "📚",
      questions: [
        {
          title: "Valid Parentheses",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/valid-parentheses/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Implement Queue using Stacks",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/implement-queue-using-stacks/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Min Stack",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/min-stack/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Daily Temperatures",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/daily-temperatures/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "Basic Trees",
      emoji: "🌳",
      questions: [
        {
          title: "Maximum Depth of Binary Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Same Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/same-tree/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Invert Binary Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/invert-binary-tree/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Binary Tree Level Order Traversal",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "Basic Dynamic Programming",
      emoji: "🧮",
      questions: [
        {
          title: "Climbing Stairs",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/climbing-stairs/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Fibonacci Number",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/fibonacci-number/" }],
          difficulty: "Easy" as const
        },
        {
          title: "House Robber",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/house-robber/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Coin Change",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/coin-change/" }],
          difficulty: "Medium" as const
        }
      ]
    }
  ],
  "3-4months": [
    {
      topic: "Arrays & Two Pointers",
      emoji: "📝",
      questions: [
        {
          title: "Two Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/two-sum/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Remove Duplicates from Sorted Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Move Zeroes",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/move-zeroes/" }],
          difficulty: "Easy" as const
        },
        {
          title: "3Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/3sum/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Container With Most Water",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/container-with-most-water/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Sort Colors",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/sort-colors/" }],
          difficulty: "Medium" as const
        },
        {
          title: "4Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/4sum/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Trapping Rain Water",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/trapping-rain-water/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "String Processing",
      emoji: "🔤",
      questions: [
        {
          title: "Valid Palindrome",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/valid-palindrome/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Implement strStr()",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/implement-strstr/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Longest Palindromic Substring",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/longest-palindromic-substring/" }],
          difficulty: "Medium" as const
        },
        {
          title: "String to Integer (atoi)",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/string-to-integer-atoi/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Minimum Window Substring",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/minimum-window-substring/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Regular Expression Matching",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/regular-expression-matching/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Linked Lists",
      emoji: "🔗",
      questions: [
        {
          title: "Reverse Linked List",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/reverse-linked-list/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Merge Two Sorted Lists",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/merge-two-sorted-lists/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Linked List Cycle",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/linked-list-cycle/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Remove Nth Node From End of List",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Add Two Numbers",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/add-two-numbers/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Merge k Sorted Lists",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/merge-k-sorted-lists/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Binary Trees",
      emoji: "🌳",
      questions: [
        {
          title: "Maximum Depth of Binary Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Same Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/same-tree/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Invert Binary Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/invert-binary-tree/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Binary Tree Level Order Traversal",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Validate Binary Search Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/validate-binary-search-tree/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Lowest Common Ancestor of a Binary Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Binary Tree Maximum Path Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Dynamic Programming",
      emoji: "🧮",
      questions: [
        {
          title: "Climbing Stairs",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/climbing-stairs/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Pascal's Triangle",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/pascals-triangle/" }],
          difficulty: "Easy" as const
        },
        {
          title: "House Robber",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/house-robber/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Coin Change",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/coin-change/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Longest Increasing Subsequence",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/longest-increasing-subsequence/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Word Break",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/word-break/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Edit Distance",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/edit-distance/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Graph Fundamentals",
      emoji: "🕸️",
      questions: [
        {
          title: "Flood Fill",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/flood-fill/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Number of Islands",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/number-of-islands/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Clone Graph",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/clone-graph/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Course Schedule",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/course-schedule/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Pacific Atlantic Water Flow",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/pacific-atlantic-water-flow/" }],
          difficulty: "Medium" as const
        }
      ]
    }
  ],
  "5+months": [
    {
      topic: "Advanced Arrays",
      emoji: "🚀",
      questions: [
        {
          title: "Two Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/two-sum/" }],
          difficulty: "Easy" as const
        },
        {
          title: "3Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/3sum/" }],
          difficulty: "Medium" as const
        },
        {
          title: "4Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/4sum/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Container With Most Water",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/container-with-most-water/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Trapping Rain Water",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/trapping-rain-water/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Median of Two Sorted Arrays",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" }],
          difficulty: "Hard" as const
        },
        {
          title: "First Missing Positive",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/first-missing-positive/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Largest Rectangle in Histogram",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/largest-rectangle-in-histogram/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Advanced String Algorithms",
      emoji: "🔤",
      questions: [
        {
          title: "Longest Palindromic Substring",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/longest-palindromic-substring/" }],
          difficulty: "Medium" as const
        },
        {
          title: "String to Integer (atoi)",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/string-to-integer-atoi/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Minimum Window Substring",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/minimum-window-substring/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Valid Number",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/valid-number/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Edit Distance",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/edit-distance/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Regular Expression Matching",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/regular-expression-matching/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Wildcard Matching",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/wildcard-matching/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Advanced Trees",
      emoji: "🌲",
      questions: [
        {
          title: "Binary Tree Inorder Traversal",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/binary-tree-inorder-traversal/" }],
          difficulty: "Easy" as const
        },
        {
          title: "Validate Binary Search Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/validate-binary-search-tree/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Construct Binary Tree from Preorder and Inorder Traversal",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Binary Tree Maximum Path Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Serialize and Deserialize Binary Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Lowest Common Ancestor of a Binary Tree",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Binary Tree Right Side View",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/binary-tree-right-side-view/" }],
          difficulty: "Medium" as const
        }
      ]
    },
    {
      topic: "Advanced Graph Algorithms",
      emoji: "🕸️",
      questions: [
        {
          title: "Number of Islands",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/number-of-islands/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Course Schedule",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/course-schedule/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Course Schedule II",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/course-schedule-ii/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Network Delay Time",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/network-delay-time/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Cheapest Flights Within K Stops",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Word Ladder",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/word-ladder/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Word Ladder II",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/word-ladder-ii/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Alien Dictionary",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/alien-dictionary/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Advanced Dynamic Programming",
      emoji: "💎",
      questions: [
        {
          title: "Unique Paths",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/unique-paths/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Unique Paths II",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/unique-paths-ii/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Minimum Path Sum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/minimum-path-sum/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Word Break",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/word-break/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Word Break II",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/word-break-ii/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Longest Common Subsequence",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/longest-common-subsequence/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Palindrome Partitioning II",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/palindrome-partitioning-ii/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Burst Balloons",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/burst-balloons/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "System Design Data Structures",
      emoji: "⚙️",
      questions: [
        {
          title: "LRU Cache",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/lru-cache/" }],
          difficulty: "Medium" as const
        },
        {
          title: "LFU Cache",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/lfu-cache/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Design Twitter",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/design-twitter/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Design Search Autocomplete System",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/design-search-autocomplete-system/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Insert Delete GetRandom O(1)",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/insert-delete-getrandom-o1/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Time Based Key-Value Store",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/time-based-key-value-store/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Design In-Memory File System",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/design-in-memory-file-system/" }],
          difficulty: "Hard" as const
        }
      ]
    },
    {
      topic: "Advanced Algorithms",
      emoji: "🎯",
      questions: [
        {
          title: "Implement Trie (Prefix Tree)",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/implement-trie-prefix-tree/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Word Search II",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/word-search-ii/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Maximum XOR of Two Numbers in an Array",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/" }],
          difficulty: "Medium" as const
        },
        {
          title: "Sliding Window Maximum",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/sliding-window-maximum/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Find Median from Data Stream",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/find-median-from-data-stream/" }],
          difficulty: "Hard" as const
        },
        {
          title: "N-Queens",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/n-queens/" }],
          difficulty: "Hard" as const
        },
        {
          title: "Sudoku Solver",
          resources: [{ type: 'LEETCODE' as const, url: "https://leetcode.com/problems/sudoku-solver/" }],
          difficulty: "Hard" as const
        }
      ]
    }
  ]
};
