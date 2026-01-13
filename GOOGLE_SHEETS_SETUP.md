# Google Sheets Setup Guide

To import data from Google Sheets into the Eval Labeller, you need to make your sheet publicly accessible. Here's how:

## Option 1: Publish to Web (Recommended)

This is the most reliable method.

### Steps:
1. Open your Google Sheet (e.g., [your sheet](https://docs.google.com/spreadsheets/d/1i-nrf-VjpnpMX9iZxNptO_vOqGjnpfpKjx8Pu9Or9QU/edit?gid=1414056043))

2. Click **File** → **Share** → **Publish to web**

3. In the dialog:
   - Choose which sheet to publish (or "Entire Document")
   - Select **"Web page"** or **"CSV"** format
   - Click **Publish**
   - Confirm by clicking **OK**

4. Copy the Google Sheets URL from your browser address bar

5. In the Eval Labeller:
   - Click **Import Sheets**
   - Paste your URL
   - Click **Import**

The app will automatically extract the sheet ID and convert it to a CSV export URL.

## Option 2: Share Link (Alternative)

If you don't want to fully publish, you can share with "Anyone with the link":

### Steps:
1. Open your Google Sheet

2. Click the **Share** button (top right)

3. Under "General access":
   - Click "Restricted" → Change to **"Anyone with the link"**
   - Set permission to **Viewer**
   - Click **Done**

4. Copy the share link

5. Use this link in the Eval Labeller

**Note:** This method works, but "Publish to web" is more reliable for automated imports.

## Troubleshooting

### Error: "Sheet not found" or "Failed to fetch"

**Cause:** The sheet is not publicly accessible.

**Solution:**
- Make sure you've published the sheet or set sharing to "Anyone with the link"
- Wait a few minutes after publishing (Google sometimes takes time to propagate changes)
- Try opening the CSV export URL directly in your browser to verify it works:
  ```
  https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=YOUR_GID
  ```

### How to find your Sheet ID and GID

From a URL like:
```
https://docs.google.com/spreadsheets/d/1i-nrf-VjpnpMX9iZxNptO_vOqGjnpfpKjx8Pu9Or9QU/edit?gid=1414056043
```

- **Sheet ID**: `1i-nrf-VjpnpMX9iZxNptO_vOqGjnpfpKjx8Pu9Or9QU` (between `/d/` and `/edit`)
- **GID**: `1414056043` (after `gid=`)

The app automatically extracts these for you!

## Security Considerations

### What gets shared?

When you publish to web or share with "Anyone with the link":
- Anyone with the URL can **view** the data
- They **cannot edit** unless you give them explicit edit permissions
- The data is publicly accessible on the internet

### Best Practices:

1. **For sensitive data**: Don't use Google Sheets import. Use CSV files instead (stored locally).

2. **For team collaboration**: 
   - Share the Google Sheet with specific team members (edit access)
   - Publish to web for read-only access in the labelling tool
   - Export labeled CSV and upload back to Google Sheets

3. **After labeling**:
   - Export your labeled CSV
   - You can unpublish the Google Sheet if desired (File → Share → Stop publishing)

## Workflow Recommendation

For the best collaborative labeling experience:

1. **Setup Phase**:
   - Upload your CSV to Google Sheets
   - Publish to web
   - Share the published URL with labellers

2. **Labeling Phase**:
   - Each labeller imports from Google Sheets URL
   - Labels independently in their browser
   - Exports their labeled CSV when done

3. **Merge Phase**:
   - Collect all labeled CSVs
   - Merge them (you can do this in Google Sheets or with a script)
   - Upload final merged data back to your source

**Note:** The app doesn't support real-time sync back to Google Sheets (that would require OAuth). It's read-only import from Sheets.
