# Resume Yatra - Setup & Quick Start Guide

## ✅ Migration Complete

Resume Yatra has been successfully migrated from a standalone Vite app to a Next.js app within the TBE monorepo at `apps/resume-yatra/`.

## 🚀 Quick Start

### 1. Install Dependencies

From the monorepo root:

```bash
pnpm install
```

### 2. Setup Environment Variables

Create `.env.local` in `apps/resume-yatra/`:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=generate-a-random-secret-here

# GitHub OAuth (for authentication)
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-secret

# Optional: Database connection
DATABASE_URL=your-database-connection-string
```

**To generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

**To setup GitHub OAuth:**

1. Go to GitHub Settings > Developer Settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to: `http://localhost:3002/api/auth/callback/github`
4. Copy Client ID and Secret to your `.env.local`

### 3. Run Development Server

```bash
cd apps/resume-yatra
pnpm dev
```

Access the app at: **<http://localhost:3002>**

### 4. Build for Production

```bash
pnpm build
```

## 📁 Project Structure

```
apps/resume-yatra/
├── src/
│   ├── components/
│   │   ├── builder/              # Resume builder components
│   │   │   ├── InitialChoice.tsx
│   │   │   ├── TemplatePrompt.tsx
│   │   │   ├── BuilderMain.tsx
│   │   │   └── ResultScreen.tsx
│   │   ├── landing/              # Landing page components
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── FeatureCards.tsx
│   │   │   ├── ProvenTemplateSection.tsx
│   │   │   ├── InterviewPrepSection.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/                   # Reusable shadcn/ui components
│   ├── constants/
│   │   └── resumeSteps.ts        # All resume sections data
│   ├── hooks/
│   │   ├── use-resume-progress.ts  # API integration
│   │   ├── use-resume-builder.ts   # Builder state management
│   │   └── use-toast.ts
│   ├── lib/
│   │   └── utils.ts              # Utility functions
│   ├── pages/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth].ts
│   │   │   └── resume/
│   │   │       ├── save-progress.ts
│   │   │       └── get-progress.ts
│   │   ├── _app.tsx              # App wrapper with providers
│   │   ├── _document.tsx         # HTML document structure
│   │   ├── index.tsx             # Landing page
│   │   ├── builder.tsx           # Resume builder (auth-protected)
│   │   ├── auth.tsx              # Authentication page
│   │   └── 404.tsx               # Not found page
│   ├── services/
│   │   └── resume-progress.ts    # API service layer
│   ├── styles/
│   │   └── globals.css           # Global styles
│   └── types/
│       ├── resume.ts             # Resume data types
│       ├── builder.ts            # Builder types
│       └── index.ts
├── public/                       # Static assets
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🎯 Key Features

### 1. Authentication Flow

- **GitHub OAuth** via NextAuth
- Protected `/builder` route
- Auto-redirect to `/auth` if not authenticated
- Session persistence across page reloads

### 2. Resume Builder

- **7 Comprehensive Sections:**
  1. Professional Header
  2. Professional Summary
  3. Work Experience
  4. Projects & Portfolio
  5. Technical Skills
  6. Achievements & Awards
  7. Open Source Contributions

- **Interactive Checklists** for each section
- **Real-time Scoring** with progress tracking
- **Auto-save** functionality (2-second debounce)
- **Good vs Bad Examples** for each section
- **Recruiter Perspectives** and Pro Tips

### 3. Landing Page

- Hero section with CTA
- Feature cards
- Proven template section
- Interview prep upsell
- Beautiful gradient designs

### 4. Data Persistence (Ready for Database)

- API routes ready at:
  - `POST /api/resume/save-progress`
  - `GET /api/resume/get-progress`
- React Query for caching and optimization
- Auto-save with debouncing

## 🔧 Technology Stack

- **Framework**: Next.js 15 (Pages Router)
- **Authentication**: NextAuth v4
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Query v3
- **Forms**: React Hook Form
- **TypeScript**: Full type safety
- **Workspace Packages**: @tbe/auth, @tbe/components, etc.

## 🔄 Integration Points

### Shared Workspace Packages

- `@tbe/auth` - Authentication utilities
- `@tbe/components` - Shared UI components
- `@tbe/hooks` - Shared React hooks
- `@tbe/utils` - Utility functions
- `@tbe/types` - TypeScript definitions
- `@tbe/services` - API services

### Port Configuration

- **Platform**: 3000
- **PrepYatra**: 3001
- **ResumeYatra**: 3002

## 📝 Next Steps: Database Integration

### Option 1: MongoDB (Recommended)

```typescript
// Install mongoose
pnpm add mongoose

