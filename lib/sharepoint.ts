import { KPIItem } from "./types";

// Fetch KPI data from SharePoint using service principal credentials
export async function fetchSharePointKPIData(): Promise<KPIItem[]> {
  try {
    // Check if all required credentials are present
    if (
      !process.env.AZURE_AD_TENANT_ID ||
      !process.env.AZURE_AD_CLIENT_ID ||
      !process.env.AZURE_AD_CLIENT_SECRET ||
      !process.env.NEXT_PUBLIC_SHAREPOINT_SITE_ID ||
      !process.env.NEXT_PUBLIC_SHAREPOINT_LIST_ID
    ) {
      console.error("[SharePoint] Missing required environment variables");
      throw new Error("SharePoint credentials not configured");
    }

    const siteIdRaw = process.env.NEXT_PUBLIC_SHAREPOINT_SITE_ID.trim();
    const listIdRaw = process.env.NEXT_PUBLIC_SHAREPOINT_LIST_ID.trim();

    const validateSharePointId = (name: string, value: string) => {
      if (value.length === 0) {
        throw new Error(`SharePoint ${name} cannot be empty.`);
      }
      if (/>|<|"|\{|\}|\||\\|\^|~|\[|\]|`/.test(value)) {
        throw new Error(
          `SharePoint ${name} contains invalid characters. Check your .env values.`,
        );
      }
    };

    const validateSiteIdFormat = (value: string) => {
      if (value.includes(",")) {
        const parts = value.split(",");
        if (
          parts.length !== 3 ||
          parts.some((part) => part.trim().length === 0)
        ) {
          throw new Error(
            "SharePoint Site ID must be a full Graph site identifier: hostname,siteCollectionId,siteId",
          );
        }
      } else if (!value.includes(":")) {
        throw new Error(
          "SharePoint Site ID must be a Graph site identifier or site path, e.g. hostname,siteCollectionId,siteId or hostname:/sites/YourSiteName",
        );
      }
    };

    validateSharePointId("Site ID", siteIdRaw);
    validateSharePointId("List ID", listIdRaw);
    validateSiteIdFormat(siteIdRaw);

    // Get access token using client credentials flow
    console.log("[SharePoint] Requesting access token...");
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.AZURE_AD_CLIENT_ID,
          client_secret: process.env.AZURE_AD_CLIENT_SECRET,
          scope: "https://graph.microsoft.com/.default",
          grant_type: "client_credentials",
        }).toString(),
      },
    );

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("[SharePoint] Token request failed:", error);
      throw new Error(
        `Failed to get access token: ${tokenResponse.statusText}`,
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log("[SharePoint] Access token obtained successfully");

    // Fetch items from SharePoint list
    const siteId = encodeURIComponent(
      process.env.NEXT_PUBLIC_SHAREPOINT_SITE_ID,
    );
    const listId = encodeURIComponent(
      process.env.NEXT_PUBLIC_SHAREPOINT_LIST_ID,
    );
    const listUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items?$expand=fields`;

    console.log("[SharePoint] Fetching KPI items from list...");
    const allItems: any[] = [];
    let nextUrl: string | undefined = listUrl;

    interface GraphListResponse {
      value: any[];
      "@odata.nextLink"?: string;
    }

    while (nextUrl) {
      const listResponse: Response = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!listResponse.ok) {
        const error = await listResponse.text();
        console.error("[SharePoint] List request failed:", error);
        throw new Error(
          `Failed to fetch SharePoint list: ${listResponse.statusText}`,
        );
      }

      const listData: GraphListResponse = await listResponse.json();
      if (!Array.isArray(listData.value)) {
        throw new Error("Unexpected SharePoint response format: missing value array.");
      }

      allItems.push(...listData.value);
      nextUrl = typeof listData["@odata.nextLink"] === "string"
        ? listData["@odata.nextLink"]
        : undefined;
    }

    console.log(
      `[SharePoint] Retrieved ${allItems.length} total items from SharePoint`,
    );

    const normalizeString = (value: any) => {
      if (typeof value !== "string") return value;
      return value.trim();
    };

    const resolveField = <T = string>(
      fields: Record<string, any>,
      keys: string | string[],
      defaultValue: T,
    ) => {
      const names = Array.isArray(keys) ? keys : [keys];
      for (const name of names) {
        const value = fields[name];
        if (value !== undefined && value !== null && value !== "") {
          return normalizeString(value) as T;
        }
      }
      return defaultValue;
    };

    const parseNumber = (value: any, defaultValue = 0) => {
      if (value === undefined || value === null || value === "") {
        return defaultValue;
      }
      if (typeof value === "number") {
        return Number.isFinite(value) ? value : defaultValue;
      }

      const normalized = String(value)
        .trim()
        .replace(/,/g, ".")
        .replace(/%$/, "");

      const match = normalized.match(/-?\d+(?:\.\d+)?/);
      if (!match) {
        return defaultValue;
      }

      const num = Number(match[0]);
      return Number.isFinite(num) ? num : defaultValue;
    };

    const resolveNumericField = (
      fields: Record<string, any>,
      keys: string | string[],
      defaultValue = 0,
    ) => {
      const fieldValue = resolveField(fields, keys, undefined as any);
      if (fieldValue !== undefined && fieldValue !== null && fieldValue !== "") {
        return parseNumber(fieldValue, defaultValue);
      }

      const fallback = Object.entries(fields).find(([key, value]) => {
        return /progress|percent|complete/i.test(key) &&
          !Number.isNaN(parseNumber(value, NaN));
      });

      return fallback ? parseNumber(fallback[1], defaultValue) : defaultValue;
    };

    type KPIStatus = KPIItem["status"];
    const normalizeStatus = (rawStatus: any): KPIStatus => {
      const status = normalizeString(rawStatus) as string;
      if (!status) return "Not Started";

      const normalized = status
        .toString()
        .trim()
        .toLowerCase();

      const statusMap: Record<string, KPIStatus> = {
        approved: "On Track",
        "on track": "On Track",
        "at risk": "At Risk",
        "off track": "Off Track",
        completed: "Completed",
        "not started": "Not Started",
        "in review": "At Risk",
        plannned: "Not Started",
        planned: "Not Started",
        rejected: "Off Track",
        "moved to next fy": "Not Started",
        "moved to next fiscal year": "Not Started",
      };

      const allowedStatuses = new Set<KPIStatus>([
        "On Track",
        "At Risk",
        "Off Track",
        "Completed",
        "Not Started",
      ]);

      return statusMap[normalized] ??
        (allowedStatuses.has(status as KPIStatus) ? (status as KPIStatus) : "Not Started");
    };

    const formatDate = (
      value: any,
      defaultValue = new Date().toISOString().split("T")[0],
    ) => {
      const date = value ? new Date(value) : null;
      return date instanceof Date && !Number.isNaN(date.valueOf())
        ? date.toISOString().split("T")[0]
        : defaultValue;
    };

    // Transform SharePoint items to KPIItem format
    const kpiItems: KPIItem[] = allItems.map((item: any) => {
      const fields: Record<string, any> = item.fields || {};
      const title = resolveField(
        fields,
        ["Title", "KPI Title", "KPI Name", "Issue Title"],
        "Untitled",
      );
      const responsiblePerson = resolveField(
        fields,
        ["field_8", "Responsible Person", "Owner", "Assigned To", "Assigned"],
        "Unassigned",
      );
      const ownerEmail = resolveField(
        fields,
        ["OwnerEmail", "Owner Email", "Responsible Email", "Assigned Email"],
        "",
      );
      const rawStatus = resolveField(
        fields,
        ["field_4", "Status", "Current Status", "Issue Status"],
        "Not Started",
      );
      const normalizedStatus = normalizeStatus(rawStatus);

      return {
        id: item.id,
        title,
        cluster: resolveField(
          fields,
          ["Cluster", "Business Unit", "Theme"],
          "Uncategorized",
        ),
        impactArea: resolveField(
          fields,
          [
            "field_3",
            "Impact Area/Centre",
            "Impact Area",
            "Impact Area Centre",
            "Area",
          ],
          "General",
        ),
        kpiType: resolveField(
          fields,
          ["KPINumberShort", "KPI Type", "Issue Type", "Type"],
          "General",
        ),
        status: normalizedStatus,
        plannedQuarter: resolveField(
          fields,
          ["field_5", "Planned Q delivery", "Planned Quarter", "Quarter"],
          "Q1",
        ),
        responsiblePerson,
        owner: responsiblePerson,
        ownerEmail:
          ownerEmail ||
          `${responsiblePerson.toLowerCase().replace(/\s+/g, ".")}@organization.com`,
        actualProgress: resolveNumericField(
          fields,
          [
            "field_10",
            "Actual Progress",
            "Progress",
            "Progress %",
            "Completion %",
            "Percent Complete",
            "ProgressPercentage",
            "Actual Progress %",
          ],
          0,
        ),
        targetProgress: 100,
        dueDate: formatDate(
          resolveField(
            fields,
            ["Due Date", "Target Date", "DueDate", "Modified"],
            undefined,
          ),
        ),
        completionDate: resolveField(
          fields,
          ["Actual Q delivered", "Completion Date", "Completed Date"],
          undefined,
        )
          ? formatDate(
              resolveField(
                fields,
                ["Actual Q delivered", "Completion Date", "Completed Date"],
                undefined,
              ),
              undefined,
            )
          : undefined,
        notes: resolveField(
          fields,
          [
            "field_1",
            "KPI Description",
            "Description",
            "Notes",
            "Issue Description",
          ],
          "",
        ),
        financialYear: resolveField(
          fields,
          ["field_2", "Financial Year", "FY", "FinancialYear"],
          "2024/2025",
        ),
        actionRequired: ["At Risk", "Off Track"].includes(normalizedStatus),
        lastUpdated:
          item.lastModifiedDateTime ||
          formatDate(
            resolveField(
              fields,
              ["Modified", "Last Modified", "LastModifiedDateTime"],
              new Date().toISOString(),
            ),
          ),
      };
    });

    return kpiItems;
  } catch (error) {
    console.error("[SharePoint] Error fetching KPI data:", error);
    throw error;
  }
}

// Mock data generator for development/testing (fallback only)
export function generateMockKPIData(count: number = 25): KPIItem[] {
  const clusters = ["Smart Mobility", "Smart Places", "NGEI (& NICIS)"];
  const impactAreas = [
    "SE",
    "NSA",
    "WC",
    "NICIS",
    "TSO",
    "FBI",
    "OI",
    "EC",
    "HCC",
    "eGov",
    "EDT4IR",
    "TIE",
  ];
  const kpiTypes = [
    "KPI 01",
    "KPI 02",
    "KPI 03",
    "KPI 04",
    "KPI 05",
    "KPI 06",
    "KPI 07",
    "KPI 08",
    "KPI 09",
    "KPI 10",
    "KPI 11",
    "KPI 22",
  ];
  const statuses = [
    "On Track",
    "At Risk",
    "Off Track",
    "Not Started",
    "Completed",
  ] as const;
  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const people = [
    "C. Jacobs",
    "E. Maseko",
    "B. Ndlovu",
    "F. van Wyk",
    "D. Naidoo",
    "A. Molefe",
  ];

  const mockData: KPIItem[] = [];

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const actualProgress = Math.floor(Math.random() * 100);

    mockData.push({
      id: `kpi-${i + 1}`,
      title: `Dummy KPI Project ${i + 1}`,
      cluster: clusters[Math.floor(Math.random() * clusters.length)],
      impactArea: impactAreas[Math.floor(Math.random() * impactAreas.length)],
      kpiType: kpiTypes[Math.floor(Math.random() * kpiTypes.length)],
      status: status,
      plannedQuarter: quarters[Math.floor(Math.random() * quarters.length)],
      responsiblePerson: people[Math.floor(Math.random() * people.length)],
      owner: people[Math.floor(Math.random() * people.length)],
      ownerEmail: `${people[Math.floor(Math.random() * people.length)].toLowerCase().replace(/\s+/g, ".")}@organization.com`,
      actualProgress: actualProgress,
      targetProgress: 100,
      dueDate: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      completionDate:
        status === "Completed"
          ? new Date().toISOString().split("T")[0]
          : undefined,
      notes: `Progress update for KPI ${i + 1}`,
      financialYear: Math.random() > 0.5 ? "2024-2025" : "2025-2026",
      actionRequired: status === "At Risk" || status === "Off Track",
      lastUpdated: new Date().toISOString(),
    });
  }

  return mockData;
}

// Filter KPI data based on filter state
export function filterKPIData(
  data: KPIItem[],
  filters: {
    cluster?: string[];
    impactArea?: string[];
    kpiType?: string[];
    status?: string[];
    plannedQuarter?: string[];
    responsiblePerson?: string[];
    actionRequired?: boolean;
  },
): KPIItem[] {
  return data.filter((item) => {
    if (
      filters.cluster &&
      filters.cluster.length > 0 &&
      !filters.cluster.includes(item.cluster)
    ) {
      return false;
    }
    if (
      filters.impactArea &&
      filters.impactArea.length > 0 &&
      !filters.impactArea.includes(item.impactArea)
    ) {
      return false;
    }
    if (
      filters.kpiType &&
      filters.kpiType.length > 0 &&
      !filters.kpiType.includes(item.kpiType)
    ) {
      return false;
    }
    if (
      filters.status &&
      filters.status.length > 0 &&
      !filters.status.includes(item.status)
    ) {
      return false;
    }
    if (
      filters.plannedQuarter &&
      filters.plannedQuarter.length > 0 &&
      !filters.plannedQuarter.includes(item.plannedQuarter)
    ) {
      return false;
    }
    if (
      filters.responsiblePerson &&
      filters.responsiblePerson.length > 0 &&
      !filters.responsiblePerson.includes(item.responsiblePerson)
    ) {
      return false;
    }
    if (
      filters.actionRequired !== undefined &&
      item.actionRequired !== filters.actionRequired
    ) {
      return false;
    }
    return true;
  });
}

// Calculate summary metrics
export function calculateMetrics(data: KPIItem[]): {
  total: number;
  onTrack: number;
  atRisk: number;
  offTrack: number;
  notStarted: number;
  completed: number;
  actionRequired: number;
  averageProgress: number;
} {
  const metrics = {
    total: data.length,
    onTrack: data.filter((d) => d.status === "On Track").length,
    atRisk: data.filter((d) => d.status === "At Risk").length,
    offTrack: data.filter((d) => d.status === "Off Track").length,
    notStarted: data.filter((d) => d.status === "Not Started").length,
    completed: data.filter((d) => d.status === "Completed").length,
    actionRequired: data.filter((d) => d.actionRequired).length,
    averageProgress:
      data.length > 0
        ? Math.round(
            data.reduce((sum, d) => sum + d.actualProgress, 0) / data.length,
          )
        : 0,
  };

  return metrics;
}

// Calculate delivery health data by quarter
export function calculateDeliveryHealth(
  data: KPIItem[],
): Array<{
  quarter: string;
  onTrack: number;
  atRisk: number;
  offTrack: number;
}> {
  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  return quarters.map((quarter) => {
    const quarterData = data.filter((d) => d.plannedQuarter === quarter);
    return {
      quarter,
      onTrack: quarterData.filter((d) => d.status === "On Track").length,
      atRisk: quarterData.filter((d) => d.status === "At Risk").length,
      offTrack: quarterData.filter((d) => d.status === "Off Track").length,
    };
  });
}

// Get unique values for filter options
export function getFilterOptions(data: KPIItem[]): {
  clusters: string[];
  impactAreas: string[];
  kpiTypes: string[];
  statuses: string[];
  quarters: string[];
  people: string[];
} {
  return {
    clusters: Array.from(new Set(data.map((d) => d.cluster))).sort(),
    impactAreas: Array.from(new Set(data.map((d) => d.impactArea))).sort(),
    kpiTypes: Array.from(new Set(data.map((d) => d.kpiType))).sort(),
    statuses: Array.from(new Set(data.map((d) => d.status))).sort(),
    quarters: Array.from(new Set(data.map((d) => d.plannedQuarter))).sort(),
    people: Array.from(new Set(data.map((d) => d.responsiblePerson))).sort(),
  };
}
