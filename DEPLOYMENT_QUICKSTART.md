# Quick Deployment Guide

## 🚀 Deploy Backend to Vercel (5 minutes)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Navigate to backend
cd backend

# 3. Login to Vercel
vercel login

# 4. Deploy
vercel

# 5. Deploy to production
vercel --prod

# 6. Note your deployment URL (e.g., https://your-app.vercel.app)
```

### Set Environment Variables in Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings > Environment Variables
4. Add these (minimum required):
   ```
   DATABASE_URL=your-postgres-connection-string
   JWT_SECRET=your-secret-key-min-32-characters
   ```

### Get Free PostgreSQL Database:
- **Neon**: https://neon.tech (Recommended - Free tier)
- **Supabase**: https://supabase.com (Free tier)
- **Vercel Postgres**: In Vercel Dashboard > Storage

---

## 📱 Build Android APK (10 minutes)

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Navigate to app
cd myapp

# 3. Login to Expo
eas login

# 4. Update .env with your Vercel URL
# Edit myapp/.env:
EXPO_PUBLIC_API_URL=https://your-app.vercel.app

# 5. Configure EAS
eas build:configure

# 6. Build APK
eas build --platform android --profile preview

# 7. Wait for build to complete (10-15 minutes)
# 8. Download APK from the link provided
```

---

## ✅ Quick Checklist

### Backend Deployment
- [ ] Vercel CLI installed
- [ ] Backend deployed to Vercel
- [ ] Database created (Neon/Supabase/Vercel)
- [ ] Environment variables set in Vercel
- [ ] Database migrations run
- [ ] API tested (visit https://your-app.vercel.app/api/health)

### Android Build
- [ ] EAS CLI installed
- [ ] Expo account created
- [ ] .env updated with production API URL
- [ ] EAS configured
- [ ] APK built successfully
- [ ] APK downloaded
- [ ] APK tested on Android device

---

## 🔧 Minimum Environment Variables

### Vercel (Backend)
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
```

### Mobile App (.env)
```env
EXPO_PUBLIC_API_URL=https://your-app.vercel.app
EXPO_PUBLIC_OLLAMA_URL=http://localhost:11434
```

---

## 📞 Support Commands

```bash
# Check Vercel deployment status
vercel ls

# View Vercel logs
vercel logs

# Check EAS build status
eas build:list

# Download specific build
eas build:download --id BUILD_ID

# Test API
curl https://your-app.vercel.app/api/health
```

---

## 🐛 Common Issues

### Backend won't deploy
- Check `backend/package.json` has `"postinstall": "prisma generate"`
- Verify DATABASE_URL is correct
- Check Vercel logs for errors

### APK build fails
- Ensure you're logged into Expo: `eas login`
- Check `app.json` is valid JSON
- Try building with `--profile preview` first

### App can't connect to backend
- Verify EXPO_PUBLIC_API_URL in .env
- Test API URL in browser
- Rebuild app after changing .env

---

## 📚 Full Guides

- **Backend Deployment**: See `VERCEL_DEPLOYMENT_GUIDE.md`
- **Android Build**: See `ANDROID_BUILD_GUIDE.md`
- **Ollama Setup**: See `OLLAMA_NETWORK_SETUP.md`

---

## 🎯 Next Steps After Deployment

1. Test all features in production
2. Set up monitoring (Sentry, LogRocket)
3. Configure custom domain (optional)
4. Set up CI/CD (GitHub Actions)
5. Publish to Google Play Store (optional)
6. Add analytics
7. Set up backup strategy
8. Configure rate limiting
9. Add error tracking
10. Set up automated testing
