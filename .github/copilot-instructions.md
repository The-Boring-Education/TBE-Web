# GitHub Copilot Instructions — The Boring Education (TBE) Workspace

This file covers all four repositories in this workspace. Apply the relevant section based on which project you are working in.

---

## 1. Workspace Overview

| Repository          | Type               | Stack                                                                                |
| ------------------- | ------------------ | ------------------------------------------------------------------------------------ |
| `TBE-Web`           | Turborepo monorepo | Next.js 14 (Pages Router), TypeScript, MongoDB/Mongoose, Tailwind CSS, Framer Motion |
| `tbe-admin`         | Vite SPA           | React 18, Vite, TypeScript, shadcn/ui, Redux Toolkit, TanStack Query, Axios          |
| `The-Boring-Agents` | Python API         | FastAPI, LangGraph, LangChain, OpenAI, Pydantic v2                                   |
| `vidya-pod`         | Next.js app        | Next.js 15 (App Router), React 19, Supabase, Tailwind v4, Zod                        |

---

## 2. TBE-Web Monorepo

### 2.1 Tech Stack

- **Monorepo tooling**: Turborepo + pnpm 10 (workspaces)
- **Apps**: Next.js 14 Pages Router (all apps except `onboarding` which is Vite/React)
- **TypeScript**: 5, strict mode
- **UI**: `@tbe/components` (custom library — Tailwind CSS + Framer Motion). **No shadcn/ui, no MUI**.
- **Auth**: `@tbe/auth` (JWT, Google OAuth). Tokens: `tbe_access_token` / `tbe_refresh_token`.
- **Database**: MongoDB via Mongoose, only in `apps/api`
- **Data fetching**: `@tbe/query` (TanStack Query wrapper). `useApi` is **deprecated**.
- **State**: Custom hooks in `@tbe/hooks`. No Zustand/Redux in TBE-Web.
- **Testing**: Vitest (unit/integration) + Playwright (E2E) — all in `apps/testing`
- **Monitoring**: Sentry (`@sentry/nextjs`)
- **Package manager**: pnpm only

### 2.2 Folder Structure

```
TBE-Web/
├── apps/
│   ├── api/          ← Backend: all API routes under /api/v1/, MongoDB models, services
│   ├── platform/     ← Main frontend (port 3000)
│   ├── prep-yatra/   ← Interview prep (port 3001)
│   ├── quizes/       ← Quizzes (port 3002)
│   ├── techyatra/    ← Tech paths (port 3003)
│   ├── onboarding/   ← Onboarding flow (Vite, port 5173)
│   ├── dsayatra/     ← DSA learning (port 3005)
│   ├── resume-yatra/ ← Resume builder (port 3006)
│   ├── oncampus/     ← On-campus program (port 3007)
│   └── testing/      ← ALL tests: unit, integration, e2e
├── packages/
│   ├── components/   ← @tbe/components: shared UI
│   ├── hooks/        ← @tbe/hooks: shared React hooks
│   ├── types/        ← @tbe/types: DB types + API types
│   ├── interface/    ← @tbe/interface: component props + page props
│   ├── auth/         ← @tbe/auth: JWT auth logic
│   ├── constants/    ← @tbe/constants: routes, env, app config
│   ├── utils/        ← @tbe/utils: shared utilities (sendRequest, etc.)
│   ├── services/     ← @tbe/services: API service functions
│   ├── gamification/ ← @tbe/gamification: points, badges, leaderboard
│   └── query/        ← @tbe/query: TanStack Query wrapper
```

### 2.3 UI Component Rules

- All reusable components live in `packages/components/`
- Props interfaces go in `packages/interface/src/Components.ts`
- Use `import type { MyComponentProps } from "@tbe/interface"` before defining the component
- Variants are string unions: `"PRIMARY" | "SECONDARY" | "OUTLINE" | "GHOST" | "SUCCESS" | "NEUTRAL"` — never booleans
- Loading states use `<LoadingSpinner />` from `@tbe/components`
- Animations use Framer Motion `motion.*` — no CSS `@keyframes`
- Export all new components from `packages/components/src/index.ts`

