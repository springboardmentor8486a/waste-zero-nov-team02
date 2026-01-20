# WasteZero - Smart Waste Management Platform

WasteZero is a comprehensive full-stack web application designed to streamline waste collection scheduling, volunteer coordination, and environmental impact tracking for communities and organizations.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Features](#features)
5. [Installation and Setup](#installation-and-setup)
6. [Environment Configuration](#environment-configuration)
7. [Running the Application](#running-the-application)
8. [API Documentation](#api-documentation)
9. [Database Models](#database-models)
10. [Frontend Components](#frontend-components)
11. [Authentication System](#authentication-system)
12. [Admin Panel](#admin-panel)
13. [AI Assistant Integration](#ai-assistant-integration)
14. [Styling and Theming](#styling-and-theming)
15. [Troubleshooting](#troubleshooting)

---

## Project Overview

WasteZero connects waste-generating organizations (NGOs, businesses, institutions) with volunteers who collect and properly dispose of or recycle materials. The platform provides:

- Scheduling and tracking of waste pickups
- Volunteer opportunity management
- Real-time messaging between users
- Environmental impact tracking and reporting
- AI-powered assistant for user guidance
- Administrative dashboard for platform management

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | Latest LTS | Runtime environment |
| Express.js | 5.2.1 | Web application framework |
| MongoDB | Cloud Atlas | Database storage |
| Mongoose | 9.0.0 | MongoDB object modeling |
| JSON Web Token | 9.0.2 | Authentication tokens |
| bcryptjs | 3.0.3 | Password hashing |
| Socket.io | 4.8.3 | Real-time communication |
| Nodemailer | 6.10.1 | Email services (OTP) |
| Multer | 1.4.5 | File upload handling |
| Google Auth Library | 9.15.1 | Google OAuth integration |
| Axios | 1.13.2 | HTTP client for AI API calls |
| dotenv | 17.2.3 | Environment variable management |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI library |
| Vite | 7.2.4 | Build tool and dev server |
| React Router DOM | 7.10.1 | Client-side routing |
| TailwindCSS | 3.4.19 | Utility-first CSS framework |
| Framer Motion | 12.23.26 | Animation library |
| Recharts | 3.6.0 | Data visualization charts |
| Leaflet | 1.9.4 | Interactive maps |
| React Leaflet | 5.0.0 | React wrapper for Leaflet |
| Lucide React | 0.561.0 | Icon library |
| Socket.io Client | 4.8.3 | Real-time client communication |
| jsPDF | 4.0.0 | PDF generation for reports |
| Axios | 1.6.5 | HTTP client |

---

## Project Structure

```
wastezero/
├── Backend/
│   ├── middleware/
│   │   └── auth.js                 # JWT authentication middleware
│   ├── models/
│   │   ├── Activity.js             # Activity logging model
│   │   ├── AdminLog.js             # Administrative action logs
│   │   ├── Application.js          # Volunteer applications
│   │   ├── ChatRequest.js          # Chat request management
│   │   ├── Message.js              # User messages
│   │   ├── NgoProfile.js           # NGO profile details
│   │   ├── Notification.js         # User notifications
│   │   ├── Opportunity.js          # Volunteer opportunities
│   │   ├── OTP.js                  # One-time password storage
│   │   ├── Pickup.js               # Waste pickup records
│   │   ├── User.js                 # User accounts
│   │   ├── VolunteerProfile.js     # Volunteer profile details
│   │   └── WasteStat.js            # Waste statistics
│   ├── routes/
│   │   ├── activity.js             # Activity feed endpoints
│   │   ├── admin.js                # Admin management endpoints
│   │   ├── application.js          # Application handling
│   │   ├── assistant.js            # AI assistant endpoints
│   │   ├── auth.js                 # Authentication endpoints
│   │   ├── chat.js                 # Chat functionality
│   │   ├── dashboard.js            # Dashboard data endpoints
│   │   ├── impact.js               # Environmental impact endpoints
│   │   ├── matches.js              # Volunteer-opportunity matching
│   │   ├── messages.js             # Messaging endpoints
│   │   ├── notifications.js        # Notification endpoints
│   │   ├── opportunities.js        # Opportunity management
│   │   ├── pickups.js              # Pickup scheduling endpoints
│   │   ├── profile.js              # User profile endpoints
│   │   ├── settings.js             # User settings endpoints
│   │   ├── uploads-admin.js        # Admin file uploads
│   │   └── users.js                # User management endpoints
│   ├── uploads/                    # Uploaded files storage
│   ├── utils/                      # Utility functions
│   ├── scripts/                    # Database scripts
│   ├── .env                        # Environment variables
│   ├── server.js                   # Express server entry point
│   └── package.json                # Backend dependencies
│
├── frontend/
│   ├── public/
│   │   ├── image.png               # Background image
│   │   ├── waste-truck.png         # Logo image
│   │   └── assets/                 # Static assets (waste type images)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ActivityFeed.jsx        # Activity feed display
│   │   │   ├── AddImpactModal.jsx      # Impact data entry modal
│   │   │   ├── AdminRoute.jsx          # Admin route protection
│   │   │   ├── CalendarView.jsx        # Calendar component
│   │   │   ├── ChatAssistant.jsx       # AI chatbot interface
│   │   │   ├── ErrorBoundary.jsx       # Error handling wrapper
│   │   │   ├── Header.jsx              # Main navigation header
│   │   │   ├── HorizontalCalendar.jsx  # Horizontal date picker
│   │   │   ├── NewChatModal.jsx        # New chat creation
│   │   │   ├── OnboardingModal.jsx     # User onboarding flow
│   │   │   ├── PageHeader.jsx          # Page title component
│   │   │   ├── ProfileEditModal.jsx    # Profile editing modal
│   │   │   ├── ProfileSection.jsx      # Profile display section
│   │   │   └── notifications/          # Notification components
│   │   ├── context/
│   │   │   └── UIContext.jsx           # Global UI state management
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx      # Full admin panel
│   │   │   │   ├── AdminDashboardView.jsx  # Admin overview
│   │   │   │   └── AdminUserModal.jsx      # User management modal
│   │   │   ├── matches/                # Matching functionality
│   │   │   ├── messages/               # Message pages
│   │   │   └── reports/                # Report generation
│   │   ├── services/                   # API service functions
│   │   ├── utils/
│   │   │   └── api.js                  # Axios instance configuration
│   │   ├── App.jsx                 # Main application component
│   │   ├── App.css                 # Global styles
│   │   ├── AvailablePickups.jsx    # Browse available pickups
│   │   ├── Dashboard.jsx           # User dashboard
│   │   ├── ForgotPage.jsx          # Password reset request
│   │   ├── GoogleLogin.jsx         # Google OAuth component
│   │   ├── Help.jsx                # Help and support page
│   │   ├── LandingPage.jsx         # Marketing landing page
│   │   ├── LandingPage.css         # Landing page styles
│   │   ├── LoginPage.jsx           # User login
│   │   ├── Messages.jsx            # Messaging interface
│   │   ├── MyImpact.jsx            # Environmental impact tracker
│   │   ├── MyPickups.jsx           # User's pickup management
│   │   ├── NgoDashboard.jsx        # NGO-specific dashboard
│   │   ├── Opportunities.jsx       # Volunteer opportunities
│   │   ├── OtpPage.jsx             # OTP verification
│   │   ├── Profile.jsx             # User profile page
│   │   ├── Profile.css             # Profile styles
│   │   ├── ProtectedRoute.jsx      # Route authentication
│   │   ├── RegisterPage.jsx        # User registration
│   │   ├── ResetPasswordPage.jsx   # Password reset
│   │   ├── Schedule.jsx            # Pickup scheduling
│   │   ├── Settings.jsx            # User settings
│   │   ├── WelcomePage.jsx         # Landing/welcome page
│   │   ├── index.css               # Base styles
│   │   └── main.jsx                # React entry point
│   └── package.json                # Frontend dependencies
│
├── package.json                    # Root package (concurrently)
├── GOOGLE_SIGNIN_SETUP.md          # Google OAuth setup guide
├── PORT_FORWARDING_GUIDE.md        # Network configuration guide
├── ADMIN_CREDENTIALS.txt           # Default admin credentials
└── start-with-ngrok.ps1            # Ngrok tunnel script
```

---

## Features

### User Authentication

- Email and password registration with validation
- Email verification via OTP (One-Time Password)
- Password reset functionality with email OTP
- Google OAuth 2.0 single sign-on integration
- JWT-based session management with 7-day expiration
- Role-based access control (Volunteer, NGO, Admin)
- Password strength indicator during registration
- Automatic role detection based on email domain (Gmail = Volunteer, Organization = NGO)

### User Roles

#### Volunteer
- Browse and claim available waste pickups
- Track personal environmental impact
- View and apply for volunteer opportunities
- Communicate with NGOs via messaging
- Earn points for completed pickups

#### NGO (Non-Governmental Organization)
- Schedule waste pickups with date, time, and location
- Create volunteer opportunity postings
- Manage organization profile with logo upload
- Track waste collection statistics
- Communicate with volunteers

#### Administrator
- Full dashboard with platform analytics
- User management (view, edit, suspend, delete)
- Audit log viewing for all system actions
- Opportunity approval and moderation
- System-wide statistics and reporting

### Waste Pickup Management

- Schedule pickups with waste type selection (Plastic, Paper, E-waste, Metal)
- Quantity specification with unit options (Kilograms, Bags, Items)
- Date and time slot selection via interactive calendar
- Location selection with interactive Leaflet map
- Address geocoding and display
- Pickup status tracking (Pending, Assigned, In Progress, Completed, Cancelled)
- Reschedule request and approval workflow
- Points calculation based on waste type and quantity

### Volunteer Opportunities

- Create and manage volunteer opportunity postings
- Rich text descriptions with required skills
- Date range and location specification
- Application submission and tracking
- NGO can approve or reject applications
- Volunteer capacity limits per opportunity

### Messaging System

- Real-time messaging between users via Socket.io
- Chat request and approval workflow
- Message history persistence
- Unread message indicators
- User presence detection

### Environmental Impact Tracking

- Automatic impact calculation from completed pickups
- Manual impact entry for external activities
- Visual charts and graphs using Recharts
- Metrics tracked: waste collected, CO2 saved, trees saved, water conserved
- Weekly and monthly trend visualization
- PDF report generation with jsPDF

### AI Assistant (EcoBot)

- Integrated chatbot interface accessible from all pages
- Powered by OpenRouter API with fallback to Gemini
- Context-aware responses about waste management
- Platform feature guidance
- Environmental tips and best practices
- Conversation history within session

### Notifications

- Real-time notification delivery
- Types: pickup updates, message alerts, opportunity updates, system announcements
- Mark as read functionality
- Bell icon with unread count indicator
- Notification panel dropdown

### User Profile Management

- Personal information editing
- Profile picture upload and management
- Google profile picture integration
- NGO-specific fields (organization name, description, logo)
- Volunteer-specific fields (skills, availability, bio)

### Settings

- Theme toggle (Light/Dark mode)
- Notification preferences
- Privacy settings
- Account management

---

## Installation and Setup

### Prerequisites

- Node.js (version 18 or higher)
- npm (version 9 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- Google Cloud Console project (for OAuth)
- OpenRouter API key (for AI assistant)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd wastezero
```

### Step 2: Install Dependencies

Install all dependencies for root, backend, and frontend:

```bash
npm run install-all
```

Or install individually:

```bash
# Root dependencies
npm install

# Backend dependencies
cd Backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 3: Configure Environment Variables

Create or update the `.env` file in the `Backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/wastezero
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development

# Email Configuration (for OTP verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# AI Integration
OPENROUTER_API_KEY=your_openrouter_api_key
GEMINI_API_KEY=your_gemini_api_key  # Optional fallback
```

### Step 4: Configure Frontend Environment

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Environment Configuration

### MongoDB Atlas Setup

1. Create a free cluster at mongodb.com/atlas
2. Create a database user with read/write permissions
3. Whitelist your IP address (or 0.0.0.0/0 for development)
4. Copy the connection string and update `MONGODB_URI`

### Google OAuth Setup

1. Go to console.cloud.google.com
2. Create a new project or select existing
3. Navigate to APIs and Services then Credentials
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized JavaScript origins: `http://localhost:5173`
6. Add authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
7. Copy Client ID and Client Secret to environment variables

### OpenRouter API Setup

1. Visit openrouter.ai and create an account
2. Navigate to Keys section
3. Generate a new API key
4. Add the key to `OPENROUTER_API_KEY` in `.env`

---

## Running the Application

### Development Mode (Concurrent)

Run both backend and frontend simultaneously:

```bash
npm run dev
```

### Individual Servers

Backend only:
```bash
cd Backend
npm run dev
```

Frontend only:
```bash
cd frontend
npm run dev
```

### Access Points

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- API Health Check: http://localhost:5000/api/health

### Production Build

```bash
cd frontend
npm run build
```

The build output will be in `frontend/dist`.

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | User login |
| POST | /api/auth/google | Google OAuth authentication |
| POST | /api/auth/forgot-password | Request password reset OTP |
| POST | /api/auth/verify-otp | Verify OTP code |
| POST | /api/auth/reset-password | Reset password with OTP |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/profile | Get current user profile |
| PUT | /api/profile | Update user profile |
| POST | /api/profile/avatar | Upload profile picture |
| GET | /api/users | List all users (admin) |

### Pickup Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/pickups | List all pickups |
| GET | /api/pickups/my | Get user's pickups |
| GET | /api/pickups/available | Get available pickups |
| POST | /api/pickups | Create new pickup |
| PUT | /api/pickups/:id | Update pickup |
| PUT | /api/pickups/:id/claim | Claim a pickup (volunteer) |
| PUT | /api/pickups/:id/complete | Mark pickup complete |
| PUT | /api/pickups/:id/cancel | Cancel pickup |
| PUT | /api/pickups/:id/reschedule | Request reschedule |
| PUT | /api/pickups/:id/reschedule-respond | Respond to reschedule |

### Opportunity Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/opportunities | List opportunities |
| GET | /api/opportunities/:id | Get opportunity details |
| POST | /api/opportunities | Create opportunity |
| PUT | /api/opportunities/:id | Update opportunity |
| DELETE | /api/opportunities/:id | Delete opportunity |
| POST | /api/opportunities/:id/apply | Apply to opportunity |

### Message Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/messages | Get user's conversations |
| GET | /api/messages/:conversationId | Get conversation messages |
| POST | /api/messages | Send message |
| POST | /api/chat/request | Request new chat |
| PUT | /api/chat/request/:id/accept | Accept chat request |

### Notification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | Get user notifications |
| PATCH | /api/notifications/:id/read | Mark as read |
| DELETE | /api/notifications/:id | Delete notification |

### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/summary | Get dashboard statistics |
| GET | /api/impact | Get impact metrics |
| POST | /api/impact | Add manual impact entry |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/users | List all users |
| GET | /api/admin/users/:id | Get user details |
| PUT | /api/admin/users/:id | Update user |
| DELETE | /api/admin/users/:id | Delete user |
| GET | /api/admin/logs | Get audit logs |
| GET | /api/admin/stats | Get platform statistics |

### AI Assistant Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/assistant/chat | Send message to AI assistant |

---

## Database Models

### User Model

```javascript
{
  email: String (unique, required),
  username: String (unique, required),
  password: String (hashed),
  fullName: String,
  role: String (enum: 'volunteer', 'ngo', 'admin'),
  isVerified: Boolean,
  avatar: String,
  googleId: String,
  googleProfilePic: String,
  ngoDetails: {
    organizationName: String,
    description: String,
    logo: String,
    website: String,
    contactPhone: String
  },
  volunteerDetails: {
    skills: [String],
    availability: String,
    bio: String,
    avatar: String
  },
  points: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Pickup Model

```javascript
{
  user: ObjectId (ref: User),
  wasteTypes: [String],
  quantity: Number,
  unit: String,
  scheduledDate: String,
  timeSlot: String,
  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: String (enum: 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'),
  assignedTo: ObjectId (ref: User),
  points: Number,
  rescheduleRequest: {
    requested: Boolean,
    newDate: String,
    newTime: String,
    reason: String,
    status: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Opportunity Model

```javascript
{
  ngo_id: ObjectId (ref: User),
  title: String,
  description: String,
  skills: [String],
  startDate: Date,
  endDate: Date,
  location: String,
  capacity: Number,
  applicants: [ObjectId],
  acceptedVolunteers: [ObjectId],
  status: String (enum: 'active', 'closed', 'completed'),
  image: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model

```javascript
{
  sender: ObjectId (ref: User),
  recipient: ObjectId (ref: User),
  conversationId: String,
  content: String,
  read: Boolean,
  createdAt: Date
}
```

### Notification Model

```javascript
{
  user: ObjectId (ref: User),
  type: String,
  title: String,
  message: String,
  data: Object,
  isRead: Boolean,
  createdAt: Date
}
```

---

## Frontend Components

### Page Components

| Component | Purpose |
|-----------|---------|
| WelcomePage | Landing page with hero section and branding |
| LoginPage | User authentication with email and Google |
| RegisterPage | New user registration with password strength indicator |
| ForgotPage | Password reset request |
| OtpPage | OTP verification |
| ResetPasswordPage | New password entry |
| Dashboard | Main user dashboard with overview |
| Schedule | Pickup scheduling with calendar and map |
| MyPickups | User's pickup management and history |
| AvailablePickups | Browse and claim available pickups |
| Opportunities | Volunteer opportunity listings |
| Messages | Real-time messaging interface |
| MyImpact | Environmental impact tracking and charts |
| Profile | User profile display and editing |
| Settings | Theme and notification preferences |
| Help | Help and support information |

### Reusable Components

| Component | Purpose |
|-----------|---------|
| Header | Main navigation bar with user menu |
| PageHeader | Consistent page title styling |
| CalendarView | Interactive calendar display |
| HorizontalCalendar | Date picker strip |
| ChatAssistant | AI chatbot floating interface |
| NotificationBell | Notification dropdown |
| ProfileEditModal | Profile editing form |
| OnboardingModal | New user setup wizard |
| ErrorBoundary | Error handling wrapper |
| AdminRoute | Admin access protection |

---

## Authentication System

### JWT Token Flow

1. User submits credentials via login or registration
2. Server validates credentials and creates JWT token
3. Token stored in localStorage on client
4. Token attached to all API requests via Axios interceptor
5. Server validates token on protected routes
6. Token expires after 7 days, requiring re-login

### Google OAuth Flow

1. User clicks "Sign in with Google" button
2. Google Identity Services handles authentication popup
3. Credential token returned to client
4. Token sent to `/api/auth/google` endpoint
5. Server verifies token with Google Auth Library
6. New user created or existing user matched
7. JWT token generated and returned

### Password Security

- Passwords hashed using bcryptjs with salt rounds
- Minimum 6 character requirement enforced
- Password strength indicator shows weak/medium/strong
- Strong password requirements: 8+ characters, uppercase, lowercase, number, special character

---

## Admin Panel

### Access

Admin credentials are stored in `ADMIN_CREDENTIALS.txt`. Default admin account can be created using:

```bash
cd Backend
node create_admin.js
```

### Features

- Dashboard with key platform metrics
- Real-time user count, pickup count, opportunity count
- User management table with search and filters
- User detail modal with edit capabilities
- Audit log viewer showing all administrative actions
- Platform-wide statistics and charts

---

## AI Assistant Integration

### Configuration

The AI assistant uses OpenRouter API by default with Gemini as fallback:

```env
OPENROUTER_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here  # Optional
```

### Supported Models

- OpenRouter: Various models including Claude, GPT, Mistral
- Gemini: Google's Gemini Pro model

### Features

- Floating chat interface accessible from any page
- Context-aware responses about waste management
- Platform navigation assistance
- Environmental education and tips
- Conversation memory within session

---

## Styling and Theming

### CSS Architecture

- TailwindCSS for utility-first styling
- Custom CSS in `App.css` for global overrides
- Component-specific CSS files where needed
- CSS variables for theme colors:
  - `--green`: #123524 (primary brand color)
  - `--green-glow`: rgba(18, 53, 36, 0.15)
  - `--glass-bg`: rgba(255, 255, 255, 0.85)

### Dark Mode

- Toggle available in Settings page
- Preference saved to localStorage
- Applied via `.dark` class on document root
- Automatic color inversions for backgrounds and text
- Green accent colors adjusted for visibility

### Typography

- Primary font: Graphik, Inter
- Clean, professional appearance
- Consistent sizing hierarchy

---

## Troubleshooting

### Common Issues

#### MongoDB Connection Failed
- Verify `MONGODB_URI` is correct
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity

#### Google Sign-In Not Working
- Verify Client ID matches in both frontend and backend
- Check authorized origins include `http://localhost:5173`
- Ensure redirect URI is configured correctly

#### AI Assistant Returns Error
- Verify `OPENROUTER_API_KEY` is set
- Check API key has credits remaining
- Restart backend server after adding key

#### Registration Fails
- Check MongoDB connection
- Verify all required fields are provided
- Check server console for specific error

#### Styles Not Loading
- Clear browser cache (Ctrl+Shift+R)
- Delete `node_modules/.vite` folder
- Restart frontend dev server

### Server Restart Commands

Backend:
```bash
cd Backend
npm run dev
```

Or use the provided batch script:
```bash
Backend\restart_server.bat
```

### Clearing Caches

Vite cache:
```bash
cd frontend
rm -rf node_modules/.vite
```

Browser cache:
- Press Ctrl+Shift+R for hard refresh
- Or clear browsing data via Ctrl+Shift+Delete

---

## License

This project is proprietary software.

---

## Support

For technical support or inquiries, contact the development team.

---

Copyright 2026 WasteZero. All Rights Reserved.
