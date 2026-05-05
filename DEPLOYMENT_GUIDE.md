# Operational KPI Dashboard - Local Deployment Guide

## Prerequisites
- Node.js 18+ and npm/pnpm
- Git
- Azure AD credentials (provided)
- SharePoint access with KPI list

## Quick Start

### 1. Environment Setup
The `.env.local` file has been created with your Azure AD credentials:
- **Client ID**: 37b3b438-b221-4000-870e-e512c7718345
- **Tenant ID**: 1efd3c5d5-ddb2-4ed3-9803-f89675928df4
- **Object ID**: 6b2761b4-07f9-4a9f-a207-f91b1e003cbc

**Important**: The `NEXTAUTH_SECRET` is a placeholder. Generate a secure one:
```bash
openssl rand -base64 32
```
Update this in `.env.local` before deployment.

### 2. SharePoint Configuration
Update the following in `.env.local`:
- `NEXT_PUBLIC_SHAREPOINT_SITE_ID`: Your SharePoint site ID
- `NEXT_PUBLIC_SHAREPOINT_LIST_ID`: ID of the "Smart Society KPI Table" list

To find these:
1. Open SharePoint site
2. Go to Site Settings → Site Information
3. Copy Site ID from URL or settings

### 3. Installation & Running Locally
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Application will be available at http://localhost:3000
```

### 4. Building for Production
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Project Structure
```
/app
  /api/auth          - OAuth 2.0 authentication routes
  /api/kpis          - KPI data fetching endpoints
  page.tsx           - Main dashboard page
  layout.tsx         - Root layout with providers
  globals.css        - Global styles

/components
  FilterBar.tsx      - Global filter controls
  SummaryCards.tsx   - KPI metric cards
  DashboardCharts.tsx - Visualizations (Recharts)
  KPITable.tsx       - Paginated KPI table

/lib
  types.ts           - TypeScript types
  sharepoint.ts      - SharePoint/Graph utilities
  date-utils.ts      - Date formatting utilities
```

## Features
✅ Azure AD OAuth 2.0 authentication
✅ Real-time KPI data from SharePoint
✅ Global filtering by Cluster, Impact Area, Status, Quarter
✅ KPI summary cards with metrics
✅ Delivery health visualization
✅ Portfolio view charts
✅ Paginated KPI drill-down table
✅ European date formatting (DD/MM/YYYY)
✅ Responsive design for desktop & tablet
✅ Dark/Light mode support

## Authentication Flow
1. User navigates to dashboard
2. Redirected to Azure AD login if not authenticated
3. OAuth 2.0 flow exchanges credentials for access token
4. Token stored in secure session
5. Microsoft Graph API calls use token for data access
6. Data fetched from SharePoint KPI list

## Data Refresh
- Dashboard loads current financial year data by default
- Manual refresh available via "Refresh" button
- Filters applied dynamically without page reload
- Pagination supports 25 items per page

## Deployment Checklist
- [ ] Update `.env.local` with production values
- [ ] Generate secure `NEXTAUTH_SECRET`
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Verify SharePoint list is accessible
- [ ] Test authentication flow with Azure AD
- [ ] Configure HTTPS for production
- [ ] Set up SSL certificates
- [ ] Test all filters and visualizations
- [ ] Verify date formatting for European locale
- [ ] Check mobile responsiveness

## Troubleshooting

### Auth not working
- Verify Azure AD credentials in `.env.local`
- Check that `NEXTAUTH_URL` matches your domain
- Ensure `NEXTAUTH_SECRET` is set

### No data displayed
- Verify SharePoint site and list IDs
- Check that user has access to the KPI list
- Review browser console for API errors
- Ensure Microsoft Graph permissions are granted

### Date formatting issues
- Uses European DD/MM/YYYY format
- System locale should match browser locale
- All dates stored in ISO format internally

## Support & Next Steps
1. Test the application in development first
2. Validate data with stakeholders
3. Configure production environment variables
4. Deploy to your local server
5. Monitor logs for any issues

For more technical details, refer to the implementation plan in `v0_plans/realistic-outline.md`.