```tsx
// CORRECT component pattern
import type { FeatureCardProps } from "@tbe/interface";
import { motion } from "framer-motion";
import LoadingSpinner from "../LoadingSpinner";

const FeatureCard = ({
  title,
  isLoading = false,
  variant = "PRIMARY",
}: FeatureCardProps) => {
  if (isLoading) return <LoadingSpinner />;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-lg p-4"
    >
      <h3 className="font-semibold">{title}</h3>
    </motion.div>
  );
};
export default FeatureCard;
```

### 2.4 Next.js Pages Router Rules

- Every public page must include `<SEO seoMeta={seoMeta} />` from `@tbe/components`
- `seoMeta` comes from `getPreFetchProps` via `getStaticProps`
- Page components accept `PageProps` from `@tbe/interface`
- Wrap pages in `<PageLayout>` (handles Navbar/Footer/analytics)
- Auth guards use `useUser()` from `@tbe/hooks` — check `isAuth` and `loading`
- Route strings come from `routes` in `@tbe/constants` — never hardcoded
- Dynamic routes use `fallback: "blocking"` in `getStaticPaths`

```tsx
// CORRECT page pattern
import { SEO } from "@tbe/components";
import type { PageProps } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";
import type { GetStaticProps } from "next";
import { Fragment } from "react";

const CoursesPage = ({ seoMeta }: PageProps) => (
  <Fragment>
    <SEO seoMeta={seoMeta} appId="platform" />
    {/* content */}
  </Fragment>
);

export const getStaticProps: GetStaticProps = async () =>
  await getPreFetchProps({ pageId: "courses" });

export default CoursesPage;
```

### 2.5 API Route Rules

- All handlers wrapped: `export default withApiHandler(handler)`
- All responses use: `sendAPIResponse({ status: bool, data?, error?, message? })`
- HTTP status from: `apiStatusCodes` constant (never hardcoded numbers)
- Route structure: `switch(method)` → `handleGet*`, `handlePost*`, etc.
- Error paths call `captureAPIError` / `captureDatabaseError` / `captureAuthError` / `capturePaymentError` before responding
- DB calls use query functions from `@/lib/database` — never Mongoose models directly in routes
- Admin routes use `withAdminHandler` — not `withApiHandler`
- Query params extracted via `firstQueryValue(req.query.param)` from `@/lib/validation/queryParams`

```ts
// CORRECT API route pattern
import { withApiHandler } from "@/middleware/requestLogger";
import { sendAPIResponse } from "@/lib/utils";
import { apiStatusCodes } from "@/lib/constants";
import { captureAPIError } from "@/lib/utils/sentry";
import { getUserByIdFromDB } from "@/lib/database";
import { firstQueryValue } from "@/lib/validation/queryParams";

const handler = async (req, res) => {
  switch (req.method) {
    case "GET":
      return handleGetUser(req, res);
    default:
      return res
        .status(405)
        .json(
          sendAPIResponse({ status: false, message: "Method not allowed" }),
        );
  }
};

const handleGetUser = async (req, res) => {
  const userId = firstQueryValue(req.query.userId);
  if (!userId)
    return res
      .status(400)
      .json(sendAPIResponse({ status: false, message: "userId required" }));
  const { data, error } = await getUserByIdFromDB(userId);
  if (error) {
    captureAPIError(error, "/api/v1/user", "GET", 500, { userId });
    return res.status(500).json(
      sendAPIResponse({
        status: false,
        error,
        message: "Error fetching user",
      }),
    );
  }
  return res.status(200).json(sendAPIResponse({ status: true, data }));
};

export default withApiHandler(handler);
```

### 2.6 MongoDB + Mongoose Rules

