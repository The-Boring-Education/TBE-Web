#!/usr/bin/env python3
"""
PostToolUse hook — after any file edit, analyze the changed file and inject
a systemMessage asking the agent to identify test coverage gaps.

TBE-Web conventions:
  - All tests live in apps/testing/src/
  - Unit + integration: Vitest (describe/it)
  - E2E: Playwright (no waitForTimeout)
"""
import json
import sys

# ── Read hook input ────────────────────────────────────────────────────────────
try:
    hook_input = json.load(sys.stdin)
except Exception:
    sys.exit(0)

tool_name = hook_input.get("toolName", "")
tool_input = hook_input.get("toolInput", {})

# ── Only fire for file-editing tools ──────────────────────────────────────────
EDIT_TOOLS = {"create_file", "replace_string_in_file", "multi_replace_string_in_file"}
if tool_name not in EDIT_TOOLS:
    sys.exit(0)

# ── Collect all edited file paths ─────────────────────────────────────────────
file_paths = []

if tool_name == "multi_replace_string_in_file":
    for replacement in tool_input.get("replacements", []):
        fp = replacement.get("filePath", "")
        if fp:
            file_paths.append(fp)
else:
    fp = tool_input.get("filePath", "")
    if fp:
        file_paths.append(fp)

if not file_paths:
    sys.exit(0)

# ── Filter to only actionable source files ────────────────────────────────────
SKIP_PATTERNS = [
    # Already test files
    ".test.", ".spec.", "__tests__", "/testing/src/",
    # Config / generated / docs
    ".config.", ".mdc", ".md", ".json", ".yaml", ".yml",
    ".css", ".scss", ".env", "tailwind", "postcss", "vite.config",
    "tsconfig", "eslint",
    # Build artifacts
    "node_modules", ".next", "dist", "build", ".turbo",
    # Copilot/cursor customisation files
    ".github/agents", ".github/hooks", ".github/prompts",
    ".cursor/rules",
]

SOURCE_EXTENSIONS = (".ts", ".tsx", ".js", ".jsx")

def is_testable(path: str) -> bool:
    if not path.endswith(SOURCE_EXTENSIONS):
        return False
    return not any(pattern in path for pattern in SKIP_PATTERNS)

testable = [p for p in file_paths if is_testable(p)]
if not testable:
    sys.exit(0)

# ── Build a readable relative path list ──────────────────────────────────────
def relative(path: str) -> str:
    marker = "/TBE-Web/"
    idx = path.find(marker)
    return path[idx + len(marker):] if idx != -1 else path

file_list = "\n".join(f"  - `{relative(p)}`" for p in testable)

# ── Classify file type for targeted advice ───────────────────────────────────
first = testable[0]
hints = []

if "/pages/api/" in first:
    hints.append("API route — cover: success response shape, 4xx validation errors, 5xx DB failures, auth guard rejection")
elif "/lib/database/queries/" in first:
    hints.append("DB query function — cover: valid input returns `{ data }`, DB error returns `{ error }`, edge cases like empty results")
elif "/packages/components/" in first or "/components/" in first:
    hints.append("UI component — cover: default render, each variant prop, loading state, error state")
elif "/pages/" in first:
    hints.append("Page component — cover: renders with valid props, auth-gated redirect, loading state")
elif "/packages/hooks/" in first or "/hooks/" in first:
    hints.append("Custom hook — cover: initial state, state changes on mutation, error path")
elif "/api/" in first:
    hints.append("API hook — cover: successful fetch, error handling, staleTime and retry behaviour")

hint_block = f"\n\n**File-specific hint**: {hints[0]}" if hints else ""

# ── Compose the injected system message ──────────────────────────────────────
message = f"""**Test Coverage Check** — you just edited:
{file_list}

Before closing this task, do the following:
1. Identify every new or changed function, handler, or component in the edited file(s).
2. For each one, check whether a test already exists in `apps/testing/src/`.
3. List any gaps: uncovered branches (if/else, switch), error paths, auth failures, edge cases (empty input, null, invalid types).{hint_block}

**TBE-Web testing conventions**:
- Tests live in `apps/testing/src/` — mirror the source path (e.g. `src/unit/lib/database/queries/`)
- Unit + integration: Vitest — `describe` + `it` blocks, `vi.mock` for `@tbe/*` packages
- E2E: Playwright — `page.waitForSelector()` / `page.waitForResponse()`, never `waitForTimeout()`
- API tests: MSW — `server.listen()` / `server.resetHandlers()` / `server.close()`

If gaps exist, either write the missing tests now or explicitly tell the user which gaps remain and why they were deferred."""

# ── Output ────────────────────────────────────────────────────────────────────
print(json.dumps({"continue": True, "systemMessage": message}))
