# Android APK Build Guide

## Prerequisites
- Node.js installed
- EAS CLI installed: `npm install -g eas-cli`
- Expo account (sign up at https://expo.dev)

## Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

## Step 2: Login to Expo

```bash
eas login
```

## Step 3: Configure EAS Build

### 3.1 Initialize EAS in your project

```bash
cd myapp
eas build:configure
```

This creates `eas.json` file.

### 3.2 Update eas.json

Edit `myapp/eas.json`:
```json
{
  "cli": {
    "version": ">= 13.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Step 4: Update app.json

Update `myapp/app.json`:
```json
{
  "expo": {
    "name": "Finance Manager",
    "slug": "finance-manager",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "financemanager",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#2563eb"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.financemanager"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png",
        "backgroundColor": "#2563eb"
      },
      "package": "com.yourcompany.financemanager",
      "versionCode": 1,
      "permissions": [
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0"
          }
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "YOUR_PROJECT_ID"
      }
    }
  }
}
```

## Step 5: Update Environment Variables

### 5.1 Create production .env

Create `myapp/.env.production`:
```env
# Production Backend URL (your Vercel deployment)
EXPO_PUBLIC_API_URL=https://your-project.vercel.app

# Ollama - users will need to configure their own
EXPO_PUBLIC_OLLAMA_URL=http://localhost:11434

# Google OAuth
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-client-id
```

### 5.2 Configure EAS Secrets

```bash
cd myapp

# Add environment variables to EAS
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://your-project.vercel.app
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value your-google-client-id
```

## Step 6: Build APK

### Option A: Build Preview APK (Recommended for testing)

```bash
cd myapp
eas build --platform android --profile preview
```

### Option B: Build Production APK

```bash
cd myapp
eas build --platform android --profile production
```

### Option C: Build Locally (Faster, requires Android Studio)

```bash
cd myapp
eas build --platform android --profile preview --local
```

## Step 7: Download APK

After build completes:

1. **From Terminal**: 
   - Build URL will be shown in terminal
   - Click the link to download

2. **From Expo Dashboard**:
   - Go to https://expo.dev
   - Navigate to your project
   - Go to "Builds" tab
   - Download the APK

3. **Using CLI**:
   ```bash
   eas build:list
   # Copy the build ID
   eas build:download --id YOUR_BUILD_ID
   ```

## Step 8: Install APK on Android Device

### Method 1: Direct Install
1. Transfer APK to your Android device
2. Open the APK file
3. Allow installation from unknown sources if prompted
4. Install the app

### Method 2: ADB Install
```bash
# Connect device via USB
adb devices

# Install APK
adb install path/to/your-app.apk
```

### Method 3: Share via Link
1. Upload APK to Google Drive or Dropbox
2. Share link with users
3. Users download and install

## Step 9: Test the APK

1. Install on Android device
2. Open the app
3. Test all features:
   - Login/Signup
   - Add transactions
   - View dashboard
   - Chat with AI (configure Ollama)
   - All CRUD operations

## Build Optimization

### Reduce APK Size

Update `eas.json`:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease",
        "enableProguardInReleaseBuilds": true,
        "enableShrinkResourcesInReleaseBuilds": true
      }
    }
  }
}
```

### Enable Hermes (Faster Performance)

In `app.json`:
```json
{
  "expo": {
    "jsEngine": "hermes"
  }
}
```

## Build for Google Play Store (AAB)

If you want to publish to Play Store:

```bash
# Build AAB instead of APK
eas build --platform android --profile production
```

Update `eas.json`:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

## Troubleshooting

### Issue: Build fails with "No Android SDK found"
**Solution**: Use EAS cloud build (don't use --local flag)

### Issue: "Package name already exists"
**Solution**: Change package name in app.json:
```json
"android": {
  "package": "com.yourcompany.uniquename"
}
```

### Issue: APK won't install
**Solution**: 
- Enable "Install from Unknown Sources" in Android settings
- Check if package name conflicts with existing app
- Ensure Android version is compatible (min SDK 21)

### Issue: App crashes on startup
**Solution**:
- Check logs: `adb logcat`
- Verify environment variables are set
- Test with development build first

### Issue: Build takes too long
**Solution**:
- Use EAS cloud build (faster servers)
- Build during off-peak hours
- Use preview profile for testing

## Build Variants

### Development Build (for testing)
```bash
eas build --platform android --profile development
```
- Includes dev tools
- Larger size
- Easier debugging

### Preview Build (for beta testing)
```bash
eas build --platform android --profile preview
```
- Production-like
- Smaller size
- No dev tools

### Production Build (for release)
```bash
eas build --platform android --profile production
```
- Optimized
- Smallest size
- Ready for Play Store

## Signing Configuration

For production builds, you'll need a keystore:

```bash
# Generate keystore
eas credentials

# Follow prompts to:
# 1. Generate new keystore
# 2. Or upload existing keystore
```

## Update Strategy

### OTA Updates (Over-The-Air)
```bash
# Publish update without rebuilding
eas update --branch production --message "Bug fixes"
```

### Full Rebuild
```bash
# Increment version in app.json
# Then rebuild
eas build --platform android --profile production
```

## Distribution

### Internal Testing
- Share APK link directly
- Use Google Drive/Dropbox
- Email to testers

### Beta Testing
- Use Google Play Internal Testing
- Upload AAB to Play Console
- Add testers by email

### Public Release
- Build AAB (not APK)
- Upload to Google Play Console
- Complete store listing
- Submit for review

## Monitoring

### Crash Reports
```bash
# Install Sentry
npm install @sentry/react-native

# Configure in app
```

### Analytics
```bash
# Install analytics
npm install @react-native-firebase/analytics
```

## Cost Considerations

**EAS Build Free Tier**:
- 30 builds/month for Android
- Unlimited for open source projects

**Paid Plans**:
- Production: $29/month (unlimited builds)
- Enterprise: Custom pricing

## Quick Commands Reference

```bash
# Login
eas login

# Configure
eas build:configure

# Build preview APK
eas build -p android --profile preview

# Build production APK
eas build -p android --profile production

# List builds
eas build:list

# Download build
eas build:download --id BUILD_ID

# View build logs
eas build:view BUILD_ID

# Cancel build
eas build:cancel BUILD_ID
```

## Next Steps

1. ✅ Deploy backend to Vercel
2. ✅ Update API URL in .env.production
3. ✅ Build preview APK
4. ✅ Test on Android device
5. ✅ Fix any issues
6. ✅ Build production APK
7. ✅ Distribute to users
8. ✅ (Optional) Publish to Play Store