- Models in `apps/api/src/lib/database/models/`
- Query functions in `apps/api/src/lib/database/queries/`
- Every query function returns `Promise<{ data?: any; error?: string }>`
- Schema enum values reference imported constants — never inline string arrays
- Model registration: `models[DATABASE_MODELS.X] || model(DATABASE_MODELS.X, Schema)`
- Monetary values stored as integers (paise/cents)
- Virtual getters for computed fields (e.g. `isExpired`, `isValid`)

```ts
// CORRECT model pattern
import { Model, model, models, Schema } from "mongoose";
import { DATABASE_MODELS, RESOURCE_TYPES } from "@/lib/constants";
import type { ResourceModel } from "@/lib/interfaces";

const ResourceSchema = new Schema<ResourceModel>(
  {
    type: { type: String, enum: RESOURCE_TYPES, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const ResourceModelClass: Model<ResourceModel> =
  (models[DATABASE_MODELS.RESOURCE] as Model<ResourceModel>) ||
  model<ResourceModel>(DATABASE_MODELS.RESOURCE, ResourceSchema);

export default ResourceModelClass;
```

### 2.7 Hooks & Data Fetching Rules

- Use `useQuery`/`useMutation` from `@tbe/query` — `useApi` is deprecated
- Every hook has an explicit return type interface
- `staleTime: 5 * 60 * 1000` (5 min) on all queries — never default (0)
- `queryKey` is always an array: `["resource", id]`
- After mutations: `queryClient.invalidateQueries({ queryKey: ["resource"] })`
- Auth state only via `useUser()` from `@tbe/hooks`

### 2.8 TypeScript Types Rules

- DB types → `packages/types/src/database.ts`
- API request/response types → `packages/types/src/api.ts`
- Component props → `packages/interface/src/Components.ts`
- Page props → `packages/interface/src/page.ts`
- No `any` — use `unknown` + type narrowing
- No TypeScript `enum` keyword — use string union types
- No `I` prefix on interfaces (`UserModel`, not `IUserModel`)
- Use `as const` for constant maps

### 2.9 Authentication Rules

- Frontend: `const { isAuth, user, loading } = useUser()` — only source of truth
- Backend: `getAuthenticatedUser(req)` for reading the JWT user
- Token keys from `AUTH_CONFIG` in `@tbe/auth` — never hardcode
- `GOOGLE_AUTH_CLIENT_SECRET` must never have `NEXT_PUBLIC_` prefix
- Auth errors: call `captureAuthError` before responding

### 2.10 Testing Rules

- All tests in `apps/testing/src/`
- Unit tests: Vitest, jsdom env, `describe` + `it` structure
- Integration tests: `src/integration/`, Vitest node env
- E2E: Playwright in `src/e2e/`
- Mock `@tbe/*` packages entirely: `vi.mock("@tbe/auth", () => ({ useAuth: () => mockFn() }))`
- API tests use MSW: `server.listen()` / `server.resetHandlers()` / `server.close()`
- E2E: no `page.waitForTimeout()` — use `page.waitForSelector()` or `page.waitForResponse()`

### 2.11 Error Handling Rules

- No `console.log` — use `logger.info/warn/error/debug` from `@/lib/utils/logger` (API-side)
- All API errors: call appropriate `capture*` from `@/lib/utils/sentry`
- Query functions never throw — return `{ error: "message" }`
- Frontend renders graceful error states on failure — never let network errors hit the error boundary

### 2.12 SEO Rules

- Every public page: `<SEO seoMeta={seoMeta} appId="platform" />`
- Course pages: add `schema={{ type: "Course", course: {...} }}`
- FAQ sections: add `schema={{ type: "FAQPage", faq: [...] }}`
- Article/webinar pages: add `schema={{ type: "Article", article: {...} }}`
- Canonical URL is auto-generated — never set manually
- `next-sitemap` handles sitemap.xml — never edit manually

---

## 3. tbe-admin

### 3.1 Tech Stack

