# Google Sign-In Setup Guide

## Why the Google Sign-In Button Might Not Show

The Google sign-in button requires a **Google Client ID** to be configured. If it's not showing, it's likely because:

1. **Missing Environment Variable**: `VITE_GOOGLE_CLIENT_ID` is not set in your `.env` file
2. **Invalid Client ID**: The Client ID is incorrect or expired
3. **Script Loading Issue**: The Google Identity Services script failed to load

## How to Fix

### Step 1: Create `.env` file in `frontend` directory

Create a file named `.env` in the `frontend` folder with:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

### Step 2: Get Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API** or **Google Identity Services**
4. Go to **APIs & Services** > **Credentials**
5. Click **Create Credentials** > **OAuth client ID**
6. Choose **Web application**
7. Add authorized JavaScript origins:
   - `http://localhost:5173`
   - `http://localhost:5000`
8. Copy the **Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)

### Step 3: Add to `.env` file

```env
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

### Step 4: Restart Frontend Server

After adding the `.env` file, restart your frontend development server:

```powershell
# Stop the current server (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

## Verification

1. Open browser console (F12)
2. Check for messages:
   - ✅ "Google sign-in button rendered" = Working!
   - ⚠️ "Google Client ID not found" = Missing `.env` file
   - ❌ "Failed to load Google Identity Services" = Network/script issue

## Troubleshooting

**Button still not showing?**
- Check browser console for errors
- Verify `.env` file is in `frontend` folder (not root)
- Make sure variable name is exactly `VITE_GOOGLE_CLIENT_ID` (case-sensitive)
- Restart the frontend server after creating `.env`
- Clear browser cache and reload

**Button shows but doesn't work?**
- Verify the Client ID is correct
- Check that authorized origins include `http://localhost:5173`
- Make sure backend `/api/auth/google` route is working

## Current Status

The code now:
- ✅ Shows helpful messages if Client ID is missing
- ✅ Handles script loading errors gracefully
- ✅ Logs detailed information to console for debugging
- ✅ Ensures button container is visible with proper styling

