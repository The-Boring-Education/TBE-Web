/**
 * Script to import DSA questions to development database
 * Run with: node import-dsa-questions.js
 * 
 * Requirements:
 * - Database connection configured in .env
 * - Run from apps/api directory
 */

import { connectDatabase } from './src/lib/database/index.js';
import DSAQuestion from './src/lib/database/models/InterviewPrep/DSAQuestion.js';

// Stack Questions (ordered Easy -> Medium -> Hard)
const stackQuestions = [
    // EASY
    {
        title: "Valid Parentheses",
        answer: "Check if a string of brackets is valid with correct opening and closing. Every open bracket must have a corresponding close bracket in correct order.",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/valid-parentheses/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "EASY",
        companyTypes: ["Startup", "MidSize", "MNC", "FAANG"],
        topics: ["STACK", "STRING"],
        order: 1
    },
    {
        title: "Remove All Adjacent Duplicates in String",
        answer: "Remove all adjacent duplicate characters in a string. Push characters onto stack; pop when duplicates appear.",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/remove-all-duplicates-in-string/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "EASY",
        companyTypes: ["Startup", "MidSize", "MNC"],
        topics: ["STACK", "STRING"],
        order: 2
    },
    {
        title: "Baseball Game",
        answer: "Simulate a baseball game where operations include adding scores or removing the last added score. Use stack to track valid operations (records, undo, etc).",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/baseball-game/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "EASY",
        companyTypes: ["Startup", "MidSize"],
        topics: ["STACK"],
        order: 3
    },
    {
        title: "Implement Stack using Queues",
        answer: "Use one or two queues to implement standard stack operations. Reverse queue operations to mimic stack behavior.",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/implement-stack-using-queues/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "EASY",
        companyTypes: ["Startup", "MidSize", "MNC"],
        topics: ["STACK", "QUEUE"],
        order: 4
    },
    {
        title: "Next Greater Element I",
        answer: "Find the next greater element for each number in an array. Use a stack to efficiently track greater elements while iterating.",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/next-greater-element-i/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "EASY",
        companyTypes: ["MidSize", "MNC", "FAANG"],
        topics: ["STACK", "ARRAY"],
        order: 5
    },
    // MEDIUM
    {
        title: "Min Stack",
        answer: "Design a stack that supports push, pop, top, and retrieving the minimum element in O(1) time. Store minimum values alongside regular stack elements.",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/min-stack/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "MEDIUM",
        companyTypes: ["MidSize", "MNC", "FAANG"],
        topics: ["STACK"],
        order: 6
    },
    {
        title: "Evaluate Reverse Polish Notation",
        answer: "Evaluate expressions in Reverse Polish Notation (RPN) using a stack. Push operands onto stack; apply operations when encountering operators.",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/evaluate-reverse-polish-notation/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "MEDIUM",
        companyTypes: ["MidSize", "MNC", "FAANG"],
        topics: ["STACK", "ARRAY", "MATH"],
        order: 7
    },
    {
        title: "Decode String",
        answer: "Decode a string encoded with patterns like \"3[a2[c]]\". Use stack to handle nested bracket structures.",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/decode-string/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "MEDIUM",
        companyTypes: ["MNC", "FAANG"],
        topics: ["STACK", "STRING"],
        order: 8
    },
    {
        title: "Next Greater Node In Linked List",
        answer: "Find the next greater node value for every node in a linked list. Use stack to efficiently find greater values while traversing the list.",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/next-greater-node-in-linked-list/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "MEDIUM",
        companyTypes: ["MNC", "FAANG"],
        topics: ["STACK", "LINKED_LIST"],
        order: 9
    },
    // HARD
    {
        title: "Longest Valid Parentheses",
        answer: "Find the length of the longest valid parentheses substring. Track indices in stack to identify valid parentheses sequences.",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/longest-valid-parentheses/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "HARD",
        companyTypes: ["MNC", "FAANG"],
        topics: ["STACK", "STRING", "DYNAMIC_PROGRAMMING"],
        order: 10
    }
];

