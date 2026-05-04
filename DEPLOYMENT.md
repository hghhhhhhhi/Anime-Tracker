# Deploy Anime Tracker to Vercel (Free)

## Step 1: Push to GitHub
1. Create a new repository on GitHub
2. Push your code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/anime-tracker.git
   git push -u origin main
   ```

## Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Click "New Project"
4. Select your anime-tracker repository
5. Vercel will automatically detect the `vercel.json` configuration
6. Click "Deploy"

## Step 3: Environment Variables (if needed)
If your server needs any environment variables, add them in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add any required variables

## Features
- ✅ Free hosting
- ✅ Custom domain support
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Serverless API functions
- ✅ Automatic deployments on git push

## Your App URL
After deployment, your app will be available at:
`https://your-project-name.vercel.app`

## Notes
- The app uses Vercel's serverless functions for the API
- Frontend is served as static files
- No server maintenance required
- Always free for hobby projects
