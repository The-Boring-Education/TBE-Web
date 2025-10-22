# 📊 DSA Yatra - Data Structures & Algorithms Practice

A comprehensive platform for practicing data structures and algorithms with interactive coding challenges, visual explanations, and progress tracking.

## 📋 Overview

DSA Yatra helps developers master data structures and algorithms through structured practice, visual learning, and comprehensive problem-solving exercises.

### Key Features

- **Interactive Coding**: In-browser code editor with real-time testing
- **Visual Explanations**: Algorithm visualizations and step-by-step breakdowns
- **Problem Categories**: Arrays, Linked Lists, Trees, Graphs, Dynamic Programming
- **Difficulty Levels**: Beginner to Advanced problem sets
- **Progress Analytics**: Track solving patterns and improvement areas

## 🛠️ Tech Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor or CodeMirror
- **Visualizations**: D3.js or custom React components
- **Shared Packages**: `@tbe/components`, `@tbe/hooks`, `@tbe/utils`

## 🚀 Development

### Prerequisites

- Node.js >= 20.x
- pnpm >= 9.12.0

### Setup

```bash
# From monorepo root
pnpm install

# Start dsayatra app
pnpm dev:dsayatra
```

### Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3004
NEXT_PUBLIC_BASE_URL=http://localhost:3006

# Code Execution Service
NEXT_PUBLIC_CODE_RUNNER_URL=your-code-execution-service

# Cross-app Integration
NEXT_PUBLIC_PLATFORM_URL=http://localhost:3000
NEXT_PUBLIC_PREP_YATRA_URL=http://localhost:3001
```

## 📁 Project Structure

```
apps/dsayatra/
├── src/
│   ├── app/              # Next.js 13+ app directory
│   │   ├── problems/     # Problem pages
│   │   ├── topics/       # Topic-wise organization
│   │   ├── practice/     # Practice sessions
│   │   └── analytics/    # Progress analytics
│   ├── components/       # App-specific components
│   │   ├── editor/       # Code editor components
│   │   ├── visualizer/   # Algorithm visualizations
│   │   └── problems/     # Problem-related components
│   ├── lib/             # Utilities and configurations
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

### Problem Categories

- **Arrays & Strings**: Basic to advanced array manipulations
- **Linked Lists**: Singly, doubly, and circular linked lists
- **Stacks & Queues**: Implementation and applications
- **Trees**: Binary trees, BST, AVL, heap operations
- **Graphs**: BFS, DFS, shortest path algorithms
- **Dynamic Programming**: Memoization and tabulation techniques

### Interactive Features

- **Code Editor**: Syntax highlighting and auto-completion
- **Test Cases**: Automated testing with multiple test cases
- **Hints System**: Progressive hints for problem-solving
- **Solution Explanations**: Detailed explanations with complexity analysis
- **Algorithm Visualization**: Step-by-step algorithm execution

### Progress Tracking

- **Problem Completion**: Track solved problems by category
- **Difficulty Progress**: Monitor advancement through difficulty levels
- **Time Analytics**: Average solving time and improvement trends
- **Weak Areas**: Identify topics needing more practice

## 🎨 Components

### Code Editor

```typescript
import { CodeEditor } from '@/components/editor'

<CodeEditor
  language="javascript"
  defaultValue="// Write your solution here"
  onSubmit={handleSubmit}
  testCases={problemTestCases}
/>
```

### Algorithm Visualizer

```typescript
import { AlgorithmVisualizer } from '@/components/visualizer'

<AlgorithmVisualizer
  algorithm="binarySearch"
  data={[1, 3, 5, 7, 9, 11]}
  target={7}
/>
```

## 📖 Contributing

Follow the [main contributing guide](../../README.md#contributing) and focus on:

- Problem quality and accuracy
- Clear explanations and hints
- Algorithm visualizations
- Test case coverage
- Performance optimization

### Adding New Problems

1. Create problem definition in appropriate category
2. Add test cases and expected outputs
3. Write detailed explanation and hints
4. Add algorithm visualization if applicable
5. Update progress tracking logic

---

**Part of the TBE Platform Monorepo**
