# 📄 Resume Yatra - Professional Resume Builder

A comprehensive resume building platform that helps developers create professional, ATS-friendly resumes with industry-specific templates and optimization features.

## 📋 Overview

Resume Yatra provides an intuitive interface for creating, customizing, and optimizing resumes specifically designed for tech professionals and developers.

### Key Features

- **Professional Templates**: Industry-specific resume templates
- **ATS Optimization**: Ensure resumes pass Applicant Tracking Systems
- **Real-time Preview**: Live preview while editing
- **Export Options**: PDF, Word, and web-friendly formats
- **Content Suggestions**: AI-powered content recommendations
- **Skills Matching**: Match skills to job descriptions

## 🛠️ Tech Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF or Puppeteer
- **Form Handling**: React Hook Form
- **Shared Packages**: `@tbe/components`, `@tbe/hooks`, `@tbe/utils`

## 🚀 Development

### Prerequisites

- Node.js >= 20.x
- pnpm >= 9.12.0

### Setup

```bash
# From monorepo root
pnpm install

# Start resume-yatra app
pnpm dev:resume-yatra
```

### Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3004
NEXT_PUBLIC_BASE_URL=http://localhost:3007

# AI Services (for content suggestions)
OPENAI_API_KEY=your-openai-key

# File Storage
NEXT_PUBLIC_STORAGE_URL=your-storage-service

# Cross-app Integration
NEXT_PUBLIC_PLATFORM_URL=http://localhost:3000
```

## 📁 Project Structure

```
apps/resume-yatra/
├── src/
│   ├── app/              # Next.js 13+ app directory
│   │   ├── builder/      # Resume builder interface
│   │   ├── templates/    # Template selection
│   │   ├── preview/      # Resume preview
│   │   └── export/       # Export functionality
│   ├── components/       # App-specific components
│   │   ├── builder/      # Builder components
│   │   ├── templates/    # Template components
│   │   ├── forms/        # Form components
│   │   └── preview/      # Preview components
│   ├── lib/             # Utilities and configurations
│   ├── templates/       # Resume template definitions
│   └── styles/          # Global styles
├── public/              # Static assets
└── README.md           # This file
```

## 🔧 Available Scripts

```bash
pnpm dev                # Start development server
pnpm build              # Build for production
pnpm start              # Start production server
pnpm lint               # Run ESLint
```

## 🎯 Key Features

### Resume Builder

- **Drag & Drop Interface**: Intuitive section reordering
- **Real-time Editing**: Live preview while typing
- **Section Management**: Add, remove, and customize sections
- **Auto-save**: Automatic saving of progress
- **Version Control**: Multiple resume versions

### Template System

- **Modern Templates**: Clean, professional designs
- **Tech-focused Layouts**: Optimized for developer roles
- **Customizable Colors**: Brand color customization
- **Font Options**: Professional typography choices
- **Layout Variations**: Single/multi-column layouts

### Content Optimization

- **ATS Scanning**: Check ATS compatibility
- **Keyword Optimization**: Suggest relevant keywords
- **Content Analysis**: Grammar and readability checks
- **Skill Matching**: Match skills to job postings
- **Achievement Metrics**: Quantify accomplishments

### Export & Sharing

- **PDF Export**: High-quality PDF generation
- **Word Format**: Editable Word documents
- **Web Resume**: Shareable web links
- **Print Optimization**: Print-friendly layouts

## 🎨 Components

### Resume Builder Interface

```typescript
import { ResumeBuilder } from '@/components/builder'

<ResumeBuilder
  template="modern"
  onSave={handleSave}
  onExport={handleExport}
  initialData={resumeData}
/>
```

### Template Selector

```typescript
import { TemplateSelector } from '@/components/templates'

<TemplateSelector
  templates={availableTemplates}
  onSelect={handleTemplateSelect}
  preview={true}
/>
```

### Section Editor

```typescript
import { SectionEditor } from '@/components/forms'

<SectionEditor
  section="experience"
  data={experienceData}
  onChange={handleSectionChange}
/>
```

## 📊 Resume Data Structure

```typescript
interface Resume {
    id: string
    userId: string
    template: string
    personalInfo: PersonalInfo
    summary: string
    experience: Experience[]
    education: Education[]
    skills: Skill[]
    projects: Project[]
    certifications: Certification[]
    customSections: CustomSection[]
    settings: ResumeSettings
}

interface Experience {
    id: string
    company: string
    position: string
    location: string
    startDate: string
    endDate?: string
    current: boolean
    description: string[]
    technologies: string[]
}
```

## 🔍 ATS Optimization

### Scanning Features

- **Keyword Density**: Analyze keyword usage
- **Format Compatibility**: Check ATS-friendly formatting
- **Section Recognition**: Ensure proper section headers
- **Font Compatibility**: Use ATS-readable fonts
- **File Format**: Optimize for different ATS systems

### Optimization Suggestions

- **Missing Keywords**: Suggest relevant keywords
- **Format Issues**: Highlight formatting problems
- **Content Gaps**: Identify missing information
- **Improvement Tips**: Provide actionable advice

## 📖 Contributing

Follow the [main contributing guide](../../README.md#contributing) and focus on:

- Template design and usability
- ATS optimization accuracy
- Export functionality
- Content suggestion quality
- User experience improvements

### Adding New Templates

1. Create template component in `/templates`
2. Define template metadata and preview
3. Add to template selector
4. Test with various content types
5. Ensure ATS compatibility

### Content Suggestions

1. Implement AI-powered content analysis
2. Create industry-specific suggestions
3. Add skill matching algorithms
4. Provide achievement quantification tips

---

**Part of the TBE Platform Monorepo**
