"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export interface FilterState {
  financialYear: string;
  clusters: string[];
  impactAreas: string[];
  kpiTypes: string[];
  statuses: string[];
  quarters: string[];
  people: string[];
  actionRequired?: boolean;
}

interface FilterProps {
  onFilterChange: (filters: FilterState) => void;
  filterOptions: {
    clusters: string[];
    impactAreas: string[];
    kpiTypes: string[];
    statuses: string[];
    quarters: string[];
    people: string[];
  };
  financialYears: string[];
  currentYear: string;
}

export function FilterBar({
  onFilterChange,
  filterOptions,
  financialYears,
  currentYear,
}: FilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    financialYear: currentYear,
    clusters: [],
    impactAreas: [],
    kpiTypes: [],
    statuses: [],
    quarters: [],
    people: [],
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, financialYear: currentYear }));
  }, [currentYear]);

  const handleFilterChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [onFilterChange],
  );

  const toggleArrayFilter = (
    key: keyof Omit<FilterState, "financialYear" | "actionRequired">,
    value: string,
  ) => {
    const newFilters = { ...filters };
    const currentArray = newFilters[key] as string[];

    if (currentArray.includes(value)) {
      newFilters[key] = currentArray.filter((v) => v !== value) as any;
    } else {
      newFilters[key] = [...currentArray, value] as any;
    }

    handleFilterChange(newFilters);
  };

  const handleYearChange = (year: string) => {
    handleFilterChange({ ...filters, financialYear: year });
  };

  const clearAllFilters = () => {
    handleFilterChange({
      financialYear: currentYear,
      clusters: [],
      impactAreas: [],
      kpiTypes: [],
      statuses: [],
      quarters: [],
      people: [],
    });
  };

  const activeFilterCount =
    filters.clusters.length +
    filters.impactAreas.length +
    filters.kpiTypes.length +
    filters.statuses.length +
    filters.quarters.length +
    filters.people.length;

  return (
    <div className="bg-background border-b">
      <div className="space-y-2 p-3">
        {/* Financial Year Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground min-w-fit">
            Financial Year:
          </label>
          <Select
            value={filters.financialYear}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {financialYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          {/* Cluster Filter */}
          <FilterSelector
            label="Cluster"
            options={filterOptions.clusters}
            selected={filters.clusters}
            onChange={(value) => toggleArrayFilter("clusters", value)}
          />

          {/* Impact Area Filter */}
          <FilterSelector
            label="Impact Area"
            options={filterOptions.impactAreas}
            selected={filters.impactAreas}
            onChange={(value) => toggleArrayFilter("impactAreas", value)}
          />

          {/* KPI Type Filter */}
          <FilterSelector
            label="KPI Type"
            options={filterOptions.kpiTypes}
            selected={filters.kpiTypes}
            onChange={(value) => toggleArrayFilter("kpiTypes", value)}
          />

          {/* Status Filter */}
          <FilterSelector
            label="Status"
            options={filterOptions.statuses}
            selected={filters.statuses}
            onChange={(value) => toggleArrayFilter("statuses", value)}
          />

          {/* Responsible Person Filter */}
          <ResponsiblePersonDropdown
            label="Responsible Person"
            options={filterOptions.people}
            selected={filters.people[0] || "__ALL__"}
            onChange={(value) =>
              handleFilterChange({
                ...filters,
                people: value === "__ALL__" || !value ? [] : [value],
              })
            }
          />

          {/* Quarter Filter */}
          <FilterSelector
            label="Planned Quarter"
            options={filterOptions.quarters}
            selected={filters.quarters}
            onChange={(value) => toggleArrayFilter("quarters", value)}
          />
        </div>

        {/* Active Filters Display and Clear Button */}
        {activeFilterCount > 0 && (
          <div className="flex items-center justify-between pt-1 border-t">
            <div className="flex flex-wrap gap-1">
              {[
                ...filters.clusters,
                ...filters.impactAreas,
                ...filters.kpiTypes,
                ...filters.statuses,
                ...filters.quarters,
                ...filters.people,
              ].map((filter) => (
                <Badge
                  key={filter}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 text-xs"
                >
                  {filter}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="ml-2 h-7 text-xs"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface FilterSelectorProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
}

function FilterSelector({
  label,
  options,
  selected,
  onChange,
}: FilterSelectorProps) {
  const isAllSelected =
    options.length > 0 && selected.length === options.length;

  const handleToggleAll = () => {
    if (isAllSelected) {
      // Deselect all
      selected.forEach((item) => {
        if (options.includes(item)) {
          onChange(item);
        }
      });
    } else {
      // Select all
      options.forEach((item) => {
        if (!selected.includes(item)) {
          onChange(item);
        }
      });
    }
  };

  return (
    <Select open={undefined}>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground uppercase">
            {label}
          </label>
          {options.length > 0 && (
            <button
              onClick={handleToggleAll}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              {isAllSelected ? "None" : "All"}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                selected.includes(option)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </Select>
  );
}

interface ResponsiblePersonDropdownProps {
  label: string;
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

function ResponsiblePersonDropdown({
  label,
  options,
  selected,
  onChange,
}: ResponsiblePersonDropdownProps) {
  const effectiveValue = selected === "__ALL__" ? undefined : selected;

  const normalizedOptions = options.filter((option) => option?.trim() !== "");

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground uppercase">
          {label}
        </label>
      </div>
      <Select value={effectiveValue} onValueChange={onChange}>
        <SelectTrigger className="w-32 h-8">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__ALL__">All</SelectItem>
          {normalizedOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
