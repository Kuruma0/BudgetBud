# Kaching - Personal Finance Management App

Kaching is a comprehensive personal finance management application built with Next.js, featuring a town-building minigame that rewards good financial decisions with virtual currency called "bucks."

## 🚀 Features

- **Balance Tracking**: Monitor your current balance and monthly spending
- **Goal Setting**: Set and track financial goals with progress visualization
- **Virtual Town Building**: Earn "bucks" for good financial decisions and build your virtual town
- **Investment Learning**: Educational content about investing and financial literacy
- **Achievement System**: Unlock achievements for reaching financial milestones
- **SMS Import**: Import transactions from SMS messages
- **Monthly Budget Tracking**: Set budgets and track spending progress

## 🏗️ Architecture Overview

### Authentication System
- **Simple localStorage-based authentication** - No external database required
- User data stored locally in browser storage
- Session management handled client-side
- Files: `lib/auth.ts`, `app/auth/login/page.tsx`, `app/auth/signup/page.tsx`

### Component Structure

#### Core Components

**DashboardHeader** (`components/dashboard-header.tsx`)
- Main navigation header with orange gradient theme
- User welcome message and navigation links
- Sign out functionality

**Balance Cards** (`components/balance-card.tsx`, `components/enhanced-balance-card.tsx`)
- Display current balance with orange gradient styling
- Monthly spending tracking
- Budget setting and progress visualization
- Data stored in localStorage

**Virtual Town** (`components/virtual-town.tsx`)
- Interactive town-building minigame
- Grid-based building placement system
- Building shop with different structures (houses, shops, parks)
- Buck currency system integration

#### Financial Management

**Goals Overview** (`components/goals-overview.tsx`)
- Financial goal creation and tracking
- Progress visualization with charts
- Goal categories (savings, debt reduction, etc.)

**Achievements System** (`components/achievements-overview.tsx`)
- Achievement tracking and unlocking
- Progress indicators and rewards
- Integration with buck earning system

**Transactions** (`components/transactions-list.tsx`)
- Transaction history display
- Categorization and filtering
- Integration with buck rewards for good spending habits

#### Learning & Investment

**Learning Center** (`components/learning-center.tsx`)
- Educational modules about investing
- Interactive lessons and quizzes
- Progress tracking through learning materials

**Investment Insights** (`components/investment-insights.tsx`)
- Educational investment content
- Risk assessment tools
- Market education (no actual trading)

### Data Management

#### localStorage Schema
\`\`\`javascript
// User authentication
kaching_users: Array<{id, email, password, fullName, createdAt}>
kaching_current_user: {id, email, fullName, createdAt}

// User data
transactions_${userId}: Array<Transaction>
goals_${userId}: Array<Goal>
budget_${userId}: number
bucks_${userId}: number
town_buildings_${userId}: Array<Building>
achievements_${userId}: Array<Achievement>
\`\`\`

#### Buck Rewards System
- Users earn 10-25 bucks for good financial decisions
- Automatic detection of positive spending patterns
- Integration with transaction analysis
- Rewards displayed via notifications

### Styling & Theme

#### Color Scheme
- **Primary**: Orange gradient theme (`from-orange-500 to-red-600`)
- **Header**: Yellow to orange gradient (`from-yellow-500 to-orange-600`)
- **Consistent orange theming** throughout all components
- **South African Rand (ZAR)** currency formatting

#### Design System
- **Tailwind CSS v4** with custom CSS variables
- **shadcn/ui components** for consistent UI elements
- **Responsive design** with mobile-first approach
- **Glass morphism effects** with backdrop blur

### Page Structure

#### Authentication Pages
- `/auth/login` - Simple email/password login
- `/auth/signup` - User registration with full name

#### Main Application Pages
- `/dashboard` - Main balance overview and virtual town
- `/goals` - Financial goal management
- `/investments` - Investment learning center (educational only)
- `/achievements` - Achievement tracking and rewards
- `/account` - User account settings

### Key Features Implementation

#### Virtual Town Minigame
- **Grid System**: 6x4 building grid with drag-and-drop placement
- **Building Types**: Houses (50 bucks), Shops (100 bucks), Parks (75 bucks)
- **Currency Integration**: Earn bucks through good financial habits
- **Visual Feedback**: Animated building placement and town growth

#### Buck Rewards System
- **Automatic Detection**: Analyzes spending patterns for rewards
- **Notification System**: Visual feedback when bucks are earned
- **Integration Points**: Transaction analysis, goal completion, achievement unlocks

#### Investment Learning (No Trading)
- **Educational Content**: Comprehensive investment education modules
- **Risk Assessment**: Tools to understand investment risk
- **No Actual Trading**: Focus on education rather than real stock transactions

## 🛠️ Development

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Authentication**: localStorage-based (no external database)
- **State Management**: React hooks and localStorage
- **TypeScript**: Full type safety

### Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

### Key Files
- `lib/auth.ts` - Authentication service
- `components/virtual-town.tsx` - Town building minigame
- `components/dashboard-header.tsx` - Main navigation
- `app/globals.css` - Orange theme configuration
- `middleware.ts` - Simplified routing (no auth middleware)

## 🎮 How to Use

1. **Sign Up/Login**: Create an account or sign in with existing credentials
2. **Set Budget**: Configure your monthly budget in the balance card
3. **Track Spending**: Add transactions and monitor your balance
4. **Earn Bucks**: Make good financial decisions to earn virtual currency
5. **Build Town**: Use earned bucks to purchase buildings for your virtual town
6. **Learn Investing**: Explore the investment learning center for financial education
7. **Set Goals**: Create and track financial goals
8. **Unlock Achievements**: Complete financial milestones to earn achievements

## 🔒 Security Notes

- All data stored locally in browser localStorage
- No external database connections required
- User passwords stored in localStorage (development only - not production ready)
- Session management handled client-side

## 🚀 Future Enhancements

- Real database integration for production use
- Advanced town building features
- More investment education modules
- Social features and leaderboards
- Mobile app version
- Advanced analytics and insights