- **Framework**: Vite + React 18
- **UI**: shadcn/ui (Radix UI) + Tailwind CSS + lucide-react
- **State (server)**: TanStack Query v5
- **State (client)**: Redux Toolkit (`authSlice`)
- **HTTP**: Axios via `src/lib/axios` configured instance
- **Toasts**: `sonner`
- **Forms**: Local `useState`
- **Testing**: Vitest

### 3.2 API Hooks Pattern

All API logic in `src/api/[resource]Api.ts` as named custom hooks:

```ts
// CORRECT pattern — src/api/resourceApi.ts
export const useResources = () => {
  const query = useQuery<{ data: Resource[] }>({
    queryKey: ["resource"],
    queryFn: async () => {
      try {
        const res = await api.get("/admin/resource");
        return { data: res.data?.data || [] };
      } catch (error) {
        logApiError(error, "Fetch Resources", false);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
  return { ...query, data: (query.data?.data || []) as Resource[] };
};

export const useCreateResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ResourceFormData) =>
      api.post("/admin/resource", payload).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resource"] }),
  });
};
```

### 3.3 Page Component Pattern

```tsx
// CORRECT page pattern
const ResourcePage = () => {
  const { data: resources, isLoading } = useResources();
  const createResource = useCreateResource();
  const [showDialog, setShowDialog] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState<ResourceFormData>(INITIAL_FORM);

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      if (editingResource) {
        await updateResource.mutateAsync({
          id: editingResource._id,
          data: formData,
        });
        toast.success("Updated");
      } else {
        await createResource.mutateAsync(formData);
        toast.success("Created");
      }
      setShowDialog(false);
    } catch {
      toast.error("Failed");
    }
  };
  // ...
};
```

### 3.4 tbe-admin Rules

- `AlertDialog` for delete confirmations — never `window.confirm()`
- `Dialog` for create/edit — share one dialog, mode = `editingResource === null`
- Auth state from Redux `useSelector` — never `localStorage` directly
- All toast feedback via `sonner` — never `alert()` or custom toast state
- shadcn/ui components from `src/components/ui/` — never build raw Radix primitives
- Types defined in `src/types/` — one file per domain

---

## 4. The-Boring-Agents

### 4.1 Tech Stack

- **Framework**: FastAPI + Uvicorn
- **AI**: LangGraph (StateGraph) + LangChain + OpenAI (gpt-4o-mini default) + Anthropic optional
- **Config**: Pydantic Settings — `from src.core.config import config`
- **Validation**: Pydantic v2 `BaseModel` for all API models
- **Testing**: Pytest (class-based) + pytest-asyncio + httpx
- **Linting**: Ruff + mypy

### 4.2 Agent Workflow Pattern (LangGraph)

Every agent workflow has: `TypedDict` state → `StateGraph` nodes → `BaseWorkflowOrchestrator`

```python
# State (TypedDict — always)
class MyAgentState(TypedDict):
    session_id: str
    topic: str
    status: str
    current_step: str
    error: Optional[str]
    progress: Dict[str, Any]
    output: Optional[Dict[str, Any]]

# Node (always decorated, always returns partial state dict)
@handle_node_errors("generate", error_status="failed")
def generate_node(state: MyAgentState) -> Dict[str, Any]:
    log_node_execution("generate", state["session_id"])
    if check_skip_condition(state, "output"):
        return {}
    result = ContentGenerator().generate(state["topic"])
    return {
        "output": result,
        "progress": get_progress_update(1, 2, "Generated"),
    }

# Graph
def create_workflow_graph():
    graph = StateGraph(MyAgentState)
    graph.add_node("generate", generate_node)
    graph.set_entry_point("generate")
    graph.add_edge("generate", END)
    return graph.compile()
```

### 4.3 FastAPI Route Pattern (routes → controllers — thin routes)

