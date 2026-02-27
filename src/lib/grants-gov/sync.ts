import { createAdminClient } from "@/lib/supabase/admin";
import { searchGrantsGov, mapHitToGrant } from "./client";

const PAGE_SIZE = 100;
const MAX_GRANTS = 10_000;

export interface SyncResult {
  added: number;
  updated: number;
  total: number;
}

export async function syncGrantsFromGov(): Promise<SyncResult> {
  const supabase = createAdminClient();

  let added = 0;
  let updated = 0;
  let startRecord = 0;
  let totalHits = Infinity;

  while (startRecord < totalHits && startRecord < MAX_GRANTS) {
    const response = await searchGrantsGov(startRecord, PAGE_SIZE);
    totalHits = response.data.hitCount;

    const hits = response.data.oppHits;
    if (hits.length === 0) break;

    const grants = hits.map(mapHitToGrant);

    // Upsert using the unique constraint on (source, source_id).
    // ignoreDuplicates: false means we update on conflict.
    // We explicitly list columns to avoid overwriting cached AI data (ai_summary, eligibility_parsed).
    const { data: upserted, error } = await supabase
      .from("grants")
      .upsert(grants, {
        onConflict: "source,source_id",
        ignoreDuplicates: false,
      })
      .select("id, created_at");

    if (error) {
      throw new Error(`Supabase upsert error: ${error.message}`);
    }

    // Supabase doesn't distinguish inserts from updates in upsert responses,
    // so we approximate: compare created_at freshness (within last 10 seconds = new insert)
    const now = Date.now();
    for (const row of upserted ?? []) {
      const age = now - new Date(row.created_at).getTime();
      if (age < 10_000) {
        added++;
      } else {
        updated++;
      }
    }

    startRecord += hits.length;
  }

  return { added, updated, total: startRecord };
}
