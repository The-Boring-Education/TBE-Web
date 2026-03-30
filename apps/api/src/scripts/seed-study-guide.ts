import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";
import { v5 as uuidv5 } from "uuid";

/** Namespace UUID for deterministic `contentId` per `topicId` when none exists yet. */
const STUDY_GUIDE_CONTENT_ID_NAMESPACE = "a3b8c9d2-4e1f-4a2b-9c3d-8e7f6a5b4c3d";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from .env.local in api
dotenv.config({ path: path.join(__dirname, "../../.env.local") });

const STUDY_GUIDE_DATA = [
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
          subtitle: "What you need to know before diving into Binary Search.",
          openingParagraph:
            "Binary search is one of the most deceptively simple algorithms in all of DSA. The concept is obvious — look at the middle, eliminate half. But the implementation is a minefield. Experienced engineers still get infinite loops wrong in interviews. The reason is always the same: they did not have a clear loop invariant before they started typing. This section fixes that.",
          prereqCards: [
            {
              title: "Sorted order is required",
              body: "Binary search only works when the data is sorted — or when you can define a monotonic true/false condition over a range. If neither applies, binary search does not help. Always ask: is the input sorted, or is there a searchable property that only flips once?",
              sortOrder: 0,
            },
            {
              title: "The safe mid formula",
              body: "Computing mid as (lo + hi) / 2 causes integer overflow in Java and C++ when lo + hi exceeds 2³¹. The safe formula is lo + (hi - lo) // 2, which never overflows. Form this habit even in Python where integers are unbounded.",
              sortOrder: 1,
            },
            {
              title: "Two interval styles — pick one",
              body: "Every binary search uses either a closed interval [lo, hi] or a half-open interval [lo, hi). These dictate your loop condition and update rules. Closed → while lo <= hi. Half-open → while lo < hi. Mixing them mid-solution causes infinite loops.",
              sortOrder: 2,
            },
            {
              title: "Write your invariant first",
              body: "Before writing a single line, write a comment: 'the answer is always within [lo, hi].' Every lo and hi update must preserve this invariant. If you cannot state the invariant, you cannot write the code correctly.",
              sortOrder: 3,
            },
          ],
          callouts: [
            {
              variant: "info",
              body: "You do NOT need segment trees, Fenwick trees, or any advanced data structure before this topic. Binary search applies to plain sorted arrays, monotonic answer-space problems, and rotated arrays. Master the three core templates — they cover 95% of all binary search interview questions.",
              sortOrder: 0,
            },
            {
              variant: "success",
              body: "Goal: by the end of this guide you can write any binary search variant from memory in under 2 minutes — correct loop condition, correct mid formula, correct lo/hi updates — with zero infinite loops.",
              sortOrder: 1,
            },
          ],
          howToUseHeading: "How to use this guide",
          howToUseParagraphs: [
            "Each pattern section covers one variant of binary search with: a precise explanation of the invariant, trigger words, an ASCII visual showing how lo/hi/mid move step by step, a fully memorisable code template, a complete worked example with dry-run table, and four practice problems with targeted hints.",
            "Do Pattern 1 (exact search) before Pattern 2 (lower bound). Do both before Pattern 3 (parametric/answer-space). Each pattern adds exactly one new idea on top of the previous one — the skeleton is always the same.",
          ],
        },
      },
      {
        id: "how-binary-search-works",
        label: "How Binary Search works",
        type: "concept",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 1,
        content: {
          pageTitle: "How Binary Search Works",
          subtitle: "The core mechanics every template is built on.",
          subsections: [
            {
              subheading: "What binary search is",
              bodyText:
                "Binary search works by maintaining two pointers lo and hi that bound the region where the answer can possibly live. Each iteration computes a midpoint, evaluates a condition at mid, and eliminates the half that cannot contain the answer. After at most log₂(n) iterations the pointers converge to the answer.\n\nThe power of binary search is the elimination guarantee. When you observe that nums[mid] < target, you are not just ignoring mid — you are provably ruling out every element from lo to mid inclusive. Sorted order means that if mid is too small, everything to its left is also too small. That single observation turns O(n) into O(log n).",
              tableData: null,
              codeBlocks: [],
              sortOrder: 0,
            },
            {
              subheading: "Why exactly O(log n)?",
              bodyText:
                "Each iteration cuts the search space in half. Starting from n = 1,000,000 elements, after 20 iterations only 1 element remains — because log₂(1,000,000) ≈ 19.9. Linear search worst case is 1,000,000 iterations. Binary search worst case is 20 iterations — roughly 50,000× faster on 1M elements.",
              tableData: null,
              codeBlocks: [],
              sortOrder: 1,
            },
            {
              subheading: "The three templates — know all three",
              bodyText:
                "There are exactly three binary search templates. They share the same skeleton but differ in loop condition and lo/hi update rules. Choosing the wrong one gives you either an infinite loop or an off-by-one error.\n\nTemplate 1 — Exact search: closed interval [lo, hi], loop while lo <= hi. Returns mid on match, -1 when not found.\nTemplate 2 — Leftmost (lower bound): half-open interval [lo, hi), loop while lo < hi. hi = len(nums). When loop exits lo == hi == first index where condition is True.\nTemplate 3 — Rightmost (upper bound): same half-open interval, only the comparison flips. Returns lo - 1.\n\nWhen unsure, default to Template 2.",
              tableData: [
                {
                  isHeader: true,
                  cells: [
                    "Template",
                    "Use case",
                    "Interval",
                    "Condition",
                    "hi init",
                    "Returns",
                  ],
                },
                {
                  isHeader: false,
                  cells: [
                    "1 — Exact",
                    "Find exact value",
                    "[lo, hi]",
                    "lo <= hi",
                    "len - 1",
                    "mid or -1",
                  ],
                },
                {
                  isHeader: false,
                  cells: [
                    "2 — Leftmost",
                    "First position where condition true",
                    "[lo, hi)",
                    "lo < hi",
                    "len",
                    "lo",
                  ],
                },
                {
                  isHeader: false,
                  cells: [
                    "3 — Rightmost",
                    "Last position where condition true",
                    "[lo, hi)",
                    "lo < hi",
                    "len",
                    "lo - 1",
                  ],
                },
              ],
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
        id: "classic-exact-search",
        label: "Classic exact search",
        type: "pattern",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 3,
        content: {
          pageTitle: "Classic Exact Search",
          subtitle: "Pattern 1 of 5 · Easy · ~20 min",
          whatIsIt:
            "Classic exact search is Template 1: find the index of a specific target value in a sorted array. The search space is a closed interval [lo, hi] where both endpoints are inclusive. The loop condition is lo <= hi — the equals sign matters because the single element remaining when lo == hi must still be checked before concluding the target is absent.\n\nThe invariant is: if target exists in the array, it lies within [lo, hi] at all times. Every update either returns the answer (when nums[mid] == target) or shrinks the interval by one element. When lo > hi the interval is empty — the target is not in the array.",
          triggerPhrases: [
            "find index of",
            "search in sorted array",
            "does X exist?",
            "O(log n) lookup",
            "position of target",
          ],
          whenNotToUse:
            "Do not use exact search when the array has duplicates and you need the first or last occurrence — Template 2 or 3 is correct. Do not use it when you need the closest value to a target rather than an exact match — lower bound handles that. Do not use it on unsorted input.",
          codeTemplates: [
            {
              language: "python",
              label: "Standard Template",
              code: "def binary_search(nums: list[int], target: int) -> int:\n    lo, hi = 0, len(nums) - 1  # closed interval [lo, hi]\n    while lo <= hi:             # equality matters: single element must be checked\n        mid = lo + (hi - lo) // 2  # safe mid — avoids integer overflow\n        if nums[mid] == target: return mid    # exact match\n        elif nums[mid] < target: lo = mid + 1 # target is right of mid\n        else: hi = mid - 1                    # target is left of mid\n    return -1  # loop exited → target not present",
              sortOrder: 0,
            },
          ],
          visualAscii:
            "Searching for 7 in [1, 3, 5, 7, 9, 11, 13]:\n\nArray: 1  3  5  7  9  11  13\nIndex: 0  1  2  3  4   5   6\n\nStep 1: lo=0 hi=6 mid=3 nums[3]=7 == target → return 3 ✓\n\n──────────────────────────────────────────\nSearching for 6 (not present):\n\nStep 1: lo=0 hi=6 mid=3 nums[3]=7 > 6 → hi=2\nStep 2: lo=0 hi=2 mid=1 nums[1]=3 < 6 → lo=2\nStep 3: lo=2 hi=2 mid=2 nums[2]=5 < 6 → lo=3\nlo=3 > hi=2 → EXIT → return -1 ✓",
          workedExample: {
            problemTitle: "Binary Search",
            problemStatement:
              "Given an array of integers sorted in ascending order and a target integer, return the index of target if it exists in the array, or -1 if it does not.",
            inputExample: "nums = [-1, 0, 3, 5, 9, 12], target = 9",
            outputExample: "4",
            bruteForceDesc:
              "Scan every element from left to right and compare each to target. This is O(n) time. It works but completely ignores the sorted property — for 10,000,000 elements you do 10M comparisons. Binary search does the same job in 24 comparisons.",
            keyInsight:
              "Sorted order means that when nums[mid] < target, not just mid but every element from lo to mid is also less than target — you can discard the entire left half in one comparison. This halving is why binary search is O(log n) instead of O(n).",
            dryRunSteps: [
              {
                stepNumber: 1,
                description: "Init: lo=0, hi=5. Full array in scope.",
                arrayState: "[-1,0,3,5,9,12]",
                pointerState: "lo=0,hi=5",
                stateLabel: null,
                isSolutionFound: false,
                highlightedIndexes: [0, 1, 2, 3, 4, 5],
                foundIndexes: [],
              },
              {
                stepNumber: 2,
                description: "mid=2. nums[2]=3. 3 < 9 → lo = mid+1 = 3",
                arrayState: "[-1,0,3,5,9,12]",
                pointerState: "lo=3,hi=5",
                stateLabel: null,
                isSolutionFound: false,
                highlightedIndexes: [2],
                foundIndexes: [],
              },
              {
                stepNumber: 3,
                description: "mid=4. nums[4]=9. 9 == target → return 4 ✓",
                arrayState: "[-1,0,3,5,9,12]",
                pointerState: "lo=3,hi=5",
                stateLabel: null,
                isSolutionFound: true,
                highlightedIndexes: [4],
                foundIndexes: [4],
              },
            ],
            solutionCode: [
              {
                language: "python",
                code: "def search(nums: list[int], target: int) -> int:\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = lo + (hi - lo) // 2\n        if nums[mid] == target: return mid\n        elif nums[mid] < target: lo = mid + 1\n        else: hi = mid - 1\n    return -1",
              },
              {
                language: "java",
                code: "public int search(int[] nums, int target) {\n    int lo = 0, hi = nums.length - 1;\n    while (lo <= hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (nums[mid] == target) return mid;\n        else if (nums[mid] < target) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    return -1;\n}",
              },
              {
                language: "cpp",
                code: "int search(vector<int>& nums, int target) {\n    int lo = 0, hi = nums.size() - 1;\n    while (lo <= hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (nums[mid] == target) return mid;\n        else if (nums[mid] < target) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    return -1;\n}",
              },
              {
                language: "javascript",
                code: "var search = function(nums, target) {\n    let lo = 0, hi = nums.length - 1;\n    while (lo <= hi) {\n        const mid = lo + Math.floor((hi - lo) / 2);\n        if (nums[mid] === target) return mid;\n        else if (nums[mid] < target) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    return -1;\n};",
              },
            ],
            timeComplexity: "O(log n)",
            timeReason:
              "The search space halves every iteration — at most log₂(n) iterations.",
            spaceComplexity: "O(1)",
            spaceReason:
              "Only lo, hi, and mid — no extra data structures needed.",
            coreTrick:
              "When nums[mid] < target every element from lo to mid is ruled out — move lo past mid entirely, not just to mid.",
            leetcodeUrl: "https://leetcode.com/problems/binary-search/",
            youtubeSearch: "Binary Search LeetCode 704 solution explained",
          },
          practiceQuestions: [
            {
              name: "Binary Search",
              difficulty: "Easy",
              hint: "Reproduce Template 1 from memory without looking at any notes. Focus on three things: the loop condition (<=), the safe mid formula, and the -1 return at the end.",
              leetcodeUrl: "https://leetcode.com/problems/binary-search/",
              youtubeSearch: "Binary Search LeetCode 704",
              sortOrder: 0,
            },
            {
              name: "Guess Number Higher or Lower",
              difficulty: "Easy",
              hint: "Same template but instead of array access you call guess(num) which returns -1, 0, or 1. Map each return value to your lo/hi update. What is hi when no array is given?",
              leetcodeUrl:
                "https://leetcode.com/problems/guess-number-higher-or-lower/",
              youtubeSearch: "Guess Number Higher or Lower LeetCode",
              sortOrder: 1,
            },
            {
              name: "Search Insert Position",
              difficulty: "Easy",
              hint: "Exact search, but target may not be present. When the loop exits without finding target, lo is the correct insertion index. Think through why: what invariant holds when lo > hi?",
              leetcodeUrl:
                "https://leetcode.com/problems/search-insert-position/",
              youtubeSearch: "Search Insert Position LeetCode",
              sortOrder: 2,
            },
            {
              name: "Find First and Last Position of Element",
              difficulty: "Medium",
              hint: "You need two binary searches: one for the leftmost index (Template 2) and one for the rightmost (Template 3). Write each as a separate helper. The answer is [left, right] or [-1,-1] if nums[left] != target.",
              leetcodeUrl:
                "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
              youtubeSearch: "Find First and Last Position LeetCode",
              sortOrder: 3,
            },
          ],
        },
      },
      {
        id: "lower-bound",
        label: "Lower bound",
        type: "pattern",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 4,
        content: {
          pageTitle: "Lower Bound (Leftmost)",
          subtitle: "Pattern 2 of 5 · Easy to Medium · ~25 min",
          whatIsIt:
            "Lower bound finds the leftmost index where a condition becomes true — specifically, the first position where nums[i] >= target. Unlike exact search you never return early when you see the target, because there may be identical values to the left that you have not checked yet. You keep narrowing the interval until lo and hi converge on the answer.\n\nThe interval is half-open: [lo, hi) where hi is always one position beyond the last possible answer. This is why hi is initialised to len(nums) rather than len(nums)-1 — the answer could be the insertion point one past the last element. The loop condition is lo < hi, and when lo == hi both pointers sit exactly on the answer.\n\nThe critical update rule: when nums[mid] >= target, write hi = mid (not mid-1) because mid itself might be the leftmost valid index. When nums[mid] < target, write lo = mid+1 because mid is definitely not the answer.",
          triggerPhrases: [
            "first occurrence",
            "leftmost position",
            "insertion point",
            "at least / >= target",
            "smallest index where",
          ],
          whenNotToUse:
            "Do not use lower bound when you need the last occurrence — use upper bound (Template 3). Do not forget to check: if lo == len(nums) the target is larger than every element and is not present. If nums[lo] != target the target is not in the array; lo is only the insertion point.",
          codeTemplates: [
            {
              language: "python",
              label: "Lower bound (first occurrence)",
              code: "def lower_bound(nums: list[int], target: int) -> int:\n    lo, hi = 0, len(nums)  # half-open [lo, hi) — hi = len, not len-1\n    while lo < hi:          # NOT <= (lo==hi means answer found)\n        mid = lo + (hi - lo) // 2\n        if nums[mid] < target:\n            lo = mid + 1  # mid is definitely not the answer\n        else:             # nums[mid] >= target\n            hi = mid      # mid MIGHT be the answer — preserve it\n    # lo == hi at this point\n    # lo == len(nums)   → target larger than every element\n    # nums[lo] == target → first occurrence found\n    # nums[lo] != target → target not in array, lo is insertion point\n    return lo",
              sortOrder: 0,
            },
          ],
          visualAscii:
            "Lower bound of 5 in [1, 3, 5, 5, 5, 7, 9]:\n\nArray: 1  3  5  5  5  7  9\nIndex: 0  1  2  3  4  5  6\n         ^── first 5 is here at index 2\n\nlo=0, hi=7  (hi = len = 7, half-open [0, 7))\n\nStep 1: lo=0 hi=7 mid=3 nums[3]=5 >=5 → hi=mid=3\n         interval shrinks to [0, 3)\nStep 2: lo=0 hi=3 mid=1 nums[1]=3 < 5 → lo=mid+1=2\n         interval shrinks to [2, 3)\nStep 3: lo=2 hi=3 mid=2 nums[2]=5 >=5 → hi=mid=2\n         interval shrinks to [2, 2)\nlo == hi == 2 → loop exits → return lo = 2 ✓",
          workedExample: {
            problemTitle: "Find First and Last Position of Element",
            problemStatement:
              "Given a sorted array of integers (may have duplicates) and a target, return an array [first_index, last_index] of target. If target is not found, return [-1, -1]. You must achieve O(log n) runtime.",
            inputExample: "nums = [5, 7, 7, 8, 8, 10], target = 8",
            outputExample: "[3, 4]",
            bruteForceDesc:
              "Linear scan from the left until you find target — that is the first index. Linear scan from the right for the last index. Both are O(n). This is trivially correct but fails the O(log n) requirement.",
            keyInsight:
              "Run lower_bound(target) to get the first index. Run lower_bound(target + 1) to get one past the last index, then subtract 1 for the last index. Two independent O(log n) calls — total runtime is still O(log n). You never need to scan linearly.",
            dryRunSteps: [
              {
                stepNumber: 1,
                description:
                  "Finding first: lower_bound(nums, 8). Init lo=0, hi=6.",
                arrayState: "[5,7,7,8,8,10]",
                pointerState: "lo=0,hi=6",
                stateLabel: "lower_bound(8)",
                isSolutionFound: false,
                highlightedIndexes: [0, 1, 2, 3, 4, 5],
                foundIndexes: [],
              },
              {
                stepNumber: 2,
                description: "mid=3. nums[3]=8. 8>=8 → hi=3. Interval [0,3).",
                arrayState: "[5,7,7,8,8,10]",
                pointerState: "lo=0,hi=3",
                stateLabel: null,
                isSolutionFound: false,
                highlightedIndexes: [3],
                foundIndexes: [],
              },
              {
                stepNumber: 3,
                description: "mid=1. nums[1]=7. 7<8 → lo=2. Interval [2,3).",
                arrayState: "[5,7,7,8,8,10]",
                pointerState: "lo=0,hi=3",
                stateLabel: null,
                isSolutionFound: false,
                highlightedIndexes: [1],
                foundIndexes: [],
              },
              {
                stepNumber: 4,
                description:
                  "mid=2. nums[2]=7. 7<8 → lo=3. lo==hi==3. first=3 ✓",
                arrayState: "[5,7,7,8,8,10]",
                pointerState: "lo=3,hi=3",
                stateLabel: "first=3",
                isSolutionFound: false,
                highlightedIndexes: [2],
                foundIndexes: [3],
              },
              {
                stepNumber: 5,
                description:
                  "Finding last: lower_bound(nums, 9)-1. lo=5, hi=5. last=5-1=4 ✓",
                arrayState: "[5,7,7,8,8,10]",
                pointerState: "lo=5,hi=5",
                stateLabel: "last=4",
                isSolutionFound: true,
                highlightedIndexes: [4],
                foundIndexes: [3, 4],
              },
            ],
            solutionCode: [
              {
                language: "python",
                code: "def searchRange(nums: list[int], target: int) -> list[int]:\n    def lower_bound(t: int) -> int:\n        lo, hi = 0, len(nums)\n        while lo < hi:\n            mid = lo + (hi - lo) // 2\n            if nums[mid] < t: lo = mid + 1\n            else: hi = mid\n        return lo\n\n    first = lower_bound(target)\n    if first == len(nums) or nums[first] != target:\n        return [-1, -1]\n    last = lower_bound(target + 1) - 1\n    return [first, last]",
              },
            ],
            timeComplexity: "O(log n)",
            timeReason: "Two independent binary searches, each O(log n).",
            spaceComplexity: "O(1)",
            spaceReason:
              "Only lo, hi, mid variables in each call — no extra space.",
            coreTrick:
              "lower_bound(target+1) - 1 gives you the last occurrence without a separate rightmost template.",
            leetcodeUrl:
              "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
            youtubeSearch:
              "Find First Last Position LeetCode lower bound explained",
          },
          practiceQuestions: [],
        },
      },
      {
        id: "parametric-binary-search",
        label: "Binary search on answer",
        type: "pattern",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 5,
        content: {
          pageTitle: "Binary Search on Answer (Parametric)",
          subtitle: "Pattern 3 of 5 · Medium to Hard · ~35 min",
          whatIsIt:
            "Parametric binary search — also called binary search on the answer — solves problems where you are not searching an array but rather searching for the optimal value of an answer. The key observation is that the answer range is monotonic: for some threshold k, all values below k are 'invalid' and all values at or above k are 'valid'. This monotonicity means you can binary search on k directly.",
          triggerPhrases: [
            "minimum maximum",
            "maximum minimum",
            "at most k days",
            "minimum capacity",
          ],
          whenNotToUse:
            "Do not use parametric binary search when feasible(k) is not monotonic.",
          codeTemplates: [
            {
              language: "python",
              label: "Parametric skeleton",
              code: "def parametric_binary_search(data, constraint) -> int:\n    lo, hi = min_range, max_range\n    def feasible(mid: int) -> bool:\n        # O(n) check\n        ...\n    while lo < hi:\n        mid = lo + (hi - lo) // 2\n        if feasible(mid): hi = mid\n        else: lo = mid + 1\n    return lo",
              sortOrder: 0,
            },
          ],
          visualAscii: null,
          workedExample: {
            problemTitle: "Capacity To Ship Packages Within D Days",
            problemStatement:
              "Return the minimum capacity needed to ship all packages within given days.",
            inputExample: "weights = [3, 2, 2, 4, 1, 4], days = 3",
            outputExample: "6",
            bruteForceDesc: "Try every possible capacity.",
            keyInsight: "Monotonicity: if capacity k works, k+1 also works.",
            dryRunSteps: [],
            solutionCode: [],
            timeComplexity: "O(n log S)",
            timeReason: "O(n) check per log S step.",
            spaceComplexity: "O(1)",
            spaceReason: "No extra space.",
            coreTrick: "Greedy O(n) feasible(k) check.",
            leetcodeUrl:
              "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/",
            youtubeSearch: "Capacity Ship Packages LeetCode",
          },
          practiceQuestions: [],
        },
      },
      {
        id: "rotated-array-search",
        label: "Rotated array search",
        type: "pattern",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 6,
        content: {
          pageTitle: "Search in Rotated Sorted Array",
          subtitle: "Pattern 4 of 5 · Medium · ~30 min",
          whatIsIt:
            "A rotated sorted array is a sorted array cyclically shifted. One half around any mid is always sorted. Use this to eliminate halves.",
          triggerPhrases: [
            "rotated sorted array",
            "cyclic shift",
            "unknown pivot",
          ],
          whenNotToUse: "Unsorted array.",
          codeTemplates: [
            {
              language: "python",
              label: "Rotated array template",
              code: "def search_rotated(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = lo + (hi-lo)//2\n        if nums[mid] == target: return mid\n        if nums[lo] <= nums[mid]: # left sorted\n            if nums[lo] <= target < nums[mid]: hi = mid - 1\n            else: lo = mid + 1\n        else: # right sorted\n            if nums[mid] < target <= nums[hi]: lo = mid + 1\n            else: hi = mid - 1\n    return -1",
              sortOrder: 0,
            },
          ],
          visualAscii: null,
          workedExample: {
            problemTitle: "Search in Rotated Sorted Array",
            problemStatement: "Find index of target in rotated sorted array.",
            inputExample: "nums = [4,5,6,7,0,1,2], target = 0",
            outputExample: "4",
            bruteForceDesc: "Find pivot first.",
            keyInsight: "One half is always sorted.",
            dryRunSteps: [],
            solutionCode: [],
            timeComplexity: "O(log n)",
            timeReason: "Halves space every step.",
            spaceComplexity: "O(1)",
            spaceReason: "O(1) space.",
            coreTrick: "Identify the sorted half.",
            leetcodeUrl:
              "https://leetcode.com/problems/search-in-rotated-sorted-array/",
            youtubeSearch: "Search Rotated Sorted Array LeetCode",
          },
          practiceQuestions: [],
        },
      },
      {
        id: "2d-matrix-search",
        label: "Binary search on 2D matrix",
        type: "pattern",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 7,
        content: {
          pageTitle: "Binary Search on 2D Matrix",
          subtitle: "Pattern 5 of 5 · Medium · ~25 min",
          whatIsIt: "Treat 2D sorted matrix as a virtual 1D array.",
          triggerPhrases: ["m*n sorted matrix", "each row sorted", "O(log mn)"],
          whenNotToUse: "Unsorted matrix.",
          codeTemplates: [
            {
              language: "python",
              label: "1D conversion template",
              code: "row = mid // cols\ncol = mid % cols",
              sortOrder: 0,
            },
          ],
          visualAscii: null,
          workedExample: {
            problemTitle: "Search a 2D Matrix",
            problemStatement: "Search for target in sorted matrix.",
            inputExample: "matrix = [[1,3,5,7],[10,11,16,20]], target = 3",
            outputExample: "true",
            bruteForceDesc: "Row by row search.",
            keyInsight: "Virtual 1D flattening.",
            dryRunSteps: [],
            solutionCode: [],
            timeComplexity: "O(log mn)",
            timeReason: "Binary search on m*n.",
            spaceComplexity: "O(1)",
            spaceReason: "O(1) space.",
            coreTrick: "Mapping indices.",
            leetcodeUrl: "https://leetcode.com/problems/search-a-2d-matrix/",
            youtubeSearch: "Search 2D Matrix LeetCode",
          },
          practiceQuestions: [],
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
          pageTitle: "Quick Reference",
          subtitle: "Binary search patterns summary.",
          patternRows: [
            {
              patternName: "Exact Search",
              triggerWords: "O(log n) lookup",
              timeComplexity: "O(log n)",
              spaceComplexity: "O(1)",
              coreTrick: "lo<=hi",
              sortOrder: 0,
            },
            {
              patternName: "Lower Bound",
              triggerWords: "leftmost",
              timeComplexity: "O(log n)",
              spaceComplexity: "O(1)",
              coreTrick: "lo<hi",
              sortOrder: 1,
            },
          ],
          decisionGuide: "Pick based on requirements.",
          questionGroups: [],
          oneThingToRemember: [
            "Use safe mid to avoid overflow.",
            "Write your invariant first.",
          ],
        },
      },
    ],
  },
  {
    topicId: "HASHMAP",
    title: "Hash Map",
    hasGuide: true,
    sortOrder: 4,
    sections: [
      {
        id: "before-you-start",
        label: "Introduction",
        type: "intro",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 0,
        content: {
          pageTitle: "Beyond O(n) Lookups",
          subtitle: "The magic of O(1) time complexity.",
          openingParagraph:
            "In algorithm design, time is often more expensive than space. Hash Maps (or Hash Tables) are the ultimate cheat code for this trade-off. They allow us to store information and retrieve it in O(1) average time, turning linear scans into instant lookups. If you can solve a problem by 'remembering' what you've seen before, a Hash Map is almost always the answer.",
          prereqCards: [
            {
              title: "Key-Value pairs",
              body: "Understand that every entry consists of a unique key and its associated value. Keys must be hashable (immutable in many languages like Python).",
              sortOrder: 0,
            },
            {
              title: "O(1) vs O(n)",
              body: "A list lookup is O(n) because you might check every element. A Hash Map lookup is O(1) because the key's hash tells the computer exactly where to look.",
              sortOrder: 1,
            },
          ],
          callouts: [
            {
              variant: "info",
              body: "Mastering Hash Maps is the single highest-ROI skill for coding interviews. Over 50% of 'Easy' and 'Medium' problems can be solved or optimized using a frequency map or an existence set.",
              sortOrder: 0,
            },
          ],
          howToUseHeading: "How to use this guide",
          howToUseParagraphs: [
            "We have broken down Hash Map problems into two primary patterns: Checking Existence and Counting Elements. Master these two, and you solve 80% of hashing problems.",
          ],
        },
      },
      {
        id: "hashing-basics",
        label: "Hashing basics",
        type: "concept",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 1,
        content: {
          pageTitle: "Hashing Basics",
          subtitle: "What's going on under the hood?",
          subsections: [
            {
              subheading: "What is a Hash Function?",
              bodyText:
                "A hash function maps a large input (like a string or object) to a fixed-size integer. This index tells the map exactly where in memory to store or search for the data. A 'perfect' hash function distributes keys uniformly to avoid collisions — where two different keys map to the same index.",
              tableData: null,
              codeBlocks: [],
              sortOrder: 0,
            },
            {
              subheading: "Collisions: Chaining & Open Addressing",
              bodyText:
                "Collisions are inevitable in any large-scale application. The most common solution is 'Chaining', where each index in the underlying array points to a linked list of entries that share that hash. This is why worst-case Hash Map performance is O(n), though we average O(1).",
              tableData: null,
              codeBlocks: [],
              sortOrder: 1,
            },
            {
              subheading: "Set vs Map",
              bodyText:
                "A 'Set' (e.g., Python's set() or JS's Set) is just a Hash Map where you only care about the keys, not the values. Use a set when you only need to know 'Have I seen this?' and a map when you need 'How many times?' or 'Where did I see this?'.",
              tableData: [
                {
                  isHeader: true,
                  cells: ["Attribute", "Set", "Map"],
                },
                {
                  isHeader: false,
                  cells: ["Storage", "Keys only", "Key-Value pairs"],
                },
                {
                  isHeader: false,
                  cells: [
                    "Common Use",
                    "Checking existence",
                    "Counting / Lookup tables",
                  ],
                },
              ],
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
        id: "checking-existence",
        label: "Checking existence",
        type: "pattern",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 3,
        content: {
          pageTitle: "Checking Existence",
          subtitle: "Pattern 1: Have we seen this before?",
          whatIsIt:
            "The simplest Hash Map pattern: keep track of elements you have encountered to avoid nested loops. If you need to find a 'complement' or check for duplicates, this is your go-to strategy.",
          triggerPhrases: [
            "find pair",
            "contains duplicate",
            "already seen",
            "target sum",
            "first occurrence",
          ],
          whenNotToUse:
            "If the input is already sorted, Two Pointers might be more space-efficient (O(1) space instead of O(n)).",
          codeTemplates: [
            {
              language: "python",
              label: "Existence Pattern",
              code: "def check_existence(nums):\n    seen = set()  # or {} for index tracking\n    for x in nums:\n        if target - x in seen: # complement check\n            return True\n        seen.add(x)\n    return False",
              sortOrder: 0,
            },
          ],
          dryRunSteps: [],
          workedExample: {
            problemTitle: "Two Sum",
            problemStatement:
              "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            keyInsight:
              "As we iterate, we can check if the 'complement' (target - current) has been seen. If yes, we found our pair. If no, we 'remember' the current number by adding it to the map.",
            inputExample: "nums = [2, 7, 11, 15], target = 9",
            outputExample: "[0, 1]",
            dryRunSteps: [
              {
                stepNumber: 1,
                description: "Map is empty {}. Current num is 2.",
                arrayState: "[2] 7 11 15",
                pointerState: "num=2",
              },
              {
                stepNumber: 2,
                description:
                  "Target(9) - 2 = 7. Is 7 in map? No. Add 2 to map: {2: 0}.",
                arrayState: "2 [7] 11 15",
                pointerState: "num=7",
              },
              {
                stepNumber: 3,
                description:
                  "Target(9) - 7 = 2. Is 2 in map? Yes! Return [map[2], currentID].",
                arrayState: "2 7 [11] 15",
                pointerState: "Found!",
              },
            ],
            timeComplexity: "O(n)",
            spaceComplexity: "O(n)",
            leetcodeUrl: "https://leetcode.com/problems/two-sum/",
          },
          practiceQuestions: [
            {
              name: "Two Sum",
              difficulty: "Easy",
              hint: "Store each number's index in a map. For every element, check if its complement (target - num) exists in the map.",
              leetcodeUrl: "https://leetcode.com/problems/two-sum/",
              youtubeSearch: "Two Sum LeetCode #1",
              sortOrder: 0,
            },
            {
              name: "Contains Duplicate",
              difficulty: "Easy",
              hint: "Insert elements into a set; return true if any element is already present.",
              leetcodeUrl: "https://leetcode.com/problems/contains-duplicate/",
              youtubeSearch: "Contains Duplicate LeetCode #217",
              sortOrder: 1,
            },
            {
              name: "Longest Consecutive Sequence",
              difficulty: "Medium",
              hint: "Store all numbers in a set. For each sequence start (no n-1 in set), expand and count the consecutive elements.",
              leetcodeUrl:
                "https://leetcode.com/problems/longest-consecutive-sequence/",
              youtubeSearch: "Longest Consecutive Sequence LeetCode #128",
              sortOrder: 2,
            },
          ],
        },
      },
      {
        id: "counting-elements",
        label: "Counting elements",
        type: "pattern",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 4,
        content: {
          pageTitle: "Counting Elements",
          subtitle: "Pattern 2: Frequency Maps & Histograms",
          whatIsIt:
            "Count the occurrences of characters or numbers. This is essential for anagrams, frequency-based sorting, and 'at least K' problems.",
          triggerPhrases: [
            "frequency",
            "anagram",
            "most frequent",
            "unique character",
            "ransom note",
          ],
          whenNotToUse:
            "If the range of keys is very small (e.g., just 'a'-'z'), a fixed-size array of 26 integers is often faster and uses less memory than a Hash Map.",
          codeTemplates: [
            {
              language: "python",
              label: "Frequency Counter",
              code: "from collections import Counter\ncounts = Counter(elements)  # Instant frequency map\n# or manually:\ncounts = {}\nfor x in elements:\n    counts[x] = counts.get(x, 0) + 1",
              sortOrder: 0,
            },
          ],
          dryRunSteps: [],
          workedExample: {
            problemTitle: "Valid Anagram",
            problemStatement:
              "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
            keyInsight:
              "Two strings are anagrams if they have the exact same character frequencies. Use one map to increment counts for s and another to compare (or decrement) for t.",
            inputExample: "s = 'anagram', t = 'nagaram'",
            outputExample: "true",
            dryRunSteps: [
              {
                stepNumber: 1,
                description:
                  "Count frequencies in s: {a:3, n:1, g:1, r:1, m:1}",
                arrayState: "s='anagram'",
                pointerState: "counting",
              },
              {
                stepNumber: 2,
                description: "Subtract frequencies using t: All counts hit 0.",
                arrayState: "t='nagaram'",
                pointerState: "matching",
              },
            ],
            timeComplexity: "O(n)",
            spaceComplexity: "O(1) (since only 26 lowercase chars)",
            leetcodeUrl: "https://leetcode.com/problems/valid-anagram/",
          },
          practiceQuestions: [
            {
              name: "Valid Anagram",
              difficulty: "Easy",
              hint: "Count character frequencies of both strings using a map and compare them.",
              leetcodeUrl: "https://leetcode.com/problems/valid-anagram/",
              youtubeSearch: "Valid Anagram LeetCode #242",
              sortOrder: 0,
            },
            {
              name: "Ransom Note",
              difficulty: "Easy",
              hint: "Count character frequencies in the magazine and check if the ransom note can be formed.",
              leetcodeUrl: "https://leetcode.com/problems/ransom-note/",
              youtubeSearch: "Ransom Note LeetCode #383",
              sortOrder: 1,
            },
            {
              name: "First Unique Character in a String",
              difficulty: "Easy",
              hint: "Build a frequency map, then do a second pass to find the first character with count = 1.",
              leetcodeUrl:
                "https://leetcode.com/problems/first-unique-character-in-a-string/",
              youtubeSearch: "First Unique Character LeetCode #387",
              sortOrder: 2,
            },
            {
              name: "Intersection of Two Arrays II",
              difficulty: "Easy",
              hint: "Count elements of one array in a map, then match with the second array while decrementing counts.",
              leetcodeUrl:
                "https://leetcode.com/problems/intersection-of-two-arrays-ii/",
              youtubeSearch: "Intersection of Two Arrays II LeetCode #350",
              sortOrder: 3,
            },
            {
              name: "Group Anagrams",
              difficulty: "Medium",
              hint: "Use a sorted string (or a character count tuple) as the map key to group anagrams together.",
              leetcodeUrl: "https://leetcode.com/problems/group-anagrams/",
              youtubeSearch: "Group Anagrams LeetCode #49",
              sortOrder: 4,
            },
            {
              name: "Subarray Sum Equals K",
              difficulty: "Medium",
              hint: "Use a prefix sum map: for each index, check if prefixSum - k has been seen before and track its frequency.",
              leetcodeUrl:
                "https://leetcode.com/problems/subarray-sum-equals-k/",
              youtubeSearch: "Subarray Sum Equals K LeetCode #560",
              sortOrder: 5,
            },
            {
              name: "Top K Frequent Elements",
              difficulty: "Medium",
              hint: "Build a frequency map, then use bucket sort or a heap to find the top K elements.",
              leetcodeUrl:
                "https://leetcode.com/problems/top-k-frequent-elements/",
              youtubeSearch: "Top K Frequent Elements LeetCode #347",
              sortOrder: 6,
            },
          ],
        },
      },
      {
        id: "cheat-sheet",
        label: "Cheat sheet",
        type: "cheatsheet",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 5,
        content: {
          pageTitle: "Hash Map Cheat Sheet",
          subtitle: "Complexity and Common Patterns",
          patternRows: [
            {
              patternName: "Existence",
              triggerWords: "target sum, duplicate",
              timeComplexity: "O(1)",
              spaceComplexity: "O(n)",
              coreTrick: "seen.add(x)",
              sortOrder: 0,
            },
            {
              patternName: "Frequency",
              triggerWords: "anagram, counts",
              timeComplexity: "O(1)",
              spaceComplexity: "O(n) / O(k)",
              coreTrick: "counts[x] = counts.get(x, 0) + 1",
              sortOrder: 1,
            },
          ],
          decisionGuide:
            "Use a set for existence, a map for counting or tracking indices.",
          questionGroups: [
            {
              groupName: "Level 1: Entry",
              questions: [
                {
                  name: "Two Sum",
                  leetcodeUrl: "https://leetcode.com/problems/two-sum/",
                },
                {
                  name: "Valid Anagram",
                  leetcodeUrl: "https://leetcode.com/problems/valid-anagram/",
                },
              ],
            },
            {
              groupName: "Level 2: Intermediate",
              questions: [
                {
                  name: "Group Anagrams",
                  leetcodeUrl: "https://leetcode.com/problems/group-anagrams/",
                },
                {
                  name: "Subarray Sum Equals K",
                  leetcodeUrl:
                    "https://leetcode.com/problems/subarray-sum-equals-k/",
                },
              ],
            },
          ],
          oneThingToRemember: [
            "Average lookup time is O(1).",
            "Worst case is O(n) during collisions.",
          ],
        },
      },
    ],
  },
  {
    topicId: "SORTING",
    title: "Sorting",
    hasGuide: true,
    sortOrder: 6,
    sections: [
      {
        id: "before-you-start",
        label: "Before you start",
        type: "intro",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 0,
        content: {
          pageTitle: "Master Sorting Algorithms",
          subtitle:
            "From bubble sort to merge sort internals — everything you need to crack sorting interviews.",
          openingParagraph:
            "Sorting is the process of arranging elements in a defined order (ascending/descending). It's a fundamental building block — binary search, interval merging, and greedy algorithms almost always depend on sorted input. Most sorting problems aren't about implementing a sort — they're about knowing when to sort first, then applying another technique on top.",
          prereqCards: [
            {
              title: "6 Algorithms",
              body: "Understand the tradeoffs between O(n²) and O(n log n) sorts, and when to use non-comparison sorts.",
              sortOrder: 0,
            },
          ],
          callouts: [
            {
              variant: "info",
              body: "Interview Insight: Most sorting problems aren't about implementing a sort — they're about knowing when to sort first, then applying another technique on top.",
              sortOrder: 0,
            },
          ],
          howToUseHeading: "Key Metrics",
          howToUseParagraphs: [
            "6 Algorithms | 5 Patterns | 10 LC Problems | 4 Templates",
          ],
        },
      },
      {
        id: "sorting-algorithms",
        label: "Core Algorithms",
        type: "concept",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 1,
        content: {
          pageTitle: "Complexity & Implementations",
          subtitle: "Performance metrics and core algorithm logic.",
          subsections: [
            {
              subheading: "Complexity Cheatsheet",
              bodyText: "Performance comparison across standard sorts.",
              tableData: [
                {
                  isHeader: true,
                  cells: [
                    "Algorithm",
                    "Best",
                    "Average",
                    "Worst",
                    "Space",
                    "Stable?",
                  ],
                },
                {
                  isHeader: false,
                  cells: [
                    "Bubble Sort",
                    "O(n)",
                    "O(n²)",
                    "O(n²)",
                    "O(1)",
                    "✅ Yes",
                  ],
                },
                {
                  isHeader: false,
                  cells: [
                    "Selection Sort",
                    "O(n²)",
                    "O(n²)",
                    "O(n²)",
                    "O(1)",
                    "❌ No",
                  ],
                },
                {
                  isHeader: false,
                  cells: [
                    "Insertion Sort",
                    "O(n)",
                    "O(n²)",
                    "O(n²)",
                    "O(1)",
                    "✅ Yes",
                  ],
                },
                {
                  isHeader: false,
                  cells: [
                    "Merge Sort",
                    "O(n log n)",
                    "O(n log n)",
                    "O(n log n)",
                    "O(n)",
                    "✅ Yes",
                  ],
                },
                {
                  isHeader: false,
                  cells: [
                    "Quick Sort",
                    "O(n log n)",
                    "O(n log n)",
                    "O(n²)",
                    "O(log n)",
                    "❌ No",
                  ],
                },
                {
                  isHeader: false,
                  cells: [
                    "Heap Sort",
                    "O(n log n)",
                    "O(n log n)",
                    "O(n log n)",
                    "O(1)",
                    "❌ No",
                  ],
                },
                {
                  isHeader: false,
                  cells: [
                    "Counting Sort",
                    "O(n+k)",
                    "O(n+k)",
                    "O(n+k)",
                    "O(k)",
                    "✅ Yes",
                  ],
                },
                {
                  isHeader: false,
                  cells: [
                    "Bucket Sort",
                    "O(n+k)",
                    "O(n+k)",
                    "O(n²)",
                    "O(n)",
                    "✅ Yes",
                  ],
                },
              ],
              sortOrder: 0,
            },
            {
              subheading: "Key Vocabulary",
              bodyText: "Essential sorting terminology.",
              sortOrder: 1,
              cards: [
                {
                  title: "🔄 In-Place Sort",
                  body: "Sorts without extra memory proportional to input. Examples: Quick Sort, Heap Sort. Space = O(1) or O(log n).",
                  sortOrder: 0,
                },
                {
                  title: "🏷️ Stable Sort",
                  body: "Equal elements maintain their original relative order. Critical when sorting objects by one key (e.g., sort employees by salary while keeping them alphabetic).",
                  sortOrder: 1,
                },
                {
                  title: "📐 Comparison Sort",
                  body: "Sorts by comparing pairs. Lower bound is O(n log n) — Merge, Quick, and Heap are all comparison sorts.",
                  sortOrder: 2,
                },
                {
                  title: "🔢 Non-Comparison Sort",
                  body: "Exploits data structure (e.g. range). Can beat O(n log n). Examples: Counting, Bucket Sort.",
                  sortOrder: 3,
                },
              ],
            },
            {
              subheading: "Algorithm Implementations",
              bodyText: "Python implementations for core sorting algorithms.",
              sortOrder: 2,
              cards: [
                {
                  title: "🔀 Merge Sort (Must Know)",
                  body: "Divide into halves recursively until size 1, then merge sorted halves. Guaranteed O(n log n). The go-to for stable, predictable sorting.",
                  sortOrder: 0,
                },
                {
                  title: "⚡ Quick Sort (Must Know)",
                  body: "Pick a pivot, partition elements (smaller left, larger right), recurse. Best average performance but O(n²) worst case.",
                  sortOrder: 1,
                },
              ],
              codeBlocks: [
                {
                  language: "python",
                  label: "Merge Sort",
                  code: "def merge_sort(arr):\n    if len(arr) <= 1: return arr\n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    return merge(left, right)\n\ndef merge(left, right):\n    result, i, j = [], 0, 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            result.append(left[i]); i += 1\n        else:\n            result.append(right[j]); j += 1\n    return result + left[i:] + right[j:]",
                  sortOrder: 0,
                },
                {
                  language: "python",
                  label: "Quick Sort",
                  code: "def quick_sort(arr, lo, hi):\n    if lo < hi:\n        pivot_idx = partition(arr, lo, hi)\n        quick_sort(arr, lo, pivot_idx - 1)\n        quick_sort(arr, pivot_idx + 1, hi)\n\ndef partition(arr, lo, hi):\n    pivot = arr[hi]\n    i = lo - 1\n    for j in range(lo, hi):\n        if arr[j] <= pivot:\n            i += 1\n            arr[i], arr[j] = arr[j], arr[i]\n    arr[i+1], arr[hi] = arr[hi], arr[i+1]\n    return i + 1",
                  sortOrder: 1,
                },
              ],
            },
          ],
        },
      },
      {
        id: "sorting-patterns",
        label: "Interview Patterns",
        type: "concept",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 2,
        content: {
          pageTitle: "Sorting Interview Patterns",
          subtitle: "Common strategies to solve sorting problems.",
          subsections: [
            {
              subheading: "1. Sort First, Apply Algorithm Second",
              bodyText:
                "Sorting unlocks binary search, two pointers, and greedy logic on random data.",
              sortOrder: 0,
              codeBlocks: [
                {
                  language: "python",
                  label: "Two Sum (Sorted)",
                  code: "arr.sort() # Sort, then use two pointers\nlo, hi = 0, len(arr) - 1\nwhile lo < hi:\n    s = arr[lo] + arr[hi]\n    if s == target: return [lo, hi]\n    elif s < target: lo += 1\n    else: hi -= 1",
                  sortOrder: 0,
                },
              ],
            },
            {
              subheading: "2. Custom Comparator Sort",
              bodyText:
                "Define custom logic (ab vs ba) to handle non-standard ordering requirements.",
              sortOrder: 1,
              codeBlocks: [
                {
                  language: "python",
                  label: "LC #179 — Largest Number",
                  code: 'from functools import cmp_to_key\ndef compare(a, b):\n    if a + b > b + a: return -1\n    if a + b < b + a: return 1\n    return 0\n\nstrs = [str(n) for n in nums]\nstrs.sort(key=cmp_to_key(compare))\nreturn "".join(strs) if strs[0] != "0" else "0"',
                  sortOrder: 0,
                },
              ],
            },
            {
              subheading: "3. Interval Sorting",
              bodyText:
                "Sort by start time to handle overlapping segments greedily.",
              sortOrder: 2,
              codeBlocks: [
                {
                  language: "python",
                  label: "LC #56 — Merge Intervals",
                  code: "intervals.sort(key=lambda x: x[0])\nmerged = [intervals[0]]\nfor start, end in intervals[1:]:\n    if start <= merged[-1][1]:\n        merged[-1][1] = max(merged[-1][1], end)\n    else: merged.append([start, end])\nreturn merged",
                  sortOrder: 0,
                },
              ],
            },
            {
              subheading: "4. Dutch National Flag",
              bodyText:
                "Standard 3-way partition using low, mid, and high pointers.",
              sortOrder: 3,
              codeBlocks: [
                {
                  language: "python",
                  label: "LC #75 — Sort Colors",
                  code: "lo, mid, hi = 0, 0, len(nums) - 1\nwhile mid <= hi:\n    if nums[mid] == 0:\n        nums[lo], nums[mid] = nums[mid], nums[lo]\n        lo += 1; mid += 1\n    elif nums[mid] == 1: mid += 1\n    else:\n        nums[mid], nums[hi] = nums[hi], nums[mid]\n        hi -= 1",
                  sortOrder: 0,
                },
              ],
            },
          ],
        },
      },
      {
        id: "cheat-sheet",
        label: "Cheat sheet",
        type: "cheatsheet",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 3,
        content: {
          pageTitle: "Sorting Cheat Sheet",
          subtitle: "Roadmap, Checklist, and Templates.",
          patternRows: [
            {
              patternName: "Phase 1: Foundations",
              triggerWords: "Merge, Quick, Two Pointers",
              timeComplexity: "O(n log n)",
              spaceComplexity: "O(n) / O(log n)",
              coreTrick: "Implement Merge/Quick from scratch.",
              sortOrder: 0,
            },
            {
              patternName: "Phase 2: Core Patterns",
              triggerWords: "Dutch Flag, Intervals, QuickSelect",
              timeComplexity: "O(n) / O(n log n)",
              spaceComplexity: "O(1)",
              coreTrick: "3-pointer partition, sort by start time.",
              sortOrder: 1,
            },
          ],
          decisionGuide:
            "Use Merge Sort for stability, Quick Sort for average speed, QuickSelect for Kth element.",
          oneThingToRemember: [
            "Implement Merge Sort & Quick Sort partition from memory.",
            "Know when to use counting sort (small range) vs comparison sort.",
            "Master Dutch National Flag (3 pointers) and Interval Merging.",
          ],
          questionGroups: [
            {
              groupName: "Roadmap: 7-Day Plan",
              questions: [
                {
                  name: "Day 1-2: Implement Merge & Quick Sort",
                  leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
                },
                {
                  name: "Day 3: Dutch National Flag (#75)",
                  leetcodeUrl: "https://leetcode.com/problems/sort-colors/",
                },
                {
                  name: "Day 4: Interval Merge (#56)",
                  leetcodeUrl: "https://leetcode.com/problems/merge-intervals/",
                },
                {
                  name: "Day 5: QuickSelect (#215)",
                  leetcodeUrl:
                    "https://leetcode.com/problems/kth-largest-element-in-an-array/",
                },
                {
                  name: "Day 6: Custom Comparator (#179)",
                  leetcodeUrl: "https://leetcode.com/problems/largest-number/",
                },
              ],
            },
          ],
          codeTemplates: [
            {
              language: "python",
              label: "Template: QuickSelect (O(n) avg)",
              code: "def find_kth_largest(nums, k):\n    target = len(nums) - k\n    def quickselect(lo, hi):\n        pivot, p = nums[hi], lo\n        for i in range(lo, hi):\n            if nums[i] <= pivot:\n                nums[p], nums[i] = nums[i], nums[p]\n                p += 1\n        nums[p], nums[hi] = nums[hi], nums[p]\n        if p == target: return nums[p]\n        elif p < target: return quickselect(p+1, hi)\n        else: return quickselect(lo, p-1)\n    return quickselect(0, len(nums)-1)",
              sortOrder: 0,
            },
          ],
        },
      },
    ],
  },
  {
    topicId: "QUEUE",
    title: "Queue",
    hasGuide: true,
    sortOrder: 7,
    sections: [
      {
        id: "before-you-start",
        label: "Introduction",
        type: "intro",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 0,
        content: {
          pageTitle: "Master Queue & Deque",
          subtitle:
            "From BFS to monotonic deques — everything you need to crack queue interviews.",
          openingParagraph:
            "A queue is a FIFO (First In, First Out) data structure. Elements are added at the rear (enqueue) and removed from the front (dequeue). Think of it as a real-world line — the first person in is the first person served.",
          prereqCards: [
            {
              title: "Core Idea",
              body: "Elements enter from one end and leave from the other. Standard implementation uses a linked list or circular buffer.",
              sortOrder: 0,
            },
          ],
          callouts: [
            {
              variant: "info",
              body: "Interview Insight: Most queue problems aren't about the queue itself — they're about BFS graph traversal, sliding window optimization with a deque, or simulating time-based systems.",
              sortOrder: 0,
            },
          ],
          howToUseHeading: "Key Metrics",
          howToUseParagraphs: [
            "4 Queue Types | 5 Patterns | 15 LC Problems | 5 Templates",
          ],
        },
      },
      {
        id: "queue-mechanics",
        label: "Operations & Complexity",
        type: "concept",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 1,
        content: {
          pageTitle: "Operations & Complexity",
          subtitle: "Standard performance across different queue types.",
          subsections: [
            {
              subheading: "Performance Breakdown",
              bodyText:
                "Standard Queues, Deques, and Circular Queues all offer O(1) for adding and removing elements. Priority Queues, however, require O(log n) because they must maintain a sorted property (usually via a heap) internally.",
              tableData: [
                {
                  isHeader: true,
                  cells: [
                    "Operation",
                    "Simple Queue",
                    "Deque",
                    "Circular Queue",
                    "Priority Queue",
                  ],
                },
                {
                  isHeader: false,
                  cells: ["Enqueue (push)", "O(1)", "O(1)", "O(1)", "O(log n)"],
                },
                {
                  isHeader: false,
                  cells: ["Dequeue (pop)", "O(1)", "O(1)", "O(1)", "O(log n)"],
                },
                {
                  isHeader: false,
                  cells: ["Peek (front/rear)", "O(1)", "O(1)", "O(1)", "O(1)"],
                },
                {
                  isHeader: false,
                  cells: ["Search", "O(n)", "O(n)", "O(n)", "O(n)"],
                },
                {
                  isHeader: false,
                  cells: ["Space", "O(n)", "O(n)", "O(k)", "O(n)"],
                },
              ],
              codeBlocks: [],
              sortOrder: 0,
            },
            {
              subheading: "Key Vocabulary",
              bodyText: "Essential terms every candidate must know.",
              tableData: null,
              codeBlocks: [],
              sortOrder: 1,
              cards: [
                {
                  title: "FIFO Queue",
                  body: "Standard queue. Elements exit in the same order they entered. Python: collections.deque. Used in BFS, task scheduling.",
                  sortOrder: 0,
                },
                {
                  title: "Deque (Double-Ended)",
                  body: "Elements can be added/removed from both ends in O(1). Enables sliding window maximum and monotonic window patterns.",
                  sortOrder: 1,
                },
                {
                  title: "Circular Queue",
                  body: "Fixed-size queue using a ring buffer with head/tail pointers. O(1) operations, O(k) space. Used in streaming buffers.",
                  sortOrder: 2,
                },
                {
                  title: "Monotonic Deque",
                  body: "A deque maintained in strictly increasing or decreasing order. Enables range maximum/minimum queries in O(1).",
                  sortOrder: 3,
                },
              ],
            },
          ],
        },
      },
      {
        id: "cheat-sheet",
        label: "Cheat sheet",
        type: "cheatsheet",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 2,
        content: {
          pageTitle: "Queue Cheat Sheet",
          subtitle: "Python Quick Reference",
          patternRows: [],
          oneThingToRemember: [
            "Use collections.deque for O(1) operations from both ends.",
          ],
          codeTemplates: [
            {
              language: "python",
              label: "Python Quick Reference",
              code: "from collections import deque\nq = deque() # empty queue\nq.append(1) # enqueue right → [1]\nq.append(2) # enqueue right → [1, 2]\nq.appendleft(0) # enqueue left → [0, 1, 2]\nq.popleft() # dequeue front → 0, q=[1,2]\nq.pop() # dequeue rear → 2, q=[1]\nq[0] # peek front → 1\nq[-1] # peek rear → 1\nlen(q) == 0 # is empty → False",
              sortOrder: 0,
            },
          ],
        },
      },
    ],
  },
  {
    topicId: "GRAPH",
    title: "Graph",
    hasGuide: true,
    sortOrder: 8,
    sections: [
      {
        id: "before-you-start",
        label: "Introduction",
        type: "intro",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 0,
        content: {
          pageTitle: "The World of Nodes & Edges",
          subtitle: "Mastering connectivity, traversal, and shortest paths.",
          openingParagraph:
            "Graphs are arguably the most powerful data structure in computer science. They model everything from social networks and web pages to road maps and dependency chains. While they can seem intimidating, most graph problems boil down to a few core traversal patterns: BFS, DFS, and Union-Find.",
          prereqCards: [
            {
              title: "Adjacency List vs Matrix",
              body: "Understand how to represent graphs. Adjacency lists (Map of Lists) are O(V+E) space and the standard for most interview problems.",
              sortOrder: 0,
            },
            {
              title: "BFS vs DFS",
              body: "BFS (Queue) is for shortest paths in unweighted graphs. DFS (Recursion/Stack) is for connectivity, cycles, and exhaustive search.",
              sortOrder: 1,
            },
          ],
          callouts: [
            {
              variant: "info",
              body: "Interview Insight: Graph problems are often 'hidden'. A string transformation, a 2D grid, or a set of task dependencies are all secretly graph problems. Learning to 'see' the graph is 50% of the battle.",
              sortOrder: 0,
            },
          ],
          howToUseHeading: "The 8-Level Roadmap",
          howToUseParagraphs: [
            "We have categorized 32 curated problems into 8 logical levels. Complete each level before moving to the next. By Level 8, you will be able to handle advanced topics like Topological Sort and Critical Connections.",
          ],
        },
      },
      {
        id: "graph-roadmap",
        label: "Study Roadmap",
        type: "concept",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 1,
        content: {
          pageTitle: "Graph Learning Path",
          subtitle: "8 Levels of progressive mastery.",
          subsections: [
            {
              subheading: "Phase 1: Foundations (Levels 1-2)",
              bodyText:
                "Master basic BFS/DFS on adjacency lists and grids. Learn to count connected components (islands) and spreading processes (rotting oranges).",
              sortOrder: 0,
            },
            {
              subheading: "Phase 2: Structure & Logic (Levels 3-5)",
              bodyText:
                "Introduce Topological Sort for dependencies, cycle detection for bipartite checks, and Union-Find for dynamic connectivity. Transition into weighted graphs with Dijkstra.",
              sortOrder: 1,
            },
            {
              subheading: "Phase 3: Advanced Concepts (Levels 6-8)",
              bodyText:
                "Handle state-space graphs, Euler paths, and complex network properties like bridges (critical connections).",
              sortOrder: 2,
            },
          ],
        },
      },
      {
        id: "cheat-sheet",
        label: "Cheat sheet",
        type: "cheatsheet",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 2,
        content: {
          pageTitle: "Graph Cheat Sheet",
          subtitle: "Algorithms & Complexities",
          patternRows: [
            {
              patternName: "BFS / DFS",
              triggerWords: "Connected components, paths",
              timeComplexity: "O(V + E)",
              spaceComplexity: "O(V)",
              coreTrick: "Visited set to avoid cycles.",
              sortOrder: 0,
            },
            {
              patternName: "Dijkstra",
              triggerWords: "Shortest path (weighted)",
              timeComplexity: "O(E log V)",
              spaceComplexity: "O(V)",
              coreTrick: "Priority Queue with (dist, node).",
              sortOrder: 1,
            },
            {
              patternName: "Kahn's Algorithm",
              triggerWords: "Topological Sort, DAG",
              timeComplexity: "O(V + E)",
              spaceComplexity: "O(V)",
              coreTrick: "In-degree array + Queue.",
              sortOrder: 2,
            },
          ],
          oneThingToRemember: [
            "Always use a 'visited' set to avoid infinite loops in cyclic graphs.",
            "For grid problems, define directions: [(0,1), (0,-1), (1,0), (-1,0)].",
            "Topological sort only works on Directed Acyclic Graphs (DAGs).",
          ],
          questionGroups: [
            {
              groupName: "Level 1: Bascis (Traversal)",
              questions: [
                {
                  name: "Number of Islands",
                  leetcodeUrl:
                    "https://leetcode.com/problems/number-of-islands/",
                },
                {
                  name: "Flood Fill",
                  leetcodeUrl: "https://leetcode.com/problems/flood-fill/",
                },
              ],
            },
            {
              groupName: "Level 2: Grid + Multi-source",
              questions: [
                {
                  name: "Rotting Oranges",
                  leetcodeUrl: "https://leetcode.com/problems/rotting-oranges/",
                },
                {
                  name: "01 Matrix",
                  leetcodeUrl: "https://leetcode.com/problems/01-matrix/",
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    topicId: "DYNAMIC_PROGRAMMING",
    title: "Dynamic Programming",
    hasGuide: true,
    sortOrder: 10,
    sections: [
      {
        id: "before-you-start",
        label: "Introduction",
        type: "intro",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 0,
        content: {
          pageTitle: "The Art of Caching",
          subtitle:
            "Mastering complex optimizations by never solving the same subproblem twice.",
          openingParagraph:
            "Dynamic Programming (DP) is an optimization technique that solves complex problems by breaking them down into simpler overlapping subproblems. Instead of solving the same subproblem multiple times, DP stores the results and reuses them — a technique called memoization. If you can write a recursive solution, you are already 90% of the way to DP.",
          prereqCards: [
            {
              title: "Optimal Substructure",
              body: "The solution to a larger problem can be built using solutions to its smaller subproblems.",
              sortOrder: 0,
            },
            {
              title: "Overlapping Subproblems",
              body: "The same subproblems are solved repeatedly in a naive recursive approach.",
              sortOrder: 1,
            },
            {
              title: "State and Transition",
              body: "DP is all about defining a 'state' and a 'transition' (recurrence relation).",
              sortOrder: 2,
            },
          ],
          callouts: [
            {
              variant: "info",
              body: "Don't get intimidated by 'DP'. It's just recursion with a 'notebook' (cache). Start by drawing the recursion tree.",
              sortOrder: 0,
            },
          ],
          howToUseHeading: "The DP Roadmap",
          howToUseParagraphs: [
            "We have broken down DP into its most common interview patterns. Master 0/1 Knapsack first — it's the parent of nearly half of all DP problems.",
          ],
        },
      },
      {
        id: "knapsack-fundamentals",
        label: "Knapsack Fundamentals",
        type: "concept",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 1,
        content: {
          pageTitle: "The Knapsack Family",
          subtitle: "The most important foundation in DP.",
          subsections: [
            {
              subheading: "What is a Knapsack Problem?",
              bodyText:
                "You have a set of items, each with a weight and a value. You have a knapsack with a fixed capacity. Your goal is to maximize the total value.\n\nNearly every DP problem involves 'picking' or 'not picking' something to optimize a value under a constraint.",
              sortOrder: 0,
            },
            {
              subheading: "0/1 vs Unbounded",
              bodyText:
                "0/1 Knapsack: You have only ONE of each item (Take or Leave).\nUnbounded Knapsack: You have INFINITE copies of each item (Take again or Leave).",
              sortOrder: 1,
            },
          ],
        },
      },
      {
        id: "01-knapsack-pattern",
        label: "0/1 Knapsack Pattern",
        type: "pattern",
        isDivider: false,
        dividerLabel: null,
        sortOrder: 3,
        content: {
          pageTitle: "0/1 Knapsack Pattern",
          subtitle: "Pattern 1 of 3 · Medium · ~30 min",
          whatIsIt:
            "The 0/1 Knapsack pattern handles scenarios where you have a set of items and for each item, you must decide whether to include it in a subset or not (0 or 1 choice).",
          triggerPhrases: [
            "at most once",
            "pick or not pick",
            "maximize profit",
            "subset target sum",
          ],
          whenNotToUse:
            "Do not use when items can be used multiple times or when items can be cut into pieces (Fractional).",
          codeTemplates: [
            {
              language: "python",
              label: "Memoization (Top-Down)",
              code: "def solve(idx, cap):\n    if idx < 0 or cap <= 0: return 0\n    if (idx, cap) in memo: return memo[(idx, cap)]\n\n    # Option 1: Skip item\n    res = solve(idx - 1, cap)\n\n    # Option 2: Take item (if it fits)\n    if weights[idx] <= cap:\n        res = max(res, values[idx] + solve(idx - 1, cap - weights[idx]))\n\n    memo[(idx, cap)] = res\n    return res",
              sortOrder: 0,
            },
          ],
          workedExample: {
            problemTitle: "0/1 Knapsack Problem",
            problemStatement:
              "Given weights and values of n items, put these items in a knapsack of capacity W to get the maximum total value.",
            inputExample:
              "vals = [1, 4, 4, 5, 7], weights = [1, 2, 3, 4, 5], W = 7",
            outputExample: "11 (items with weights 2 and 5)",
            keyInsight:
              "By exploring both 'take' and 'not take' paths and caching the result, we avoid redundant calculations.",
            dryRunSteps: [
              {
                stepNumber: 1,
                description: "Start at idx 4 (wt=5, val=7), cap 7.",
                pointerState: "idx=4, W=7",
              },
              {
                stepNumber: 2,
                description:
                  "Option: Take wt 5. New cap 2. Solve for idx 3, cap 2.",
                pointerState: "idx=3, W=2",
              },
              {
                stepNumber: 3,
                description:
                  "Option: Skip wt 5. Cap remains 7. Solve for idx 3, cap 7.",
                pointerState: "idx=3, W=7",
              },
            ],
            timeComplexity: "O(n * W)",
            spaceComplexity: "O(n * W)",
          },
          practiceQuestions: [
            {
              name: "Partition Equal Subset Sum",
              difficulty: "Medium",
            },
          ],
          patternRows: [
            {
              patternName: "0/1 Knapsack",
              timeComplexity: "O(n*W)",
              spaceComplexity: "O(n*W) or O(W)",
              coreTrick: "dp[i][w] = max(dp[i-1][w], val + dp[i-1][w-wt])",
              sortOrder: 0,
            },
          ],
          oneThingToRemember: [
            "Binary Choice: Every item is either in or out.",
            "1D Array Optimization: 0/1 needs reverse loop, Unbounded needs forward loop.",
          ],
          questionGroups: [
            {
              groupName: "Knapsack Variants",
              sortOrder: 0,
              questions: [
                {
                  name: "Subset Sum Problem",
                  difficulty: "Medium",
                  leetcodeUrl: "https://leetcode.com/problems/subset-sum/",
                },
                {
                  name: "Target Sum",
                  leetcodeUrl: "https://leetcode.com/problems/target-sum/",
                },
              ],
            },
          ],
        },
      },
    ],
  },
];

const HASHMAP_QUESTIONS = [
  {
    title: "Two Sum",
    answer:
      "Use a hash map to store the elements and their indices. For each element, check if (target - element) exists in the map.",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["FAANG", "MNC", "Startup"],
    topics: ["HASHMAP"],
    leetcodeLink: "https://leetcode.com/problems/two-sum/",
    order: 1,
  },
  {
    title: "Valid Anagram",
    answer:
      "Count the frequency of characters in both strings using a hash map and compare them.",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["HASHMAP"],
    leetcodeLink: "https://leetcode.com/problems/valid-anagram/",
    order: 2,
  },
  {
    title: "Contains Duplicate",
    answer:
      "Use a hash set to track elements as you iterate. If an element is already in the set, a duplicate exists.",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["Startup", "MNC"],
    topics: ["HASHMAP"],
    leetcodeLink: "https://leetcode.com/problems/contains-duplicate/",
    order: 3,
  },
  {
    title: "Ransom Note",
    answer:
      "Count characters in the magazine string. For each character in the ransom note, decrement the count. If count becomes negative, return false.",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["HASHMAP"],
    leetcodeLink: "https://leetcode.com/problems/ransom-note/",
    order: 4,
  },
  {
    title: "First Unique Character in a String",
    answer:
      "Count the frequency of all characters first. Then iterate through the string again to find the first character with a frequency of 1.",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["FAANG", "MNC"],
    topics: ["HASHMAP"],
    leetcodeLink:
      "https://leetcode.com/problems/first-unique-character-in-a-string/",
    order: 5,
  },
  {
    title: "Intersection of Two Arrays II",
    answer:
      "Use a hash map to count elements of one array. Iterate through the second array and check if the element exists in the map with a count > 0.",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["Startup", "FAANG"],
    topics: ["HASHMAP"],
    leetcodeLink:
      "https://leetcode.com/problems/intersection-of-two-arrays-ii/",
    order: 6,
  },
  {
    title: "Group Anagrams",
    answer:
      "Use a sorted version of the string (or character counts) as a key in a hash map to group words together.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["HASHMAP"],
    leetcodeLink: "https://leetcode.com/problems/group-anagrams/",
    order: 7,
  },
  {
    title: "Subarray Sum Equals K",
    answer:
      "Use a prefix sum and a hash map to store the frequencies of all prefix sums encountered so far.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "MNC"],
    topics: ["HASHMAP"],
    leetcodeLink: "https://leetcode.com/problems/subarray-sum-equals-k/",
    order: 8,
  },
  {
    title: "Longest Consecutive Sequence",
    answer:
      "Insert all numbers into a hash set. For each number, if (number - 1) is not in the set, it's the start of a sequence. Expand from there.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["HASHMAP"],
    leetcodeLink: "https://leetcode.com/problems/longest-consecutive-sequence/",
    order: 9,
  },
  {
    title: "Top K Frequent Elements",
    answer:
      "Count frequencies then use bucket sort or a heap to get the top K elements.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["HASHMAP"],
    leetcodeLink: "https://leetcode.com/problems/top-k-frequent-elements/",
    order: 10,
  },
];

const SORTING_QUESTIONS = [
  {
    title: "Sort an Array",
    answer:
      "Implement merge sort or quick sort from scratch. Great for understanding sorting internals.",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["SORTING"],
    leetcodeLink: "https://leetcode.com/problems/sort-an-array/",
    order: 1,
  },
  {
    title: "Merge Sorted Array",
    answer:
      "Merge two sorted arrays in-place. Use a two-pointer approach from the end.",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["SORTING"],
    leetcodeLink: "https://leetcode.com/problems/merge-sorted-array/",
    order: 2,
  },
  {
    title: "Sort Colors",
    answer:
      "Classic Dutch National Flag problem. Sort 0s, 1s, 2s in one pass using 3 pointers.",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["SORTING"],
    leetcodeLink: "https://leetcode.com/problems/sort-colors/",
    order: 3,
  },
  {
    title: "Squares of a Sorted Array",
    answer:
      "Square each element and return sorted. Use two pointers from both ends.",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["SORTING"],
    leetcodeLink: "https://leetcode.com/problems/squares-of-a-sorted-array/",
    order: 4,
  },
  {
    title: "Kth Largest Element in an Array",
    answer:
      "Use QuickSelect (avg O(n)) or a min-heap of size K. Core sorting concept.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["SORTING"],
    leetcodeLink:
      "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    order: 5,
  },
  {
    title: "Merge Intervals",
    answer:
      "Sort intervals by start time, then greedily merge overlapping ones.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "MNC"],
    topics: ["SORTING"],
    leetcodeLink: "https://leetcode.com/problems/merge-intervals/",
    order: 6,
  },
  {
    title: "Largest Number",
    answer:
      "Custom comparator sort: compare ab vs ba as strings to order numbers for max result.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["SORTING"],
    leetcodeLink: "https://leetcode.com/problems/largest-number/",
    order: 7,
  },
  {
    title: "Sort Characters By Frequency",
    answer:
      "Count frequencies with a map, then sort by frequency using bucket sort or a heap.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["SORTING"],
    leetcodeLink: "https://leetcode.com/problems/sort-characters-by-frequency/",
    order: 8,
  },
  {
    title: "Wiggle Sort II",
    answer:
      "Sort the array, then interleave smaller and larger halves. Tricky index placement.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["SORTING"],
    leetcodeLink: "https://leetcode.com/problems/wiggle-sort-ii/",
    order: 9,
  },
  {
    title: "Count of Smaller Numbers After Self",
    answer:
      "Use merge sort with index tracking to count inversions — classic advanced sorting problem.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["SORTING"],
    leetcodeLink:
      "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
    order: 10,
  },
];

const QUEUE_QUESTIONS = [
  {
    title: "Number of Recent Calls",
    answer:
      "Use a queue to store timestamps. For each call, add the timestamp and dequeue any that are older than (t - 3000).",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["QUEUE"],
    leetcodeLink: "https://leetcode.com/problems/number-of-recent-calls/",
    order: 1,
  },
  {
    title: "Implement Stack using Queues",
    answer:
      "Use two queues or a single queue by rotating elements to maintain the LIFO property.",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["MNC"],
    topics: ["QUEUE"],
    leetcodeLink: "https://leetcode.com/problems/implement-stack-using-queues/",
    order: 2,
  },
  {
    title: "Implement Queue using Stacks",
    answer:
      "Use two stacks (input and output) to simulate the FIFO property. Amortized O(1) for push/pop.",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["MNC", "FAANG"],
    topics: ["QUEUE"],
    leetcodeLink: "https://leetcode.com/problems/implement-queue-using-stacks/",
    order: 3,
  },
  {
    title: "Design Circular Queue",
    answer:
      "Use a fixed-size array and two pointers (head, tail) to manage a ring buffer efficiently.",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["QUEUE"],
    leetcodeLink: "https://leetcode.com/problems/design-circular-queue/",
    order: 4,
  },
  {
    title: "First Unique Character in a String (Queue)",
    answer:
      "Use a hash map to count frequencies and a queue to keep track of the first unique character seen.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup", "FAANG"],
    topics: ["QUEUE"],
    leetcodeLink:
      "https://leetcode.com/problems/first-unique-character-in-a-string/",
    order: 5,
  },
  {
    title: "Binary Tree Level Order Traversal",
    answer:
      "Use a queue for Breadth-First Search (BFS) to process the tree nodes level by level.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "MNC"],
    topics: ["QUEUE"],
    leetcodeLink:
      "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    order: 6,
  },
  {
    title: "Rotting Oranges",
    answer:
      "Multi-source BFS using a queue to track all rotten oranges and spread the rot level by level.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["QUEUE"],
    leetcodeLink: "https://leetcode.com/problems/rotting-oranges/",
    order: 7,
  },
  {
    title: "01 Matrix",
    answer:
      "Multi-source BFS starting from all 0s in the matrix to find the shortest distance to each cell.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["QUEUE"],
    leetcodeLink: "https://leetcode.com/problems/01-matrix/",
    order: 8,
  },
  {
    title: "Walls and Gates",
    answer:
      "Start multi-source BFS from all gates ('0') to find the shortest distance to every empty room ('INF').",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "MNC"],
    topics: ["QUEUE"],
    leetcodeLink: "https://leetcode.com/problems/walls-and-gates/",
    order: 9,
  },
  {
    title: "Sliding Window Maximum (Deque)",
    answer:
      "Use a deque to maintain indices of elements in a monotonic decreasing order of values within the window.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["QUEUE"],
    leetcodeLink: "https://leetcode.com/problems/sliding-window-maximum/",
    order: 10,
  },
  {
    title: "Task Scheduler",
    answer:
      "Use a frequency map and a queue/priority queue to manage tasks while respecting cooldown times.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["QUEUE"],
    leetcodeLink: "https://leetcode.com/problems/task-scheduler/",
    order: 11,
  },
  {
    title: "Design Hit Counter",
    answer:
      "Use a queue to store timestamps of hits. For each request, remove hits that are older than 5 minutes.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup", "FAANG"],
    topics: ["QUEUE"],
    leetcodeLink: "https://leetcode.com/problems/design-hit-counter/",
    order: 12,
  },
  {
    title: "Shortest Path in Binary Matrix",
    answer:
      "Standard BFS on a matrix to find the shortest path from top-left to bottom-right.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["QUEUE"],
    leetcodeLink:
      "https://leetcode.com/problems/shortest-path-in-binary-matrix/",
    order: 13,
  },
  {
    title: "Shortest Subarray with Sum at Least K",
    answer:
      "Use a prefix sum and a deque to efficiently find the shortest subarray summing to at least K.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["QUEUE"],
    leetcodeLink:
      "https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/",
    order: 14,
  },
  {
    title: "Jump Game VI",
    answer:
      "Use DP combined with a monotonic deque to find the maximum possible score in O(n) time.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["QUEUE"],
    leetcodeLink: "https://leetcode.com/problems/jump-game-vi/",
    order: 15,
  },
];

const GRAPH_QUESTIONS = [
  // Level 1: Basics (Traversal – BFS/DFS)
  {
    title: "Number of Islands",
    answer:
      "Use BFS or DFS to traverse the grid. Whenever you find a '1', increment the island count and visit all connected '1's, marking them as visited.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/number-of-islands/",
    order: 1,
  },
  {
    title: "Flood Fill",
    answer:
      "Perform BFS or DFS starting from the source pixel. Change the color of the current pixel and all its adjacent pixels that have the same original color.",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["Startup", "MNC"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/flood-fill/",
    order: 2,
  },
  {
    title: "Find if Path Exists in Graph",
    answer:
      "Use BFS, DFS, or Union-Find to determine if the source and destination nodes are in the same connected component.",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/find-if-path-exists-in-graph/",
    order: 3,
  },
  {
    title: "Max Area of Island",
    answer:
      "Traverse the grid; for each '1', perform DFS to calculate the area of the island and update the maximum area found so far.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "MNC"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/max-area-of-island/",
    order: 4,
  },
  {
    title: "Number of Provinces",
    answer:
      "Find the number of connected components in an adjacency matrix using DFS, BFS, or Union-Find.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/number-of-provinces/",
    order: 5,
  },
  // Level 2: Grid + Multi-source BFS
  {
    title: "Rotting Oranges",
    answer:
      "Perform multi-source BFS starting with all initially rotten oranges. Track the time taken to rot all reachable fresh oranges.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/rotting-oranges/",
    order: 6,
  },
  {
    title: "01 Matrix",
    answer:
      "Use multi-source BFS starting from all '0's to find the shortest distance to each cell.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/01-matrix/",
    order: 7,
  },
  {
    title: "Surrounded Regions",
    answer:
      "Traverse the borders; for each 'O', perform DFS to mark all connected 'O' cells as safe. Then, flip all remaining 'O's to 'X's.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["MNC"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/surrounded-regions/",
    order: 8,
  },
  {
    title: "Walls and Gates",
    answer:
      "Multi-source BFS starting from all gates (0) to fill empty rooms (INF) with the distance to the nearest gate.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/walls-and-gates/",
    order: 9,
  },
  // Level 3: Cycle Detection + Topological Sort
  {
    title: "Course Schedule",
    answer:
      "Detect if there's a cycle in the directed graph using Kahn's algorithm (BFS) or DFS (with recursion stack tracking).",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "MNC"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/course-schedule/",
    order: 10,
  },
  {
    title: "Course Schedule II",
    answer:
      "Return any valid topological order using Kahn's algorithm. If a cycle exists, return an empty array.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/course-schedule-ii/",
    order: 11,
  },
  {
    title: "Is Graph Bipartite?",
    answer:
      "Use BFS or DFS to color the graph with 2 colors. If an edge connects two nodes of the same color, it's not bipartite.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/is-graph-bipartite/",
    order: 12,
  },
  {
    title: "Possible Bipartition",
    answer:
      "Model the dislikes as a graph and check if it's bipartite using 2-coloring (BFS/DFS).",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/possible-bipartition/",
    order: 13,
  },
  // Level 4: Union-Find (Disjoint Set)
  {
    title: "Redundant Connection",
    answer:
      "Use Union-Find to detect which edge creates a cycle in an undirected graph.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/redundant-connection/",
    order: 14,
  },
  {
    title: "Number of Operations to Make Network Connected",
    answer:
      "Count the number of connected components and ensure there are enough extra edges (Total Edges >= n-1).",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["GRAPH"],
    leetcodeLink:
      "https://leetcode.com/problems/number-of-operations-to-make-network-connected/",
    order: 15,
  },
  {
    title: "Accounts Merge",
    answer:
      "Use Union-Find to group common emails. Then, collect and sort emails for each root set.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/accounts-merge/",
    order: 16,
  },
  {
    title: "Graph Valid Tree",
    answer:
      "Check two conditions: exactly n-1 edges exist AND the graph is fully connected (no cycles). Use BFS or Union-Find.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/graph-valid-tree/",
    order: 17,
  },
  // Level 5: Shortest Path
  {
    title: "Network Delay Time",
    answer:
      "Use Dijkstra's algorithm to find the maximum of the shortest paths from the source to all other nodes.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/network-delay-time/",
    order: 18,
  },
  {
    title: "Cheapest Flights Within K Stops",
    answer:
      "Use Bellman-Ford or Dijkstra modified to track the number of stops.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GRAPH"],
    leetcodeLink:
      "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
    order: 19,
  },
  {
    title: "Path with Minimum Effort",
    answer:
      "Use Dijkstra's algorithm where the priority is defined by the maximum absolute difference along a path.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/path-with-minimum-effort/",
    order: 20,
  },
  {
    title: "Swim in Rising Water",
    answer:
      "Use a modified Dijkstra's or Union-Find (sorting weights) to find the minimum time to reach the destination.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/swim-in-rising-water/",
    order: 21,
  },
  // Level 6: Advanced BFS / State Graph
  {
    title: "Word Ladder",
    answer:
      "Use BFS to find the shortest transformation sequence. Transform the word one character at a time and check presence in the word list.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/word-ladder/",
    order: 22,
  },
  {
    title: "Word Ladder II",
    answer:
      "Use BFS to find the shortest path length and store parents, then use backtracking (DFS) to reconstruct all paths.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/word-ladder-ii/",
    order: 23,
  },
  {
    title: "Open the Lock",
    answer:
      "Shortest path BFS where each lock state is a node. Avoid deadends during expansion.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/open-the-lock/",
    order: 24,
  },
  {
    title: "Minimum Genetic Mutation",
    answer:
      "Similar to Word Ladder; BFS to find shortest path from start to end gene while constrained by the bank.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/minimum-genetic-mutation/",
    order: 25,
  },
  // Level 7: Advanced DFS + Backtracking
  {
    title: "Reconstruct Itinerary",
    answer:
      "Hierholzer's algorithm (DFS) to find an Eulerian path in a directed graph, sorting targets lexicographically.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/reconstruct-itinerary/",
    order: 26,
  },
  {
    title: "All Paths From Source to Target",
    answer:
      "Simple backtracking (DFS) to find all possible paths from node 0 to node n-1 in a DAG.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["GRAPH"],
    leetcodeLink:
      "https://leetcode.com/problems/all-paths-from-source-to-target/",
    order: 27,
  },
  {
    title: "Keys and Rooms",
    answer:
      "BFS or DFS simulation. If you visit all n rooms starting from room 0, return True.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/keys-and-rooms/",
    order: 28,
  },
  // Level 8: Hard Graph Concepts
  {
    title: "Alien Dictionary",
    answer:
      "Build a directed graph from lexicographical comparisons of adjacent words, then perform topological sort.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/alien-dictionary/",
    order: 29,
  },
  {
    title: "Critical Connections in a Network",
    answer:
      "Use Tarjan's or a similar DFS-based algorithm to find bridges (edges whose removal increases component count).",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GRAPH"],
    leetcodeLink:
      "https://leetcode.com/problems/critical-connections-in-a-network/",
    order: 30,
  },
  {
    title: "Clone Graph",
    answer:
      "Use a hash map to map original nodes to their cloned counterparts and perform BFS or DFS to deep copy all nodes.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GRAPH"],
    leetcodeLink: "https://leetcode.com/problems/clone-graph/",
    order: 31,
  },
  {
    title: "Shortest Path in Binary Matrix",
    answer:
      "BFS on an 8-direction grid to find the shortest path from [0,0] to [n-1,n-1].",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GRAPH"],
    leetcodeLink:
      "https://leetcode.com/problems/shortest-path-in-binary-matrix/",
    order: 32,
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
    const guidesCollection = db.collection("studyguides");
    const questionsCollection = db.collection("dsaquestions");

    // Seed Study Guides
    for (const guide of STUDY_GUIDE_DATA) {
      const existing = await guidesCollection.findOne(
        { topicId: guide.topicId },
        { projection: { contentId: 1 } },
      );
      const contentId =
        typeof existing?.contentId === "string" && existing.contentId.length > 0
          ? existing.contentId
          : uuidv5(guide.topicId, STUDY_GUIDE_CONTENT_ID_NAMESPACE);

      const payload = {
        ...guide,
        contentId,
        updatedAt: new Date(),
      };

      await guidesCollection.updateOne(
        { topicId: guide.topicId },
        { $set: payload, $setOnInsert: { createdAt: new Date() } },
        { upsert: true },
      );
      console.log(`Seeded topic guide: ${guide.topicId}`);
    }

    // Seed Hash Map Questions
    for (const q of HASHMAP_QUESTIONS) {
      const payload = {
        ...q,
        resources: {
          youtubeURL: `https://www.youtube.com/results?search_query=${q.title.replace(/\s+/g, "+")}+leetcode`,
          leetcodeURL: q.leetcodeLink,
          blogURL: null,
        },
        updatedAt: new Date(),
      };

      // Remove leetcodeLink as it's inside resources now
      delete (payload as any).leetcodeLink;

      await questionsCollection.updateOne(
        { title: q.title },
        { $set: payload, $setOnInsert: { createdAt: new Date() } },
        { upsert: true },
      );
    }
    console.log(`Seeded ${HASHMAP_QUESTIONS.length} Hash Map questions`);

    // Seed Sorting Questions
    for (const q of SORTING_QUESTIONS) {
      const payload = {
        ...q,
        resources: {
          youtubeURL: `https://www.youtube.com/results?search_query=${q.title.replace(/\s+/g, "+")}+leetcode`,
          leetcodeURL: q.leetcodeLink,
          blogURL: null,
        },
        updatedAt: new Date(),
      };

      delete (payload as any).leetcodeLink;

      await questionsCollection.updateOne(
        { title: q.title },
        { $set: payload, $setOnInsert: { createdAt: new Date() } },
        { upsert: true },
      );
    }
    console.log(`Seeded ${SORTING_QUESTIONS.length} Sorting questions`);

    // Seed Queue Questions
    for (const q of QUEUE_QUESTIONS) {
      const payload = {
        ...q,
        resources: {
          youtubeURL: `https://www.youtube.com/results?search_query=${q.title.replace(/\s+/g, "+")}+leetcode`,
          leetcodeURL: q.leetcodeLink,
          blogURL: null,
        },
        updatedAt: new Date(),
      };

      delete (payload as any).leetcodeLink;

      await questionsCollection.updateOne(
        { title: q.title },
        { $set: payload, $setOnInsert: { createdAt: new Date() } },
        { upsert: true },
      );
    }
    console.log(`Seeded ${QUEUE_QUESTIONS.length} Queue questions`);

    // Seed Graph Questions
    for (const q of GRAPH_QUESTIONS) {
      const payload = {
        ...q,
        resources: {
          youtubeURL: `https://www.youtube.com/results?search_query=${q.title.replace(/\s+/g, "+")}+leetcode`,
          leetcodeURL: q.leetcodeLink,
          blogURL: null,
        },
        updatedAt: new Date(),
      };

      delete (payload as any).leetcodeLink;

      await questionsCollection.updateOne(
        { title: q.title },
        { $set: payload, $setOnInsert: { createdAt: new Date() } },
        { upsert: true },
      );
    }
    console.log(`Seeded ${GRAPH_QUESTIONS.length} Graph questions`);

    // Seed Dynamic Programming Questions
    for (const q of DYNAMIC_PROGRAMMING_QUESTIONS) {
      const payload = {
        ...q,
        resources: {
          youtubeURL: `https://www.youtube.com/results?search_query=${q.title.replace(/\s+/g, "+")}+leetcode`,
          leetcodeURL: q.leetcodeLink,
          blogURL: null,
        },
        updatedAt: new Date(),
      };

      delete (payload as any).leetcodeLink;

      await questionsCollection.updateOne(
        { title: q.title },
        { $set: payload, $setOnInsert: { createdAt: new Date() } },
        { upsert: true },
      );
    }
    console.log(
      `Seeded ${DYNAMIC_PROGRAMMING_QUESTIONS.length} Dynamic Programming questions`,
    );

    // Seed Greedy Questions
    for (const q of GREEDY_QUESTIONS) {
      const payload = {
        ...q,
        resources: {
          youtubeURL: `https://www.youtube.com/results?search_query=${q.title.replace(/\s+/g, "+")}+leetcode`,
          leetcodeURL: q.leetcodeLink,
          blogURL: null,
        },
        updatedAt: new Date(),
      };

      delete (payload as any).leetcodeLink;

      await questionsCollection.updateOne(
        { title: q.title },
        { $set: payload, $setOnInsert: { createdAt: new Date() } },
        { upsert: true },
      );
    }
    console.log(`Seeded ${GREEDY_QUESTIONS.length} Greedy questions`);

    // Seed Monotonic Stack Questions
    for (const q of MONOTONIC_STACK_QUESTIONS) {
      const payload = {
        ...q,
        resources: {
          youtubeURL: `https://www.youtube.com/results?search_query=${q.title.replace(/\s+/g, "+")}+leetcode`,
          leetcodeURL: q.leetcodeLink,
          blogURL: null,
        },
        updatedAt: new Date(),
      };

      delete (payload as any).leetcodeLink;

      await questionsCollection.updateOne(
        { title: q.title },
        { $set: payload, $setOnInsert: { createdAt: new Date() } },
        { upsert: true },
      );
    }
    console.log(
      `Seeded ${MONOTONIC_STACK_QUESTIONS.length} Monotonic Stack questions`,
    );

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await client.close();
  }
}

const DYNAMIC_PROGRAMMING_QUESTIONS = [
  {
    title: "Climbing Stairs",
    answer: "Ways to reach step n is sum of ways to reach (n-1) and (n-2).",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["MNC", "Startup"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink: "https://leetcode.com/problems/climbing-stairs/",
    order: 1,
  },
  {
    title: "Min Cost Climbing Stairs",
    answer: "dp[i] = cost[i] + min(dp[i-1], dp[i-2])",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink: "https://leetcode.com/problems/min-cost-climbing-stairs/",
    order: 2,
  },
  {
    title: "House Robber",
    answer: "dp[i] = max(dp[i-1], nums[i] + dp[i-2])",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "MNC"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink: "https://leetcode.com/problems/house-robber/",
    order: 3,
  },
  {
    title: "Partition Equal Subset Sum",
    answer: "Subset sum problem with target = total_sum / 2.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink: "https://leetcode.com/problems/partition-equal-subset-sum/",
    order: 4,
  },
  {
    title: "Closest Dessert Cost",
    answer: "Use DP or recursion to find a sum closest to the target budget.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink: "https://leetcode.com/problems/closest-dessert-cost/",
    order: 5,
  },
  {
    title: "Minimum Cost to Connect Sticks",
    answer:
      "Use a Min-Priority Queue to merge the smallest sticks at each step.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink:
      "https://leetcode.com/problems/minimum-cost-to-connect-sticks/",
    order: 6,
  },
  {
    title: "Kth Smallest Element in a Sorted Matrix",
    answer: "Find the kth smallest element using binary search or DP variants.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["DYNAMIC_PROGRAMMING", "BINARY_SEARCH"],
    leetcodeLink:
      "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/",
    order: 7,
  },
  {
    title: "Target Sum",
    answer:
      "Find number of ways to assign +/- symbols to get a target sum. Equivalent to Count Subsets with Given Difference.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "MNC"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink: "https://leetcode.com/problems/target-sum/",
    order: 8,
  },
  {
    title: "Coin Change II (Max Ways / Unbounded)",
    answer: "Number of ways to make a total using infinite supply of coins.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink: "https://leetcode.com/problems/coin-change-2/",
    order: 9,
  },
  {
    title: "Minimum Cost to Cut a Stick",
    answer:
      "Find the minimum cost to cut a wooden stick at specific positions using partition DP.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink: "https://leetcode.com/problems/minimum-cost-to-cut-a-stick/",
    order: 10,
  },
  {
    title: "Coin Change (Min Coins)",
    answer: "Minimum number of coins to make a total.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink: "https://leetcode.com/problems/coin-change/",
    order: 11,
  },
  {
    title: "Longest Common Subsequence",
    answer: "Standard 2D DP to find LCS between two strings.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "MNC"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink: "https://leetcode.com/problems/longest-common-subsequence/",
    order: 12,
  },
  {
    title: "Maximum Length of Repeated Subarray",
    answer:
      "Find the maximum length of a common subarray (substring) between two arrays.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink:
      "https://leetcode.com/problems/maximum-length-of-repeated-subarray/",
    order: 13,
  },
  {
    title: "Shortest Common Supersequence",
    answer:
      "Length = (m+n) - LCS_length. Print the sequence by following DP table.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink:
      "https://leetcode.com/problems/shortest-common-supersequence/",
    order: 14,
  },
  {
    title: "Delete Operation for Two Strings",
    answer: "Min insertions/deletions = (m+n) - 2*LCS_length.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["MNC"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink:
      "https://leetcode.com/problems/delete-operation-for-two-strings/",
    order: 15,
  },
  {
    title: "Longest Palindromic Subsequence",
    answer: "LCS of string and its reverse.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink:
      "https://leetcode.com/problems/longest-palindromic-subsequence/",
    order: 16,
  },
  {
    title: "Longest Repeating Character Replacement",
    answer:
      "Sliding window with frequency count to find maximum repeating sequence.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["DYNAMIC_PROGRAMMING", "SLIDING_WINDOW"],
    leetcodeLink:
      "https://leetcode.com/problems/longest-repeating-character-replacement/",
    order: 17,
  },
  {
    title: "Is Subsequence",
    answer:
      "Check if one string is a subsequence of another using two pointers or DP.",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["MNC", "Startup"],
    topics: ["DYNAMIC_PROGRAMMING", "TWO_POINTERS"],
    leetcodeLink: "https://leetcode.com/problems/is-subsequence/",
    order: 18,
  },
  {
    title: "Minimum Insertion Steps to Make a String Palindrome",
    answer: "Length - LPS_length.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink:
      "https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/",
    order: 19,
  },
  {
    title: "Minimum Cost Tree From Leaf Values",
    answer:
      "Use partition DP or greedy approach with stack to minimize tree cost.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink:
      "https://leetcode.com/problems/minimum-cost-tree-from-leaf-values/",
    order: 20,
  },
  {
    title: "Palindrome Partitioning II",
    answer: "Find minimum cuts needed to partition a string into palindromes.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink: "https://leetcode.com/problems/palindrome-partitioning-ii/",
    order: 21,
  },
  {
    title: "Different Ways to Add Parentheses",
    answer:
      "Compute all possible results of expressions with different groupings.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink:
      "https://leetcode.com/problems/different-ways-to-add-parentheses/",
    order: 22,
  },
  {
    title: "Scramble String",
    answer:
      "Check if one string is a scramble version of another using recursive partition DP.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink: "https://leetcode.com/problems/scramble-string/",
    order: 23,
  },
  {
    title: "Super Egg Drop",
    answer:
      "Find the minimum number of attempts to find the critical floor with k eggs and n floors.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink: "https://leetcode.com/problems/super-egg-drop/",
    order: 24,
  },
  {
    title: "Word Break",
    answer: "dp[i] is true if s[:i] can be segmented using dictionary words.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink: "https://leetcode.com/problems/word-break/",
    order: 25,
  },
  {
    title: "Edit Distance",
    answer:
      "Min operations (insert, delete, replace) to convert one string to another.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["DYNAMIC_PROGRAMMING"],
    leetcodeLink: "https://leetcode.com/problems/edit-distance/",
    order: 26,
  },
];

const GREEDY_QUESTIONS = [
  {
    title: "Bag of Tokens",
    answer:
      "Use two pointers. Gain score by sacrificing tokens at left (min cost) and gain tokens by sacrificing score at right (max gain).",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["GREEDY"],
    leetcodeLink: "https://leetcode.com/problems/bag-of-tokens/",
    order: 1,
  },
  {
    title: "Boats to Save People",
    answer:
      "Sort the people by weight. Use two pointers to pair the heaviest and lightest people together if their combined weight fits in a boat.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["GREEDY"],
    leetcodeLink: "https://leetcode.com/problems/boats-to-save-people/",
    order: 2,
  },
  {
    title: "Break a Palindrome",
    answer:
      "Iterate through the first half of the string and replace the first non-'a' character with 'a'. If all are 'a', replace the last character with 'b'.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GREEDY"],
    leetcodeLink: "https://leetcode.com/problems/break-a-palindrome/",
    order: 3,
  },
  {
    title: "Broken Calculator",
    answer:
      "Work backwards from target to X. If target is even, divide by 2. If odd, add 1. This minimizes operations.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GREEDY"],
    leetcodeLink: "https://leetcode.com/problems/broken-calculator/",
    order: 4,
  },
  {
    title: "Minimum Time to Make Rope Colorful",
    answer:
      "For consecutive balloons of the same color, keep the one with the maximum removal cost and add the rest to the total cost.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["GREEDY"],
    leetcodeLink:
      "https://leetcode.com/problems/minimum-time-to-make-rope-colorful/",
    order: 5,
  },
  {
    title: "Earliest Possible Day of Full Bloom",
    answer:
      "Sort plants by their grow time in descending order. This ensures plants that take longer to grow start growing as early as possible.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GREEDY"],
    leetcodeLink:
      "https://leetcode.com/problems/earliest-possible-day-of-full-bloom/",
    order: 6,
  },
  {
    title: "Longest Palindrome by Concatenating Two Letter Words",
    answer:
      "Use a map to count frequencies of words. Pair words with their reverse. Handle symmetrical words specially.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["GREEDY", "HASHMAP"],
    leetcodeLink:
      "https://leetcode.com/problems/longest-palindrome-by-concatenating-two-letter-words/",
    order: 7,
  },
  {
    title: "Maximum 69 Number",
    answer:
      "Find the first occurrence of the digit '6' from the left and change it to '9' to get the maximum number.",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["MNC"],
    topics: ["GREEDY"],
    leetcodeLink: "https://leetcode.com/problems/maximum-69-number/",
    order: 8,
  },
  {
    title: "Maximum Bags With Full Capacity of Rocks",
    answer:
      "Calculate remaining capacity for each bag. Sort these capacities in ascending order and fill bags using additional rocks.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["GREEDY"],
    leetcodeLink:
      "https://leetcode.com/problems/maximum-bags-with-full-capacity-of-rocks/",
    order: 9,
  },
  {
    title: "Maximum Number of Rounds to Complete All Tasks",
    answer:
      "Count frequencies of tasks. For each frequency f, if f=1 return -1. Else, number of rounds is ceil(f/3).",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["MNC"],
    topics: ["GREEDY"],
    leetcodeLink:
      "https://leetcode.com/problems/minimum-rounds-to-complete-all-tasks/",
    order: 10,
  },
  {
    title: "Maximum Ice Cream Bars",
    answer:
      "Sort costs in ascending order. Buy ice cream bars starting from the cheapest until you run out of coins.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["GREEDY"],
    leetcodeLink: "https://leetcode.com/problems/maximum-ice-cream-bars/",
    order: 11,
  },
  {
    title: "Gas Station",
    answer:
      "If total gas is less than total cost, return -1. Otherwise, find the start station where current gas never drops below zero.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["GREEDY"],
    leetcodeLink: "https://leetcode.com/problems/gas-station/",
    order: 12,
  },
  {
    title: "Optimal Partition of String",
    answer:
      "Iterate through the string and keep adding characters to a current substring until you find a duplicate.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["GREEDY"],
    leetcodeLink: "https://leetcode.com/problems/optimal-partition-of-string/",
    order: 13,
  },
  {
    title: "Minimum Replacements to Sort the Array",
    answer:
      "Iterate backwards and replace each number such that it's just smaller than or equal to the next number.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GREEDY"],
    leetcodeLink:
      "https://leetcode.com/problems/minimum-replacements-to-sort-the-array/",
    order: 14,
  },
  {
    title: "Minimum Number of Taps to Open to Water a Garden",
    answer:
      "Convert each tap's range to an interval [start, end]. Solve by finding the minimum number of intervals to cover [0, n].",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["GREEDY"],
    leetcodeLink:
      "https://leetcode.com/problems/minimum-number-taps-to-open-to-water-a-garden/",
    order: 15,
  },
  {
    title: "Minimum Deletions to Make Character Frequencies Unique",
    answer:
      "Count frequencies and use a set to track used frequencies. Decrement counts until you find a unique available one.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["MNC", "Startup"],
    topics: ["GREEDY"],
    leetcodeLink:
      "https://leetcode.com/problems/minimum-deletions-to-make-character-frequencies-unique/",
    order: 16,
  },
  {
    title: "Candy",
    answer:
      "Two-pass greedy approach: left to right to satisfy right neighbors, and right to left to satisfy left neighbors.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GREEDY"],
    leetcodeLink: "https://leetcode.com/problems/candy/",
    order: 17,
  },
  {
    title: "Remove Colored Pieces if Both Neighbors are the Same Color",
    answer:
      "Count number of 'A' triplets and 'B' triplets. Alice wins if count(A) > count(B).",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["GREEDY"],
    leetcodeLink:
      "https://leetcode.com/problems/remove-colored-pieces-if-both-neighbors-are-the-same-color/",
    order: 18,
  },
  {
    title: "Minimum Maximum Element After Decreasing and Rearranging",
    answer:
      "Sort the array, then adjust each element to be at most 1 greater than its predecessor.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["MNC"],
    topics: ["GREEDY"],
    leetcodeLink:
      "https://leetcode.com/problems/minimum-maximum-element-after-decreasing-and-rearranging/",
    order: 19,
  },
  {
    title: "Maximum Points You Can Obtain from Cards",
    answer:
      "Sliding window approach: calculate points of first k cards, then slide from right to take cards from both ends.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["GREEDY"],
    leetcodeLink:
      "https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/",
    order: 20,
  },
  {
    title: "Watering Plants",
    answer:
      "Iterate through plants. If current water is enough, move 1 step. Else, move back to source and back again.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["GREEDY"],
    leetcodeLink: "https://leetcode.com/problems/watering-plants/",
    order: 21,
  },
  {
    title: "Find Polygon With the Largest Perimeter",
    answer:
      "Sort sides in ascending order. Find the largest prefix sum that is greater than the next side length.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["GREEDY"],
    leetcodeLink:
      "https://leetcode.com/problems/find-polygon-with-the-largest-perimeter/",
    order: 22,
  },
  {
    title: "Patching Array",
    answer:
      "Maintain the maximum range [1, miss) that can be covered. If next element > miss, patch by adding miss.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GREEDY"],
    leetcodeLink: "https://leetcode.com/problems/patching-array/",
    order: 23,
  },
  {
    title: "Maximum Distance in Arrays",
    answer:
      "Iterate arrays once while tracking global min and max seen so far to calculate distance with current ends.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["GREEDY"],
    leetcodeLink: "https://leetcode.com/problems/maximum-distance-in-arrays/",
    order: 24,
  },
  {
    title: "Maximum Manhattan Distance After K Changes",
    answer:
      "Greedily change a move to its opposite direction to maximize distance from the origin.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["GREEDY"],
    leetcodeLink:
      "https://leetcode.com/problems/maximum-manhattan-distance-after-k-changes/",
    order: 25,
  },
  {
    title: "Maximum Difference by Changing an Integer",
    answer:
      "Change the first non-'9' digit to '9' for max, and the first non-'1'/'0' digit to '1'/'0' for min.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["GREEDY"],
    leetcodeLink:
      "https://leetcode.com/problems/max-difference-you-can-get-from-changing-an-integer/",
    order: 26,
  },
  {
    title: "Partition into Minimum Number of Deci-Binary Numbers",
    answer: "The answer is the maximum digit in the input string.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["MNC"],
    topics: ["GREEDY"],
    leetcodeLink:
      "https://leetcode.com/problems/partitioning-into-minimum-number-of-deci-binary-numbers/",
    order: 27,
  },
  {
    title: "Merge Intervals",
    answer:
      "Sort intervals by start time, then greedily merge overlapping ones by updating current end.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "MNC"],
    topics: ["GREEDY", "SORTING"],
    leetcodeLink: "https://leetcode.com/problems/merge-intervals/",
    order: 28,
  },
];

const MONOTONIC_STACK_QUESTIONS = [
  {
    title: "Next Greater Element I",
    answer:
      "Use a monotonic decreasing stack to find the next greater element for each number. Map results back to the original array.",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["MNC", "Startup"],
    topics: ["MONOTONIC_STACK"],
    leetcodeLink: "https://leetcode.com/problems/next-greater-element-i/",
    order: 1,
  },
  {
    title: "Next Greater Element II",
    answer:
      "Iterate through the circular array twice using a monotonic stack to resolve next greater elements for all indices.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["MONOTONIC_STACK"],
    leetcodeLink: "https://leetcode.com/problems/next-greater-element-ii/",
    order: 2,
  },
  {
    title: "Daily Temperatures",
    answer:
      "Use a monotonic stack to track temperatures and their indices. Pop from the stack once a warmer temperature is encountered.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["MONOTONIC_STACK"],
    leetcodeLink: "https://leetcode.com/problems/daily-temperatures/",
    order: 3,
  },
  {
    title: "Final Prices With a Special Discount in a Shop",
    answer:
      "Find the next smaller element for each price using a monotonic stack to calculate the discounted price.",
    difficulty: "EASY",
    domain: ["DSA"],
    companyTypes: ["Startup"],
    topics: ["MONOTONIC_STACK"],
    leetcodeLink:
      "https://leetcode.com/problems/final-prices-with-a-special-discount-in-a-shop/",
    order: 4,
  },
  {
    title: "Stock Span Problem (Online Stock Span)",
    answer:
      "Use a monotonic stack to store [price, span] pairs. Pop elements that are smaller or equal to current price and add their spans.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "MNC"],
    topics: ["MONOTONIC_STACK"],
    leetcodeLink: "https://leetcode.com/problems/online-stock-span/",
    order: 5,
  },
  {
    title: "Remove K Digits",
    answer:
      "Maintain a monotonic increasing stack. If a smaller digit is found, pop larger digits from the stack to minimize the resulting number.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["MONOTONIC_STACK"],
    leetcodeLink: "https://leetcode.com/problems/remove-k-digits/",
    order: 6,
  },
  {
    title: "Remove Duplicate Letters",
    answer:
      "Use a monotonic stack to keep the smallest lexicographical result. Only pop if the character is larger and will appear again later.",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["MONOTONIC_STACK"],
    leetcodeLink: "https://leetcode.com/problems/remove-duplicate-letters/",
    order: 7,
  },
  {
    title: "Largest Rectangle in Histogram",
    answer:
      "Calculate the width for each bar (next smaller to left and right) using monotonic stacks to find the largest area.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["MONOTONIC_STACK"],
    leetcodeLink:
      "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    order: 8,
  },
  {
    title: "Maximal Rectangle",
    answer:
      "Apply 'Largest Rectangle in Histogram' on each row of the grid, treating the consecutive 1s above as heights.",
    difficulty: "HARD",
    domain: ["DSA"],
    companyTypes: ["FAANG"],
    topics: ["MONOTONIC_STACK"],
    leetcodeLink: "https://leetcode.com/problems/maximal-rectangle/",
    order: 9,
  },
  {
    title: "Sum of Subarray Minimums",
    answer:
      "Calculate contribution of each element as a minimum in subarrays using (distance to next smaller left) * (distance to next smaller right).",
    difficulty: "MEDIUM",
    domain: ["DSA"],
    companyTypes: ["FAANG", "Startup"],
    topics: ["MONOTONIC_STACK"],
    leetcodeLink: "https://leetcode.com/problems/sum-of-subarray-minimums/",
    order: 10,
  },
];

seed();
