'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, TrendingUp, Clock } from 'lucide-react'

interface SummaryMetrics {
  total: number
  onTrack: number
  atRisk: number
  offTrack: number
  notStarted: number
  completed: number
  actionRequired: number
  averageProgress: number
}

interface SummaryCardsProps {
  metrics: SummaryMetrics
  isLoading?: boolean
}

export function SummaryCards({ metrics, isLoading = false }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold h-8 bg-muted rounded w-16 mb-2" />
              <div className="text-xs text-muted-foreground h-3 bg-muted rounded w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: 'Action Required',
      value: metrics.actionRequired,
      subtext: `${metrics.actionRequired} KPIs need attention`,
      icon: AlertCircle,
      trend: 'negative',
      color: 'bg-red-50 dark:bg-red-950',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'On Track',
      value: metrics.onTrack,
      subtext: `${metrics.total > 0 ? ((metrics.onTrack / metrics.total) * 100).toFixed(0) : 0}% of KPIs`,
      icon: CheckCircle,
      trend: 'positive',
      color: 'bg-green-50 dark:bg-green-950',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Overall Progress',
      value: `${metrics.averageProgress}%`,
      subtext: 'Average completion rate',
      icon: TrendingUp,
      trend: 'neutral',
      color: 'bg-blue-50 dark:bg-blue-950',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'At Risk',
      value: metrics.atRisk,
      subtext: `${metrics.offTrack} off track`,
      icon: Clock,
      trend: 'warning',
      color: 'bg-amber-50 dark:bg-amber-950',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className={`overflow-hidden ${card.color} border-0`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-foreground">
                  {card.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.subtext}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
