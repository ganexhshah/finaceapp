# Backend Deployment to Vercel Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub account
- Vercel CLI installed: `npm install -g vercel`

## Step 1: Prepare Backend for Vercel

### 1.1 Create vercel.json in backend folder

Create `backend/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret",
    "EMAIL_HOST": "@email_host",
    "EMAIL_PORT": "@email_port",
    "EMAIL_USER": "@email_user",
    "EMAIL_PASSWORD": "@email_password",
    "CLOUDINARY_CLOUD_NAME": "@cloudinary_cloud_name",
    "CLOUDINARY_API_KEY": "@cloudinary_api_key",
    "CLOUDINARY_API_SECRET": "@cloudinary_api_secret"
  }
}
```

### 1.2 Update package.json

Make sure your `backend/package.json` has:
```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "prisma generate && next build",
    "start": "next start -p 3001",
    "postinstall": "prisma generate"
  }
}
```

## Step 2: Setup Database (PostgreSQL)

### Option A: Vercel Postgres (Recommended)
1. Go to Vercel Dashboard
2. Select your project
3. Go to Storage tab
4. Create Postgres Database
5. Copy the DATABASE_URL

### Option B: Neon (Free PostgreSQL)
1. Go to https://neon.tech
2. Sign up and create a project
3. Copy the connection string
4. Use it as DATABASE_URL

### Option C: Supabase
1. Go to https://supabase.com
2. Create a project
3. Get the connection string from Settings > Database
4. Use it as DATABASE_URL

## Step 3: Deploy to Vercel

### Method 1: Using Vercel CLI (Recommended)

```bash
# Navigate to backend folder
cd backend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? finance-app-backend
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

### Method 2: Using GitHub + Vercel Dashboard

1. **Push to GitHub**:
   ```bash
   # Initialize git in backend folder (if not already)
   cd backend
   git init
   git add .
   git commit -m "Initial backend commit"
   
   # Create repo on GitHub and push
   git remote add origin https://github.com/YOUR_USERNAME/finance-backend.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com/dashboard
   - Click "Add New" > "Project"
   - Import your GitHub repository
   - Select the `backend` folder as root directory
   - Click "Deploy"

## Step 4: Configure Environment Variables

In Vercel Dashboard:
1. Go to your project
2. Settings > Environment Variables
3. Add these variables:

```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Step 5: Run Database Migrations

After deployment, run migrations:

```bash
# Install Vercel CLI if not installed
npm install -g vercel

# Link to your project
cd backend
vercel link

# Run migrations
vercel env pull .env.production
npx prisma migrate deploy
npx prisma generate
```

Or use Vercel's built-in Postgres:
```bash
# If using Vercel Postgres
vercel env pull
npx prisma db push
```

## Step 6: Update Mobile App

Update `myapp/.env`:
```env
# Replace with your Vercel URL
EXPO_PUBLIC_API_URL=https://your-project.vercel.app

# Keep Ollama local
EXPO_PUBLIC_OLLAMA_URL=http://192.168.18.13:11434
```

## Step 7: Test Deployment

```bash
# Test API endpoint
curl https://your-project.vercel.app/api/health

# Or test in browser
https://your-project.vercel.app/api/health
```

## Troubleshooting

### Issue: Prisma not generating
**Solution**: Add postinstall script in package.json:
```json
"postinstall": "prisma generate"
```

### Issue: Database connection fails
**Solution**: 
- Check DATABASE_URL format
- Ensure database allows external connections
- Use connection pooling: Add `?pgbouncer=true` to DATABASE_URL

### Issue: Build fails
**Solution**:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Run `npm install` locally to verify

### Issue: API returns 404
**Solution**:
- Verify vercel.json configuration
- Check that routes are in `app/api/` folder
- Ensure Next.js app router is being used

## Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update EXPO_PUBLIC_API_URL in mobile app

## Monitoring

- View logs: Vercel Dashboard > Your Project > Logs
- Monitor performance: Vercel Dashboard > Analytics
- Set up alerts: Settings > Notifications

## Cost Considerations

**Vercel Free Tier**:
- 100 GB bandwidth/month
- Unlimited deployments
- Serverless function execution time limits

**Upgrade if needed**:
- Pro: $20/month
- More bandwidth and execution time

## Security Checklist

- ✅ Environment variables set
- ✅ JWT_SECRET is strong (32+ characters)
- ✅ Database has SSL enabled
- ✅ CORS configured properly
- ✅ Rate limiting enabled
- ✅ Input validation in place

## Next Steps

After deployment:
1. Test all API endpoints
2. Update mobile app with production URL
3. Build Android APK (see ANDROID_BUILD_GUIDE.md)
4. Test app with production backend
5. Monitor logs for errors
