# Enable Auto-Deployments from GitHub

## Overview

When your Vercel project is connected to GitHub, every `git push` automatically triggers a deployment. This guide helps you set up automatic deployments.

## Check Connection Status

Your project is connected to GitHub if you see:
- ✅ GitHub icon next to your project in Vercel Dashboard
- ✅ Deployment comments on GitHub commits
- ✅ Preview deployments for pull requests

## Connect GitHub to Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to Project Settings:**
   ```
   https://vercel.com/zarifazizs-projects/labelling-ui/settings/git
   ```

2. **Connect Repository:**
   - Look for "Git Repository" section
   - Click **"Connect Git Repository"**
   - Select **GitHub**
   - Choose: `zarifaziz/labelling-ui`
   - Branch: `main`
   - Click **"Connect"**

3. **Verify Connection:**
   - Make a test commit
   - Check Vercel Dashboard for automatic deployment

### Method 2: Redeploy via GitHub Import

If direct connection doesn't work:

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select `zarifaziz/labelling-ui`
4. Click **"Deploy"**

This will link the existing project with GitHub auto-deployment.

## Deployment Workflow

### Before Connection (Manual)
```bash
git add .
git commit -m "Update"
git push              # Only updates GitHub
vercel --prod         # Must deploy manually
```

### After Connection (Automatic)
```bash
git add .
git commit -m "Update"
git push              # Updates GitHub AND auto-deploys! ✨
```

## Benefits of Auto-Deployment

- 🚀 **Zero-touch deployments** - Just push code
- 🔍 **Preview deployments** - Every PR gets a preview URL
- 📜 **Deployment history** - Tied to Git commits
- 🔄 **Easy rollbacks** - Redeploy any previous commit
- ✅ **CI/CD integration** - Automatic testing and deployment

## Deployment Triggers

Once connected:

| Action | Result |
|--------|--------|
| Push to `main` | Production deployment |
| Open/update PR | Preview deployment |
| Merge PR | Production deployment |
| Push to other branch | Preview deployment |

## Verify It's Working

After connecting, test with:

```bash
# Make a small change
echo "# Test" >> test.txt
git add test.txt
git commit -m "Test auto-deployment"
git push
```

Check for:
1. ✅ Deployment notification in terminal
2. ✅ New deployment in Vercel Dashboard
3. ✅ GitHub commit shows Vercel status check

## Troubleshooting

### No Automatic Deployments

**Issue:** Pushing to GitHub doesn't trigger Vercel deployment

**Solutions:**
1. Verify GitHub connection in Vercel settings
2. Check that Vercel GitHub app has repository access
3. Ensure the correct branch is configured for production

### Deployment Failing

**Issue:** Auto-deployment starts but fails

**Solutions:**
1. Check build logs in Vercel Dashboard
2. Test build locally: `npm run build`
3. Verify all dependencies are in `package.json`

### Multiple Deployments

**Issue:** Each push creates multiple deployments

**Cause:** Multiple Vercel projects connected to same repo

**Solution:**
1. Go to Vercel Dashboard
2. Remove duplicate projects or disconnect them
3. Keep only one project connected

## Advanced Configuration

### Deploy Hooks

For custom deployment triggers:
1. Go to: Settings → Git → Deploy Hooks
2. Create a webhook URL
3. Use it to trigger deployments from external services

### Environment Variables

If you need environment variables:
1. Go to: Settings → Environment Variables
2. Add your variables
3. Deployments will use them automatically

### Ignore Build Step

To skip deployment for specific commits:

```bash
git commit -m "docs: update README [skip ci]"
```

Add `[skip ci]` or `[vercel skip]` to commit message.

## Current Project Links

- **GitHub Repo:** https://github.com/zarifaziz/labelling-ui
- **Vercel Project:** https://vercel.com/zarifazizs-projects/labelling-ui
- **Git Settings:** https://vercel.com/zarifazizs-projects/labelling-ui/settings/git

---

Need help? Check the [main deployment guide](DEPLOYMENT.md).
