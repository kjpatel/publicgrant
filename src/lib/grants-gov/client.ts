import type { Grant } from "@/types/database";

const GRANTS_GOV_API = "https://api.grants.gov/v1/api";

export interface GrantsGovHit {
  id: string;
  number: string;
  title: string;
  agencyCode: string;
  agencyName: string;
  openDate: string; // MM/DD/YYYY
  closeDate: string; // MM/DD/YYYY
  oppStatus: string; // posted, forecasted, closed, archived
  docType: string;
  alnList: string[];
  fundingCategories?: string;
}

export interface GrantsGovSearchResponse {
  errorcode: number;
  msg: string;
  data: {
    hitCount: number;
    startRecord: number;
    oppHits: GrantsGovHit[];
  };
}

// Maps Grants.gov funding category codes to our FocusArea values
const CATEGORY_MAP: Record<string, string> = {
  ED: "education",
  HL: "health",
  ENV: "environment",
  HO: "housing",
  ELT: "workforce",
  IIJ: "infrastructure",
  AR: "arts_culture",
  LAW: "public_safety",
  FN: "food_agriculture",
  ST: "technology",
  NR: "environment", // Natural Resources → environment
  RD: "infrastructure", // Rural Development → infrastructure
  CD: "housing", // Community Development → housing
};

function parseMmDdYyyy(dateStr: string): string | null {
  if (!dateStr) return null;
  const [month, day, year] = dateStr.split("/");
  if (!month || !day || !year) return null;
  return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00Z`).toISOString();
}

function mapCategories(fundingCategories: string | undefined): string[] {
  if (!fundingCategories) return [];
  return fundingCategories
    .split("|")
    .map((code) => CATEGORY_MAP[code.trim()])
    .filter(Boolean) as string[];
}

export function mapHitToGrant(hit: GrantsGovHit): Omit<Grant, "id" | "created_at" | "eligibility_parsed" | "ai_summary"> {
  return {
    source: "grants_gov",
    source_id: hit.id,
    title: hit.title,
    agency: hit.agencyName || null,
    description: null,
    eligibility_raw: null,
    amount_min: null,
    amount_max: null,
    deadline: parseMmDdYyyy(hit.closeDate),
    posted_date: parseMmDdYyyy(hit.openDate),
    category: mapCategories(hit.fundingCategories),
    status: "open",
    source_url: `https://grants.gov/search-results-detail/${hit.id}`,
  };
}

export async function searchGrantsGov(
  startRecord: number,
  rows: number
): Promise<GrantsGovSearchResponse> {
  const response = await fetch(`${GRANTS_GOV_API}/search2`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      oppStatuses: "posted",
      startRecordNum: startRecord,
      rows,
    }),
    // Don't cache — we always want fresh data during a sync
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Grants.gov API error: ${response.status} ${response.statusText}`);
  }

  const data: GrantsGovSearchResponse = await response.json();

  if (data.errorcode !== 0) {
    throw new Error(`Grants.gov API returned error: ${data.msg}`);
  }

  return data;
}
