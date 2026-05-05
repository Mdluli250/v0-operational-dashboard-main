'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { KPIItem } from '@/lib/types'
import { formatDateEuropean } from '@/lib/date-utils'

interface KPITableProps {
  data: KPIItem[]
  isLoading?: boolean
}

type SortKey = keyof KPIItem
type SortOrder = 'asc' | 'desc' | null

export function KPITable({ data, isLoading = false }: KPITableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<SortKey>('status')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const itemsPerPage = 25

  // Sort data
  const sortedData = useMemo(() => {
    const sorted = [...data]

    if (!sortKey || !sortOrder) return sorted

    sorted.sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]

      if (aVal === undefined || bVal === undefined) return 0

      // Handle numeric values
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }

      // Handle string values
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })

    return sorted
  }, [data, sortKey, sortOrder])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedData.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedData, currentPage])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') {
        setSortOrder('desc')
      } else if (sortOrder === 'desc') {
        setSortOrder(null)
        setSortKey(undefined as any)
      }
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="h-4 w-4" />
    if (sortOrder === 'asc') return <ArrowUp className="h-4 w-4" />
    if (sortOrder === 'desc') return <ArrowDown className="h-4 w-4" />
    return <ArrowUpDown className="h-4 w-4" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track':
        return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      case 'At Risk':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
      case 'Off Track':
        return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
      case 'Completed':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">KPI Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">KPI Details</CardTitle>
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="cursor-pointer" onClick={() => handleSort('actionRequired')}>
                    <div className="flex items-center gap-2">
                      Action
                      {getSortIcon('actionRequired')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-2">
                      Title
                      {getSortIcon('title')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('cluster')}>
                    <div className="flex items-center gap-2">
                      Cluster
                      {getSortIcon('cluster')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('actualProgress')}>
                    <div className="flex items-center gap-2">
                      Progress
                      {getSortIcon('actualProgress')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('dueDate')}>
                    <div className="flex items-center gap-2">
                      Due Date
                      {getSortIcon('dueDate')}
                    </div>
                  </TableHead>
                  <TableHead>Planned Q</TableHead>
                  <TableHead>Impact Area</TableHead>
                  <TableHead>KPI Type</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((kpi) => (
                    <TableRow key={kpi.id} className="text-sm">
                      <TableCell>
                        {kpi.actionRequired && (
                          <Badge variant="destructive" className="text-xs">
                            Action
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        {kpi.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{kpi.cluster}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(kpi.status)} border-0`}>
                          {kpi.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-muted rounded h-1.5">
                            <div
                              className="bg-primary h-full rounded"
                              style={{ width: `${kpi.actualProgress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{kpi.actualProgress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDateEuropean(new Date(kpi.dueDate))}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{kpi.plannedQuarter}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{kpi.impactArea}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {kpi.kpiType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-xs">
                        {kpi.notes || '—'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No KPIs found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