```python
# Route — thin, logs action, delegates to controller
@router.post("/resource", response_model=SessionResponse)
async def create_resource(payload: CreateResourceRequest, background_tasks: BackgroundTasks, request: Request):
    log_action(request, "create_resource", topic=payload.topic)
    try:
        return controller.create_resource(payload, background_tasks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 4.4 The-Boring-Agents Rules

- **All config via `from src.core.config import config`** — never `os.environ["KEY"]`
- **All workflow states are `TypedDict`** — never plain `dict`
- **Every node decorated with `@handle_node_errors`** from `src/core/orchestrator.py`
- **LLM calls only in generator classes** — never `ChatOpenAI()` in a node directly
- **Background tasks use FastAPI `BackgroundTasks`** — never `threading.Thread`
- **Tests are class-based** — `class TestFeature:` with `def test_*` methods
- **Mock all LLM calls in tests** — never make real API calls
- **No `print()`** — use `logging.getLogger(__name__)`

### 4.5 Pydantic Models

```python
# src/api/models/resource_models.py
from enum import Enum
from pydantic import BaseModel, Field

class ResourceDifficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"

class CreateResourceRequest(BaseModel):
    topic: str = Field(..., description="Topic for generation")
    difficulty: ResourceDifficulty = Field(default=ResourceDifficulty.MEDIUM)
    count: int = Field(default=10, ge=1, le=50)

class SessionResponse(BaseModel):
    session_id: str
    status: str
    message: str
```

---

## 5. vidya-pod

### 5.1 Tech Stack

- **Framework**: Next.js 15 App Router (`app/` directory)
- **React**: React 19
- **UI**: Radix UI + Tailwind CSS v4 + lucide-react + sonner
- **DB**: Supabase (PostgreSQL) via `@supabase/supabase-js`
- **Validation**: Zod
- **Forms**: Local `useState`

### 5.2 API Route Pattern

```ts
// app/api/register/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase";

