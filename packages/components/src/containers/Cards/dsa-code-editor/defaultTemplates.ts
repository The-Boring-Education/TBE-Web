import type { SupportedLanguage } from "./types";

export const LANGUAGE_DISPLAY_NAMES: Record<SupportedLanguage, string> = {
  python: "Python 3",
  java: "Java",
  cpp: "C++",
  javascript: "JavaScript",
};

export const LANGUAGE_VERSIONS: Record<SupportedLanguage, string> = {
  python: "3.10.0",
  java: "15.0.2",
  cpp: "10.2.0",
  javascript: "18.15.0",
};

/** Convert a human problem name like "Two Sum" into camelCase like "twoSum" */
export function toMethodName(problemTitle: string): string {
  const cleaned = problemTitle
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/);
  if (!cleaned.length || !cleaned[0]) return "solve";

  const first = cleaned[0].toLowerCase();
  const rest = cleaned
    .slice(1)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");

  return `${first}${rest}`;
}

export function generateStarterCode(
  lang: SupportedLanguage,
  problemTitle: string,
): string {
  const method = toMethodName(problemTitle);

  switch (lang) {
    case "python":
      return `class Solution:
    def ${method}(self, *args):
        # Write your solution here
        pass

# You can test your code below
if __name__ == "__main__":
    sol = Solution()
    print("Code executed successfully")
`;

    case "java":
      return `import java.util.*;

public class Solution {
    public void ${method}() {
        // Write your solution here
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        sol.${method}();
        System.out.println("Code executed successfully");
    }
}
`;

    case "cpp":
      return `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>

using namespace std;

class Solution {
public:
    void ${method}() {
        // Write your solution here
    }
};

int main() {
    Solution sol;
    sol.${method}();
    cout << "Code executed successfully" << endl;
    return 0;
}
`;

    case "javascript":
      return `/**
 * Problem: ${problemTitle}
 */
function ${method}(...args) {
    // Write your solution here
}

// Test call
console.log("Code executed successfully");
`;
    default:
      return "// Write your solution here\n";
  }
}
