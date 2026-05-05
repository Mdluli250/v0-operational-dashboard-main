import { fetchSharePointKPIData, generateMockKPIData } from '@/lib/sharepoint'

export async function GET() {
  try {
    console.log('[API] KPI endpoint called - fetching SharePoint data')
    
    // Try to fetch real data from SharePoint first
    try {
      const sharePointData = await fetchSharePointKPIData()
      console.log(`[API] Successfully fetched ${sharePointData.length} KPI records from SharePoint`)
      
      return Response.json({
        success: true,
        data: sharePointData,
        total: sharePointData.length,
        source: 'SharePoint',
      })
    } catch (sharePointError) {
      console.error('[API] SharePoint fetch failed:', sharePointError)
      console.log('[API] Falling back to mock data')
      
      // Only use mock data as fallback if SharePoint fails
      const mockData = generateMockKPIData(50)
      return Response.json({
        success: true,
        data: mockData,
        total: mockData.length,
        source: 'Mock (SharePoint unavailable)',
        warning: 'Using mock data - check SharePoint configuration',
      })
    }
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    
    // Final fallback - always return something
    const mockData = generateMockKPIData(50)
    return Response.json({
      success: true,
      data: mockData,
      total: mockData.length,
      source: 'Mock (Error occurred)',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
