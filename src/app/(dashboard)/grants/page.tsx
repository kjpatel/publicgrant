import { createClient } from "@/lib/supabase/server";
import { GrantsList } from "./grants-list";
import { SyncButton } from "./sync-button";
import type { Grant } from "@/types/database";

export default async function GrantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("grants")
    .select("*")
    .order("deadline", { ascending: true });

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  if (params.category && params.category !== "all") {
    query = query.contains("category", [params.category]);
  }

  if (params.q) {
    query = query.or(
      `title.ilike.%${params.q}%,agency.ilike.%${params.q}%,description.ilike.%${params.q}%`
    );
  }

  const { data } = await query;
  const grants = (data ?? []) as Grant[];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Grants</h1>
          <p className="text-muted-foreground">
            Browse and search available funding opportunities.
          </p>
        </div>
        <SyncButton />
      </div>
      <GrantsList
        grants={grants}
        initialQuery={params.q ?? ""}
        initialStatus={params.status ?? "all"}
        initialCategory={params.category ?? ""}
      />
    </div>
  );
}
