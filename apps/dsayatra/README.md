# DSA Yatra - Next.js

Your personalized journey to master Data Structures & Algorithms. Built with ❤️ by [The Boring Education](https://theboringeducation.com)

## 🚀 Features

- **Target-based Learning**: Choose your path based on company type (Startup, MNC, FAANG)
- **Domain-specific Roadmaps**: Specialized tracks for Full-stack, Data Science, App Dev, ML, Data Analyst, and AI
- **Time-based Plans**: Flexible learning schedules from 2 months to 5+ months
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Comprehensive Question Bank**: Curated DSA questions with difficulty levels and direct LeetCode links

## 🛠️ Technologies Used

This project is built with:

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **React 18** - Latest React features
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **shadcn/ui** - Beautiful, accessible UI components
- **Radix UI** - Unstyled, accessible components
- **React Query** - Data fetching and state management

## 📋 Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn or pnpm or bun

## 🚀 Getting Started

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd dsa-yatra-main
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
dsa-yatra-main/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── providers.tsx      # Client-side providers
│   │   ├── target/[type]/     # Target-based roadmaps
│   │   ├── domain/[type]/     # Domain-specific roadmaps
│   │   ├── time/[duration]/   # Time-based roadmaps
│   │   └── not-found.tsx      # 404 page
│   ├── components/            # Reusable UI components
│   │   └── ui/               # shadcn/ui components
│   ├── data/                 # DSA question data
│   ├── hooks/                # Custom React hooks
│   └── lib/                  # Utility functions
├── public/                    # Static assets
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## 🎨 Customization

### Adding New Questions

Edit the `src/data/dsaData.ts` file to add or modify DSA questions and topics.

### Styling

The project uses Tailwind CSS. Modify `tailwind.config.ts` to customize the design system.

### Components

All UI components are in `src/components/ui/` using shadcn/ui and Radix UI.

## 📦 Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

Then start the production server:

```bash
npm start
# or
yarn start
# or
pnpm start
# or
bun start
```

## 🚢 Deployment

### Deploy on Vercel (Recommended)

The easiest way to deploy a Next.js app is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Other Platforms

This Next.js app can also be deployed on:
- Netlify
- AWS Amplify
- Railway
- Render
- Any Node.js hosting platform

## 👨‍💻 Author

Built by [Sachin](https://github.com/imsks) at [The Boring Education](https://theboringeducation.com)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if this project helped you!
