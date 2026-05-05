# Operational KPI Dashboard

A modern, enterprise-grade operational KPI dashboard for monitoring and tracking key performance indicators from SharePoint using Azure AD authentication and Microsoft Graph API.

## Overview

This dashboard provides real-time visibility into organizational KPI performance across multiple dimensions:
- **Summary Metrics**: Total, on-track, at-risk, and completed KPIs
- **Delivery Health**: Visual breakdown by quarter and status
- **Portfolio Analysis**: Distribution across clusters and impact areas
- **Drill-down Data**: Detailed KPI table with filtering and pagination

## Key Features

✅ **Azure AD OAuth 2.0 Integration** - Secure authentication with your organization
✅ **Real-time Data** - Live KPI data from SharePoint via Microsoft Graph API
✅ **Advanced Filtering** - Filter by Cluster, Impact Area, Status, Quarter, and more
✅ **Interactive Visualizations** - Charts and graphs using Recharts
✅ **Responsive Design** - Works on desktop, tablet, and mobile devices
✅ **European Date Format** - DD/MM/YYYY format for international compliance
✅ **Dark/Light Mode** - Theme support for user preference
✅ **Performance Optimized** - Fast load times with efficient data handling

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Authentication**: NextAuth.js with Azure AD
- **API**: Microsoft Graph API, SharePoint
- **UI Components**: shadcn/ui with Tailwind CSS
- **Charts**: Recharts for data visualization
- **Styling**: Tailwind CSS with dark mode support

## Quick Start

### Prerequisites
- Node.js 18 or higher
- pnpm (or npm/yarn)
- Azure AD credentials (configured in `.env.local`)
- SharePoint access with KPI list

### Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment variables** in `.env.local`:
   ```
   NEXT_PUBLIC_AZURE_AD_CLIENT_ID=37b3b438-b221-4000-870e-e512c7718345
   AZURE_AD_CLIENT_SECRET=OrqI8Q~KkbTR9hqj7EnOnV4IjKDhMyzUkPvQqrbpu
   AZURE_AD_TENANT_ID=1efd3c5d5-ddb2-4ed3-9803-f89675928df4
   
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<generate-secure-key>
   
   NEXT_PUBLIC_SHAREPOINT_SITE_ID=<your-sharepoint-site-id>
   NEXT_PUBLIC_SHAREPOINT_LIST_ID=<your-kpi-list-id>
   ```

3. **Generate NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```

4. **Run development server**:
   ```bash
   pnpm dev
   ```

5. **Open browser**: Navigate to `http://localhost:3000`

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── auth/              # Authentication endpoints
│   │   └── kpis/              # KPI data API
│   ├── auth/                  # Auth pages (signin, error)
│   ├── page.tsx               # Main dashboard
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── components/
│   ├── FilterBar.tsx          # Global filter controls
│   ├── SummaryCards.tsx       # KPI metrics cards
│   ├── DashboardCharts.tsx    # Visualizations
│   ├── KPITable.tsx           # Data table with pagination
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── types.ts               # TypeScript interfaces
│   ├── sharepoint.ts          # SharePoint utilities
│   ├── date-utils.ts          # Date formatting
│   └── auth-types.ts          # Auth type augmentation
├── public/                    # Static assets
├── .env.local                 # Environment variables
├── DEPLOYMENT_GUIDE.md        # Detailed deployment guide
└── README.md                  # This file
```

## Configuration

### Azure AD Credentials (Pre-configured)
- **Application ID**: 37b3b438-b221-4000-870e-e512c7718345
- **Tenant ID**: 1efd3c5d5-ddb2-4ed3-9803-f89675928df4
- **Directory**: CSIR Smart Society

### SharePoint Configuration

1. **Get your SharePoint Site ID**:
   - Navigate to your SharePoint site
   - Go to Settings → Site Information
   - Copy the Site ID

2. **Get your KPI List ID**:
   - Open the "Smart Society KPI Table" list
   - Check list settings or URL
   - Copy the List ID

3. **Update `.env.local`** with these values

## Building for Production

```bash
# Build optimized production bundle
pnpm build

# Start production server
pnpm start
```

The application will be available at `http://localhost:3000` (or your configured port).

## Features & Components

### Dashboard Overview
The main dashboard displays:
1. **Global Filters** - Sticky filter bar at the top
2. **Summary Cards** - High-level KPI metrics
3. **Charts** - Delivery health and portfolio views
4. **KPI Table** - Detailed drill-down with pagination
5. **Footer** - Last updated timestamp and KPI count

### Global Filters
- Financial Year (default: current year)
- Cluster (e.g., Smart Mobility, Smart Places)
- Impact Area
- KPI Type
- Status (On Track, At Risk, Off Track)
- Quarter (Q1-Q4)

### Summary Metrics
- Total KPIs in dashboard
- On Track: KPIs meeting targets
- At Risk: KPIs requiring attention
- Action Required: Urgent items needing action

### Visualizations
- **Delivery Health Chart**: Status breakdown by quarter
- **Cluster Distribution**: KPIs by organizational cluster
- **Impact Area Distribution**: KPIs by impact area

### Data Table
- 25 items per page with pagination
- Sortable columns
- Color-coded status badges
- Progress bars for visual indication
- Date formatting in European format (DD/MM/YYYY)

## Authentication

The dashboard uses OAuth 2.0 with Azure AD:
1. User navigates to dashboard
2. Redirected to Azure AD login if not authenticated
3. User enters credentials
4. Redirected back with access token
5. Token stored securely in session
6. Dashboard loads with user's KPI data

## Deployment Options

### Local Server (Recommended for Testing)
```bash
pnpm dev              # Development server with hot reload
# or
pnpm build && pnpm start  # Production server
```

### Docker
Create a `Dockerfile` for containerized deployment:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
CMD ["pnpm", "start"]
```

### Vercel
Deploy directly to Vercel for production:
- Push to GitHub
- Connect repository to Vercel
- Set environment variables in Vercel dashboard
- Deploy with one click

## Troubleshooting

### "Unauthorized" Error
- Verify Azure AD credentials in `.env.local`
- Check that user has access to SharePoint KPI list
- Ensure `NEXTAUTH_URL` matches your domain

### "No data displayed"
- Verify SharePoint Site ID and List ID
- Check that the KPI list exists and is accessible
- Review browser console for API errors
- Ensure Microsoft Graph permissions are granted

### Date formatting issues
- Uses European format (DD/MM/YYYY)
- Check system locale settings
- Browser locale might override formatting

### Performance issues
- Clear browser cache
- Check for slow network
- Review application logs for API delays

## Security Notes

⚠️ **Important for Production**:
1. Store `AZURE_AD_CLIENT_SECRET` securely - never commit to version control
2. Generate a strong `NEXTAUTH_SECRET` using cryptographic methods
3. Use HTTPS in production
4. Implement rate limiting for API endpoints
5. Set appropriate CORS policies
6. Regularly rotate credentials

## Additional Resources

- **DEPLOYMENT_GUIDE.md** - Detailed deployment instructions for production
- **v0_plans/realistic-outline.md** - Architecture and implementation plan
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features
- [NextAuth.js Documentation](https://next-auth.js.org) - Authentication details
- [Microsoft Graph API](https://docs.microsoft.com/graph) - API reference

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review deployment guide for production setup
3. Check browser console for error details
4. Verify environment variables are set correctly

## License

Internal use - CSIR Smart Society Project

## Version

**v1.0.0** - Ready for local deployment and testing
