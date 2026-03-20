import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from .env.local in api
dotenv.config({ path: path.join(__dirname, "../../.env.local") });

const STUDY_GUIDE_DATA = [
  {
    topicId: "ARRAY",
    title: "Arrays",
    hasGuide: true,
    sortOrder: 1,
    sections: [
      {
        id: "before-you-start",
        label: "Before you start",
        type: "intro",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 0,
        content: {
          pageTitle: "Before you start",
          subtitle:
            "Make sure you're comfortable with these concepts before diving into arrays.",
          openingParagraph:
            "Arrays are the most common data structure in DSA interviews. But before you can solve array problems, your brain needs four things to feel natural, not memorised, but natural. If any of the four feel shaky, spend 30 minutes on that one before moving on.",
          prereqCards: [
            {
              title: "Variables and basic types",
              body: "You should be able to declare an integer, swap two values without confusion, and know what happens when you do `a = b`. Pointer bugs in array problems almost always come from not being solid here.",
              sortOrder: 0,
            },
            {
              title: "For loops and while loops",
              body: "You must be able to write a loop that goes forward, backward, and stops at a condition. 90% of array solutions are just a loop with a condition inside it.",
              sortOrder: 1,
            },
            {
              title: "0-based indexing",
              body: "Arrays start at index 0, not 1. The last element is at index `length - 1`. Off-by-one errors are the number one bug in array problems.",
              sortOrder: 2,
            },
            {
              title: "Basic time complexity",
              body: "You should know what O(n) and O(n²) mean intuitively. O(n) means one pass through the array. O(n²) means a loop inside a loop.",
              sortOrder: 3,
            },
          ],
          callouts: [
            {
              variant: "info",
              body: "You do NOT need to know recursion, trees, graphs, or dynamic programming before starting arrays. Those come later. Arrays are the foundation, start here.",
              sortOrder: 0,
            },
            {
              variant: "success",
              body: "Goal: by the end of this guide, you should be able to look at any Easy or Medium array problem and identify the pattern within 60 seconds of reading it.",
              sortOrder: 1,
            },
          ],
          howToUseHeading: "How to use this guide",
          howToUseParagraphs: [
            "Each section covers one pattern, a reusable way of thinking that applies to a family of problems. Every section has: (1) an explanation of the pattern with a visual, (2) a reusable code template, (3) one fully worked example, and (4) a set of practice questions.",
            "Do the sections in order. Two Pointers before Sliding Window. Sliding Window before Hash Map. The patterns build on each other.",
          ],
        },
      },
      {
        id: "how-arrays-work",
        label: "How Arrays work",
        type: "concept",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 1,
        content: {
          pageTitle: "How Arrays work",
          subtitle:
            "What is actually happening in memory when you use an array.",
          subsections: [
            {
              subheading: "What an array is",
              bodyText:
                "An array is a collection of elements stored in contiguous (back-to-back) memory locations. Every element sits right next to the previous one in memory, and every element takes the same amount of space.\n\nBecause elements are evenly spaced, the computer can calculate the exact memory address of any element in one step using its index. This is why reading or writing any element by index is instant regardless of array size.",
              tableData: null,
              codeBlocks: [],
              sortOrder: 0,
            },
            {
              subheading: "Time complexity of common operations",
              bodyText:
                "The key insight: random access (read/write by index) is O(1). Shifting elements is O(n). This shapes how you think about every array problem.",
              tableData: [
                { isHeader: true, cells: ["Operation", "Time", "Why"] },
                {
                  isHeader: false,
                  cells: ["Read arr[i]", "O(1)", "Direct memory address"],
                },
                {
                  isHeader: false,
                  cells: ["Write arr[i] = x", "O(1)", "Direct address"],
                },
                {
                  isHeader: false,
                  cells: [
                    "Search (unsorted)",
                    "O(n)",
                    "Must check every element",
                  ],
                },
                {
                  isHeader: false,
                  cells: ["Insert at end", "O(1)", "Place at next position"],
                },
                {
                  isHeader: false,
                  cells: [
                    "Insert in middle",
                    "O(n)",
                    "Must shift elements after",
                  ],
                },
                {
                  isHeader: false,
                  cells: ["Delete from end", "O(1)", "Just reduce length"],
                },
                {
                  isHeader: false,
                  cells: [
                    "Delete from middle",
                    "O(n)",
                    "Must shift elements after",
                  ],
                },
              ],
              codeBlocks: [],
              sortOrder: 1,
            },
            {
              subheading: "In-place vs extra space",
              bodyText:
                "Many array problems say do it in-place or without using extra space. This means you cannot create a new array of the same size. You must modify the given array directly using only index swaps and pointer movement.\n\nThis restriction forces you to think about rearranging elements in the original array. Two Pointers is the most common tool for in-place manipulation.",
              tableData: null,
              codeBlocks: [],
              sortOrder: 2,
            },
          ],
        },
      },
      {
        id: null,
        label: null,
        type: null,
        isDivider: true,
        dividerLabel: "Patterns",
        sortOrder: 2,
        content: null,
      },
      {
        id: "two-pointers",
        label: "Two pointers",
        type: "pattern",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 3,
        content: {
          pageTitle: "Two pointers",
          subtitle: "Pattern 1 of 5 · Easy to Medium · 25 minutes",
          whatIsIt:
            "Two pointers means using two index variables and moving them based on a condition. Instead of a nested loop checking every pair, you use two positions and move them intelligently. This turns O(n²) problems into O(n).\n\nInward: L starts at 0, R at the last index, they move toward each other. Used for sorted array pair problems.\n\nSlow-fast: both start at 0, fast moves every step, slow moves only when a valid element is found. Used for in-place rearrangement.",
          triggerPhrases: [
            "in-place",
            "sorted array + find pair",
            "without extra space",
            "remove or move elements",
            "partition elements",
          ],
          whenNotToUse:
            "Do not use when you need instant value lookups (use hash map). Do not use when you need to track a subarray of variable length (use sliding window).",
          codeTemplates: [
            {
              language: "pseudocode",
              label: "Inward",
              code: "L = 0\nR = length - 1\nwhile L < R:\n  if condition to move L:\n    L += 1\n  elif condition to move R:\n    R -= 1\n  else:\n    answer found",
              sortOrder: 0,
            },
            {
              language: "python",
              label: "Slow-fast",
              code: "slow = 0\nfor fast in range(len(arr)):\n    if arr[fast] != 0:\n        arr[slow], arr[fast] = arr[fast], arr[slow]\n        slow += 1",
              sortOrder: 1,
            },
          ],
          visualAscii:
            "INWARD:\n[ 1 ][ 3 ][ 5 ][ 7 ][ 9 ]\n  ↑                   ↑\n  L                   R\n\nSLOW-FAST:\n[ 0 ][ 1 ][ 0 ][ 3 ][ 12 ]\n  ↑\n slow=0   fast scans right, swaps non-zeros to slow",
          workedExample: {
            problemTitle: "Move Zeroes",
            problemStatement:
              "Given an array, move all 0s to the end while keeping the relative order of non-zero elements. Do it in-place.",
            inputExample: "[0, 1, 0, 3, 12]",
            outputExample: "[1, 3, 12, 0, 0]",
            bruteForceDesc:
              "Build a new array. Copy all non-zeros first, then fill remaining spots with zeros. Works but uses O(n) extra space. The problem says in-place.",
            keyInsight:
              "Use a slow pointer marking where the next non-zero element should be placed. Fast scans every element. When fast finds a non-zero, swap it to where slow points and advance slow. One pass, zero extra space.",
            dryRunSteps: [
              {
                stepNumber: 1,
                description: "slow=0, fast=0: arr[0]=0. Zero, skip.",
                arrayState: "[0,1,0,3,12]",
                pointerState: "slow=0,fast=0",
                stateLabel: null,
                isSolutionFound: false,
                highlightedIndexes: [0],
                foundIndexes: [],
              },
              {
                stepNumber: 2,
                description:
                  "slow=0, fast=1: arr[1]=1. Non-zero! Swap index 0 and 1. slow→1.",
                arrayState: "[1,0,0,3,12]",
                pointerState: "slow=1,fast=1",
                stateLabel: null,
                isSolutionFound: false,
                highlightedIndexes: [1],
                foundIndexes: [0],
              },
              {
                stepNumber: 3,
                description:
                  "slow=1, fast=3: arr[3]=3. Non-zero! Swap index 1 and 3. slow→2.",
                arrayState: "[1,3,0,0,12]",
                pointerState: "slow=2,fast=3",
                stateLabel: null,
                isSolutionFound: false,
                highlightedIndexes: [3],
                foundIndexes: [0, 1],
              },
              {
                stepNumber: 4,
                description:
                  "slow=2, fast=4: arr[4]=12. Non-zero! Swap index 2 and 4. Done.",
                arrayState: "[1,3,12,0,0]",
                pointerState: "slow=3,fast=4",
                stateLabel: null,
                isSolutionFound: true,
                highlightedIndexes: [4],
                foundIndexes: [0, 1, 2],
              },
            ],
            solutionCode: [
              {
                language: "python",
                code: "def moveZeroes(nums):\n    slow = 0\n    for fast in range(len(nums)):\n        if nums[fast] != 0:\n            nums[slow], nums[fast] = nums[fast], nums[slow]\n            slow += 1",
              },
              {
                language: "java",
                code: "public void moveZeroes(int[] nums) {\n    int slow = 0;\n    for (int fast = 0; fast < nums.length; fast++) {\n        if (nums[fast] != 0) {\n            int temp = nums[slow];\n            nums[slow] = nums[fast];\n            nums[fast] = temp;\n            slow++;\n        }\n    }\n}",
              },
              {
                language: "cpp",
                code: "void moveZeroes(vector<int>& nums) {\n    int slow = 0;\n    for (int fast = 0; fast < nums.size(); fast++) {\n        if (nums[fast] != 0) {\n            swap(nums[slow], nums[fast]);\n            slow++;\n        }\n    }\n}",
              },
              {
                language: "javascript",
                code: "var moveZeroes = function(nums) {\n    let slow = 0;\n    for (let fast = 0; fast < nums.length; fast++) {\n        if (nums[fast] !== 0) {\n            [nums[slow], nums[fast]] = [nums[fast], nums[slow]];\n            slow++;\n        }\n    }\n};",
              },
            ],
            timeComplexity: "O(n)",
            timeReason: "One pass through the array with the fast pointer.",
            spaceComplexity: "O(1)",
            spaceReason: "In-place, only two index variables.",
            coreTrick:
              "slow marks the write position. fast finds what to write. Only slow advances when a valid element is placed.",
            leetcodeUrl: "https://leetcode.com/problems/move-zeroes/",
            youtubeSearch: "Move Zeroes LeetCode solution explained",
          },
          practiceQuestions: [
            {
              name: "Remove Duplicates from Sorted Array",
              difficulty: "Easy",
              hint: "Slow-fast. Array is sorted so duplicates are adjacent. Slow marks where the next unique value goes. When does fast find something new enough to write?",
              leetcodeUrl:
                "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
              youtubeSearch: "Remove Duplicates Sorted Array LeetCode",
              sortOrder: 0,
            },
            {
              name: "Remove Element",
              difficulty: "Easy",
              hint: "Identical to Move Zeroes. When fast finds an element that is NOT the value to remove, write it at slow and advance slow.",
              leetcodeUrl: "https://leetcode.com/problems/remove-element/",
              youtubeSearch: "Remove Element LeetCode solution",
              sortOrder: 1,
            },
            {
              name: "Sort Colors",
              difficulty: "Medium",
              hint: "Three pointers: low, mid, high. When mid sees 0 swap with low. When mid sees 2 swap with high but do not advance mid.",
              leetcodeUrl: "https://leetcode.com/problems/sort-colors/",
              youtubeSearch: "Sort Colors Dutch National Flag LeetCode",
              sortOrder: 2,
            },
            {
              name: "Two Sum II",
              difficulty: "Medium",
              hint: "Inward two pointer. Array is sorted. If sum is too big R moves left. If too small L moves right.",
              leetcodeUrl:
                "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
              youtubeSearch: "Two Sum II sorted array LeetCode",
              sortOrder: 3,
            },
            {
              name: "Rotate Array",
              difficulty: "Medium",
              hint: "Three reversals. Reverse whole array. Reverse first k. Reverse the rest. Inward two-pointer is your reverse tool.",
              leetcodeUrl: "https://leetcode.com/problems/rotate-array/",
              youtubeSearch: "Rotate Array reverse approach LeetCode",
              sortOrder: 4,
            },
          ],
        },
      },
      {
        id: "sliding-window",
        label: "Sliding window",
        type: "pattern",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 4,
        content: {
          pageTitle: "Sliding window",
          subtitle: "Pattern 2 of 5 · Easy to Medium · 25 minutes",
          whatIsIt:
            "A sliding window is a subarray that moves across the array left to right. You maintain a property of the window and update it as elements enter and leave, instead of recomputing from scratch. This turns O(n × k) into O(n).\n\nFixed-size: window always has exactly k elements.\nVariable-size: window grows and shrinks based on a condition.",
          triggerPhrases: [
            "subarray with a property",
            "contiguous elements",
            "maximum or minimum subarray",
            "fixed window of size k",
            "longest or shortest subarray",
          ],
          whenNotToUse:
            "Elements must be contiguous. If gaps are allowed, sliding window does not apply. If looking for a pair not a range, two pointers is more appropriate.",
          codeTemplates: [
            {
              language: "python" as const,
              label: "Fixed-size window",
              code: "window_sum = sum(arr[:k])\nmax_sum = window_sum\nfor i in range(k, len(arr)):\n    window_sum += arr[i]\n    window_sum -= arr[i - k]\n    max_sum = max(max_sum, window_sum)\nreturn max_sum",
              sortOrder: 0,
            },
            {
              language: "python" as const,
              label: "Variable-size window",
              code: "L = 0\nwindow_sum = 0\nresult = 0\nfor R in range(len(arr)):\n    window_sum += arr[R]\n    while window_sum > target:\n        window_sum -= arr[L]\n        L += 1\n    result = max(result, R - L + 1)\nreturn result",
              sortOrder: 1,
            },
          ],
          visualAscii:
            "Fixed window k=3 on [2, 1, 5, 1, 3, 2]:\n[2,1,5] sum=8\n[1,5,1] sum=7\n[5,1,3] sum=9 ← max\n[1,3,2] sum=6",
          workedExample: {
            problemTitle: "Maximum Average Subarray I",
            problemStatement:
              "Find the maximum average of any contiguous subarray of length exactly k.",
            inputExample: "arr = [1, 12, -5, -6, 50, 3], k = 4",
            outputExample: "12.75",
            bruteForceDesc:
              "For every starting index i, sum k elements from i to i+k-1 and track the maximum. O(n × k).",
            keyInsight:
              "Sum of next window = sum of current window + new right element - old left element. Two operations per step instead of k additions.",
            dryRunSteps: [
              {
                stepNumber: 1,
                description: "First window [0..3]: 1+12+(-5)+(-6)=2. max=2",
                arrayState: "[1,12,-5,-6,50,3]",
                pointerState: "window=[0..3]",
                stateLabel: "sum=2",
                isSolutionFound: false,
                highlightedIndexes: [0, 1, 2, 3],
                foundIndexes: [],
              },
              {
                stepNumber: 2,
                description: "i=4: add 50, remove 1. sum=2+50-1=51. max=51",
                arrayState: "[1,12,-5,-6,50,3]",
                pointerState: "window=[1..4]",
                stateLabel: "sum=51",
                isSolutionFound: false,
                highlightedIndexes: [1, 2, 3, 4],
                foundIndexes: [],
              },
              {
                stepNumber: 3,
                description:
                  "i=5: add 3, remove 12. sum=42. max stays 51. Answer=51/4=12.75",
                arrayState: "[1,12,-5,-6,50,3]",
                pointerState: "window=[2..5]",
                stateLabel: "sum=42",
                isSolutionFound: true,
                highlightedIndexes: [2, 3, 4, 5],
                foundIndexes: [1, 2, 3, 4],
              },
            ],
            solutionCode: [
              {
                language: "python" as const,
                code: "def findMaxAverage(nums, k):\n    window_sum = sum(nums[:k])\n    max_sum = window_sum\n    for i in range(k, len(nums)):\n        window_sum += nums[i]\n        window_sum -= nums[i - k]\n        max_sum = max(max_sum, window_sum)\n    return max_sum / k",
              },
              {
                language: "java" as const,
                code: "public double findMaxAverage(int[] nums, int k) {\n    int windowSum = 0;\n    for (int i = 0; i < k; i++) windowSum += nums[i];\n    int maxSum = windowSum;\n    for (int i = k; i < nums.length; i++) {\n        windowSum += nums[i] - nums[i - k];\n        maxSum = Math.max(maxSum, windowSum);\n    }\n    return (double) maxSum / k;\n}",
              },
            ],
            timeComplexity: "O(n)",
            timeReason: "One pass after building the first window.",
            spaceComplexity: "O(1)",
            spaceReason: "Only storing the running sum.",
            coreTrick:
              "Add right, subtract left. Never recompute the whole window sum.",
            leetcodeUrl:
              "https://leetcode.com/problems/maximum-average-subarray-i/",
            youtubeSearch: "Maximum Average Subarray LeetCode solution",
          },
          practiceQuestions: [
            {
              name: "Max Consecutive Ones III",
              difficulty: "Medium",
              hint: "Count zeros in window. When zeros exceed k, shrink from left until a zero is removed.",
              leetcodeUrl:
                "https://leetcode.com/problems/max-consecutive-ones-iii/",
              youtubeSearch: "Max Consecutive Ones III LeetCode sliding window",
              sortOrder: 0,
            },
            {
              name: "Minimum Size Subarray Sum",
              difficulty: "Medium",
              hint: "Expand right until sum >= target. Then shrink left while still >= target recording size. Want minimum.",
              leetcodeUrl:
                "https://leetcode.com/problems/minimum-size-subarray-sum/",
              youtubeSearch: "Minimum Size Subarray Sum LeetCode",
              sortOrder: 1,
            },
            {
              name: "Contains Duplicate II",
              difficulty: "Easy",
              hint: "Fixed window of size k+1. Maintain a set. Before adding new element check if it exists already.",
              leetcodeUrl:
                "https://leetcode.com/problems/contains-duplicate-ii/",
              youtubeSearch: "Contains Duplicate II LeetCode",
              sortOrder: 2,
            },
            {
              name: "Longest Subarray of 1s After Deleting One Element",
              difficulty: "Medium",
              hint: "Max Consecutive Ones III with k=1. Window size minus 1 is the answer.",
              leetcodeUrl:
                "https://leetcode.com/problems/longest-subarray-of-1s-after-deleting-one-element/",
              youtubeSearch: "Longest Subarray 1s After Deleting LeetCode",
              sortOrder: 3,
            },
          ],
        },
      },
      {
        id: "hash-map",
        label: "Hash map",
        type: "pattern",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 5,
        content: {
          pageTitle: "Hash map",
          subtitle: "Pattern 3 of 5 · Easy to Medium · 25 minutes",
          whatIsIt:
            "A hash map stores key-value pairs with O(1) average lookup. In array problems, you use it to remember things already seen. Instead of scanning backward (O(n)), you look it up in O(1). Trade-off: O(n) extra space buys O(n) time instead of O(n²).",
          triggerPhrases: [
            "find two elements summing to target",
            "count how many times each value appears",
            "check if seen before",
            "group elements by property",
          ],
          whenNotToUse:
            "If array is sorted and you need a pair, two pointers is O(1) space. Use hash map when unsorted or when sorting would destroy original indexes.",
          codeTemplates: [
            {
              language: "python" as const,
              label: "Complement lookup",
              code: "seen = {}\nfor i, num in enumerate(arr):\n    comp = target - num\n    if comp in seen:\n        return [seen[comp], i]\n    seen[num] = i  # store AFTER checking\nreturn []",
              sortOrder: 0,
            },
            {
              language: "python" as const,
              label: "Frequency count",
              code: "freq = {}\nfor num in arr:\n    freq[num] = freq.get(num, 0) + 1\nreturn freq",
              sortOrder: 1,
            },
          ],
          visualAscii:
            "arr=[2,7,11,15], target=9\n\ni=0: num=2. comp=7. seen={}. Not found. Store {2:0}\ni=1: num=7. comp=2. seen={2:0}. FOUND at index 0!\n     Return [0,1] ✓",
          workedExample: {
            problemTitle: "Two Sum",
            problemStatement:
              "Given an array and a target, return the indexes of the two numbers that add up to the target.",
            inputExample: "nums = [2, 7, 11, 15], target = 9",
            outputExample: "[0, 1]",
            bruteForceDesc:
              "Check every pair. For each i, scan every j after i. O(n²).",
            keyInsight:
              "For every number, you need exactly one other: target minus current. Check if that complement was already stored. Store AFTER checking to avoid using the same index twice.",
            dryRunSteps: [
              {
                stepNumber: 1,
                description: "i=0, num=2. comp=7. Not in seen. Store {2:0}.",
                arrayState: "[2,7,11,15]",
                pointerState: "i=0",
                stateLabel: "seen={2:0}",
                isSolutionFound: false,
                highlightedIndexes: [0],
                foundIndexes: [],
              },
              {
                stepNumber: 2,
                description:
                  "i=1, num=7. comp=2. FOUND in seen at index 0. Return [0,1].",
                arrayState: "[2,7,11,15]",
                pointerState: "i=1",
                stateLabel: "FOUND!",
                isSolutionFound: true,
                highlightedIndexes: [1],
                foundIndexes: [0, 1],
              },
            ],
            solutionCode: [
              {
                language: "python" as const,
                code: "def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in seen:\n            return [seen[comp], i]\n        seen[num] = i\n    return []",
              },
              {
                language: "java" as const,
                code: "public int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> seen = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int comp = target - nums[i];\n        if (seen.containsKey(comp))\n            return new int[]{seen.get(comp), i};\n        seen.put(nums[i], i);\n    }\n    return new int[]{};\n}",
              },
              {
                language: "cpp" as const,
                code: "vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int,int> seen;\n    for (int i = 0; i < nums.size(); i++) {\n        int comp = target - nums[i];\n        if (seen.count(comp)) return {seen[comp], i};\n        seen[nums[i]] = i;\n    }\n    return {};\n}",
              },
            ],
            timeComplexity: "O(n)",
            timeReason: "One pass, each lookup and insert is O(1).",
            spaceComplexity: "O(n)",
            spaceReason:
              "Worst case store every element before finding answer.",
            coreTrick:
              "complement = target - current. Check before inserting. Store index as value, number as key.",
            leetcodeUrl: "https://leetcode.com/problems/two-sum/",
            youtubeSearch: "Two Sum LeetCode hash map solution",
          },
          practiceQuestions: [
            {
              name: "Single Number",
              difficulty: "Easy",
              hint: "Frequency map then find key with count 1. Also solvable with XOR in O(1) space.",
              leetcodeUrl: "https://leetcode.com/problems/single-number/",
              youtubeSearch: "Single Number LeetCode XOR",
              sortOrder: 0,
            },
            {
              name: "Contains Duplicate",
              difficulty: "Easy",
              hint: "Add to a set as you walk. Before adding check if it already exists.",
              leetcodeUrl: "https://leetcode.com/problems/contains-duplicate/",
              youtubeSearch: "Contains Duplicate LeetCode",
              sortOrder: 1,
            },
            {
              name: "Majority Element",
              difficulty: "Easy",
              hint: "Frequency map return key with count > n/2. Boyer-Moore solves in O(1) space.",
              leetcodeUrl: "https://leetcode.com/problems/majority-element/",
              youtubeSearch: "Majority Element LeetCode Boyer Moore",
              sortOrder: 2,
            },
            {
              name: "Longest Consecutive Sequence",
              difficulty: "Medium",
              hint: "Put all in a set. For each n where n-1 is NOT in the set, count forward. O(n) total.",
              leetcodeUrl:
                "https://leetcode.com/problems/longest-consecutive-sequence/",
              youtubeSearch: "Longest Consecutive Sequence LeetCode",
              sortOrder: 3,
            },
          ],
        },
      },
      {
        id: "prefix-sum",
        label: "Prefix sum",
        type: "pattern",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 6,
        content: {
          pageTitle: "Prefix sum",
          subtitle: "Pattern 4 of 5 · Medium · 20 minutes",
          whatIsIt:
            "A prefix sum array stores the cumulative sum up to each index. Once built, find the sum of any subarray in O(1): sum(L to R) = prefix[R+1] - prefix[L].",
          triggerPhrases: [
            "sum between index i and j",
            "number of subarrays with sum k",
            "range sum query",
            "cumulative sum",
          ],
          whenNotToUse:
            "When you only need the sum of one subarray once, just loop. Prefix sum pays off when many range queries are needed.",
          codeTemplates: [
            {
              language: "python" as const,
              label: "Build prefix sum",
              code: "n = len(arr)\nprefix = [0] * (n + 1)\nfor i in range(n):\n    prefix[i + 1] = prefix[i] + arr[i]\n# sum(L to R) = prefix[R+1] - prefix[L]",
              sortOrder: 0,
            },
            {
              language: "python" as const,
              label: "Count subarrays sum = k",
              code: "count = 0\nprefix_sum = 0\nseen = {0: 1}\nfor num in nums:\n    prefix_sum += num\n    count += seen.get(prefix_sum - k, 0)\n    seen[prefix_sum] = seen.get(prefix_sum, 0) + 1\nreturn count",
              sortOrder: 1,
            },
          ],
          visualAscii:
            "arr =    [3,  1,  4,  1,  5,  9]\nprefix = [0,  3,  4,  8,  9, 14, 23]\n\nSum index 2 to 4:\n  prefix[5] - prefix[2] = 14 - 4 = 10 ✓",
          workedExample: {
            problemTitle: "Subarray Sum Equals K",
            problemStatement:
              "Return the total number of subarrays whose sum equals k.",
            inputExample: "nums = [1, 1, 1], k = 2",
            outputExample: "2",
            bruteForceDesc:
              "For every pair (i,j), sum elements and check. O(n²) or O(n³).",
            keyInsight:
              "If current prefix sum is P and (P - k) was seen earlier, the subarray between has sum k. Start map with {0:1} to handle subarrays from index 0.",
            dryRunSteps: [
              {
                stepNumber: 1,
                description:
                  "num=1. prefix=1. Need -1. Not found. seen={0:1,1:1}. count=0",
                arrayState: "[1,1,1]",
                pointerState: "i=0",
                stateLabel: "seen={0:1,1:1}",
                isSolutionFound: false,
                highlightedIndexes: [0],
                foundIndexes: [],
              },
              {
                stepNumber: 2,
                description: "num=1. prefix=2. Need 0. Found 1 time. count=1.",
                arrayState: "[1,1,1]",
                pointerState: "i=1",
                stateLabel: "count=1",
                isSolutionFound: false,
                highlightedIndexes: [1],
                foundIndexes: [],
              },
              {
                stepNumber: 3,
                description:
                  "num=1. prefix=3. Need 1. Found 1 time. count=2. Return 2.",
                arrayState: "[1,1,1]",
                pointerState: "i=2",
                stateLabel: "count=2",
                isSolutionFound: true,
                highlightedIndexes: [2],
                foundIndexes: [],
              },
            ],
            solutionCode: [
              {
                language: "python" as const,
                code: "def subarraySum(nums, k):\n    count = 0\n    prefix_sum = 0\n    seen = {0: 1}\n    for num in nums:\n        prefix_sum += num\n        count += seen.get(prefix_sum - k, 0)\n        seen[prefix_sum] = seen.get(prefix_sum, 0) + 1\n    return count",
              },
              {
                language: "java" as const,
                code: "public int subarraySum(int[] nums, int k) {\n    int count = 0, sum = 0;\n    Map<Integer,Integer> seen = new HashMap<>();\n    seen.put(0, 1);\n    for (int num : nums) {\n        sum += num;\n        count += seen.getOrDefault(sum - k, 0);\n        seen.put(sum, seen.getOrDefault(sum, 0) + 1);\n    }\n    return count;\n}",
              },
            ],
            timeComplexity: "O(n)",
            timeReason: "One pass, O(1) hash map operations.",
            spaceComplexity: "O(n)",
            spaceReason: "Map stores at most n distinct prefix sums.",
            coreTrick:
              "If prefix sum is P and (P-k) was seen before, valid subarray ends here. Start map with {0:1}.",
            leetcodeUrl: "https://leetcode.com/problems/subarray-sum-equals-k/",
            youtubeSearch: "Subarray Sum Equals K LeetCode prefix sum",
          },
          practiceQuestions: [
            {
              name: "Range Sum Query — Immutable",
              difficulty: "Easy",
              hint: "Build prefix once. Answer each query as prefix[R+1] - prefix[L] in O(1).",
              leetcodeUrl:
                "https://leetcode.com/problems/range-sum-query-immutable/",
              youtubeSearch: "Range Sum Query LeetCode prefix sum",
              sortOrder: 0,
            },
            {
              name: "Find Pivot Index",
              difficulty: "Easy",
              hint: "Total sum first. At each index right_sum = total - left_sum - arr[i]. Check if left equals right.",
              leetcodeUrl: "https://leetcode.com/problems/find-pivot-index/",
              youtubeSearch: "Find Pivot Index LeetCode",
              sortOrder: 1,
            },
            {
              name: "Product of Array Except Self",
              difficulty: "Medium",
              hint: "Prefix product left to right, suffix product right to left, multiply. No division.",
              leetcodeUrl:
                "https://leetcode.com/problems/product-of-array-except-self/",
              youtubeSearch: "Product Array Except Self LeetCode",
              sortOrder: 2,
            },
            {
              name: "Contiguous Array",
              difficulty: "Medium",
              hint: "Replace 0 with -1. Find longest subarray with sum 0 using prefix sum map.",
              leetcodeUrl: "https://leetcode.com/problems/contiguous-array/",
              youtubeSearch: "Contiguous Array LeetCode prefix sum",
              sortOrder: 3,
            },
          ],
        },
      },
      {
        id: "kadanes",
        label: "Kadane's algorithm",
        type: "pattern",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 7,
        content: {
          pageTitle: "Kadane's algorithm",
          subtitle: "Pattern 5 of 5 · Medium · 20 minutes",
          whatIsIt:
            "Kadane's finds the maximum sum of any contiguous subarray in O(n). At every index, decide: extend the previous subarray or start fresh. If the running sum went negative, starting fresh always wins.",
          triggerPhrases: [
            "maximum subarray sum",
            "maximum product subarray",
            "best time to buy and sell stock",
            "running total reset on negative",
          ],
          whenNotToUse:
            "When you need actual subarray indexes not just the sum. When elements wrap around (use circular variant). When looking at non-contiguous elements.",
          codeTemplates: [
            {
              language: "python" as const,
              label: "Classic Kadane's",
              code: "current = arr[0]\nbest = arr[0]\nfor i in range(1, len(arr)):\n    current = max(arr[i], current + arr[i])\n    best = max(best, current)\nreturn best",
              sortOrder: 0,
            },
          ],
          visualAscii:
            "arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\ncurr: -2   1  -2   4   3   5   6   1   5\nbest: -2   1   1   4   4   5   6   6   6\n\nAt i=3: max(4,-2+4)=4. Start fresh.\nAnswer: 6 (subarray [4,-1,2,1])",
          workedExample: {
            problemTitle: "Maximum Subarray",
            problemStatement:
              "Find the contiguous subarray with the largest sum and return that sum.",
            inputExample: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
            outputExample: "6",
            bruteForceDesc:
              "Try every subarray. For every pair (i,j) sum elements. O(n²) or O(n³).",
            keyInsight:
              "At each position, extend the best subarray ending just before you, or start fresh. If extending produces a smaller sum than starting fresh, the previous was a net negative.",
            dryRunSteps: [
              {
                stepNumber: 1,
                description: "i=0: current=-2, best=-2",
                arrayState: "[-2,1,-3,4,-1,2,1,-5,4]",
                pointerState: "i=0",
                stateLabel: "cur=-2,best=-2",
                isSolutionFound: false,
                highlightedIndexes: [0],
                foundIndexes: [],
              },
              {
                stepNumber: 2,
                description: "i=1: max(1,-2+1)=1. Start fresh. best=1",
                arrayState: "[-2,1,-3,4,-1,2,1,-5,4]",
                pointerState: "i=1",
                stateLabel: "cur=1,best=1",
                isSolutionFound: false,
                highlightedIndexes: [1],
                foundIndexes: [],
              },
              {
                stepNumber: 3,
                description: "i=3: max(4,-2+4)=4. Start fresh. best=4",
                arrayState: "[-2,1,-3,4,-1,2,1,-5,4]",
                pointerState: "i=3",
                stateLabel: "cur=4,best=4",
                isSolutionFound: false,
                highlightedIndexes: [3],
                foundIndexes: [],
              },
              {
                stepNumber: 4,
                description: "i=6: max(1,5+1)=6. Extend. best=6. Final answer.",
                arrayState: "[-2,1,-3,4,-1,2,1,-5,4]",
                pointerState: "i=6",
                stateLabel: "cur=6,best=6",
                isSolutionFound: true,
                highlightedIndexes: [3, 4, 5, 6],
                foundIndexes: [3, 4, 5, 6],
              },
            ],
            solutionCode: [
              {
                language: "python" as const,
                code: "def maxSubArray(nums):\n    current = nums[0]\n    best = nums[0]\n    for i in range(1, len(nums)):\n        current = max(nums[i], current + nums[i])\n        best = max(best, current)\n    return best",
              },
              {
                language: "java" as const,
                code: "public int maxSubArray(int[] nums) {\n    int current = nums[0], best = nums[0];\n    for (int i = 1; i < nums.length; i++) {\n        current = Math.max(nums[i], current + nums[i]);\n        best = Math.max(best, current);\n    }\n    return best;\n}",
              },
            ],
            timeComplexity: "O(n)",
            timeReason: "One pass.",
            spaceComplexity: "O(1)",
            spaceReason: "Two variables only.",
            coreTrick:
              "current = max(arr[i], current + arr[i]). If running sum went negative, start fresh.",
            leetcodeUrl: "https://leetcode.com/problems/maximum-subarray/",
            youtubeSearch: "Maximum Subarray Kadane Algorithm LeetCode",
          },
          practiceQuestions: [
            {
              name: "Best Time to Buy and Sell Stock",
              difficulty: "Easy",
              hint: "Track min price seen. Profit today = current - min. Track best profit. Kadane's in disguise.",
              leetcodeUrl:
                "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
              youtubeSearch: "Best Time Buy Sell Stock LeetCode",
              sortOrder: 0,
            },
            {
              name: "Maximum Product Subarray",
              difficulty: "Medium",
              hint: "Track both max AND min. Negative × negative = positive. new_max = max(arr[i], max×arr[i], min×arr[i]).",
              leetcodeUrl:
                "https://leetcode.com/problems/maximum-product-subarray/",
              youtubeSearch: "Maximum Product Subarray LeetCode",
              sortOrder: 1,
            },
            {
              name: "Maximum Sum Circular Subarray",
              difficulty: "Medium",
              hint: "Two cases: no wrap (standard Kadane) or wrap (total - min subarray). max(kadane_max, total - kadane_min).",
              leetcodeUrl:
                "https://leetcode.com/problems/maximum-sum-circular-subarray/",
              youtubeSearch: "Maximum Sum Circular Subarray LeetCode",
              sortOrder: 2,
            },
          ],
        },
      },
      {
        id: null,
        label: null,
        type: null,
        isDivider: true,
        dividerLabel: null,
        sortOrder: 8,
        content: null,
      },
      {
        id: "cheat-sheet",
        label: "Cheat sheet",
        type: "cheatsheet",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 9,
        content: {
          pageTitle: "Quick reference",
          subtitle: "All 5 array patterns at a glance",
          patternRows: [
            {
              patternName: "Two pointers",
              triggerWords: "in-place, sorted+pair, remove/move",
              timeComplexity: "O(n)",
              spaceComplexity: "O(1)",
              coreTrick: "slow marks write position, fast finds what to write",
              sortOrder: 0,
            },
            {
              patternName: "Sliding window",
              triggerWords: "subarray, contiguous, max/min window",
              timeComplexity: "O(n)",
              spaceComplexity: "O(1)",
              coreTrick: "add right, subtract left, never restart",
              sortOrder: 1,
            },
            {
              patternName: "Hash map",
              triggerWords: "find complement, count frequency, seen before",
              timeComplexity: "O(n)",
              spaceComplexity: "O(n)",
              coreTrick: "store what you have seen, look it up in O(1)",
              sortOrder: 2,
            },
            {
              patternName: "Prefix sum",
              triggerWords: "range sum, subarray sum equals k",
              timeComplexity: "O(n) build, O(1) query",
              spaceComplexity: "O(n)",
              coreTrick: "prefix[R+1] - prefix[L] gives any range sum",
              sortOrder: 3,
            },
            {
              patternName: "Kadane's",
              triggerWords: "max subarray, running total, reset on negative",
              timeComplexity: "O(n)",
              spaceComplexity: "O(1)",
              coreTrick: "if running sum went negative, start fresh",
              sortOrder: 4,
            },
          ],
          decisionGuide:
            "Problem says in-place AND you rearrange elements → Two pointers (slow-fast)\nSorted array AND find a pair → Two pointers (inward)\nSubarray fixed length k → Sliding window (fixed)\nLongest/shortest subarray with condition → Sliding window (variable)\nFind two elements summing to target unsorted → Hash map\nCount frequencies, duplicates, group → Hash map\nSum of a range or count subarrays sum=k → Prefix sum\nMax/min sum contiguous subarray → Kadane's",
          questionGroups: [
            {
              groupName: "Two pointers",
              sortOrder: 0,
              questions: [
                {
                  name: "Move Zeroes",
                  difficulty: "Easy",
                  leetcodeUrl: "https://leetcode.com/problems/move-zeroes/",
                },
                {
                  name: "Remove Duplicates from Sorted Array",
                  difficulty: "Easy",
                  leetcodeUrl:
                    "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
                },
                {
                  name: "Sort Colors",
                  difficulty: "Medium",
                  leetcodeUrl: "https://leetcode.com/problems/sort-colors/",
                },
                {
                  name: "Two Sum II",
                  difficulty: "Medium",
                  leetcodeUrl:
                    "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
                },
                {
                  name: "Rotate Array",
                  difficulty: "Medium",
                  leetcodeUrl: "https://leetcode.com/problems/rotate-array/",
                },
              ],
            },
            {
              groupName: "Sliding window",
              sortOrder: 1,
              questions: [
                {
                  name: "Maximum Average Subarray I",
                  difficulty: "Easy",
                  leetcodeUrl:
                    "https://leetcode.com/problems/maximum-average-subarray-i/",
                },
                {
                  name: "Max Consecutive Ones III",
                  difficulty: "Medium",
                  leetcodeUrl:
                    "https://leetcode.com/problems/max-consecutive-ones-iii/",
                },
                {
                  name: "Minimum Size Subarray Sum",
                  difficulty: "Medium",
                  leetcodeUrl:
                    "https://leetcode.com/problems/minimum-size-subarray-sum/",
                },
              ],
            },
            {
              groupName: "Hash map",
              sortOrder: 2,
              questions: [
                {
                  name: "Two Sum",
                  difficulty: "Easy",
                  leetcodeUrl: "https://leetcode.com/problems/two-sum/",
                },
                {
                  name: "Single Number",
                  difficulty: "Easy",
                  leetcodeUrl: "https://leetcode.com/problems/single-number/",
                },
                {
                  name: "Longest Consecutive Sequence",
                  difficulty: "Medium",
                  leetcodeUrl:
                    "https://leetcode.com/problems/longest-consecutive-sequence/",
                },
              ],
            },
            {
              groupName: "Prefix sum",
              sortOrder: 3,
              questions: [
                {
                  name: "Range Sum Query Immutable",
                  difficulty: "Easy",
                  leetcodeUrl:
                    "https://leetcode.com/problems/range-sum-query-immutable/",
                },
                {
                  name: "Subarray Sum Equals K",
                  difficulty: "Medium",
                  leetcodeUrl:
                    "https://leetcode.com/problems/subarray-sum-equals-k/",
                },
                {
                  name: "Product of Array Except Self",
                  difficulty: "Medium",
                  leetcodeUrl:
                    "https://leetcode.com/problems/product-of-array-except-self/",
                },
              ],
            },
            {
              groupName: "Kadane's",
              sortOrder: 4,
              questions: [
                {
                  name: "Maximum Subarray",
                  difficulty: "Medium",
                  leetcodeUrl:
                    "https://leetcode.com/problems/maximum-subarray/",
                },
                {
                  name: "Best Time to Buy and Sell Stock",
                  difficulty: "Easy",
                  leetcodeUrl:
                    "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
                },
                {
                  name: "Maximum Product Subarray",
                  difficulty: "Medium",
                  leetcodeUrl:
                    "https://leetcode.com/problems/maximum-product-subarray/",
                },
              ],
            },
          ],
          oneThingToRemember: [
            "Two pointers: slow marks write position, fast finds what to write",
            "Sliding window: add right, subtract left, never recompute the whole window",
            "Hash map: store what you have seen so you can look it up in O(1)",
            "Prefix sum: prefix[R+1] minus prefix[L] equals any range sum in O(1)",
            "Kadane's: if current sum went negative, start fresh at current element",
          ],
        },
      },
    ],
  },
  {
    topicId: "STRING",
    title: "Strings",
    hasGuide: true,
    sortOrder: 2,
    sections: [
      {
        id: "before-you-start",
        label: "Before you start",
        type: "intro",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 0,
        content: {
          pageTitle: "Before you start",
          subtitle:
            "Master string manipulation by understanding how they differ from arrays.",
          openingParagraph:
            "In many languages, strings are immutable. This means you can't just change one character. You have to build a new string. Understanding this is key to O(n) solutions.",
          prereqCards: [
            {
              title: "Immutability",
              body: "Know if your language (like Java/Python) allows changing string characters in-place.",
              sortOrder: 0,
            },
            {
              title: "StringBuilder",
              body: "Use specialized classes to efficiently build strings in a loop.",
              sortOrder: 1,
            },
          ],
          callouts: [],
          howToUseHeading: "Strategy",
          howToUseParagraphs: [
            "Focus on frequency counting and two-pointer patterns.",
          ],
        },
      },
      {
        id: "frequency-counting",
        label: "Frequency Counting",
        type: "pattern",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 1,
        content: {
          pageTitle: "Frequency Counting",
          subtitle: "Pattern 1 of 3 · Easy · 15 minutes",
          whatIsIt:
            "Use a hash map or a fixed-size array (of size 26 for alphabets) to store character counts.",
          triggerPhrases: ["anagram", "frequency", "unique characters"],
          whenNotToUse: "When order matters more than frequency.",
          codeTemplates: [
            {
              language: "python" as const,
              label: "Counter",
              code: "counts = {}\nfor char in s:\n    counts[char] = counts.get(char, 0) + 1",
              sortOrder: 0,
            },
          ],
          visualAscii: null,
          workedExample: {
            problemTitle: "Valid Anagram",
            problemStatement:
              "Determine if two strings are anagrams of each other.",
            inputExample: "s = 'anagram', t = 'nagaram'",
            outputExample: "true",
            bruteForceDesc: "Sort both strings and compare.",
            keyInsight:
              "Both strings must have the exact same characters with the same frequencies.",
            dryRunSteps: [],
            solutionCode: [],
            timeComplexity: "O(n)",
            timeReason: "One pass through each string.",
            spaceComplexity: "O(1)",
            spaceReason: "Constant space for 26 alphabets.",
            coreTrick: "counts[char]++ for s, counts[char]-- for t.",
            leetcodeUrl: "https://leetcode.com/problems/valid-anagram/",
            youtubeSearch: "Valid Anagram LeetCode",
          },
          practiceQuestions: [],
        },
      },
    ],
  },
  {
    topicId: "BINARY_SEARCH",
    title: "Binary Search",
    hasGuide: true,
    sortOrder: 3,
    sections: [
      {
        id: "before-you-start",
        label: "Before you start",
        type: "intro",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 0,
        content: {
          pageTitle: "The log(n) Strategy",
          subtitle: "Find anything in a sorted space twice as fast every step.",
          openingParagraph:
            "Binary search isn't just for arrays. It's for any sorted search space. If you can discard half the space at every step, use binary search.",
          prereqCards: [
            {
              title: "Sorted Order",
              body: "Binary search only works if the elements are sorted based on the search condition.",
              sortOrder: 0,
            },
          ],
          callouts: [],
          howToUseHeading: "The Golden Rule",
          howToUseParagraphs: [
            "Always define your boundaries carefully. Use `mid = left + (right - left) // 2` to avoid overflow.",
          ],
        },
      },
      {
        id: "classic-binary-search",
        label: "Classic Search",
        type: "pattern",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 1,
        content: {
          pageTitle: "Binary Search Template",
          subtitle: "Master the basic template · Easy · 10 minutes",
          whatIsIt:
            "Repeatedly divide the search interval in half. Compare target with mid.",
          triggerPhrases: [
            "sorted array",
            "find target",
            "find first/last occurrence",
          ],
          whenNotToUse: "When the array is unsorted.",
          codeTemplates: [
            {
              language: "python" as const,
              label: "Standard Template",
              code: "left, right = 0, len(arr) - 1\nwhile left <= right:\n    mid = left + (right - left) // 2\n    if arr[mid] == target: return mid\n    if arr[mid] < target: left = mid + 1\n    else: right = mid - 1",
              sortOrder: 0,
            },
          ],
          visualAscii: null,
          workedExample: {
            problemTitle: "Binary Search",
            problemStatement:
              "Given a sorted array of integers, find the index of the target.",
            inputExample: "nums = [-1,0,3,5,9,12], target = 9",
            outputExample: "4",
            bruteForceDesc: "Linear search O(n).",
            keyInsight: "Use the sorted property to jump.",
            dryRunSteps: [],
            solutionCode: [],
            timeComplexity: "O(log n)",
            timeReason: "Space reduces by half every step.",
            spaceComplexity: "O(1)",
            spaceReason: "No extra data structures.",
            coreTrick: "left = mid + 1 OR right = mid - 1.",
            leetcodeUrl: "https://leetcode.com/problems/binary-search/",
            youtubeSearch: "Binary Search LeetCode",
          },
          practiceQuestions: [],
        },
      },
    ],
  },
  {
    topicId: "SLIDING_WINDOW",
    title: "Sliding Window",
    hasGuide: true,
    sortOrder: 4,
    sections: [
      {
        id: "before-you-start",
        label: "Before you start",
        type: "intro",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 0,
        content: {
          pageTitle: "Moving Windows",
          subtitle: "Avoid O(n²) by reusing previous work.",
          openingParagraph:
            "Sliding window works on contiguous sequences. Instead of re-calculating the sum of a window from scratch, just add the new element and remove the old one.",
          prereqCards: [
            {
              title: "Contiguous",
              body: "Sliding window only works on subarrays or substrings, not subsequences.",
              sortOrder: 0,
            },
          ],
          callouts: [],
          howToUseHeading: "The Two Types",
          howToUseParagraphs: [
            "Fixed size (window is always k) and Variable size (window expands until condition fails).",
          ],
        },
      },
      {
        id: "fixed-window",
        label: "Fixed Window",
        type: "pattern",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 1,
        content: {
          pageTitle: "Fixed Size Window",
          subtitle: "Pattern 1 of 2 · Easy · 10 minutes",
          whatIsIt: "Maintain a sum or property of exactly K elements.",
          triggerPhrases: [
            "subarray of size k",
            "average of all subarrays",
            "max sum of k elements",
          ],
          whenNotToUse: "When order doesn't matter.",
          codeTemplates: [
            {
              language: "python" as const,
              label: "Fixed Template",
              code: "window_sum = sum(arr[:k])\nfor i in range(k, len(arr)):\n    window_sum += arr[i] - arr[i-k]\n    # process window_sum",
              sortOrder: 0,
            },
          ],
          visualAscii: null,
          workedExample: {
            problemTitle: "Maximum Sum of Subarray of size K",
            problemStatement:
              "Find the maximum sum of any contiguous subarray of size k.",
            inputExample: "[2, 1, 5, 1, 3, 2], k=3",
            outputExample: "9 ([5, 1, 3])",
            bruteForceDesc: "Nested loops O(n*k).",
            keyInsight:
              "Don't re-sum the whole window. Sub the outgoing element, add incoming.",
            dryRunSteps: [],
            solutionCode: [],
            timeComplexity: "O(n)",
            timeReason: "One pass through the array.",
            spaceComplexity: "O(1)",
            spaceReason: "No extra storage.",
            coreTrick: "window_sum += incoming - outgoing.",
            leetcodeUrl:
              "https://leetcode.com/problems/maximum-average-subarray-i/",
            youtubeSearch: "Sliding Window Subarray k LeetCode",
          },
          practiceQuestions: [],
        },
      },
    ],
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGODB_URI is not defined");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db();
    const collection = db.collection("studyguides");

    for (const guide of STUDY_GUIDE_DATA) {
      // @ts-ignore
      guide.updatedAt = new Date();
      await collection.updateOne(
        { topicId: guide.topicId },
        { $set: guide, $setOnInsert: { createdAt: new Date() } },
        { upsert: true },
      );
      console.log(`Seeded topic: ${guide.topicId}`);
    }

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await client.close();
  }
}

seed();