// Dynamic Programming Questions (ordered Easy -> Medium -> Hard)
const dpQuestions = [
    // EASY
    {
        title: "Climbing Stairs",
        answer: "Find the number of ways to climb n stairs if you can climb 1 or 2 steps at a time. Classic DP problem. The answer for step n is the sum of ways to reach step n-1 and n-2.",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/climbing-stairs/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "EASY",
        companyTypes: ["Startup", "MidSize", "MNC", "FAANG"],
        topics: ["DYNAMIC_PROGRAMMING", "MATH"],
        order: 11
    },
    {
        title: "Fibonacci Number",
        answer: "Calculate the nth Fibonacci number. The most fundamental DP problem. Each number is the sum of the previous two.",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/fibonacci-number/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "EASY",
        companyTypes: ["Startup", "MidSize", "MNC"],
        topics: ["DYNAMIC_PROGRAMMING", "MATH"],
        order: 12
    },
    {
        title: "Best Time to Buy and Sell Stock",
        answer: "Find the maximum profit from one buy-sell transaction. Track the minimum price so far and calculate profit at each point.",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "EASY",
        companyTypes: ["MidSize", "MNC", "FAANG"],
        topics: ["DYNAMIC_PROGRAMMING", "ARRAY"],
        order: 13
    },
    {
        title: "Contains Duplicate II",
        answer: "Check if array contains duplicates within k distance. Simple DP/sliding window to track if two identical elements are within k indices.",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/contains-duplicate-ii/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "EASY",
        companyTypes: ["Startup", "MidSize", "MNC"],
        topics: ["DYNAMIC_PROGRAMMING", "ARRAY", "HASHMAP"],
        order: 14
    },
    {
        title: "Counting Bits",
        answer: "Count the number of 1's in binary representation for all numbers up to n. Use the pattern: number of 1's in i = number of 1's in (i >> 1) + (i & 1).",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/counting-bits/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "EASY",
        companyTypes: ["MidSize", "MNC", "FAANG"],
        topics: ["DYNAMIC_PROGRAMMING", "BIT_MANIPULATION"],
        order: 15
    },
    {
        title: "Min Cost Climbing Stairs",
        answer: "Find minimum cost to reach the top of stairs. Similar to climbing stairs but with costs. dp[i] = min(dp[i-1], dp[i-2]) + cost[i].",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/min-cost-climbing-stairs/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "EASY",
        companyTypes: ["MidSize", "MNC", "FAANG"],
        topics: ["DYNAMIC_PROGRAMMING", "ARRAY"],
        order: 16
    },
    {
        title: "Pascal's Triangle",
        answer: "Generate Pascal's triangle up to n rows. Each element is the sum of the two elements above it. Great for understanding 2D DP tables.",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/pascals-triangle/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "EASY",
        companyTypes: ["Startup", "MidSize", "MNC"],
        topics: ["DYNAMIC_PROGRAMMING", "ARRAY"],
        order: 17
    },
    // MEDIUM
    {
        title: "House Robber",
        answer: "Maximize money stolen from houses (can't rob adjacent houses). At each house, decide whether to rob it or skip it. dp[i] = max(dp[i-1], dp[i-2] + current house).",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/house-robber/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "MEDIUM",
        companyTypes: ["MidSize", "MNC", "FAANG"],
        topics: ["DYNAMIC_PROGRAMMING", "ARRAY"],
        order: 18
    },
    {
        title: "Maximum Subarray",
        answer: "Find the contiguous subarray with the largest sum. Kadane's algorithm. At each position, decide if it's better to extend the current subarray or start fresh.",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/maximum-subarray/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "MEDIUM",
        companyTypes: ["MNC", "FAANG"],
        topics: ["DYNAMIC_PROGRAMMING", "ARRAY"],
        order: 19
    },
    {
        title: "Ugly Number II",
        answer: "Find the nth ugly number (numbers with only prime factors 2, 3, 5). Use DP with three pointers to generate ugly numbers in order.",
        resources: {
            leetcodeURL: "https://leetcode.com/problems/ugly-number-ii/",
            youtubeURL: null,
            blogURL: null
        },
        domain: ["GENERAL"],
        difficulty: "MEDIUM",
        companyTypes: ["MNC", "FAANG"],
        topics: ["DYNAMIC_PROGRAMMING", "MATH"],
        order: 20
    }
];

async function importQuestions() {
    try {
        console.log('Connecting to database...');
        await connectDatabase();
        console.log('Database connected successfully!');

        const allQuestions = [...stackQuestions, ...dpQuestions];

        console.log(`\nImporting ${allQuestions.length} DSA questions...`);
        console.log(`- Stack questions: ${stackQuestions.length}`);
        console.log(`- Dynamic Programming questions: ${dpQuestions.length}\n`);

        let successCount = 0;
        let errorCount = 0;

        for (const questionData of allQuestions) {
            try {
                const question = new DSAQuestion(questionData);
                await question.save();
                console.log(`✓ Imported: ${questionData.title} (${questionData.difficulty})`);
                successCount++;
            } catch (error) {
                console.error(`✗ Failed to import: ${questionData.title}`);
                console.error(`  Error: ${error.message}`);
                errorCount++;
            }
        }

        console.log(`\n========== Import Summary ==========`);
        console.log(`Total questions: ${allQuestions.length}`);
        console.log(`Successfully imported: ${successCount}`);
        console.log(`Failed: ${errorCount}`);
        console.log(`====================================\n`);

        process.exit(0);
    } catch (error) {
        console.error('Fatal error during import:',  error);
        process.exit(1);
    }
}

// Run the import
importQuestions();
