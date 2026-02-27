export type OrgType =
  | "nonprofit"
  | "school_district"
  | "municipality"
  | "public_health"
  | "other";

export type FocusArea =
  | "education"
  | "health"
  | "environment"
  | "housing"
  | "workforce"
  | "infrastructure"
  | "arts_culture"
  | "public_safety"
  | "food_agriculture"
  | "technology";

export interface Organization {
  id: string;
  user_id: string;
  name: string;
  type: OrgType;
  mission: string | null;
  location: string | null;
  annual_budget: number | null;
  focus_areas: FocusArea[];
  created_at: string;
  updated_at: string;
}

export interface Grant {
  id: string;
  source: string;
  source_id: string | null;
  title: string;
  agency: string | null;
  description: string | null;
  eligibility_raw: string | null;
  eligibility_parsed: Record<string, unknown>;
  amount_min: number | null;
  amount_max: number | null;
  deadline: string | null;
  posted_date: string | null;
  category: string[];
  status: "open" | "closed" | "upcoming";
  source_url: string | null;
  ai_summary: string | null;
  created_at: string;
}

export interface GrantMatch {
  id: string;
  org_id: string;
  grant_id: string;
  fit_score: number;
  match_reasons: Record<string, unknown>[];
  disqualifiers: Record<string, unknown>[];
  created_at: string;
}

export interface Proposal {
  id: string;
  org_id: string;
  grant_id: string;
  title: string;
  status: "draft" | "review" | "submitted";
  sections: Record<string, string>;
  ai_suggestions: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