// Create lib/db.ts
import mongoose from 'mongoose';

export async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  return mongoose.connect(process.env.DATABASE_URL!);
}

// Create models/ResumeProgress.ts
import mongoose from 'mongoose';

const ResumeProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  stepData: { type: Array, required: true },
  currentStep: { type: Number, default: 0 },
  overallScore: { type: Number, default: 0 },
  hasResume: { type: Boolean, default: null },
  showTemplate: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ResumeProgress ||
  mongoose.model('ResumeProgress', ResumeProgressSchema);
```

### Option 2: PostgreSQL with Prisma

```bash
# Install Prisma
pnpm add prisma @prisma/client

# Initialize Prisma
npx prisma init

# Add schema in prisma/schema.prisma
# Then generate client and migrate
npx prisma generate
npx prisma migrate dev
```

### Update API Routes

Replace the TODO sections in:

- `src/pages/api/resume/save-progress.ts`
- `src/pages/api/resume/get-progress.ts`

With actual database calls.

## 🎨 Customization

### Brand Colors

Update in `tailwind.config.ts`:

```typescript
colors: {
  primary: "#your-color",
  secondary: "#your-color",
}
```

### Resume Steps

Modify in `src/constants/resumeSteps.ts` to add/remove/edit sections.

### Landing Page

Edit components in `src/components/landing/` to customize messaging and design.

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set root directory to `apps/resume-yatra`
4. Add environment variables
5. Deploy!

The `vercel.json` is pre-configured for monorepo deployment.

### Environment Variables for Production

```env
NEXTAUTH_SECRET=your-production-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret
DATABASE_URL=your-production-database-url
```

## 📊 Build Output

```
Route (pages)                                 Size  First Load JS
┌ ○ /                                      5.84 kB         411 kB
├ ○ /404                                   1.41 kB         407 kB
├ ƒ /auth                                  2.19 kB         411 kB
├ ƒ /builder                               11.5 kB         420 kB
└ ƒ /api/* (API routes)                       0 B         403 kB
```

## ✅ Testing Checklist

- [ ] Authentication flow works (GitHub OAuth)
- [ ] Landing page loads correctly
- [ ] Builder requires authentication
- [ ] All 7 resume sections display properly
- [ ] Checkl

ist items toggle correctly

- [ ] Progress bar updates
- [ ] Score calculations work
- [ ] Auto-save triggers (check network tab)
- [ ] Result screen shows with confetti
- [ ] Toast notifications appear
- [ ] Mobile responsive design works

## 🐛 Troubleshooting

### Issue: "Cannot find module '@tbe/auth'"

**Solution**: Run `pnpm install` from monorepo root

### Issue: GitHub OAuth not working

**Solution**:

1. Check GitHub OAuth app settings
2. Verify callback URL matches
3. Ensure environment variables are set

### Issue: Build fails with TypeScript errors

**Solution**: Run `pnpm build` to see specific errors

### Issue: Styles not loading

**Solution**:

1. Check Tailwind config
2. Ensure globals.css is imported in \_app.tsx
3. Verify @/\* path alias works

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Query Documentation](https://tanstack.com/query/v3)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## 🎉 Success

Your Resume Yatra app is now fully integrated into the TBE monorepo!

**Features Ready:**
✅ Authentication with GitHub OAuth
✅ Interactive resume builder with 7 sections
✅ Real-time progress tracking and scoring
✅ Auto-save functionality
✅ Beautiful, responsive UI
✅ API routes ready for database integration

**Next Steps:**

1. Setup GitHub OAuth credentials
2. Add database connection
3. Test the full flow
4. Deploy to Vercel
5. Share with users!

---

For questions or issues, check `MIGRATION_SUMMARY.md` or the main README.
