# 💰 Personal Finance Tracker

A comprehensive mobile finance management application built with React Native (Expo) and Next.js backend. Track expenses, manage budgets, handle party transactions, and get AI-powered financial insights.

## 📱 Features

### 🔐 Authentication & Security
- Email/Password authentication with OTP verification
- Google OAuth integration
- Two-factor authentication (2FA) support
- Biometric login (fingerprint/face recognition)
- Session management with device tracking
- Login history tracking with IP, device, and location
- Secure password change functionality
- Account deletion with data export

### 💸 Income & Expense Management
- Add, edit, and delete income entries
- Add, edit, and delete expense entries with image attachments
- Categorize transactions with custom or default categories
- Recurring income/expense support
- Date-based transaction filtering
- Transaction search functionality
- Detailed transaction history view
- Calendar view for transaction visualization

### 🏦 Account Management
- Multiple account support (Cash, Bank, Wallet)
- Real-time balance tracking
- Account-wise transaction filtering
- Bank account details (Account Number, IFSC Code, Bank Name)
- Custom account colors and icons
- Default account selection
- Account balance updates on transactions

### 📊 Budget Management
- Set budgets by category
- Multiple budget periods (Daily, Weekly, Monthly, Yearly)
- Budget vs actual spending comparison
- Budget alerts and notifications
- Visual budget progress indicators
- Budget period tracking with start/end dates

### 👥 Party Management (Receivables/Payables)
- Track money to receive or give to parties
- Party contact details (Name, Phone, Email, Address)
- PAN number tracking for business parties
- Opening balance with as-of date
- Party transaction history
- Settlement tracking
- Party-wise balance calculation
- Credit/Debit transaction management

### 📈 Statistics & Analytics
- Income vs Expense comparison
- Category-wise spending breakdown
- Monthly/Weekly/Daily spending trends
- Account balance overview
- Visual charts and graphs
- Transaction insights

### 🤖 AI-Powered Financial Assistant
- Natural language expense/income entry
  - "I spent 500 on momo" → Automatically creates expense
  - "I earned 50000 as salary" → Automatically creates income
- Intelligent financial insights with real-time data analysis
  - Account balance overview across all accounts
  - Recent transaction summaries (last 30 days)
  - Budget status monitoring with alerts
  - Category-wise spending breakdown
  - Party balance tracking (receivables/payables)
  - Spending trend analysis (week-over-week, month-over-month)
- Personalized budgeting recommendations
  - Budget vs actual spending comparison
  - Overspending alerts and warnings
  - Category-specific budget suggestions
- Smart action detection and execution
  - "Show my transactions" → Navigate to transactions
  - "View my budget" → Navigate to budget screen
  - "Show statistics" → Navigate to analytics
  - "Show my accounts" → Navigate to accounts
  - "Show parties" → Navigate to party management
  - "Analyze my spending" → Generate detailed spending report
- Context-aware conversations
  - Maintains conversation history
  - Understands follow-up questions
  - Provides specific insights based on user's actual financial data
- Financial advice and tips
  - Expense reduction strategies
  - Savings recommendations
  - Budget optimization suggestions
- Conversational interface powered by Groq AI (Llama 3.3 70B)
- Quick navigation to relevant screens
- Real-time financial data integration

### 🔔 Notifications & Alerts
- Push notifications for budget alerts
- Email notifications
- Weekly financial reports
- Budget threshold warnings
- Transaction reminders

### ⚙️ User Settings
- Profile management with avatar upload
- Personal information (Name, Email, Phone, Date of Birth)
- Notification preferences
- Security settings
- Currency selection
- Theme preferences (Light/Dark mode)
- Data export (Download all user data)

### 🌐 Additional Features
- Nepali date support with calendar
- Multi-currency support
- Image upload for expenses (Cloudinary integration)
- Responsive design for all screen sizes
- Offline support with data sync
- Search functionality across all transactions
- Help & Support section
- About page

## 🛠️ Tech Stack

