// KPI Data Models and Types for SharePoint Integration

export interface KPIItem {
  id: string
  title: string
  cluster: string
  impactArea: string
  kpiType: string
  status: 'On Track' | 'At Risk' | 'Off Track' | 'Completed' | 'Not Started'
  plannedQuarter: string
  responsiblePerson: string
  owner: string
  ownerEmail: string
  actualProgress: number
  targetProgress: number
  dueDate: string
  completionDate?: string
  notes: string
  financialYear: string
  actionRequired: boolean
  lastUpdated: string
}

export interface FilterState {
  financialYear: string
  clusters: string[]
  impactAreas: string[]
  kpiTypes: string[]
  statuses: string[]
  quarters: string[]
  people: string[]
  actionRequired?: boolean
}

export interface SummaryMetrics {
  totalKPIs: number
  onTrack: number
  atRisk: number
  offTrack: number
  notStarted: number
  completed: number
  actionRequiredCount: number
  averageProgress: number
}

export interface DeliveryHealthData {
  quarter: string
  onTrack: number
  atRisk: number
  offTrack: number
}

export interface ClusterData {
  name: string
  value: number
}

export interface ImpactAreaData {
  name: string
  value: number
}

export interface KPIMixData {
  name: string
  value: number
}

// Constants
export const FINANCIAL_YEARS = ['2024/2025', '2025/2026', '2026/2027']
export const CLUSTERS = ['Digital', 'Operations', 'Finance', 'Innovation', 'Customer Success']
export const IMPACT_AREAS = ['Customer Experience', 'Operational Efficiency', 'Revenue Growth', 'Risk Management', 'Talent Development']
export const KPI_TYPES = ['Financial', 'Operational', 'Customer', 'Quality', 'Strategic']
export const STATUS_OPTIONS = ['On Track', 'At Risk', 'Off Track', 'Not Started', 'Completed']
export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']
