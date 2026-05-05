# SharePoint Configuration Guide

This guide helps you find your SharePoint Site ID and List ID to connect the KPI Dashboard to your real SharePoint data.

## Step 1: Get Your SharePoint Site ID

### Method 1: Using Microsoft Graph Explorer (Easiest)
1. Go to [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
2. Sign in with your organizational account
3. In the query bar, type: `/sites?search=*`
4. Click **Run query**
5. Find your site in the results - look for "displayName" matching your SharePoint site
6. Copy the **id** field (format: `hostname,siteId,listId-placeholder`)
7. Extract just the middle part after the first comma - that's your Site ID

### Method 2: From SharePoint URL
1. Navigate to your SharePoint site
2. Go to **Settings** → **Site Information**
3. Copy the Site ID from the information panel
4. Or use this pattern: `contoso.sharepoint.com/sites/YourSiteName`
   - Site ID will be displayed in Site Information

### Method 3: Using PowerShell
```powershell
Connect-PnPOnline -Url "https://contoso.sharepoint.com/sites/YourSiteName" -Interactive
Get-PnPSite -Includes Id
```

## Step 2: Get Your KPI List ID

### Method 1: Using Microsoft Graph Explorer
1. Replace `{SITE_ID}` with your Site ID from Step 1
2. In Graph Explorer, use query: `/sites/{SITE_ID}/lists`
3. Click **Run query**
4. Find your "Smart Society KPI Table" list
5. Copy its **id** field - that's your List ID

### Method 2: From SharePoint List URL
1. Open your KPI list in SharePoint
2. Go to **Settings** → **List settings**
3. Look at the URL: `...list.aspx?id={LIST_ID}`
4. The LIST_ID in the URL is what you need

### Method 3: Using PowerShell
```powershell
Connect-PnPOnline -Url "https://contoso.sharepoint.com/sites/YourSiteName" -Interactive
Get-PnPList | Select Title, Id
```

## Step 3: Update .env.local

Once you have both IDs, update your `.env.local` file on the server:

```bash
ssh user@146.64.52.234
nano /var/www/kpi-dashboard/.env.local
```

Replace these lines:
```
NEXT_PUBLIC_SHAREPOINT_SITE_ID=your-sharepoint-site-id
NEXT_PUBLIC_SHAREPOINT_LIST_ID=your-kpi-list-id
```

With your actual IDs:
```
NEXT_PUBLIC_SHAREPOINT_SITE_ID=1234abcd-5678-90ef-ghij-klmnopqrstuv
NEXT_PUBLIC_SHAREPOINT_LIST_ID=9876wxyz-5432-10ba-cdef-ghijklmnopqr
```

Save and exit (Ctrl+X, then Y, then Enter)

## Step 4: Verify SharePoint Permissions

Your Azure AD application needs these permissions in SharePoint:
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **App registrations** → Your app → **API permissions**
3. Add these permissions:
   - **Microsoft Graph** → **Sites.Read.All** (Application)
   - **Microsoft Graph** → **Sites.ReadWrite.All** (Application)
   - **SharePoint** → **Sites.Read.All** (Application)

4. Click **Grant admin consent for [Organization]**

## Step 5: Restart the Application

After updating `.env.local`, restart your application:

```bash
# SSH into your server
ssh user@146.64.52.234

# Go to app directory
cd /var/www/kpi-dashboard

# If using systemd:
sudo systemctl restart kpi-dashboard

# Or if running manually:
# Stop the process (Ctrl+C)
# Then restart: pnpm start
```

## Step 6: Verify Connection

1. Check the application logs:
   ```bash
   sudo journalctl -u kpi-dashboard -n 50
   ```

2. Look for messages like:
   ```
   [SharePoint] Requesting access token...
   [SharePoint] Access token obtained successfully
   [SharePoint] Fetching KPI items from list...
   [SharePoint] Retrieved X items from SharePoint
   ```

3. Visit your dashboard: `http://146.64.52.234:3000`

## Troubleshooting

### "Missing required environment variables"
- Ensure all values are set in `.env.local`
- Check for typos in variable names
- Restart the application after updating

### "Failed to get access token"
- Verify Azure AD credentials in `.env.local`
- Check that Client Secret hasn't expired (valid for ~2 years by default)
- Ensure tenant ID is correct

### "Failed to fetch SharePoint list"
- Verify Site ID and List ID are correct
- Check that the list exists in your SharePoint site
- Confirm application has read permissions to the list
- Check Application permissions in Azure AD

### Still seeing mock data
- Check application logs for errors
- Verify all environment variables are set
- Confirm SharePoint list is accessible
- Check that list contains the expected columns

## List Column Mapping

The dashboard expects these columns in your SharePoint KPI list:

| SharePoint Column | Dashboard Field |
|---|---|
| Title | KPI Title |
| Cluster | Cluster (e.g., Smart Mobility) |
| Impact Area/Centre | Impact Area |
| KPINumberShort | KPI Type |
| Status | Status (On Track, At Risk, etc.) |
| Planned Q delivery | Quarter |
| Responsible Person | Responsible Person |
| Financial Year | Financial Year |
| KPI Description | Notes |
| Actual Progress | Progress % |
| Actual Q delivered | Completion Date |

If your columns have different names, update the mapping in `/lib/sharepoint.ts` in the `fetchSharePointKPIData` function.

## API Response Format

The `/api/kpis` endpoint returns:

```json
{
  "success": true,
  "data": [ /* Array of KPI items */ ],
  "total": 50,
  "source": "SharePoint"
}
```

If SharePoint is unavailable:
```json
{
  "success": true,
  "data": [ /* Mock data */ ],
  "total": 50,
  "source": "Mock (SharePoint unavailable)",
  "warning": "Using mock data - check SharePoint configuration"
}
```
