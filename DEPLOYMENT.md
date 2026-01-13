# Deployment Guide - Vercel

This guide covers deploying the Eval Labeller to Vercel.

## Quick Deploy

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N** (first time)
- Project name? **labelling-ui** (or your preferred name)
- Directory? **./** (press Enter)
- Override settings? **N**

4. **Deploy to Production**:
```bash
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. **Push code to GitHub** (if not already):
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click **"Add New Project"**
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click **"Deploy"**

## Configuration

### Build Settings (Auto-detected)

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### Environment Variables

This app doesn't require any environment variables! All data is:
- Imported via client-side CSV parsing or Google Sheets public URLs
- Stored in browser localStorage
- Exported as CSV files

## Post-Deployment

### Your App Will Be Available At:
- Production: `https://labelling-ui.vercel.app` (or your custom domain)
- Preview: Each git push creates a preview deployment

### Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Click **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions

## Features That Work on Vercel

✅ **CSV Import** - Client-side file reading  
✅ **Google Sheets Import** - Public sheet URLs  
✅ **LaTeX Rendering** - KaTeX library  
✅ **localStorage** - Browser-based persistence  
✅ **CSV Export** - Client-side file generation  
✅ **Keyboard Shortcuts** - All work client-side  

## Important Notes

### Data Persistence
- All data is stored in **browser localStorage**
- Data is **NOT** synced to the server
- Each user/browser has their own data
- Remind users to **export regularly**

### No Backend Required
- This is a fully static Next.js app
- All processing happens in the browser
- No server-side APIs
- No database needed

### Collaboration Workflow
For teams:
1. One person creates the evaluation dataset
2. Uploads to Google Sheets and publishes to web
3. Team members access the deployed app
4. Each person imports the sheet, labels independently
5. Everyone exports their labeled CSVs
6. Merge CSVs externally (Google Sheets, Python, etc.)

## Troubleshooting

### Build Failures
- Check that all dependencies are in `package.json`
- Ensure TypeScript has no errors: `npm run lint`
- Test build locally: `npm run build`

### Google Sheets Import Not Working
- This is a client-side issue, not deployment
- User must publish their sheet to web
- See `GOOGLE_SHEETS_SETUP.md` for details

### App Loads But Looks Broken
- Check browser console for errors
- Verify Tailwind CSS is building correctly
- Try clearing cache and hard refresh

## Monitoring

After deployment, monitor:
- **Analytics**: Enable Vercel Analytics in project settings
- **Logs**: View function logs in Vercel Dashboard
- **Performance**: Check Web Vitals in Vercel

## Cost

- **Hobby Plan** (Free):
  - Unlimited deployments
  - 100GB bandwidth/month
  - 6,000 build minutes/month
  - Perfect for this app!

- **Pro Plan** ($20/month):
  - Only needed for heavy traffic or team features

## Updates

### Continuous Deployment (GitHub)
- Every push to `main` → Production deployment
- Every PR → Preview deployment
- Automatic

### Manual Deployment (CLI)
```bash
# Development preview
vercel

# Production
vercel --prod
```

## Security

### No Sensitive Data
- No API keys needed
- No environment secrets
- No database credentials

### Google Sheets Access
- Users must publish their own sheets
- App only reads public CSV exports
- No OAuth or Google API access needed

## Next Steps

1. ✅ Deploy to Vercel
2. 📱 Share the URL with your team
3. 📊 Import your evaluation data
4. 🏷️ Start labeling!
5. 💾 Export regularly to avoid data loss

---

**Need help?** Check [Vercel's Next.js Documentation](https://vercel.com/docs/frameworks/nextjs)