const schema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  role: z.enum(["teacher", "student", "proctor"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }
    const supabase = getSupabase();
    const result = await supabase.from("students").insert(parsed.data);
    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### 5.3 vidya-pod Rules

- **Supabase via `getSupabase()` singleton only** — never `createClient()` in route files
- **All API routes validate with Zod** — never trust raw `request.json()` directly
- **Server components fetch data directly** — no `useEffect` + `fetch` in server components
- **Client components marked `"use client"`** at top
- **`NextResponse.json()` for all responses** with explicit `{ status: N }`
- **No hardcoded admin credentials** — use environment variables (⚠️ currently `src/components/register-page.tsx` has hardcoded `ADMIN_ID = "sachin"` — fix this)

---

## 6. Never Do This (Cross-Project Anti-Patterns)

### TypeScript

```ts
// ❌ Never use any
const process = (data: any) => data.value;
// ✅ Use unknown + type narrowing
const process = (data: unknown) => (data as { value: string }).value;

// ❌ Never use TypeScript enum keyword
enum Status {
  ACTIVE = "ACTIVE",
}
// ✅ Use string union type
type Status = "ACTIVE" | "INACTIVE";

// ❌ Never I-prefix interfaces
interface IUserModel {
  email: string;
}
// ✅ No prefix
interface UserModel {
  email: string;
}
```

### TBE-Web API Routes

```ts
// ❌ Never bare handler export
export default async function handler(req, res) {
  res.json({ data });
}
// ✅ Always wrapped
export default withApiHandler(handler);

// ❌ Never Mongoose model directly in route file
import UserModel from "@/lib/database/models/User";
await UserModel.find();
// ✅ Use query functions
import { getUsersFromDB } from "@/lib/database";
const { data, error } = await getUsersFromDB();

// ❌ Never hardcode HTTP status
res.status(200).json({ status: true });
// ✅ Use constants
res.status(apiStatusCodes.OKAY).json(sendAPIResponse({ status: true, data }));
```

### Data Fetching

```ts
// ❌ Never use deprecated useApi
import useApi from "@tbe/hooks/useApi";
// ✅ Use TanStack Query
import { useQuery } from "@tbe/query";

// ❌ Never missing staleTime
useQuery({ queryKey: ["x"], queryFn: fetchX });
// ✅ Always set staleTime
useQuery({ queryKey: ["x"], queryFn: fetchX, staleTime: 5 * 60 * 1000 });
```

### Auth

```ts
// ❌ Never read tokens from localStorage
const token = localStorage.getItem("tbe_access_token");
// ✅ Use useUser()
const { isAuth } = useUser();

// ❌ Never NEXT_PUBLIC_ for server secrets
NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_SECRET = secret;
// ✅ Server-only (no prefix)
GOOGLE_AUTH_CLIENT_SECRET = secret;
```

### Logging

```ts
// ❌ Never console.log in production code
console.log("User:", user);
// ✅ Use logger
logger.info("User fetched", { userId: user._id });
```

### Python (The-Boring-Agents)

```python
# ❌ Never plain dict as workflow state type
def my_node(state: dict) -> dict: ...
# ✅ Always TypedDict
def my_node(state: MyAgentState) -> Dict[str, Any]: ...

# ❌ Never os.environ directly
api_key = os.environ["OPENAI_API_KEY"]
# ✅ Use config
from src.core.config import config
api_key = config.openai_api_key

# ❌ Never real LLM calls in tests
def test_workflow(): orchestrator.run_workflow(state)  # makes real API call
# ✅ Mock the generator
with patch("src.agents.quiz.generators.QuizQuestionGenerator.generate") as mock:
    mock.return_value = [{"question": "Q1"}]
    ...
```

### vidya-pod

```ts
// ❌ Never hardcoded admin credentials
const ADMIN_PASSWORD = "sachin";
// ✅ Environment variables
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// ❌ Never skip Zod validation in API routes
const { name, phone } = await request.json();
// ✅ Always validate
const parsed = schema.safeParse(await request.json());
if (!parsed.success) return NextResponse.json({ error: ... }, { status: 400 });
```

---

## 7. Environment Variables Reference

### TBE-Web (apps/api + apps/platform)

| Variable                    | Description                   | Notes       |
| --------------------------- | ----------------------------- | ----------- |
| `MONGODB_URI`               | MongoDB connection string     | Server-only |
| `NEXT_PUBLIC_API_URL`       | API base URL for frontends    | Public      |
| `AUTH_JWT_SECRET`           | JWT signing secret            | Server-only |
| `GOOGLE_AUTH_CLIENT_ID`     | Google OAuth client ID        | Server-only |
| `GOOGLE_AUTH_CLIENT_SECRET` | Google OAuth secret           | Server-only |
| `ADMIN_SECRET`              | Admin route secret            | Server-only |
| `CASHFREE_SECRET_KEY`       | Cashfree payment secret       | Server-only |
| `NEXT_PUBLIC_CASHFREE_MODE` | `"sandbox"` or `"production"` | Public      |
| `NEXT_PUBLIC_SENTRY_DSN`    | Sentry DSN                    | Public      |
| `EMAIL_API_KEY`             | Email service key             | Server-only |

### The-Boring-Agents

| Variable            | Description                     |
| ------------------- | ------------------------------- |
| `OPENAI_API_KEY`    | OpenAI API key                  |
| `ANTHROPIC_API_KEY` | Anthropic API key (optional)    |
| `ENVIRONMENT`       | `local`, `dev`, or `prod`       |
| `DEFAULT_MODEL`     | Default LLM model (gpt-4o-mini) |
| `ADMIN_SECRET`      | Matches TBE-Web admin secret    |

### vidya-pod

| Variable                               | Description                          | Notes                                 |
| -------------------------------------- | ------------------------------------ | ------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL                 | Public                                |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key                    | Public                                |
| `ADMIN_PASSWORD`                       | Admin password for registration gate | Server-only — **move from hardcoded** |
