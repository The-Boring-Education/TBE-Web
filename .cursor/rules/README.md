# 📚 TBE Platform - Cursor Rules Documentation

This directory contains the comprehensive Cursor AI rulebook for The Boring Education (TBE) Platform ecosystem. These rules ensure consistent, maintainable, and high-quality code generation across all applications and services.

## 📁 Structure Overview

```
.cursor/rules/
├── README.md                    # This documentation
├── architecture.md              # System architecture guidelines
├── frontend-rules.md           # Frontend-specific rules
├── backend-rules.md            # Backend API development rules
├── shared-packages.md          # Shared package development
├── authentication.md           # Auth implementation guidelines
└── styling-ui.md              # UI/UX and styling rules
```

## 🎯 Purpose

These rules serve multiple critical functions:

### 1. **Consistency Enforcement**

- Maintain uniform code patterns across 8+ applications
- Ensure shared package usage instead of code duplication
- Standardize API response structures and error handling
- Enforce TypeScript best practices throughout the ecosystem

### 2. **Knowledge Transfer**

- Document established patterns and architectural decisions
- Provide clear guidelines for new team members
- Capture institutional knowledge in code form
- Enable faster onboarding and development

### 3. **Quality Assurance**

- Prevent common anti-patterns and mistakes
- Enforce security best practices
- Maintain performance optimization standards
- Ensure accessibility and responsive design compliance

### 4. **AI-Assisted Development**

- Guide Cursor AI to generate code that follows project conventions
- Reduce manual code review overhead
- Accelerate development while maintaining quality
- Enable consistent code generation across different developers

## 🚀 How to Use

### For Developers

1. **Read the main `.cursorrules`** file in the project root first
2. **Reference specific rule files** when working on particular areas
3. **Follow the patterns** shown in code examples
4. **Update rules** when establishing new patterns or conventions

### For Cursor AI

The rules are automatically detected and applied when:

- Working in any directory within the TBE platform
- Generating new code or refactoring existing code
- Suggesting improvements or fixes
- Creating new files or components

### For Code Reviews

Use these rules as a checklist to ensure:

- ✅ Proper shared package usage
- ✅ Consistent TypeScript patterns
- ✅ Appropriate error handling
- ✅ Security best practices
- ✅ Performance considerations

## 🔄 Maintenance

### Adding New Rules

1. **Identify patterns** that should be standardized
2. **Document the pattern** with clear examples
3. **Add to appropriate rule file** or create new one
4. **Update this README** if adding new files
5. **Communicate changes** to the development team

### Updating Existing Rules

1. **Discuss changes** with the team first
2. **Update relevant rule files**
3. **Test with Cursor AI** to ensure proper application
4. **Document the reasoning** for changes

## 📋 Rule Categories

### 🏗️ **Architecture Rules** (`architecture.md`)

- Monorepo structure and organization
- Inter-app communication patterns
- Shared package architecture
- Dependency management

### 🎨 **Frontend Rules** (`frontend-rules.md`)

- Next.js application patterns
- React component conventions
- State management approaches
- Routing and navigation

### 🌐 **Backend Rules** (`backend-rules.md`)

- API route structure and patterns
- Database operation conventions
- Authentication and authorization
- External service integration

### 📦 **Shared Package Rules** (`shared-packages.md`)

- Component library organization
- Hook development patterns
- Utility function conventions
- Type definition standards

### 🔐 **Authentication Rules** (`authentication.md`)

- NextAuth.js implementation
- Session management
- Protected route patterns
- Security best practices

### 🎨 **Styling Rules** (`styling-ui.md`)

- Tailwind CSS conventions
- Radix UI integration
- Responsive design patterns
- Accessibility standards

## 🎯 Key Benefits

### For Development Teams

- **Faster Development**: Clear patterns reduce decision fatigue
- **Better Quality**: Consistent standards prevent bugs
- **Easier Maintenance**: Uniform code is easier to understand and modify
- **Knowledge Sharing**: Rules capture and share best practices

### For AI-Assisted Development

- **Contextual Awareness**: AI understands project-specific patterns
- **Consistent Output**: Generated code follows established conventions
- **Reduced Review Time**: Less manual correction needed
- **Pattern Learning**: AI learns from documented best practices

## 🔍 Quick Reference

### Most Important Rules

1. **Always check `@tbe/components`** before creating new UI components
2. **Use TypeScript interfaces** from `@tbe/types` package
3. **Follow the established API response structure** in backend services
4. **Apply CORS middleware** on all API routes
5. **Use environment variables** for all configuration
6. **Implement proper error handling** with logging
7. **Follow the monorepo package import patterns**
8. **Maintain responsive design** with Tailwind CSS

### Common Patterns

```typescript
// Component imports
import { Button, Card } from "@tbe/components";
import { useAuth, useApi } from "@tbe/hooks";
import type { User, APIResponse } from "@tbe/types";

// API response structure
return res.status(200).json(
  sendAPIResponse({
    status: true,
    data: result,
  }),
);

// Error handling
try {
  const result = await operation();
  return success(result);
} catch (error) {
  captureError(error);
  return errorResponse(error.message);
}
```

## 📞 Support

### Questions or Issues

- **Check existing rules** first for established patterns
- **Discuss with team** for clarification on ambiguous cases
- **Update documentation** when new patterns are established
- **Create issues** for rule improvements or additions

### Contributing

1. **Follow the existing documentation style**
2. **Provide clear code examples**
3. **Explain the reasoning** behind rules
4. **Test with Cursor AI** before finalizing
5. **Get team review** for significant changes

---

**Remember**: These rules are living documents that should evolve with the project. Keep them updated, clear, and actionable to maximize their value for both human developers and AI assistance.
