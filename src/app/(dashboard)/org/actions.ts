"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { OrgType, FocusArea } from "@/types/database";

interface OrgFormData {
  name: string;
  type: OrgType;
  mission: string;
  location: string;
  annual_budget: string;
  focus_areas: FocusArea[];
}

export async function saveOrganization(data: OrgFormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check if org already exists for this user
  const { data: existing } = await supabase
    .from("organizations")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const orgData = {
    name: data.name,
    type: data.type,
    mission: data.mission || null,
    location: data.location || null,
    annual_budget: data.annual_budget ? parseFloat(data.annual_budget) : null,
    focus_areas: data.focus_areas,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabase
      .from("organizations")
      .update(orgData)
      .eq("id", existing.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("organizations")
      .insert({ ...orgData, user_id: user.id });

    if (error) return { error: error.message };
  }

  revalidatePath("/org");
  revalidatePath("/dashboard");
  return { success: true };
}