### Frontend (Mobile App)
- **Framework**: React Native with Expo
- **Navigation**: Expo Router (File-based routing)
- **Language**: TypeScript
- **UI Components**: Custom components with React Native
- **State Management**: React Hooks
- **HTTP Client**: Fetch API
- **Authentication**: AsyncStorage for token management
- **Image Handling**: Expo Image, Expo File System
- **Date Handling**: Custom Nepali date library
- **AI Integration**: Groq API (Llama 3.3 70B)

### Backend (API)
- **Framework**: Next.js 14 (API Routes)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Email Service**: Nodemailer
- **File Upload**: Cloudinary
- **Google OAuth**: google-auth-library
- **Validation**: Zod

### Database Schema
- Users with profile and settings
- Categories (Income/Expense)
- Income & Expense records
- Budgets with period tracking
- Accounts (Cash/Bank/Wallet)
- Parties (Receivables/Payables)
- Transactions
- OTP verification
- Login history
- Active sessions

## 📁 Project Structure

```
.
├── backend/                 # Next.js Backend API
│   ├── app/api/            # API Routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── account/        # Account management
│   │   ├── budget/         # Budget endpoints
│   │   ├── category/       # Category management
│   │   ├── expense/        # Expense endpoints
│   │   ├── income/         # Income endpoints
│   │   ├── party/          # Party management
│   │   ├── transaction/    # Transaction endpoints
│   │   ├── upload/         # File upload
│   │   └── user/           # User profile & settings
│   ├── lib/                # Utility libraries
│   │   ├── auth.ts         # JWT authentication
│   │   ├── cloudinary.ts   # Image upload
│   │   ├── email.ts        # Email service
│   │   ├── middleware.ts   # Auth middleware
│   │   ├── prisma.ts       # Database client
│   │   └── response.ts     # API response helpers
│   └── prisma/             # Database schema
│
├── myapp/                  # React Native Mobile App
│   ├── app/                # Screens (File-based routing)
│   │   ├── (auth)/         # Auth screens
│   │   ├── (tabs)/         # Main tab screens
│   │   └── *.tsx           # Other screens
│   ├── components/         # Reusable components
│   ├── lib/                # Utilities
│   │   ├── api.ts          # API client
│   │   ├── groq.ts         # AI service with financial context
│   │   ├── ai-actions.ts   # AI action parser & executor
│   │   └── nepali-date.ts  # Date utilities
│   ├── constants/          # App constants
│   └── assets/             # Images and fonts
│
└── AI_FEATURES.md          # Comprehensive AI features documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Expo CLI
- Cloudinary account (for image uploads)
- Groq API key (for AI chat)
- Google OAuth credentials (optional)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/financedb"
JWT_SECRET="your-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. Setup database:
```bash
npm run prisma:push
```

5. Start development server:
```bash
npm run dev
```

Backend will run on `http://localhost:3001`

### Mobile App Setup

1. Navigate to app directory:
```bash
cd myapp
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
EXPO_PUBLIC_API_URL=http://localhost:3001/api
EXPO_PUBLIC_GROQ_API_KEY=your-groq-api-key
```

4. Start Expo development server:
```bash
npm start
```

5. Run on device:
- Press `a` for Android
- Press `i` for iOS
- Scan QR code with Expo Go app

## 📱 Building for Production

### Android Build
See [ANDROID_BUILD_GUIDE.md](ANDROID_BUILD_GUIDE.md) for detailed instructions.

### Backend Deployment
See [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md) and [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) for deployment instructions.

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/google` - Google OAuth login

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/change-password` - Change password
- `GET /api/user/settings` - Get user settings
- `PUT /api/user/settings` - Update settings
- `GET /api/user/login-history` - Get login history
- `GET /api/user/sessions` - Get active sessions
- `GET /api/user/security` - Get security info
- `GET /api/user/download-data` - Export user data
- `DELETE /api/user/delete-account` - Delete account

### Income & Expenses
- `GET /api/income` - Get all income
- `POST /api/income` - Create income
- `PUT /api/income/[id]` - Update income
- `DELETE /api/income/[id]` - Delete income
- `GET /api/expense` - Get all expenses
- `POST /api/expense` - Create expense
- `PUT /api/expense/[id]` - Update expense
- `DELETE /api/expense/[id]` - Delete expense

