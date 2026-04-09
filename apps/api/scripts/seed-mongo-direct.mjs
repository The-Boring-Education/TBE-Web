import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db();

    // The raw JSON array provided by the user
    const rawQuestions = [
      {
        _id: { $oid: "a1b2c3d4e5f6a7b8c9d0e1f2" },
        title: "Best Time to Buy and Sell Stock",
        domain: ["GENERAL", "FINANCE"],
        difficulty: "EASY",
        companyTypes: ["MNC", "Startup", "Fintech"],
        topics: ["ARRAY"],
        createdAt: { $date: "2026-04-06T10:00:00.000Z" },
        updatedAt: { $date: "2026-04-06T10:00:00.000Z" },
        __v: 0,
        order: 1,
        answer:
          "# Best Time to Buy and Sell Stock\n\nYou're given an array `prices` where `prices[i]` is the price of a stock on day `i`. You want to maximize your profit by choosing a single day to buy and a single day to sell **after** the buy day.\n\nReturn the maximum profit. If no profit is possible, return 0.\n\n## Examples\n\n**Example 1:**\n**Input:** `prices = [7, 1, 5, 3, 6, 4]`\n**Output:** `5`\n**Explanation:** Buy on day 2 (price=1), sell on day 5 (price=6). Profit = 6 - 1 = 5.\n\n**Example 2:**\n**Input:** `prices = [7, 6, 4, 3, 1]`\n**Output:** `0`\n**Explanation:** Prices only fall. No transaction is profitable.\n\n## Constraints\n- 1 <= prices.length <= 100,000\n- 0 <= prices[i] <= 10,000\n",
        resources: {
          leetcodeURL:
            "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
          blogURL: null,
        },
        sections: {
          first_principles: {
            paragraphs: [
              "Imagine you're a trader watching a stock ticker for a month. Every day you note the price. At the end, you want to figure out: what was the best single day to have bought, and the best later day to have sold?",
              "You can't go back in time — you must buy before you sell. So the sell day index must always be greater than the buy day index.",
              "The naive way is to check every pair of (buy day, sell day), compute profit, and take the max. That works but it's slow — O(n²).",
              "The better insight: as you scan prices left to right, track the lowest price seen so far. For each day, ask — if I sell today, what's my profit given the best buy I could've done before today?",
            ],
            key_observation:
              "Track the minimum price seen so far and compute profit at each step. One pass is enough.",
          },
          constraints: [
            {
              constraint: "You must buy before you sell",
              plain_meaning:
                "The buy index must come before the sell index in the array.",
              implication:
                "You can't simply find the global min and max — the min must appear before the max.",
            },
            {
              constraint: "Return 0 if no profit is possible",
              plain_meaning:
                "If prices only decrease, there's no valid trade to make.",
              implication: "Initialize max_profit = 0, not -Infinity.",
            },
          ],
          examples: [
            {
              label: "Example 1",
              input: "[7, 1, 5, 3, 6, 4]",
              output: "5",
              explanation:
                "Buy at index 1 (price=1), sell at index 4 (price=6). Profit = 5.",
              step_by_step: [
                "Day 0: price=7. min_price=7, max_profit=0",
                "Day 1: price=1. min_price=1, max_profit=0",
                "Day 2: price=5. profit=5-1=4. max_profit=4",
                "Day 3: price=3. profit=3-1=2. max_profit stays 4",
                "Day 4: price=6. profit=6-1=5. max_profit=5",
                "Day 5: price=4. profit=4-1=3. max_profit stays 5",
              ],
            },
            {
              label: "Example 2",
              input: "[7, 6, 4, 3, 1]",
              output: "0",
              explanation:
                "Prices are always falling. No profitable trade exists.",
              step_by_step: null,
            },
            {
              label: "Example 3 — edge case",
              input: "[5]",
              output: "0",
              explanation: "Only one day — can't buy and sell on the same day.",
              step_by_step: null,
            },
          ],
          ways_to_solve: [
            {
              approach_number: 1,
              name: "Brute Force — check every pair",
              description:
                "Use two nested loops. For every buy day i, try every sell day j > i and track the maximum profit.",
              time_complexity: "O(n²)",
              time_reason: "Every pair (i, j) is visited once.",
              space_complexity: "O(1)",
              space_reason: "No extra data structures used.",
              verdict: "too_slow",
              verdict_label: "Works but too slow — use only to build intuition",
            },
            {
              approach_number: 2,
              name: "Optimal — single pass with min tracking",
              description:
                "Iterate once. Maintain the minimum price seen so far. At each step, compute profit if sold today and update max profit.",
              time_complexity: "O(n)",
              time_reason: "Each element is visited exactly once.",
              space_complexity: "O(1)",
              space_reason:
                "Only two variables are maintained — min_price and max_profit.",
              verdict: "optimal",
              verdict_label: "Optimal — this is the interview answer",
            },
          ],
          how_to_approach: {
            steps: [
              {
                step_number: 1,
                heading: "Ground it in real life",
                body: "Think of yourself as an investor reviewing historical stock data. You want the best single trade — one buy, one sell, buy before sell.",
              },
              {
                step_number: 2,
                heading: "Identify the constraint",
                body: "The sell must come after the buy — this rules out simply finding global min and max independently.",
              },
              {
                step_number: 3,
                heading: "Reject brute force early",
                body: "Checking every pair is O(n²) — with 100,000 days, that's 10 billion operations. Not acceptable.",
              },
              {
                step_number: 4,
                heading: "Think greedy — track the best buy so far",
                body: "As you move right, you know every valid buy day is to your left. Track the minimum seen so far, compute profit at each step.",
              },
              {
                step_number: 5,
                heading: "Handle the no-profit case",
                body: "Initialize max_profit = 0. If no trade is profitable, you return 0 naturally.",
              },
            ],
          },
          pseudo_code: {
            code: "set min_price to infinity set max_profit to 0 for each price in prices if price < min_price update min_price to price else if price - min_price > max_profit update max_profit to price - min_price return max_profit",
            annotations: [
              {
                line_reference: "if price < min_price",
                note: "Found a cheaper buy day — update the best buy price.",
              },
              {
                line_reference: "price - min_price > max_profit",
                note: "Selling today beats all previous trades — update max profit.",
              },
            ],
          },
          working_code: {
            default_language: "python",
            languages: {
              python: {
                code: "def maxProfit(prices):\n    min_price = float('inf')\n    max_profit = 0\n    for price in prices:\n        if price < min_price:\n            min_price = price\n        elif price - min_price > max_profit:\n            max_profit = price - min_price\n    return max_profit",
              },
              java: {
                code: "class Solution {\n    public int maxProfit(int[] prices) {\n        int minPrice = Integer.MAX_VALUE;\n        int maxProfit = 0;\n        for (int price : prices) {\n            if (price < minPrice) {\n                minPrice = price;\n            } else if (price - minPrice > maxProfit) {\n                maxProfit = price - minPrice;\n            }\n        }\n        return maxProfit;\n    }\n}",
              },
              cpp: {
                code: "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        int minPrice = INT_MAX, maxProfit = 0;\n        for (int price : prices) {\n            if (price < minPrice) minPrice = price;\n            else if (price - minPrice > maxProfit) maxProfit = price - minPrice;\n        }\n        return maxProfit;\n    }\n};",
              },
              javascript: {
                code: "var maxProfit = function(prices) {\n    let minPrice = Infinity;\n    let maxProfit = 0;\n    for (let price of prices) {\n        if (price < minPrice) minPrice = price;\n        else if (price - minPrice > maxProfit) maxProfit = price - minPrice;\n    }\n    return maxProfit;\n};",
              },
              go: {
                code: "func maxProfit(prices []int) int {\n    minPrice := math.MaxInt64\n    maxProfit := 0\n    for _, price := range prices {\n        if price < minPrice {\n            minPrice = price\n        } else if price - minPrice > maxProfit {\n            maxProfit = price - minPrice\n        }\n    }\n    return maxProfit\n}",
              },
            },
          },
          common_mistakes: [
            {
              mistake_number: 1,
              title: "Finding global min and max independently",
              wrong_code:
                "def maxProfit(prices):\n    return max(prices) - min(prices)",
              explanation:
                "This breaks when the minimum occurs after the maximum — e.g., [6, 1] gives max=6, min=1, profit=5, but you'd be selling before buying.",
              fix: "Track min_price as you go left to right, not as a standalone operation.",
            },
            {
              mistake_number: 2,
              title: "Initializing max_profit to negative infinity",
              wrong_code: "max_profit = float('-inf')\n# ... rest of logic",
              explanation:
                "If no profitable trade exists (prices only fall), you'd return a negative number instead of 0.",
              fix: "Initialize max_profit = 0 to handle the no-trade case.",
            },
            {
              mistake_number: 3,
              title: "Updating min_price and profit in the same step",
              wrong_code:
                "for price in prices:\n    min_price = min(min_price, price)\n    max_profit = max(max_profit, price - min_price)",
              explanation:
                "Technically this works since if price == min_price, profit becomes 0 and doesn't hurt max_profit. But it can be confusing during interviews — makes it look like you're buying and selling on the same day.",
              fix: "Use an if-else to make the logic explicit and easier to reason about.",
            },
          ],
        },
        contentId: "f1e2d3c4-b5a6-7890-abcd-ef1234567890",
      },

      {
        _id: { $oid: "b2c3d4e5f6a7b8c9d0e1f2a3" },
        title: "Product of Array Except Self",
        domain: ["GENERAL", "E-COMMERCE"],
        difficulty: "MEDIUM",
        companyTypes: ["MNC", "Startup"],
        topics: ["ARRAY"],
        createdAt: { $date: "2026-04-06T10:00:00.000Z" },
        updatedAt: { $date: "2026-04-06T10:00:00.000Z" },
        __v: 0,
        order: 2,
        answer:
          "# Product of Array Except Self\n\nYou're building a pricing engine. Given an array `prices` of `n` items, for each item, compute the product of all other items' prices — without using division and in O(n) time.\n\nFormally: given `nums`, return an array `output` where `output[i]` = product of all elements except `nums[i]`.\n\n## Examples\n\n**Example 1:**\n**Input:** `nums = [1, 2, 3, 4]`\n**Output:** `[24, 12, 8, 6]`\n**Explanation:** output[0] = 2×3×4 = 24, output[1] = 1×3×4 = 12, etc.\n\n**Example 2:**\n**Input:** `nums = [-1, 1, 0, -3, 3]`\n**Output:** `[0, 0, 9, 0, 0]`\n\n## Constraints\n- 2 <= nums.length <= 100,000\n- -30 <= nums[i] <= 30\n- The product of any prefix or suffix fits in a 32-bit integer\n- You must not use the division operator\n",
        resources: {
          leetcodeURL:
            "https://leetcode.com/problems/product-of-array-except-self/",
          blogURL: null,
        },
        sections: {
          first_principles: {
            paragraphs: [
              "Imagine you run a warehouse with 4 products. Your analytics team wants to know: for each product, what's the combined price of all the others? This is useful for bundle pricing, discount modeling, or sensitivity analysis.",
              "The naive approach: for each item, multiply all the others. That's O(n²) — fine for 4 items, terrible for 100,000.",
              "The clever insight: for any index i, the product of everything except nums[i] is the product of everything to its LEFT multiplied by the product of everything to its RIGHT.",
              "You can compute these prefix and suffix products in two passes, then multiply them together in a third pass — or even do it in one output array with a running multiplier.",
            ],
            key_observation:
              "output[i] = (product of all elements before i) × (product of all elements after i). Compute these independently in two passes.",
          },
          constraints: [
            {
              constraint: "No division allowed",
              plain_meaning:
                "You can't just compute total product and divide by nums[i].",
              implication:
                "Forces you to think about prefix/suffix products — a more elegant solution anyway, since it also handles zeros correctly.",
            },
            {
              constraint: "O(n) time required",
              plain_meaning: "Nested loops won't cut it.",
              implication:
                "You need a linear scan strategy — two passes at most.",
            },
          ],
          examples: [
            {
              label: "Example 1",
              input: "[1, 2, 3, 4]",
              output: "[24, 12, 8, 6]",
              explanation:
                "For index 0: 2×3×4=24. For index 1: 1×3×4=12. For index 2: 1×2×4=8. For index 3: 1×2×3=6.",
              step_by_step: [
                "Left pass: prefix = [1, 1, 2, 6] (running product from the left, not including self)",
                "Right pass: suffix = [24, 12, 4, 1] (running product from the right, not including self)",
                "Multiply: output[i] = prefix[i] × suffix[i] → [24, 12, 8, 6]",
              ],
            },
            {
              label: "Example 2 — zeros in input",
              input: "[-1, 1, 0, -3, 3]",
              output: "[0, 0, 9, 0, 0]",
              explanation:
                "The zero at index 2 makes all other positions 0. For index 2, product of the rest = (-1)×1×(-3)×3 = 9.",
              step_by_step: null,
            },
            {
              label: "Example 3 — two elements",
              input: "[3, 4]",
              output: "[4, 3]",
              explanation: "Each element is just the other one.",
              step_by_step: null,
            },
          ],
          ways_to_solve: [
            {
              approach_number: 1,
              name: "Brute Force — nested loops",
              description:
                "For each index i, iterate over all other indices and multiply them together.",
              time_complexity: "O(n²)",
              time_reason:
                "For each of n elements, you scan the remaining n-1 elements.",
              space_complexity: "O(1)",
              space_reason: "No extra storage beyond the output array.",
              verdict: "too_slow",
              verdict_label: "Works but too slow — use only to build intuition",
            },
            {
              approach_number: 2,
              name: "Optimal — prefix and suffix product arrays",
              description:
                "First pass: build a prefix product array where prefix[i] = product of all elements before i. Second pass: traverse right to left, maintaining a running suffix product, and multiply into the output array.",
              time_complexity: "O(n)",
              time_reason: "Two linear passes over the array.",
              space_complexity: "O(1)",
              space_reason:
                "If the output array doesn't count, only a single running variable is needed for the suffix pass.",
              verdict: "optimal",
              verdict_label: "Optimal — this is the interview answer",
            },
          ],
          how_to_approach: {
            steps: [
              {
                step_number: 1,
                heading: "Make it concrete with a small example",
                body: "Take [1, 2, 3, 4] and manually compute each output slot. Notice the pattern — it's always a left chunk times a right chunk.",
              },
              {
                step_number: 2,
                heading: "Name what you need",
                body: "For index i, you need: product of nums[0..i-1] and product of nums[i+1..n-1]. Call these prefix[i] and suffix[i].",
              },
              {
                step_number: 3,
                heading: "First pass — fill prefix products",
                body: "Go left to right. prefix[0] = 1 (nothing to the left). prefix[i] = prefix[i-1] × nums[i-1].",
              },
              {
                step_number: 4,
                heading: "Second pass — multiply in suffix on the fly",
                body: "Go right to left. Maintain a running suffix variable. Multiply it into output[i], then update the running suffix.",
              },
              {
                step_number: 5,
                heading: "Handle zeros confidently",
                body: "The prefix/suffix approach handles zeros naturally — no division means no divide-by-zero panic.",
              },
            ],
          },
          pseudo_code: {
            code: "initialize output array of size n with all 1s set prefix_product to 1 for i from 0 to n-1 output[i] = prefix_product prefix_product = prefix_product * nums[i] set suffix_product to 1 for i from n-1 to 0 output[i] = output[i] * suffix_product suffix_product = suffix_product * nums[i] return output",
            annotations: [
              {
                line_reference: "output[i] = prefix_product",
                note: "Store the running left product before including nums[i] itself.",
              },
              {
                line_reference: "output[i] = output[i] * suffix_product",
                note: "Multiply the already-stored left product with the running right product.",
              },
            ],
          },
          working_code: {
            default_language: "python",
            languages: {
              python: {
                code: "def productExceptSelf(nums):\n    n = len(nums)\n    output = [1] * n\n\n    # Left pass: fill prefix products\n    prefix = 1\n    for i in range(n):\n        output[i] = prefix\n        prefix *= nums[i]\n\n    # Right pass: multiply in suffix products\n    suffix = 1\n    for i in range(n - 1, -1, -1):\n        output[i] *= suffix\n        suffix *= nums[i]\n\n    return output",
              },
              java: {
                code: "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        int n = nums.length;\n        int[] output = new int[n];\n        Arrays.fill(output, 1);\n\n        int prefix = 1;\n        for (int i = 0; i < n; i++) {\n            output[i] = prefix;\n            prefix *= nums[i];\n        }\n\n        int suffix = 1;\n        for (int i = n - 1; i >= 0; i--) {\n            output[i] *= suffix;\n            suffix *= nums[i];\n        }\n\n        return output;\n    }\n}",
              },
              cpp: {
                code: "class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        int n = nums.size();\n        vector<int> output(n, 1);\n\n        int prefix = 1;\n        for (int i = 0; i < n; i++) {\n            output[i] = prefix;\n            prefix *= nums[i];\n        }\n\n        int suffix = 1;\n        for (int i = n - 1; i >= 0; i--) {\n            output[i] *= suffix;\n            suffix *= nums[i];\n        }\n\n        return output;\n    }\n};",
              },
              javascript: {
                code: "var productExceptSelf = function(nums) {\n    const n = nums.length;\n    const output = new Array(n).fill(1);\n\n    let prefix = 1;\n    for (let i = 0; i < n; i++) {\n        output[i] = prefix;\n        prefix *= nums[i];\n    }\n\n    let suffix = 1;\n    for (let i = n - 1; i >= 0; i--) {\n        output[i] *= suffix;\n        suffix *= nums[i];\n    }\n\n    return output;\n};",
              },
              go: {
                code: "func productExceptSelf(nums []int) []int {\n    n := len(nums)\n    output := make([]int, n)\n    for i := range output { output[i] = 1 }\n\n    prefix := 1\n    for i := 0; i < n; i++ {\n        output[i] = prefix\n        prefix *= nums[i]\n    }\n\n    suffix := 1\n    for i := n - 1; i >= 0; i-- {\n        output[i] *= suffix\n        suffix *= nums[i]\n    }\n\n    return output\n}",
              },
            },
          },
          common_mistakes: [
            {
              mistake_number: 1,
              title: "Using division to solve it",
              wrong_code:
                "def productExceptSelf(nums):\n    total = 1\n    for n in nums:\n        total *= n\n    return [total // n for n in nums]",
              explanation:
                "Breaks completely when any element is 0 — you get a division by zero error.",
              fix: "Use the prefix/suffix pass approach — it handles zeros naturally.",
            },
            {
              mistake_number: 2,
              title: "Including self in the prefix or suffix",
              wrong_code:
                "prefix = 1\nfor i in range(n):\n    prefix *= nums[i]  # Including nums[i] before storing\n    output[i] = prefix",
              explanation:
                "You're including nums[i] in the left product, so output[i] now contains nums[i] itself — wrong.",
              fix: "Store prefix into output[i] BEFORE multiplying in nums[i].",
            },
            {
              mistake_number: 3,
              title: "Using O(n) extra space unnecessarily",
              wrong_code:
                "prefix = [1] * n\nsuffix = [1] * n\nfor i in range(1, n): prefix[i] = prefix[i-1] * nums[i-1]\nfor i in range(n-2, -1, -1): suffix[i] = suffix[i+1] * nums[i+1]\nreturn [prefix[i] * suffix[i] for i in range(n)]",
              explanation:
                "This works, but uses O(n) extra space for two arrays. Interviewers will ask you to optimize.",
              fix: "Use a single running variable for the suffix pass instead of an array.",
            },
          ],
        },
        contentId: "c4d5e6f7-a8b9-0123-cdef-456789abcdef",
      },
    ];

    // Transmute the extended JSON objects into native JS objects that the native Node driver loves
    const mappedQuestions = rawQuestions.map((q) => {
      const qNew = { ...q };
      if (qNew._id && qNew._id.$oid) {
        qNew._id = new ObjectId(qNew._id.$oid);
      }
      if (qNew.createdAt && qNew.createdAt.$date) {
        qNew.createdAt = new Date(qNew.createdAt.$date);
      }
      if (qNew.updatedAt && qNew.updatedAt.$date) {
        qNew.updatedAt = new Date(qNew.updatedAt.$date);
      }
      return qNew;
    });

    // Create the question matches the mongoose model mapping (dsaquestions collection)
    const result = await db
      .collection("dsaquestions")
      .insertMany(mappedQuestions);

    console.log(
      "Successfully inserted these 2 questions into the DB:",
      result.insertedCount,
    );
  } catch (error) {
    if (error.code === 11000) {
      console.log(
        "One or both of these questions were already inserted (Duplicate Key Error)",
      );
    } else {
      console.error("Error connecting to DB:", error);
    }
  } finally {
    await client.close();
  }
}

seed();
