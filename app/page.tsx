"use client";

import { useEffect, useState, useMemo } from "react";
import { FilterBar, FilterState } from "@/components/FilterBar";
import { SummaryCards } from "@/components/SummaryCards";
import { DashboardCharts } from "@/components/DashboardCharts";
import { KPITable } from "@/components/KPITable";
import { KPIItem } from "@/lib/types";
import { formatDateTimeEuropean } from "@/lib/date-utils";
import {
  filterKPIData,
  calculateMetrics,
  calculateDeliveryHealth,
  getFilterOptions,
  generateMockKPIData,
} from "@/lib/sharepoint";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DashboardPage() {
  const [allKPIs, setAllKPIs] = useState<KPIItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [filters, setFilters] = useState<FilterState>({
    financialYear: "",
    clusters: [],
    impactAreas: [],
    kpiTypes: [],
    statuses: [],
    quarters: [],
    people: [],
  });

  const financialYears = useMemo(
    () => Array.from(new Set(allKPIs.map((kpi) => kpi.financialYear))).sort(),
    [allKPIs],
  );

  useEffect(() => {
    if (!filters.financialYear && financialYears.length > 0) {
      setFilters((prev) => ({ ...prev, financialYear: financialYears[0] }));
    }
    if (
      filters.financialYear &&
      !financialYears.includes(filters.financialYear) &&
      financialYears.length > 0
    ) {
      setFilters((prev) => ({ ...prev, financialYear: financialYears[0] }));
    }
  }, [financialYears, filters.financialYear]);

  // Fetch KPI data
  const fetchKPIData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("[v0] Fetching KPI data from /api/kpis");
      const response = await fetch("/api/kpis");
      if (!response.ok) throw new Error("Failed to fetch KPI data");
      const result = await response.json();
      console.log(
        "[v0] Received KPI data:",
        result.data?.length || 0,
        "records",
      );
      setAllKPIs(result.data || []);
    } catch (err) {
      console.error("[v0] Error fetching KPI data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      // Fallback to mock data for demo
      const mockData = generateMockKPIData(50);
      console.log("[v0] Using mock data fallback:", mockData.length, "records");
      setAllKPIs(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIData();
  }, []);

  // Set timestamp only on client to avoid hydration mismatch
  useEffect(() => {
    setLastUpdated(formatDateTimeEuropean(new Date()));
  }, [allKPIs]);

  // Filter and calculate metrics
  const filteredKPIs = useMemo(() => {
    const yearFiltered = allKPIs.filter(
      (kpi) => kpi.financialYear === filters.financialYear,
    );

    // If no data at all, return empty
    if (yearFiltered.length === 0) return [];

    // If all filter arrays are empty, show all data
    const hasAnyFilter =
      (filters.clusters && filters.clusters.length > 0) ||
      (filters.impactAreas && filters.impactAreas.length > 0) ||
      (filters.kpiTypes && filters.kpiTypes.length > 0) ||
      (filters.statuses && filters.statuses.length > 0) ||
      (filters.quarters && filters.quarters.length > 0) ||
      (filters.people && filters.people.length > 0);

    // If no filters are applied, return all data for the year
    if (!hasAnyFilter) {
      return yearFiltered;
    }

    // Apply filters
    return filterKPIData(yearFiltered, {
      cluster: filters.clusters.length > 0 ? filters.clusters : undefined,
      impactArea:
        filters.impactAreas.length > 0 ? filters.impactAreas : undefined,
      kpiType: filters.kpiTypes.length > 0 ? filters.kpiTypes : undefined,
      status: filters.statuses.length > 0 ? filters.statuses : undefined,
      plannedQuarter:
        filters.quarters.length > 0 ? filters.quarters : undefined,
      responsiblePerson:
        filters.people.length > 0 ? filters.people : undefined,
    });
  }, [allKPIs, filters]);

  const metrics = useMemo(() => calculateMetrics(filteredKPIs), [filteredKPIs]);

  console.log("[v0] Filter state:", filters);
  console.log("[v0] Filtered KPIs length:", filteredKPIs.length);
  console.log("[v0] Metrics:", metrics);

  const deliveryHealthData = useMemo(
    () => calculateDeliveryHealth(filteredKPIs),
    [filteredKPIs],
  );

  const clusterData = useMemo(() => {
    const clustered = filteredKPIs.reduce(
      (acc, kpi) => {
        const existing = acc.find((d) => d.name === kpi.cluster);
        if (existing) {
          existing.value++;
        } else {
          acc.push({ name: kpi.cluster, value: 1 });
        }
        return acc;
      },
      [] as Array<{ name: string; value: number }>,
    );
    return clustered;
  }, [filteredKPIs]);

  const impactAreaData = useMemo(() => {
    const areas = filteredKPIs.reduce(
      (acc, kpi) => {
        const existing = acc.find((d) => d.name === kpi.impactArea);
        if (existing) {
          existing.value++;
        } else {
          acc.push({ name: kpi.impactArea, value: 1 });
        }
        return acc;
      },
      [] as Array<{ name: string; value: number }>,
    );
    return areas;
  }, [filteredKPIs]);

  const filterOptions = useMemo(() => {
    return getFilterOptions(
      allKPIs.filter((kpi) => kpi.financialYear === filters.financialYear),
    );
  }, [allKPIs, filters.financialYear]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4 md:p-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Operational KPI Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time KPI tracking and performance monitoring
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchKPIData}
            disabled={isLoading}
            className="h-10 w-10"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="px-4 md:px-6 pt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}. Showing mock data for demonstration purposes.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Filter Bar */}
      <FilterBar
        onFilterChange={setFilters}
        filterOptions={filterOptions}
        financialYears={financialYears}
        currentYear={filters.financialYear}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* Summary Cards */}
        <SummaryCards metrics={metrics} isLoading={isLoading} />

        {/* Charts */}
        <DashboardCharts
          deliveryHealthData={deliveryHealthData}
          clusterData={clusterData}
          impactAreaData={impactAreaData}
          isLoading={isLoading}
        />

        {/* KPI Table */}
        <KPITable data={filteredKPIs} isLoading={isLoading} />

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p suppressHydrationWarning>
            Data last updated: {lastUpdated || "Loading..."} • Total KPIs in{" "}
            {filters.financialYear}:{" "}
            {
              allKPIs.filter((k) => k.financialYear === filters.financialYear)
                .length
            }
          </p>
        </div>
      </main>
    </div>
  );
}
