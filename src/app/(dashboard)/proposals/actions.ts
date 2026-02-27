"use server";

import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import { proposalSectionPrompt } from "@/lib/ai/prompts";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { PROPOSAL_SECTIONS } from "@/lib/proposals/sections";
import type { Grant, Organization, Proposal } from "@/types/database";

export async function createProposal(grantId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!org)
    return { error: "Set up your organization profile before starting a proposal." };

  const { data: grant } = await supabase
    .from("grants")
    .select("*")
    .eq("id", grantId)
    .single();

  if (!grant) return { error: "Grant not found" };

  // Check if a proposal already exists for this grant
  const { data: existing } = await supabase
    .from("proposals")
    .select("id")
    .eq("org_id", org.id)
    .eq("grant_id", grantId)
    .single();

  if (existing) {
    redirect(`/proposals/${existing.id}`);
  }

  // Create empty sections
  const sections: Record<string, string> = {};
  for (const section of PROPOSAL_SECTIONS) {
    sections[section.key] = "";
  }

  const { data: proposal, error } = await supabase
    .from("proposals")
    .insert({
      org_id: org.id,
      grant_id: grantId,
      title: `Proposal: ${(grant as Grant).title}`,
      status: "draft",
      sections,
      ai_suggestions: {},
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  redirect(`/proposals/${proposal.id}`);
}

export async function updateProposalSection(
  proposalId: string,
  sectionKey: string,
  content: string
) {
  const supabase = await createClient();

  const { data: proposal } = await supabase
    .from("proposals")
    .select("sections")
    .eq("id", proposalId)
    .single();

  if (!proposal) return { error: "Proposal not found" };

  const sections = (proposal.sections as Record<string, string>) || {};
  sections[sectionKey] = content;

  const { error } = await supabase
    .from("proposals")
    .update({ sections, updated_at: new Date().toISOString() })
    .eq("id", proposalId);

  if (error) return { error: error.message };

  revalidatePath(`/proposals/${proposalId}`);
  return { success: true };
}

export async function generateSection(
  proposalId: string,
  sectionKey: string
) {
  const supabase = await createClient();

  // Get proposal with grant and org
  const { data: proposal } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", proposalId)
    .single();

  if (!proposal) return { error: "Proposal not found" };

  const typedProposal = proposal as Proposal;

  const { data: grant } = await supabase
    .from("grants")
    .select("*")
    .eq("id", typedProposal.grant_id)
    .single();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!grant || !org) return { error: "Missing grant or organization data" };

  const typedGrant = grant as Grant;
  const typedOrg = org as Organization;

  const sectionDef = PROPOSAL_SECTIONS.find((s) => s.key === sectionKey);
  if (!sectionDef) return { error: "Unknown section" };

  const existingContent = typedProposal.sections[sectionKey] || undefined;

  try {
    const prompt = proposalSectionPrompt(
      typedOrg,
      typedGrant,
      sectionDef.label,
      sectionDef.description,
      existingContent
    );

    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    const generatedText = textBlock.text.trim();

    // Save the generated content
    const sections = { ...typedProposal.sections };
    sections[sectionKey] = generatedText;

    await supabase
      .from("proposals")
      .update({ sections, updated_at: new Date().toISOString() })
      .eq("id", proposalId);

    return { data: generatedText };
  } catch (e: any) {
    if (e?.status === 400 && e?.message?.includes("credit")) {
      return { error: "Anthropic API credits exhausted." };
    }
    return {
      error: `AI generation failed: ${e instanceof Error ? e.message : "Unknown error"}`,
    };
  }
}

export async function updateProposalStatus(
  proposalId: string,
  status: "draft" | "review" | "submitted"
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("proposals")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", proposalId);

  if (error) return { error: error.message };

  revalidatePath(`/proposals/${proposalId}`);
  return { success: true };
}
