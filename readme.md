# The Boring Quizes 🧠

A comprehensive quiz platform for mastering tech interviews with detailed analytics, performance tracking, and competitive leaderboards.

## ✨ Features

### 🎯 Core Quiz System

-   **Multiple Categories**: JavaScript, React, Algorithms, Web Development, and more
-   **Interactive Questions**: Multiple choice with detailed explanations
-   **Real-time Scoring**: Immediate feedback and performance tracking
-   **Progress Tracking**: Save attempts and track improvement over time

### 📊 Enhanced Dashboard

-   **Unified Navigation**: Clean, intuitive navigation across all features
-   **Quick Stats**: Overview of total attempts, average scores, and time spent
-   **Category Progress**: Visual progress indicators for each quiz category
-   **Performance Insights**: Detailed analytics and improvement tracking

### 📈 Stats & Analytics

-   **Performance Metrics**: Comprehensive performance overview
-   **Time Range Filtering**: 7 days, 30 days, 90 days, or all time
-   **Category Performance**: Detailed breakdown by quiz category
-   **Trend Analysis**: Performance improvement tracking and insights
-   **Accuracy Metrics**: Time management and accuracy statistics

### 📚 Performance History

-   **Detailed Attempt Tracking**: Complete history of all quiz attempts
-   **Advanced Filtering**: Search by category, time range, and keywords
-   **Performance Trends**: Compare recent vs. previous performance
-   **Detailed Insights**: Expandable attempt details with metrics
-   **Export & Analysis**: Comprehensive performance data for review

### 🏆 Leaderboard & Competition

-   **Global Rankings**: Compete with learners worldwide
-   **Achievement System**: Unlock badges and rewards
-   **User Profiles**: View detailed profiles and achievements
-   **Ranking Tiers**: Top 25, 50, or 100 learners
-   **Personal Ranking**: Track your position globally

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   npm or yarn

### Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd The-Boring-Quizes
    ```

2. **Install dependencies**

    ```bash
    npm install
    # or
    yarn install
    ```

3. **Environment Setup**

    ```bash
    cp .env.example .env.local
    ```

    Update `.env.local` with your configuration:

    ```env
    NEXT_PUBLIC_TBE_WEBAPP_API_URL=your_api_url
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
    ```

4. **Run Development Server**

    ```bash
    npm run dev
    # or
    yarn dev
    ```

    Open [http://localhost:3002](http://localhost:3002) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 🏗️ Architecture

### Frontend Structure

```
src/
├── app/                    # Next.js app router
│   ├── dashboard/         # Dashboard pages
│   │   ├── page.tsx      # Main dashboard
│   │   ├── stats/        # Stats & Analytics
│   │   ├── history/      # Performance History
│   │   └── leaderboard/  # Leaderboard
│   └── quiz/             # Quiz taking interface
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   │   └── DashboardNav.tsx
│   └── ui/               # UI components
├── services/             # API services
├── types/                # TypeScript types
└── lib/                  # Utilities and helpers
```

### Key Components

#### DashboardNav

-   **Unified Navigation**: Consistent navigation across all dashboard pages
-   **Responsive Design**: Mobile-friendly with collapsible menu
-   **Active States**: Visual feedback for current page
-   **User Management**: Profile menu and sign out functionality

#### Stats & Analytics

-   **Performance Metrics**: Key performance indicators
-   **Time Range Filtering**: Flexible date range selection
-   **Category Breakdown**: Performance by quiz category
-   **Trend Analysis**: Improvement tracking over time

#### Performance History

-   **Attempt Tracking**: Complete history of quiz attempts
-   **Advanced Filtering**: Search and filter capabilities
-   **Performance Trends**: Comparative analysis
-   **Detailed Insights**: Expandable attempt information

#### Leaderboard

-   **Global Rankings**: Worldwide competition
-   **User Profiles**: Detailed user information
-   **Achievement System**: Badges and rewards
-   **Ranking Tiers**: Multiple leaderboard views

## 🔧 API Integration

### Endpoints

-   **Quiz Management**: Categories, questions, and submissions
-   **Analytics**: Performance metrics and category analysis
-   **User Management**: Profiles, authentication, and preferences
-   **Leaderboard**: Rankings and achievements

### Data Flow

1. **Quiz Attempts**: Track user performance and time
2. **Analytics Processing**: Calculate metrics and trends
3. **Leaderboard Updates**: Real-time ranking calculations
4. **Achievement Unlocking**: Automatic badge assignment

## 🎨 UI/UX Features

### Design Principles

-   **Clean & Modern**: Minimalist design with clear hierarchy
-   **Responsive**: Mobile-first responsive design
-   **Accessible**: WCAG compliant with proper contrast
-   **Interactive**: Smooth animations and micro-interactions

### Visual Elements

-   **Glass Morphism**: Modern backdrop blur effects
-   **Gradient Accents**: Subtle color gradients
-   **Icon System**: Consistent Lucide React icons
-   **Animation**: Smooth transitions and loading states

## 📱 Responsive Design

### Breakpoints

-   **Mobile**: 320px - 768px
-   **Tablet**: 768px - 1024px
-   **Desktop**: 1024px+

### Mobile Features

-   **Collapsible Navigation**: Hamburger menu for mobile
-   **Touch-Friendly**: Optimized for touch interactions
-   **Adaptive Layouts**: Responsive grid systems
-   **Mobile-First**: Designed for mobile devices first

## 🚀 Performance

### Optimization

-   **React Query**: Efficient data fetching and caching
-   **Code Splitting**: Lazy loading of components
-   **Image Optimization**: Next.js image optimization
-   **Bundle Analysis**: Optimized bundle sizes

### Caching Strategy

-   **Client-Side**: React Query cache management
-   **Server-Side**: API response caching
-   **Static Assets**: CDN optimization for static files

## 🔒 Security

### Authentication

-   **Google OAuth**: Secure third-party authentication
-   **JWT Tokens**: Secure session management
-   **Protected Routes**: Route-level authentication
-   **User Isolation**: Secure data separation

### Data Protection

-   **Input Validation**: Client and server-side validation
-   **XSS Prevention**: Sanitized user inputs
-   **CSRF Protection**: Cross-site request forgery prevention
-   **Rate Limiting**: API abuse prevention

## 🧪 Testing

### Testing Strategy

-   **Unit Tests**: Component and utility testing
-   **Integration Tests**: API integration testing
-   **E2E Tests**: End-to-end user flow testing
-   **Performance Tests**: Load and stress testing

### Test Commands

```bash
npm run test          # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run test:coverage # Generate coverage report
```

## 📈 Monitoring & Analytics

<<<<<<< HEAD

-   `POST /user` - Create/find user after Google auth
-   `GET /user/onbording?userName={username}` - Check username availability
-   `POST /user/onbording?userId={userId}` - Complete user onboarding
-   `GET /quiz` - Get available quiz categories
-   `GET /quiz/{categoryId}` - Get questions for a category
-   # `POST /quiz/{categoryId}/attempt` - Submit quiz attempt

### Performance Monitoring

-   **Core Web Vitals**: LCP, FID, CLS tracking
-   **Error Tracking**: Sentry integration for error monitoring
-   **User Analytics**: Google Analytics integration
-   **Performance Metrics**: Real-time performance tracking
    > > > > > > > eea263a45a6a795009639f422308aa2962dcf4cd

### User Behavior

-   **Quiz Completion Rates**: Track user engagement
-   **Performance Trends**: Monitor learning progress
-   **Feature Usage**: Understand user preferences
-   **Conversion Funnel**: Optimize user journey

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Code Standards

-   **TypeScript**: Strict type checking
-   **ESLint**: Code quality enforcement
-   **Prettier**: Consistent code formatting
-   **Conventional Commits**: Standardized commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

-   **Next.js Team**: For the amazing React framework
-   **Tailwind CSS**: For the utility-first CSS framework
-   **Lucide Icons**: For the beautiful icon set
-   **React Query**: For efficient data management

## 📞 Support

-   **Documentation**: [Wiki](link-to-wiki)
-   **Issues**: [GitHub Issues](link-to-issues)
-   **Discussions**: [GitHub Discussions](link-to-discussions)
-   **Email**: support@theboringquizes.com

---

**Built with ❤️ by The Boring Team**
