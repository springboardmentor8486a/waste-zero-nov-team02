# Setup script for Backend .env file
$envContent = @"
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/wastezero?retryWrites=true&w=majority
JWT_SECRET=wastezero_secret_key_2024_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development

# Email Configuration (for OTP) - Optional for now
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google OAuth - Optional for now
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
"@

if (-not (Test-Path ".env")) {
    $envContent | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✅ Created .env file!" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Please update MONGODB_URI with your MongoDB Atlas connection string" -ForegroundColor Yellow
    Write-Host "📖 See MONGODB_ATLAS_SETUP.md for detailed instructions" -ForegroundColor Cyan
} else {
    Write-Host "ℹ️  .env file already exists" -ForegroundColor Blue
}