### Accounts
- `GET /api/account` - Get all accounts
- `POST /api/account` - Create account
- `PUT /api/account/[id]` - Update account
- `DELETE /api/account/[id]` - Delete account

### Budgets
- `GET /api/budget` - Get all budgets
- `POST /api/budget` - Create budget
- `PUT /api/budget/[id]` - Update budget
- `DELETE /api/budget/[id]` - Delete budget

### Parties
- `GET /api/party` - Get all parties
- `POST /api/party` - Create party
- `PUT /api/party/[id]` - Update party
- `DELETE /api/party/[id]` - Delete party

### Categories
- `GET /api/category` - Get all categories
- `POST /api/category` - Create category
- `PUT /api/category/[id]` - Update category
- `DELETE /api/category/[id]` - Delete category

### Transactions
- `GET /api/transaction` - Get all transactions
- `POST /api/transaction` - Create transaction

### File Upload
- `POST /api/upload` - Upload image to Cloudinary

## 🎨 Key Features Explained

### AI Financial Assistant
The app includes an intelligent chat assistant with comprehensive financial analysis capabilities:

**Natural Language Processing:**
- Parse conversational text to detect financial actions
- Automatically create expenses/income from natural language
- Understand context and intent from user messages

**Real-Time Financial Insights:**
- Account balance monitoring across all accounts (Cash, Bank, Wallet)
- Recent transaction summaries with income/expense breakdown
- Budget status tracking with overspending alerts
- Category-wise spending analysis with percentages
- Party balance tracking (money to receive/pay)
- Spending trend analysis (week-over-week, month-over-month changes)

**Smart Actions:**
- Navigate to relevant screens based on user intent
- Generate detailed spending reports on demand
- Provide budget recommendations based on actual spending patterns
- Alert users about budget breaches and near-limit categories

**Personalized Recommendations:**
- Expense reduction strategies based on spending patterns
- Budget optimization suggestions
- Savings tips tailored to user's financial situation
- Category-specific insights and warnings

**Example Interactions:**
- "I spent 500 on momo" → Creates expense automatically
- "Show my transactions" → Navigates to transactions screen
- "How am I doing this month?" → Provides comprehensive financial summary
- "Analyze my spending" → Generates detailed spending report with insights
- "Show my budget status" → Displays budget overview with alerts
- "Who owes me money?" → Shows receivables from parties
- "How can I save more?" → Provides personalized savings advice

### Party Management
Track money you need to receive or give to others:
- Add parties with full contact details
- Record opening balances
- Track all transactions with each party
- Settle balances when paid
- View party-wise transaction history

### Multi-Account Support
Manage multiple accounts simultaneously:
- Cash accounts for daily expenses
- Bank accounts with full details
- Digital wallets
- Real-time balance synchronization
- Account-wise transaction filtering

## 🔒 Security Features
- JWT-based authentication
- Password hashing with bcrypt
- OTP verification for new accounts
- Session management with device tracking
- Two-factor authentication support
- Secure API endpoints with middleware
- Token expiration and refresh

## 📄 License
This project is private and proprietary.

## 👨‍💻 Development

### Running Tests
```bash
# Backend
cd backend
npm test

# Mobile App
cd myapp
npm test
```

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting

## 🤝 Contributing
This is a private project. Contact the repository owner for contribution guidelines.

## 📞 Support
For issues and questions, please refer to the Help & Support section in the app or contact the development team.

## 📚 Additional Documentation

- [AI Features Guide](AI_FEATURES.md) - Comprehensive guide to AI-powered financial assistant
- [Android Build Guide](ANDROID_BUILD_GUIDE.md) - Instructions for building Android APK
- [Deployment Quickstart](DEPLOYMENT_QUICKSTART.md) - Quick deployment guide
- [Vercel Deployment](VERCEL_DEPLOYMENT_GUIDE.md) - Detailed Vercel deployment instructions

---

Built with ❤️ using React Native, Expo, and Next.js
