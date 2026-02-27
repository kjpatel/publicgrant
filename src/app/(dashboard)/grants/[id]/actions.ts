"use server";

import { getAnthropicClient } from "@/lib/ai/anthropic";
import {
  grantSummaryPrompt,
  eligibilityExtractionPrompt,
  fitScoringPrompt,
} from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";
import type { Grant, Organization } from "@/types/database";

async function callClaude(system: string, user: string) {
  const client = getAnthropicClient();

  let response;
  try {
    response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system,
      messages: [{ role: "user", content: user }],
    });
  } catch (apiError: any) {
    if (apiError?.status === 400 && apiError?.message?.includes("credit")) {
      throw new Error("Anthropic API credits exhausted. Please add credits to your account.");
    }
    throw new Error(apiError?.message || "Failed to call Claude API");
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Extract JSON from the response (handle markdown code blocks)
  let jsonStr = textBlock.text;
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  return JSON.parse(jsonStr.trim());
}

export async function analyzeGrant(grantId: string) {
  const supabase = await createClient();

  const { data: grant } = await supabase
    .from("grants")
    .select("*")
    .eq("id", grantId)
    .single();

  if (!grant) return { error: "Grant not found" };

  const typedGrant = grant as Grant;

  try {
    const prompt = grantSummaryPrompt(typedGrant);
    const result = await callClaude(prompt.system, prompt.user);

    // Cache the summary in the database
    await supabase
      .from("grants")
      .update({ ai_summary: JSON.stringify(result) })
      .eq("id", grantId);

    return { data: result };
  } catch (e) {
    return { error: `AI analysis failed: ${e instanceof Error ? e.message : "Unknown error"}` };
  }
}

export async function extractEligibility(grantId: string) {
  const supabase = await createClient();

  const { data: grant } = await supabase
    .from("grants")
    .select("*")
    .eq("id", grantId)
    .single();

  if (!grant) return { error: "Grant not found" };

  const typedGrant = grant as Grant;

  try {
    const prompt = eligibilityExtractionPrompt(typedGrant);
    const result = await callClaude(prompt.system, prompt.user);

    // Cache parsed eligibility
    await supabase
      .from("grants")
      .update({ eligibility_parsed: result })
      .eq("id", grantId);

    return { data: result };
  } catch (e) {
    return { error: `Eligibility extraction failed: ${e instanceof Error ? e.message : "Unknown error"}` };
  }
}

export async function scoreGrantFit(grantId: string) {
  const supabase = await createClient();

  // Get user's org
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!org) return { error: "No organization profile found. Set up your org profile first." };

  const { data: grant } = await supabase
    .from("grants")
    .select("*")
    .eq("id", grantId)
    .single();

  if (!grant) return { error: "Grant not found" };

  const typedOrg = org as Organization;
  const typedGrant = grant as Grant;

  try {
    const prompt = fitScoringPrompt(typedOrg, typedGrant);
    const result = await callClaude(prompt.system, prompt.user);

    // Save match score
    await supabase.from("grant_matches").upsert(
      {
        org_id: typedOrg.id,
        grant_id: grantId,
        fit_score: result.fit_score,
        match_reasons: result.strengths,
        disqualifiers: result.gaps,
      },
      { onConflict: "org_id,grant_id" }
    );

    return { data: result };
  } catch (e) {
    return { error: `Fit scoring failed: ${e instanceof Error ? e.message : "Unknown error"}` };
  }
}
