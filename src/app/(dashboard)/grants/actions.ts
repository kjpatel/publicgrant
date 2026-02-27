"use server";

import { revalidatePath } from "next/cache";
import { syncGrantsFromGov } from "@/lib/grants-gov/sync";
import type { SyncResult } from "@/lib/grants-gov/sync";

export async function syncGrants(): Promise<SyncResult & { error?: string }> {
  try {
    const result = await syncGrantsFromGov();
    revalidatePath("/grants");
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return { added: 0, updated: 0, total: 0, error: message };
  }
}
