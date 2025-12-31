const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const axios = require('axios');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Pickup = require('../models/Pickup');
const Message = require('../models/Message');
const NgoProfile = require('../models/NgoProfile');
const VolunteerProfile = require('../models/VolunteerProfile');

// Helper function to call OpenRouter API
async function callOpenRouter(systemPrompt, message) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'openai/gpt-3.5-turbo', // Using GPT-3.5 for ChatGPT-like experience
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.OPENROUTER_REFERRER || 'https://localhost:5000', // Optional but recommended
        'X-Title': 'WasteWise EcoBot' // Optional but recommended
      },
      timeout: 30000 // 30 second timeout
    }
  );

  return response.data?.choices?.[0]?.message?.content || null;
}

// Helper function to call Gemini API
async function callGemini(systemPrompt, message) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  // Combine system prompt with user message for Gemini
  // Format: System instructions followed by user message
  const fullPrompt = `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      contents: [{
        parts: [{
          text: fullPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    },
    {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    }
  );

  const candidate = response.data?.candidates?.[0];
  if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
    throw new Error(`Gemini generation stopped: ${candidate.finishReason}`);
  }

  return candidate?.content?.parts?.[0]?.text || null;
}

// Function to generate comprehensive website knowledge base
function getWebsiteKnowledgeBase() {
  return {
    websiteName: "WasteWise",
    description: "A waste management platform connecting NGOs and Volunteers for efficient waste collection and recycling initiatives",
    platform: {
      purpose: "Smart waste scheduling and management system",
      tagline: "Build cleaner cities through efficient and eco-friendly management",
      targetUsers: ["NGOs", "Volunteers", "Admin"]
    },
    pages: [
      {
        route: "/",
        name: "Welcome Page",
        type: "public",
        description: "Landing page with platform introduction",
        content: "SMART WASTE SCHEDULING MADE SIMPLE - Build cleaner cities through efficient and eco-friendly management",
        features: ["Platform introduction", "Registration/Login links", "Hero section with waste truck image"]
      },
      {
        route: "/login",
        name: "Login Page",
        type: "public",
        description: "User authentication page",
        content: "Login with email/password or Google account",
        features: ["Email/Password login", "Google OAuth login", "Password recovery link"]
      },
      {
        route: "/register",
        name: "Register Page",
        type: "public",
        description: "New user registration",
        content: "Create account as NGO or Volunteer",
        features: ["Role selection (NGO/Volunteer)", "Email verification", "Profile setup"]
      },
      {
        route: "/dashboard",
        name: "Dashboard Overview",
        type: "protected",
        description: "Main dashboard showing summary statistics",
        content: "Displays user statistics, activity feed, and quick actions",
        features: [
          "Summary statistics (opportunities, applications, messages, waste collected, pickups, hours)",
          "Recent activity feed",
          "Quick navigation to all sections",
          "Role-based dashboard (different for NGOs vs Volunteers)"
        ],
        dataDisplayed: {
          ngo: ["Total opportunities created", "Scheduled pickups", "Unread messages"],
          volunteer: ["Total applications", "Completed pickups", "Waste collected (kg)", "Volunteer hours", "Unread messages"]
        }
      },
      {
        route: "/profile",
        name: "Profile Page",
        type: "protected",
        description: "User profile management",
        content: "View and edit personal/organization information",
        features: [
          "View profile details",
          "Edit profile information",
          "Upload logo/avatar",
          "Update skills, location, bio, mission statement",
          "NGO-specific: Organization name, website, mission",
          "Volunteer-specific: Bio, interests, availability"
        ]
      },
      {
        route: "/schedule",
        name: "Schedule Pickup (NGO)",
        type: "protected",
        role: "ngo",
        description: "NGOs can schedule new waste pickups",
        content: "Create new pickup requests with waste type, amount, date, time, and location",
        features: [
          "Select waste types (plastic, paper, ewaste, metal)",
          "Set amount and unit (kg, bags, items)",
          "Choose date from calendar",
          "Select time slot",
          "Set pickup location with map",
          "Estimate points for volunteers"
        ],
        dataFields: ["wasteTypes", "amount", "unit", "scheduledDate", "timeSlot", "location (address + coordinates)", "points_estimated"]
      },
      {
        route: "/my-pickups",
        name: "My Pickups (NGO)",
        type: "protected",
        role: "ngo",
        description: "View all pickups created by NGO",
        content: "List of all scheduled pickups with status, dates, locations, and assigned volunteers",
        features: [
          "View all created pickups",
          "Filter by status (scheduled, in_progress, completed, cancelled)",
          "See volunteer assignments",
          "View pickup details (waste type, amount, location, date, time)"
        ]
      },
      {
        route: "/available-pickups",
        name: "Available Pickups (Volunteer)",
        type: "protected",
        role: "volunteer",
        description: "Browse and accept available pickup requests",
        content: "View all available pickups that haven't been accepted yet",
        features: [
          "Browse available pickups",
          "Filter by distance (15km default)",
          "Filter by waste type",
          "Filter by urgency",
          "View on map",
          "Accept pickup requests",
          "See location, date, time, waste type, amount, points"
        ],
        dataDisplayed: ["Pickup location (address + coordinates)", "Scheduled date and time", "Waste types", "Amount and unit", "Estimated points", "NGO information"]
      },
      {
        route: "/my-schedule",
        name: "My Schedule (Volunteer)",
        type: "protected",
        role: "volunteer",
        description: "View volunteer's accepted pickups schedule",
        content: "Calendar view of all accepted pickups with dates, times, and locations",
        features: [
          "View all accepted pickups",
          "Calendar timeline view",
          "See upcoming pickups",
          "View pickup details",
          "Track completion status"
        ]
      },
      {
        route: "/opportunities",
        name: "Opportunities",
        type: "protected",
        description: "View and manage volunteer opportunities",
        content: "List of waste management opportunities (for NGOs: create/edit, for Volunteers: browse/apply)",
        features: [
          "NGOs: Create new opportunities, Edit existing, View applications",
          "Volunteers: Browse opportunities, Apply to opportunities, Filter by location/skills",
          "View opportunity details (title, description, location, date, required skills, capacity)"
        ],
        dataFields: ["title", "short description", "full description", "location", "category", "date", "time", "required_skills", "capacity", "registered_count", "status", "cover image", "attachments"]
      },
      {
        route: "/opportunities/new",
        name: "Create Opportunity",
        type: "protected",
        role: "ngo",
        description: "NGOs create new volunteer opportunities",
        content: "Form to create opportunities for volunteers",
        features: ["Title, description, location", "Date and time", "Required skills", "Capacity limit", "Upload cover image", "Attach documents"]
      },
      {
        route: "/messages",
        name: "Messages",
        type: "protected",
        description: "Chat with EcoBot AI assistant",
        content: "AI-powered chatbot for waste management assistance",
        features: [
          "Chat with EcoBot AI assistant",
          "Get personalized answers based on user data",
          "Ask about schedules, opportunities, impact",
          "Get location-based recommendations",
          "AI analyzes user's dashboard, profile, schedules, opportunities"
        ],
        aiCapabilities: [
          "Answer questions about user's schedules",
          "Find opportunities within specific distance",
          "Provide dashboard statistics",
          "Analyze profile and activity data",
          "Give personalized recommendations"
        ]
      },
      {
        route: "/impact",
        name: "My Impact",
        type: "protected",
        description: "View impact statistics and reports",
        content: "Track environmental impact, volunteer hours, waste collected",
        features: [
          "View waste collected statistics",
          "Track volunteer hours",
          "See number of pickups completed",
          "View impact over time",
          "Environmental contribution metrics"
        ]
      },
      {
        route: "/settings",
        name: "Settings",
        type: "protected",
        description: "User preferences and settings",
        content: "Configure AI assistant mode, notifications, and preferences",
        features: [
          "AI mode selection (balanced, concise, creative)",
          "Enable/disable suggestions",
          "Notification preferences",
          "Account settings"
        ]
      },
      {
        route: "/help",
        name: "Help & Support",
        type: "protected",
        description: "Help documentation and support",
        content: "User guide and support information",
        features: ["FAQ", "User guide", "Contact support", "Platform information"]
      }
    ],
    dataModels: {
      User: {
        fields: ["email", "username", "password", "role (volunteer/ngo/admin)", "fullName", "location", "skills", "settings"],
        roles: ["volunteer", "ngo", "admin"]
      },
      Opportunity: {
        description: "Volunteer opportunities posted by NGOs",
        fields: ["title", "short", "description", "location", "category", "date", "time", "required_skills", "capacity", "registered_count", "status (open/closed/in-progress)", "ngo_id", "cover", "attachments"]
      },
      Pickup: {
        description: "Waste pickup requests scheduled by NGOs and accepted by volunteers",
        fields: ["user (NGO)", "volunteer", "wasteTypes (plastic/paper/ewaste/metal)", "amount", "unit (kg/bags/items)", "scheduledDate", "timeSlot", "location (address + coordinates)", "status (scheduled/in_progress/completed/cancelled)", "points_estimated"]
      },
      Application: {
        description: "Volunteer applications to opportunities",
        fields: ["opportunity_id", "volunteer_id", "status (pending/accepted/rejected)"]
      },
      Message: {
        description: "Messages between users or from system",
        fields: ["sender_id", "receiver_id", "content", "timestamp"]
      },
      NgoProfile: {
        description: "Extended profile for NGOs",
        fields: ["organizationName", "website", "missionStatement", "publicEmail", "phoneNumber", "address", "city", "country", "logo"]
      },
      VolunteerProfile: {
        description: "Extended profile for volunteers",
        fields: ["displayName", "bio", "skills", "interests", "phoneNumber", "address", "city", "country", "avatar", "availability"]
      }
    },
    features: {
      wasteTypes: ["plastic", "paper", "ewaste", "metal"],
      units: ["Kilograms (kg)", "Bags (Standard Trash Bags)", "Items (Count)"],
      pickupStatuses: ["scheduled", "in_progress", "completed", "cancelled"],
      opportunityStatuses: ["open", "closed", "in-progress"],
      applicationStatuses: ["pending", "accepted", "rejected"],
      roles: {
        ngo: ["Schedule pickups", "Create opportunities", "Manage volunteers", "Track impact"],
        volunteer: ["Accept pickups", "Apply to opportunities", "Earn points", "Track impact"]
      }
    },
    navigation: {
      ngo: [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Schedule Pickup", path: "/schedule" },
        { name: "My Pickups", path: "/my-pickups" },
        { name: "My Postings", path: "/opportunities" },
        { name: "Messages", path: "/messages" },
        { name: "My Impact", path: "/impact" }
      ],
      volunteer: [
        { name: "Dashboard", path: "/dashboard" },
        { name: "My Schedule", path: "/my-schedule" },
        { name: "Impact Reports", path: "/impact" },
        { name: "Waste Pickups", path: "/available-pickups" },
        { name: "Opportunities", path: "/opportunities" }
      ]
    }
  };
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// Function to gather user context data with comprehensive schedule and opportunity data
async function getUserContext(userId, role) {
  try {
    const context = {
      profile: null,
      dashboard: {
        opportunities: 0,
        applications: 0,
        messages: 0,
        waste_kg: 0,
        pickups: 0,
        hours: 0
      },
      allSchedules: [], // ALL scheduled pickups with full details
      upcomingSchedules: [], // Upcoming schedules sorted by date
      allOpportunities: [], // ALL opportunities for location-based queries
      availableOpportunities: [], // Available opportunities (for volunteers)
      availableWastePickups: [], // AVAILABLE WASTE PICKUPS (from waste pickups page - different from opportunities)
      recentApplications: [],
      completedPickups: []
    };

    // Fetch user profile
    const user = await User.findById(userId).select('-password');
    if (user) {
      context.profile = {
        name: user.fullName || user.username,
        email: user.email,
        role: user.role,
        location: user.location,
        skills: user.skills || []
      };

      // Fetch role-specific profile
      if (role === 'ngo') {
        const ngoProfile = await NgoProfile.findOne({ user: userId });
        if (ngoProfile) {
          context.profile.organizationName = ngoProfile.organizationName;
          context.profile.missionStatement = ngoProfile.missionStatement;
          context.profile.website = ngoProfile.website;
          context.profile.city = ngoProfile.city;
          context.profile.address = ngoProfile.address;
        }
      } else if (role === 'volunteer') {
        const volProfile = await VolunteerProfile.findOne({ user: userId });
        if (volProfile) {
          context.profile.bio = volProfile.bio;
          context.profile.interests = volProfile.interests || [];
          context.profile.availability = volProfile.availability;
          context.profile.city = volProfile.city;
          context.profile.address = volProfile.address;
        }
      }
    }

    // Fetch dashboard summary
    if (role === 'ngo') {
      context.dashboard.opportunities = await Opportunity.countDocuments({ ngo_id: userId });
    } else if (role === 'volunteer') {
      context.dashboard.applications = await Application.countDocuments({ volunteer_id: userId });
      const volunteerPickups = await Pickup.find({ volunteer: userId, status: 'completed' });
      context.dashboard.pickups = volunteerPickups.length;
      context.dashboard.waste_kg = volunteerPickups.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      context.dashboard.hours = context.dashboard.pickups * 2;
    }
    context.dashboard.messages = await Message.countDocuments({ receiver_id: userId });

    // Fetch ALL schedules/pickups (comprehensive schedule data)
    if (role === 'volunteer') {
      // All pickups assigned to this volunteer
      context.allSchedules = await Pickup.find({ volunteer: userId })
        .populate('user', 'username fullName email')
        .sort({ scheduledDate: 1, timeSlot: 1 })
        .select('wasteTypes amount unit scheduledDate timeSlot location status points_estimated createdAt')
        .lean();
      
      // Separate upcoming vs completed vs in_progress
      context.upcomingSchedules = context.allSchedules.filter(p => 
        p.status === 'scheduled' || p.status === 'in_progress'
      );
      context.inProgressSchedules = context.allSchedules.filter(p => p.status === 'in_progress');
      context.completedPickups = context.allSchedules.filter(p => p.status === 'completed');
      
    } else if (role === 'ngo') {
      // All pickups created by this NGO
      context.allSchedules = await Pickup.find({ user: userId })
        .populate('volunteer', 'username fullName email')
        .sort({ scheduledDate: 1, timeSlot: 1 })
        .select('wasteTypes amount unit scheduledDate timeSlot location status volunteer points_estimated createdAt')
        .lean();
      
      // Separate upcoming vs completed vs in_progress
      context.upcomingSchedules = context.allSchedules.filter(p => 
        p.status === 'scheduled' || p.status === 'in_progress'
      );
      context.inProgressSchedules = context.allSchedules.filter(p => p.status === 'in_progress');
      context.completedPickups = context.allSchedules.filter(p => p.status === 'completed');
    }

    // Fetch ALL opportunities with location data (for distance-based queries)
    if (role === 'ngo') {
      // All opportunities created by this NGO
      context.allOpportunities = await Opportunity.find({ ngo_id: userId })
        .populate('ngo_id', 'username location')
        .sort({ createdAt: -1 })
        .select('title short description status location category date time registered_count capacity required_skills createdAt')
        .lean();
    } else if (role === 'volunteer') {
      // All available opportunities (for location-based filtering)
      context.allOpportunities = await Opportunity.find({ status: 'open' })
        .populate('ngo_id', 'username location')
        .sort({ createdAt: -1 })
        .select('title short description status location category date time registered_count capacity required_skills createdAt')
        .lean();
      
      // Applications by this volunteer
      context.recentApplications = await Application.find({ volunteer_id: userId })
        .populate('opportunity_id', 'title status location category date registered_count capacity')
        .sort({ createdAt: -1 })
        .lean();
      
      // Fetch AVAILABLE WASTE PICKUPS (different from opportunities - these are actual waste collection tasks)
      // These are pickups with status 'scheduled' that haven't been accepted yet
      context.availableWastePickups = await Pickup.find({
        status: 'scheduled',
        $or: [
          { volunteer: { $exists: false } },
          { volunteer: null }
        ]
      })
        .populate('user', 'username fullName email location')
        .sort({ createdAt: -1 })
        .select('wasteTypes amount unit scheduledDate timeSlot location status points_estimated createdAt user')
        .lean();
    }

    // Get user's location coordinates (if available from profile or recent pickups)
    let userCoordinates = null;
    if (context.profile?.address || context.profile?.city) {
      // Try to get coordinates from first pickup location if available
      if (context.allSchedules?.length > 0 && context.allSchedules[0].location?.coordinates) {
        userCoordinates = context.allSchedules[0].location.coordinates;
      }
    }

    // Calculate distances for opportunities (if user has location data)
    if (role === 'volunteer' && userCoordinates && context.allOpportunities?.length > 0) {
      context.allOpportunities = context.allOpportunities.map(opp => {
        // Note: Opportunities store location as string, not coordinates
        // For now, we'll include the location string for the AI to analyze
        return opp;
      });
    }

    return context;
  } catch (error) {
    console.error('Error gathering user context:', error);
    return null;
  }
}

// Format website knowledge base into readable string
function formatWebsiteKnowledgeBase() {
  const websiteKB = getWebsiteKnowledgeBase();
  let kbStr = '\n\n=== WEBSITE KNOWLEDGE BASE (Complete Website Information) ===\n\n';
  kbStr += `Website Name: ${websiteKB.websiteName}\n`;
  kbStr += `Description: ${websiteKB.description}\n`;
  kbStr += `Purpose: ${websiteKB.platform.purpose}\n`;
  kbStr += `Tagline: ${websiteKB.platform.tagline}\n\n`;
  
  kbStr += `ALL WEBSITE PAGES AND THEIR CONTENT:\n\n`;
  websiteKB.pages.forEach(page => {
    kbStr += `PAGE: ${page.name}\n`;
    kbStr += `Route: ${page.route}\n`;
    kbStr += `Type: ${page.type}${page.role ? ` (${page.role} only)` : ''}\n`;
    kbStr += `Description: ${page.description}\n`;
    kbStr += `Content: ${page.content}\n`;
    if (page.features && page.features.length > 0) {
      kbStr += `Features: ${page.features.join(', ')}\n`;
    }
    if (page.dataDisplayed) {
      kbStr += `Data Displayed: ${JSON.stringify(page.dataDisplayed, null, 2)}\n`;
    }
    if (page.dataFields && page.dataFields.length > 0) {
      kbStr += `Data Fields: ${page.dataFields.join(', ')}\n`;
    }
    if (page.aiCapabilities && page.aiCapabilities.length > 0) {
      kbStr += `AI Capabilities: ${page.aiCapabilities.join(', ')}\n`;
    }
    kbStr += '\n';
  });
  
  kbStr += `DATA MODELS (What data the website stores and uses):\n\n`;
  Object.keys(websiteKB.dataModels).forEach(modelName => {
    const model = websiteKB.dataModels[modelName];
    kbStr += `${modelName}:\n`;
    if (model.description) kbStr += `  Description: ${model.description}\n`;
    if (model.fields) kbStr += `  Fields: ${model.fields.join(', ')}\n`;
    if (model.roles) kbStr += `  Roles: ${model.roles.join(', ')}\n`;
    kbStr += '\n';
  });
  
  kbStr += `AVAILABLE FEATURES:\n`;
  kbStr += `- Waste Types: ${websiteKB.features.wasteTypes.join(', ')}\n`;
  kbStr += `- Units: ${websiteKB.features.units.join(', ')}\n`;
  kbStr += `- Pickup Statuses: ${websiteKB.features.pickupStatuses.join(', ')}\n`;
  kbStr += `- Opportunity Statuses: ${websiteKB.features.opportunityStatuses.join(', ')}\n`;
  kbStr += `- Application Statuses: ${websiteKB.features.applicationStatuses.join(', ')}\n\n`;
  
  kbStr += `NAVIGATION STRUCTURE:\n`;
  kbStr += `NGO Navigation: ${websiteKB.navigation.ngo.map(n => n.name).join(' → ')}\n`;
  kbStr += `Volunteer Navigation: ${websiteKB.navigation.volunteer.map(n => n.name).join(' → ')}\n\n`;
  
  kbStr += '=== END WEBSITE KNOWLEDGE BASE ===\n';
  kbStr += '\nIMPORTANT: This knowledge base contains ALL pages, routes, features, and data structures in the website. Use this to understand what each page does and what information is available on each page.\n\n';
  
  return kbStr;
}

// Format context into readable string for AI
function formatContext(context, role) {
  if (!context) return '';

  let contextStr = '\n\n=== USER CONTEXT DATA ===\n\n';
  
  // Profile information
  if (context.profile) {
    contextStr += `=== USER PROFILE INFORMATION ===\n`;
    contextStr += `IMPORTANT: The user's name is: ${context.profile.name || 'Not set'}\n`;
    contextStr += `When asked "what is my name" or "who am I", answer: "${context.profile.name || 'Not set'}"\n\n`;
    contextStr += `User Profile Details:\n`;
    contextStr += `- Name: ${context.profile.name || 'Not set'}\n`;
    contextStr += `- Email: ${context.profile.email}\n`;
    contextStr += `- Role: ${context.profile.role}\n`;
    if (context.profile.location) contextStr += `- Location: ${context.profile.location}\n`;
    if (context.profile.city) contextStr += `- City: ${context.profile.city}\n`;
    if (context.profile.address) contextStr += `- Address: ${context.profile.address}\n`;
    if (context.profile.skills?.length) contextStr += `- Skills: ${context.profile.skills.join(', ')}\n`;
    
    if (role === 'ngo') {
      if (context.profile.organizationName) contextStr += `- Organization: ${context.profile.organizationName}\n`;
      if (context.profile.missionStatement) contextStr += `- Mission: ${context.profile.missionStatement}\n`;
      if (context.profile.website) contextStr += `- Website: ${context.profile.website}\n`;
    } else if (role === 'volunteer') {
      if (context.profile.bio) contextStr += `- Bio: ${context.profile.bio}\n`;
      if (context.profile.interests?.length) contextStr += `- Interests: ${context.profile.interests.join(', ')}\n`;
      if (context.profile.availability) contextStr += `- Availability: ${context.profile.availability}\n`;
    }
    contextStr += '\n';
  }

  // Dashboard summary - IMPORTANT: These are REAL values from user's account
  const wasteKg = context.dashboard.waste_kg || 0;
  const completedPickups = context.dashboard.pickups || 0;
  const volunteerHours = context.dashboard.hours || 0;
  
  contextStr += `=== DASHBOARD STATISTICS (REAL VALUES - USE THESE EXACT NUMBERS) ===\n`;
  if (role === 'ngo') {
    contextStr += `- Total Opportunities Created: ${context.dashboard.opportunities || 0}\n`;
  } else if (role === 'volunteer') {
    contextStr += `- Total Applications: ${context.dashboard.applications || 0}\n`;
    contextStr += `- Completed Pickups: ${completedPickups}\n`;
    contextStr += `- Total Waste Collected: ${wasteKg} kg\n`;
    contextStr += `- Volunteer Hours: ${volunteerHours} hours\n`;
  }
  contextStr += `- Unread Messages: ${context.dashboard.messages || 0}\n\n`;
  contextStr += `🚨 CRITICAL INSTRUCTION FOR DASHBOARD STATS:\n`;
  contextStr += `When user asks ANY of these questions, use the EXACT values above:\n`;
  contextStr += `- "how much waste have I collected" → Answer: "${wasteKg} kg"\n`;
  contextStr += `- "how many pickups have I completed" → Answer: "${completedPickups} pickups"\n`;
  contextStr += `- "how many hours have I volunteered" → Answer: "${volunteerHours} hours"\n`;
  contextStr += `DO NOT say "0" or "000" if the values above show ${wasteKg}, ${completedPickups}, or ${volunteerHours}.\n`;
  contextStr += `The user's dashboard shows: ${wasteKg} kg waste, ${completedPickups} pickups, ${volunteerHours} hours.\n\n`;

  // IN-PROGRESS SCHEDULES (Currently active pickups - VERY IMPORTANT)
  if (context.inProgressSchedules?.length > 0) {
    contextStr += `🚨 CURRENTLY IN-PROGRESS SCHEDULES (Active Now):\n`;
    contextStr += `These are the schedules that are currently in progress and need attention.\n\n`;
    context.inProgressSchedules.forEach((pickup, idx) => {
      contextStr += `IN-PROGRESS SCHEDULE #${idx + 1}:\n`;
      if (pickup.wasteTypes?.length) contextStr += `  - Waste Types to Collect: ${pickup.wasteTypes.join(', ')}\n`;
      contextStr += `  - Amount: ${pickup.amount} ${pickup.unit || 'kg'}\n`;
      contextStr += `  - Scheduled Date: ${pickup.scheduledDate || 'Not scheduled'}\n`;
      contextStr += `  - Time Slot: ${pickup.timeSlot || 'Not set'}\n`;
      if (pickup.location?.address) {
        contextStr += `  - Location/Address to Go: ${pickup.location.address}\n`;
        if (pickup.location.coordinates) {
          contextStr += `  - Coordinates: ${pickup.location.coordinates.lat}, ${pickup.location.coordinates.lng}\n`;
        }
      }
      
      // For volunteers: Show who to collect from (NGO/User info)
      if (role === 'volunteer' && pickup.user && typeof pickup.user === 'object') {
        contextStr += `  - Person/Organization to Collect From: ${pickup.user.fullName || pickup.user.username}\n`;
        contextStr += `  - Contact Email: ${pickup.user.email || 'Not available'}\n`;
      }
      
      // For NGOs: Show who is collecting (volunteer info)
      if (role === 'ngo' && pickup.volunteer && typeof pickup.volunteer === 'object') {
        contextStr += `  - Volunteer Collecting: ${pickup.volunteer.fullName || pickup.volunteer.username}\n`;
        contextStr += `  - Volunteer Email: ${pickup.volunteer.email || 'Not available'}\n`;
      }
      
      if (pickup.points_estimated) contextStr += `  - Points: ${pickup.points_estimated}\n`;
      contextStr += `  - Status: ${pickup.status}\n\n`;
    });
    contextStr += '\n';
  } else {
    contextStr += `CURRENTLY IN-PROGRESS SCHEDULES: None\n\n`;
  }

  // COMPREHENSIVE SCHEDULE DATA (All scheduled pickups - this is the schedule page data)
  if (context.upcomingSchedules?.length > 0) {
    contextStr += `MY UPCOMING SCHEDULES (Sorted by Date & Time - includes scheduled and in-progress):\n`;
    context.upcomingSchedules.forEach((pickup, idx) => {
      contextStr += `${idx + 1}. `;
      if (pickup.wasteTypes?.length) contextStr += `Waste Types: ${pickup.wasteTypes.join(', ')} | `;
      contextStr += `Amount: ${pickup.amount} ${pickup.unit || 'kg'} | `;
      contextStr += `Date: ${pickup.scheduledDate || 'Not scheduled'} | `;
      contextStr += `Time: ${pickup.timeSlot || 'Not set'} | `;
      if (pickup.location?.address) contextStr += `Location: ${pickup.location.address} | `;
      contextStr += `Status: ${pickup.status}`;
      if (pickup.points_estimated) contextStr += ` | Points: ${pickup.points_estimated}`;
      if (pickup.volunteer && typeof pickup.volunteer === 'object') {
        contextStr += ` | Volunteer: ${pickup.volunteer.fullName || pickup.volunteer.username}`;
      }
      if (pickup.user && typeof pickup.user === 'object') {
        contextStr += ` | Person/Organization: ${pickup.user.fullName || pickup.user.username}`;
      }
      contextStr += '\n';
    });
    contextStr += '\n';
  } else {
    contextStr += `MY UPCOMING SCHEDULES: No upcoming schedules found.\n\n`;
  }

  // All schedules (including past ones for reference)
  if (context.allSchedules?.length > 0) {
    contextStr += `ALL MY SCHEDULES (Total: ${context.allSchedules.length}):\n`;
    context.allSchedules.forEach((pickup, idx) => {
      contextStr += `${idx + 1}. `;
      if (pickup.wasteTypes?.length) contextStr += `${pickup.wasteTypes.join(', ')} - `;
      contextStr += `${pickup.amount} ${pickup.unit || 'kg'} | `;
      contextStr += `${pickup.scheduledDate || 'N/A'} at ${pickup.timeSlot || 'N/A'} | `;
      if (pickup.location?.address) contextStr += `${pickup.location.address} | `;
      contextStr += `Status: ${pickup.status}\n`;
    });
    contextStr += '\n';
  }

  // Completed pickups
  if (context.completedPickups?.length > 0) {
    contextStr += `COMPLETED PICKUPS (${context.completedPickups.length} total):\n`;
    context.completedPickups.slice(0, 10).forEach((pickup, idx) => {
      contextStr += `${idx + 1}. ${pickup.wasteTypes?.join(', ') || 'N/A'} - ${pickup.amount} ${pickup.unit || 'kg'} - Completed on ${pickup.scheduledDate || 'N/A'}\n`;
    });
    contextStr += '\n';
  }

  // AVAILABLE WASTE PICKUPS (This is different from Opportunities - these are actual waste collection tasks)
  // THIS IS THE WASTE PICKUPS PAGE DATA - USE THIS WHEN USER ASKS ABOUT WASTE PICKUP OPPORTUNITIES
  if (role === 'volunteer' && context.availableWastePickups?.length > 0) {
    contextStr += `=== 🗑️ AVAILABLE WASTE PICKUPS (Waste Pickups Page - NOT Opportunities Page) ===\n`;
    contextStr += `🚨 IMPORTANT: These are ACTUAL WASTE COLLECTION TASKS from the Waste Pickups page.\n`;
    contextStr += `These are DIFFERENT from Opportunities (beach cleanup, park cleanup).\n`;
    contextStr += `These are waste pickups that need to be collected.\n`;
    contextStr += `Total Available Waste Pickups: ${context.availableWastePickups.length}\n\n`;
    context.availableWastePickups.forEach((pickup, idx) => {
      contextStr += `WASTE PICKUP #${idx + 1}:\n`;
      if (pickup.wasteTypes?.length) {
        contextStr += `  - Waste Types: ${pickup.wasteTypes.join(', ')}\n`;
        // Check if plastic is in waste types
        if (pickup.wasteTypes.includes('plastic')) {
          contextStr += `  - 🟢 CONTAINS PLASTIC\n`;
        }
      }
      contextStr += `  - Amount: ${pickup.amount} ${pickup.unit || 'kg'}\n`;
      contextStr += `  - Scheduled Date: ${pickup.scheduledDate || 'Not scheduled'}\n`;
      contextStr += `  - Time Slot: ${pickup.timeSlot || 'Not set'}\n`;
      if (pickup.location?.address) {
        contextStr += `  - Location/Address: ${pickup.location.address}\n`;
        if (pickup.location.coordinates) {
          contextStr += `  - Coordinates: ${pickup.location.coordinates.lat}, ${pickup.location.coordinates.lng}\n`;
        }
      }
      if (pickup.user && typeof pickup.user === 'object') {
        contextStr += `  - Organization/NGO: ${pickup.user.fullName || pickup.user.username}\n`;
        contextStr += `  - Contact Email: ${pickup.user.email || 'Not available'}\n`;
      }
      if (pickup.points_estimated) contextStr += `  - Points: ${pickup.points_estimated}\n`;
      contextStr += `  - Status: ${pickup.status}\n`;
      // Priority indicator: older pickups or larger amounts could be higher priority
      const daysSinceCreation = pickup.createdAt ? Math.floor((Date.now() - new Date(pickup.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      if (daysSinceCreation > 2) contextStr += `  - Priority: 🔴 HIGH (Created ${daysSinceCreation} days ago - URGENT)\n`;
      else if (daysSinceCreation > 0) contextStr += `  - Priority: 🟡 MEDIUM (Created ${daysSinceCreation} days ago)\n`;
      else contextStr += `  - Priority: 🟢 NORMAL\n`;
      contextStr += '\n';
    });
    contextStr += `\n🚨 REMEMBER: When user asks about "waste pickup opportunities" or "high priority waste pickups", use the data above from AVAILABLE WASTE PICKUPS section, NOT the Opportunities section below.\n\n`;
  } else if (role === 'volunteer') {
    contextStr += `=== AVAILABLE WASTE PICKUPS: None available at the moment.\n\n`;
  }

  // ALL OPPORTUNITIES (for location-based queries and analysis)
  // NOTE: OPPORTUNITIES are different from WASTE PICKUPS
  // Opportunities = Volunteer events/projects (like beach cleanup, tree planting)
  // Waste Pickups = Actual waste collection tasks (pickup scheduled waste)
  if (context.allOpportunities?.length > 0) {
    contextStr += `=== ALL AVAILABLE OPPORTUNITIES (Opportunities Page - Different from Waste Pickups) ===\n`;
    contextStr += `These are volunteer opportunities/events (like beach cleanup, tree planting projects), NOT waste pickups.\n`;
    contextStr += `Total: ${context.allOpportunities.length}\n\n`;
    contextStr += `ALL AVAILABLE OPPORTUNITIES (Total: ${context.allOpportunities.length}):\n`;
    context.allOpportunities.forEach((opp, idx) => {
      contextStr += `${idx + 1}. ${opp.title || 'Untitled'}`;
      if (opp.short) contextStr += ` - ${opp.short}`;
      contextStr += `\n   Status: ${opp.status} | Location: ${opp.location || 'Not specified'}`;
      if (opp.category) contextStr += ` | Category: ${opp.category}`;
      if (opp.date) contextStr += ` | Date: ${opp.date}`;
      if (opp.time) contextStr += ` | Time: ${opp.time}`;
      if (opp.registered_count !== undefined && opp.capacity) {
        contextStr += ` | Volunteers: ${opp.registered_count}/${opp.capacity}`;
      }
      if (opp.required_skills?.length) {
        contextStr += ` | Required Skills: ${opp.required_skills.join(', ')}`;
      }
      contextStr += '\n';
    });
    contextStr += '\n';
  }

  // Applications (for volunteers)
  if (role === 'volunteer' && context.recentApplications?.length > 0) {
    contextStr += `MY APPLICATIONS (${context.recentApplications.length} total):\n`;
    context.recentApplications.forEach((app, idx) => {
      const opp = app.opportunity_id;
      if (opp) {
        contextStr += `${idx + 1}. ${opp.title} - Application Status: ${app.status} - Opportunity Status: ${opp.status}`;
        if (opp.location) contextStr += ` - Location: ${opp.location}`;
        contextStr += '\n';
      }
    });
    contextStr += '\n';
  }

  contextStr += '=== END USER CONTEXT ===\n';
  contextStr += '\n';
  contextStr += 'MANDATORY INSTRUCTIONS FOR USING THIS DATA:\n';
  contextStr += '1. The user\'s NAME is provided above in "User Profile" section - USE IT when asked about their name. Example: If User Profile shows "Name: John Doe", answer "Your name is John Doe".\n';
  contextStr += '2. When asked "what is my name" or "who am I", answer with their ACTUAL NAME from the User Profile section above.\n';
  contextStr += `3. 🚨 DASHBOARD STATISTICS - MANDATORY:\n`;
  contextStr += `   The dashboard shows these EXACT values:\n`;
  contextStr += `   - Total Waste Collected: ${context.dashboard.waste_kg || 0} kg\n`;
  contextStr += `   - Completed Pickups: ${context.dashboard.pickups || 0}\n`;
  contextStr += `   - Volunteer Hours: ${context.dashboard.hours || 0} hours\n`;
  contextStr += `   When user asks ANY of these questions, use the EXACT values above:\n`;
  contextStr += `   - "how much waste have I collected" → Answer: "${context.dashboard.waste_kg || 0} kg"\n`;
  contextStr += `   - "how many pickups have I completed" → Answer: "${context.dashboard.pickups || 0} pickups"\n`;
  contextStr += `   - "how many hours have I volunteered" → Answer: "${context.dashboard.hours || 0} hours"\n`;
  contextStr += `   NEVER say "0 kg", "000 kg", "0 pickups" if the values above show ${context.dashboard.waste_kg || 0} kg, ${context.dashboard.pickups || 0} pickups, or ${context.dashboard.hours || 0} hours.\n`;
  contextStr += '4. When asked "what is the schedule that is in progress" or "what schedules are in progress", look at the "CURRENTLY IN-PROGRESS SCHEDULES" section above and provide ALL details:\n';
  contextStr += '   - Tell them the waste types they need to collect\n';
  contextStr += '   - Tell them the location/address where they need to go\n';
  contextStr += '   - Tell them who to collect from (Person/Organization name and contact info)\n';
  contextStr += '   - Tell them the date and time\n';
  contextStr += '   - Tell them the amount and points\n';
  contextStr += '   Example: "You have 1 schedule in progress: Collect plastic and paper (15 kg) from GreenTech NGO at 123 Main Street on Oct 3 at 2:00 PM. Contact: contact@greentech.org"\n';
  contextStr += '5. When asked about "my schedules" or "what are my schedules", analyze the "MY UPCOMING SCHEDULES" section above and list ALL scheduled pickups with dates, times, locations, and details.\n';
  contextStr += '6. CRITICAL: "WASTE PICKUPS" and "OPPORTUNITIES" are DIFFERENT things:\n';
  contextStr += '   - WASTE PICKUPS = Actual waste collection tasks (from "Available Waste Pickups" page). These are pickups where waste needs to be collected from a location. They have wasteTypes like "plastic", "paper", "ewaste", "metal".\n';
  contextStr += '   - OPPORTUNITIES = Volunteer events/projects (like beach cleanup, tree planting). These are activities, not waste pickups.\n';
  contextStr += `7. 🚨 WHEN USER ASKS "high priority waste pickup opportunities" OR "high-priority opportunities in the plastic sector" OR "show me high-priority opportunities in plastic" OR "waste pickup opportunities":\n`;
  contextStr += `   - You MUST look at the "🗑️ AVAILABLE WASTE PICKUPS" section above\n`;
  contextStr += `   - DO NOT look at the "ALL AVAILABLE OPPORTUNITIES" section\n`;
  contextStr += `   - If user mentions "plastic", filter waste pickups that have "plastic" in their wasteTypes array\n`;
  contextStr += `   - Sort by priority: HIGH (🔴) first, then MEDIUM (🟡), then NORMAL (🟢)\n`;
  contextStr += `   - Include ALL details: waste types, location/address, amount, scheduled date, time slot, organization/NGO name, and priority level\n`;
  contextStr += `   - Example response: "Here are high-priority waste pickups: 1. Plastic, Paper - 20 kg at 123 Main St on Oct 5 at 2:00 PM - Priority: HIGH - Organization: GreenTech NGO (contact@greentech.org)"\n`;
  contextStr += `   - NEVER mention beach cleanup, park cleanup, or other Opportunities - those are different!\n`;
  contextStr += '8. When asked "which is higher priority waste pickup" or "what high priority waste pickups are available" (without mentioning a specific waste type), look at the "AVAILABLE WASTE PICKUPS" section above, NOT the Opportunities section. Prioritize by:\n';
  contextStr += '   - Pickups marked as HIGH priority (older than 2 days)\n';
  contextStr += '   - Larger amounts of waste\n';
  contextStr += '   - Location proximity\n';
  contextStr += '   Include waste types, location, amount, date, time, and organization name.\n';
  contextStr += '9. When asked about opportunities "within X kilometers" or "nearby" (without mentioning waste pickups or specific waste types), analyze the "ALL AVAILABLE OPPORTUNITIES" section and filter by location. Compare location strings or use city/address matching.\n';
  contextStr += '10. Always reference the ACTUAL DATA from the user\'s account shown above. Do NOT make up or assume data that is not present.\n';
  contextStr += '11. Be specific with dates, times, locations, and numbers from the actual data. Use EXACT values from dashboard statistics.\n';
  contextStr += '12. If asked about the schedule page, dashboard, or any page data, use the corresponding section from above.\n';
  contextStr += '13. NEVER say "I don\'t have access" or "I can\'t see your information" - you have FULL ACCESS to all the data shown above.\n';
  contextStr += '14. ALWAYS personalize responses with their actual account information: use their real name, real numbers, real dates, real locations.\n';
  contextStr += '15. When user asks about their profile, dashboard, impact, or any account information, use the EXACT data from the sections above.\n';
  contextStr += '16. For in-progress schedules, always mention: where to go (location), what to collect (waste types and amount), who to collect from (organization/person name), and when (date/time).\n';

  return contextStr;
}

// Main function to try APIs in order with fallback
async function getAIResponse(systemPrompt, message, contextData) {
  const errors = [];

  // Try OpenRouter first (default)
  try {
    const reply = await callOpenRouter(systemPrompt, message);
    if (reply) {
      console.log('✅ Successfully used OpenRouter API');
      return { reply, provider: 'OpenRouter' };
    }
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message || 'Unknown error';
    errors.push(`OpenRouter: ${errorMsg}`);
    console.warn('⚠️ OpenRouter API failed:', errorMsg);
  }

  // Fallback to Gemini
  try {
    const reply = await callGemini(systemPrompt, message);
    if (reply) {
      console.log('✅ Successfully used Gemini API (fallback)');
      return { reply, provider: 'Gemini' };
    }
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message || 'Unknown error';
    errors.push(`Gemini: ${errorMsg}`);
    console.warn('⚠️ Gemini API failed:', errorMsg);
  }

  // All APIs failed
  throw new Error(`All AI providers failed. ${errors.join('; ')}`);
}

// POST /api/assistant { message }
router.post('/', protect, async (req, res) => {
  try {
    const user = req.user;
    const userId = user.id || user._id;
    const message = (req.body && req.body.message) ? String(req.body.message) : '';
    const settings = user.settings || {};
    // Allow user settings or fallback to 'balanced'
    const mode = settings.aiMode || req.body?.settings?.aiMode || 'balanced';

    // Gather user context data (profile, dashboard, opportunities, pickups, etc.)
    const contextData = await getUserContext(userId, user.role);
    
    // Debug: Log dashboard values to verify they're being fetched
    if (contextData && contextData.dashboard) {
      console.log('📊 Dashboard Stats Fetched:', {
        waste_kg: contextData.dashboard.waste_kg,
        pickups: contextData.dashboard.pickups,
        hours: contextData.dashboard.hours,
        applications: contextData.dashboard.applications
      });
      console.log('🗑️ Available Waste Pickups:', contextData.availableWastePickups?.length || 0);
    }

    // Construct System Prompt based on role/mode
    let systemPrompt = "You are EcoBot, a helpful AI assistant for the WasteWise platform. You help volunteers and NGOs manage waste, schedule pickups, and find opportunities. Keep answers concise and helpful.\n\n";
    
    // FIRST: Add complete website knowledge base so AI understands all pages and features
    systemPrompt += formatWebsiteKnowledgeBase();
    
    systemPrompt += "\nYou have FULL ACCESS to:\n";
    systemPrompt += "1. COMPLETE WEBSITE KNOWLEDGE BASE (above) - All pages, routes, features, and data structures\n";
    systemPrompt += "2. User's actual account data including:\n";
    systemPrompt += "   - Their NAME, EMAIL, PROFILE INFORMATION (provided in USER CONTEXT DATA below)\n";
    systemPrompt += "   - Their complete schedule page (all scheduled pickups with dates, times, locations)\n";
    systemPrompt += "   - All available opportunities with location data\n";
    systemPrompt += "   - Dashboard statistics and profile information\n";
    systemPrompt += "   - All their applications and activities\n\n";
    
    systemPrompt += "CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE:\n";
    systemPrompt += "1. ALWAYS USE THE ACTUAL USER DATA PROVIDED BELOW. The user's name, email, profile, schedules, opportunities, and all data are provided in the 'USER CONTEXT DATA' section.\n";
    systemPrompt += "2. When user asks 'what is my name' or 'who am I', answer with their ACTUAL NAME from the User Profile section below.\n";
    systemPrompt += "3. When user asks about their schedules, use the EXACT data from 'MY UPCOMING SCHEDULES' section below.\n";
    systemPrompt += "4. When user asks about opportunities, use the EXACT data from 'ALL AVAILABLE OPPORTUNITIES' section below.\n";
    systemPrompt += "5. When user asks about ANY PAGE (e.g., 'what's on the schedule page?'), first explain what that page shows (from WEBSITE KNOWLEDGE BASE), then show their ACTUAL DATA from that page.\n";
    systemPrompt += "6. When user asks 'what opportunities are within X kilometers', filter the opportunities list by location matching their city/address.\n";
    systemPrompt += "7. NEVER say you don't have access to user information - you DO have access to all their data provided below.\n";
    systemPrompt += "8. ALWAYS provide specific, personalized answers using the actual numbers, dates, names, and data from their account.\n";
    systemPrompt += "9. Reference specific data points: 'You have 3 upcoming pickups', 'Your name is [actual name]', 'You've collected 125 kg of waste', etc.\n\n";

    if (user.role === 'ngo') {
      systemPrompt += "The user is an NGO representative. You can:\n";
      systemPrompt += "- Explain what any page does (using website knowledge base)\n";
      systemPrompt += "- Analyze their schedule page to show all scheduled pickups\n";
      systemPrompt += "- View their created opportunities\n";
      systemPrompt += "- Help manage volunteers and track impact\n";
      systemPrompt += "- Always reference actual schedule data when answering schedule-related questions\n";
    } else {
      systemPrompt += "The user is a Volunteer. You can:\n";
      systemPrompt += "- Explain what any page does (using website knowledge base)\n";
      systemPrompt += "- Analyze their schedule page to show upcoming pickups they've accepted\n";
      systemPrompt += "- Find available opportunities nearby (within X kilometers based on location matching)\n";
      systemPrompt += "- View their applications and track their impact\n";
      systemPrompt += "- Always reference actual schedule and opportunity data when answering questions\n";
    }

    if (mode === 'concise') systemPrompt += "\nBe extremely brief.";
    if (mode === 'creative') systemPrompt += "\nBe creative and inspiring.";

    // Add formatted context data to system prompt
    if (contextData) {
      const contextStr = formatContext(contextData, user.role);
      systemPrompt += contextStr;
      
      // Debug: Log user name to verify it's being fetched
      if (contextData.profile?.name) {
        console.log('✅ User name fetched:', contextData.profile.name);
      } else {
        console.warn('⚠️ User name not found in context data');
      }
    } else {
      console.error('❌ No context data available');
    }

    // Check if any API key is configured
    if (!process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY) {
      return res.json({ 
        success: true, 
        reply: "I'm sorry, I haven't been configured with an API key yet. Please contact the admin to configure OpenRouter or Gemini API keys." 
      });
    }

    // Get AI response with fallback mechanism (pass context for logging if needed)
    const { reply, provider } = await getAIResponse(systemPrompt, message, contextData);
    const suggestions = (settings.suggestionsEnabled ?? true) ? ['How do I earn points?', 'Schedule a pickup', 'Find nearby events'] : [];

    return res.json({ success: true, reply, suggestions, provider });

  } catch (e) {
    // CAPTURE API ERROR DETAILS
    const apiError = e.message || "Unknown error";
    console.error("AI Error:", apiError);

    // Return a user-friendly error message
    return res.json({
      success: true,
      reply: `I'm having trouble connecting to my AI services right now. Please try again in a moment. (Error: ${apiError})`
    });
  }
});

module.exports = router;
