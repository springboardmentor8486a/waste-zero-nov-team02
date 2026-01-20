# How to Run the Backend Server

## Prerequisites
1. Make sure you have Node.js installed (v14 or higher)
2. Ensure you have a `.env` file in the `Backend` directory with the required environment variables

## Steps to Run

### 1. Navigate to the Backend directory
```bash
cd Backend
```

### 2. Install dependencies (if not already installed)
```bash
npm install
```

### 3. Ensure .env file exists
Make sure you have a `.env` file in the `Backend` directory with at least:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (defaults to 5000 if not set)

### 4. Run the server

**Option A: Production mode (standard)**
```bash
npm start
```
or
```bash
node server.js
```

**Option B: Development mode (with auto-restart)**
```bash
npm run dev
```
or
```bash
nodemon server.js
```

## Server Information
- Default port: **5000**
- API endpoint: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health`

## Troubleshooting

If you get errors:
1. **"MONGODB_URI not defined"** - Check your `.env` file
2. **Port already in use** - Change the PORT in `.env` or kill the process using port 5000
3. **Module not found** - Run `npm install` to install dependencies

