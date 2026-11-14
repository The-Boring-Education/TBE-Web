export type SupportedIdeLanguage = "javascript" | "python" | "java" | "cpp";

export interface LanguageOption {
  id: SupportedIdeLanguage;
  name: string;
  monacoLanguage: string;
  version: string;
  extension: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    id: "python",
    name: "Python 3",
    monacoLanguage: "python",
    version: "3.10",
    extension: ".py",
  },
  {
    id: "javascript",
    name: "JavaScript (Node.js)",
    monacoLanguage: "javascript",
    version: "ES2022",
    extension: ".js",
  },
  {
    id: "java",
    name: "Java",
    monacoLanguage: "java",
    version: "JDK 21",
    extension: ".java",
  },
  {
    id: "cpp",
    name: "C++",
    monacoLanguage: "cpp",
    version: "C++20",
    extension: ".cpp",
  },
];

export function getStarterCode(
  language: SupportedIdeLanguage,
  problemTitle: string = "Solution",
  workingCode?: {
    languages?: Record<string, { code: string }>;
  },
): string {
  // If working_code exists in the question data, use that as starter template
  if (workingCode?.languages) {
    if (language === "python" && workingCode.languages.python?.code) {
      return workingCode.languages.python.code;
    }
    if (language === "javascript" && (workingCode.languages.javascript?.code || workingCode.languages.js?.code)) {
      return workingCode.languages.javascript?.code || workingCode.languages.js?.code || "";
    }
    if (language === "java" && workingCode.languages.java?.code) {
      return workingCode.languages.java.code;
    }
    if (language === "cpp" && (workingCode.languages.cpp?.code || workingCode.languages["c++"]?.code)) {
      return workingCode.languages.cpp?.code || workingCode.languages["c++"]?.code || "";
    }
  }

  // Generate clean boilerplate template
  const sanitizedName = problemTitle
    .replace(/[^a-zA-Z0-9]/g, " ")
    .trim()
    .split(/\s+/)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join("") || "solve";

  switch (language) {
    case "python":
      return `# ${problemTitle}
# Write your solution below. Input is passed via standard input or function.

import sys

def ${sanitizedName}(data: str):
    """
    Implement your solution here.
    """
    # Example: process input and return result
    return data


def main():
    input_data = sys.stdin.read().strip()
    result = ${sanitizedName}(input_data)
    if result is not None:
        print(result)


if __name__ == "__main__":
    main()
`;

    case "javascript":
      return `/**
 * ${problemTitle}
 * Write your solution below. Input is read from standard input.
 */

const fs = require("fs");

function ${sanitizedName}(input) {
  // Implement your solution here
  return input;
}

function main() {
  const input = fs.readFileSync(0, "utf-8").trim();
  const result = ${sanitizedName}(input);
  if (result !== undefined) {
    console.log(result);
  }
}

main();
`;

    case "java":
      return `/**
 * ${problemTitle}
 * Write your solution inside the Main class.
 */

import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNext()) {
            return;
        }

        StringBuilder input = new StringBuilder();
        while (scanner.hasNextLine()) {
            input.append(scanner.nextLine()).append("\\n");
        }

        String result = solve(input.toString().trim());
        System.out.println(result);
    }

    public static String solve(String input) {
        // Implement your solution here
        return input;
    }
}
`;

    case "cpp":
      return `/**
 * ${problemTitle}
 * Write your solution inside main().
 */

#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

using namespace std;

string solve(const string& input) {
    // Implement your solution here
    return input;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string line, fullInput = "";
    while (getline(cin, line)) {
        if (!fullInput.empty()) fullInput += "\\n";
        fullInput += line;
    }

    cout << solve(fullInput) << "\\n";
    return 0;
}
`;
  }
}

