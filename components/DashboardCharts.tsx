'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DeliveryHealthData {
  quarter: string
  onTrack: number
  atRisk: number
  offTrack: number
}

interface ChartData {
  name: string
  value: number
}

interface ChartsProps {
  deliveryHealthData: DeliveryHealthData[]
  clusterData: ChartData[]
  impactAreaData: ChartData[]
  isLoading?: boolean
}

const COLORS = {
  onTrack: '#10b981',
  atRisk: '#f59e0b',
  offTrack: '#ef4444',
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  tertiary: '#ec4899',
  quaternary: '#06b6d4',
}

export function DashboardCharts({
  deliveryHealthData,
  clusterData,
  impactAreaData,
  isLoading = false,
}: ChartsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium h-4 bg-muted rounded w-32" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
      {/* Delivery Health by Quarter */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Delivery Health by Quarter</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deliveryHealthData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="quarter" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Bar dataKey="onTrack" stackId="a" fill={COLORS.onTrack} name="On Track" />
              <Bar dataKey="atRisk" stackId="a" fill={COLORS.atRisk} name="At Risk" />
              <Bar dataKey="offTrack" stackId="a" fill={COLORS.offTrack} name="Off Track" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* KPI Distribution by Cluster */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">KPI Distribution by Cluster</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={clusterData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {clusterData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={Object.values(COLORS)[index % Object.values(COLORS).length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* KPI Distribution by Impact Area */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">KPI Distribution by Impact Area</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={impactAreaData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {impactAreaData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={Object.values(COLORS)[(index + 2) % Object.values(COLORS).length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function renderCustomLabel(entry: any) {
  // In Recharts pie charts, entry has: name, value, percent, midAngle, etc.
  // percent is already calculated (0-1 range)
  if (entry.percent === undefined || entry.percent === null) {
    return ''
  }
  const percent = Math.round(entry.percent * 100)
  return `${percent}%`
}
