# Port Forwarding Guide - Share Your App with Friends

## Your Application Ports
- **Backend API**: Port 5000 (http://localhost:5000)
- **Frontend**: Port 5173 (http://localhost:5173)

## Why Cursor Port Forwarding Failed
The error shows that Cursor's built-in port forwarding couldn't find `code-tunnel.exe`. This is a Cursor IDE issue, not your application.

## Solutions to Share Your App

### Option 1: Using ngrok (Recommended - Easiest)

**Step 1: Install ngrok**
- Download from: https://ngrok.com/download
- Or install via npm: `npm install -g ngrok`

**Step 2: Start your backend server**
```bash
cd Backend
npm start
```

**Step 3: Forward backend port (Terminal 1)**
```bash
ngrok http 5000
```

**Step 4: Start your frontend**
```bash
cd frontend
npm run dev
```

**Step 5: Forward frontend port (Terminal 2)**
```bash
ngrok http 5173
```

**Step 6: Share the URLs**
- ngrok will give you public URLs like:
  - Backend: `https://abc123.ngrok.io`
  - Frontend: `https://xyz789.ngrok.io`
- Share these URLs with your friend!

**Note**: You'll need to update the frontend API URL to use the ngrok backend URL, or use ngrok's static domain feature.

---

### Option 2: Using localtunnel (Free, No Signup)

**Step 1: Install localtunnel**
```bash
npm install -g localtunnel
```

**Step 2: Forward backend**
```bash
lt --port 5000
```

**Step 3: Forward frontend (new terminal)**
```bash
lt --port 5173
```

**Step 4: Share the URLs** that localtunnel provides

---

### Option 3: Manual Port Forwarding (If on same network)

**Step 1: Find your local IP address**
```powershell
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

**Step 2: Start your servers**
- Backend: `cd Backend && npm start`
- Frontend: `cd frontend && npm run dev`

**Step 3: Share these URLs with your friend (if on same WiFi/network)**
- Backend: `http://YOUR_IP:5000`
- Frontend: `http://YOUR_IP:5173`

**Note**: This only works if you're on the same local network (same WiFi).

---

### Option 4: Using VS Code Port Forwarding (If you have VS Code)

1. Open VS Code
2. Go to Ports tab (Terminal > New Terminal > Ports)
3. Click "Forward a Port"
4. Enter `5000` for backend
5. Enter `5173` for frontend
6. Share the forwarded URLs

---

## Quick Setup Script for ngrok

Create a file `start-with-ngrok.ps1`:

```powershell
# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Backend; npm start"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

# Wait a bit for frontend to start
Start-Sleep -Seconds 3

# Start ngrok for backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 5000"

# Start ngrok for frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 5173"

Write-Host "✅ Servers and ngrok tunnels started!"
Write-Host "📋 Check the ngrok windows for public URLs to share"
```

---

## Important Notes

1. **Free ngrok URLs expire** after 2 hours (or when you close ngrok)
2. **For permanent URLs**, sign up for ngrok (free tier available)
3. **Update frontend API URL** if using ngrok - you may need to modify `frontend/src/utils/api.js` to use the ngrok backend URL
4. **Security**: Only share with trusted friends - these URLs expose your local server

---

## Troubleshooting

**If ngrok doesn't work:**
- Make sure your firewall allows connections
- Check if ports 5000 and 5173 are already in use
- Try different ports if needed

**If localtunnel doesn't work:**
- Make sure you have internet connection
- Try with `--subdomain` flag: `lt --port 5000 --subdomain myapp`

