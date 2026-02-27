import type { Organization, Grant } from "@/types/database";

export function grantSummaryPrompt(grant: Grant) {
  return {
    system: `You are a grant analyst helping nonprofits and public agencies understand funding opportunities. Summarize grants in clear, plain English. Be concise and actionable.`,
    user: `Summarize this grant opportunity in plain English. Focus on what the grant funds, who it's for, and what makes a strong applicant.

GRANT TITLE: ${grant.title}
AGENCY: ${grant.agency}
FUNDING: $${grant.amount_min?.toLocaleString()} – $${grant.amount_max?.toLocaleString()}
DEADLINE: ${grant.deadline}

DESCRIPTION:
${grant.description}

ELIGIBILITY:
${grant.eligibility_raw}

Respond with JSON in this exact format:
{
  "summary": "2-3 sentence plain English summary",
  "key_requirements": ["requirement 1", "requirement 2", ...],
  "ideal_applicant": "1 sentence describing the ideal applicant",
  "tips": ["tip 1", "tip 2"]
}`,
  };
}

export function eligibilityExtractionPrompt(grant: Grant) {
  return {
    system: `You are a grant eligibility specialist. Extract and structure eligibility criteria from grant descriptions. Be precise and thorough.`,
    user: `Extract the structured eligibility criteria from this grant.

GRANT: ${grant.title}
AGENCY: ${grant.agency}

ELIGIBILITY TEXT:
${grant.eligibility_raw}

Respond with JSON in this exact format:
{
  "org_types": ["list of eligible organization types"],
  "requirements": ["specific requirement 1", "specific requirement 2", ...],
  "disqualifiers": ["what would disqualify an applicant"],
  "preferred": ["preferred but not required qualifications"],
  "min_budget": null or number,
  "geographic": "geographic restrictions or null"
}`,
  };
}

export function fitScoringPrompt(org: Organization, grant: Grant) {
  return {
    system: `You are a grant matching specialist. Score how well an organization fits a grant opportunity. Be honest and specific about both strengths and gaps.`,
    user: `Score how well this organization matches this grant opportunity.

ORGANIZATION:
- Name: ${org.name}
- Type: ${org.type}
- Mission: ${org.mission}
- Location: ${org.location}
- Annual Budget: $${org.annual_budget?.toLocaleString()}
- Focus Areas: ${org.focus_areas.join(", ")}

GRANT:
- Title: ${grant.title}
- Agency: ${grant.agency}
- Funding: $${grant.amount_min?.toLocaleString()} – $${grant.amount_max?.toLocaleString()}
- Categories: ${grant.category.join(", ")}

ELIGIBILITY:
${grant.eligibility_raw}

Respond with JSON in this exact format:
{
  "fit_score": <number 0-100>,
  "strengths": ["why this org is a good fit"],
  "gaps": ["potential concerns or missing qualifications"],
  "recommendation": "1-2 sentence recommendation on whether to apply"
}`,
  };
}

export function proposalSectionPrompt(
  org: Organization,
  grant: Grant,
  sectionName: string,
  sectionDescription: string,
  existingContent?: string
) {
  return {
    system: `You are an expert grant writer who helps nonprofits and public agencies write winning proposals. Write in a professional but accessible style. Be specific, use data when available, and align the proposal with the grant's priorities.`,
    user: `Write the "${sectionName}" section of a grant proposal.

ORGANIZATION:
- Name: ${org.name}
- Type: ${org.type}
- Mission: ${org.mission}
- Location: ${org.location}
- Annual Budget: $${org.annual_budget?.toLocaleString()}
- Focus Areas: ${org.focus_areas.join(", ")}

GRANT:
- Title: ${grant.title}
- Agency: ${grant.agency}
- Funding: $${grant.amount_min?.toLocaleString()} – $${grant.amount_max?.toLocaleString()}
- Description: ${grant.description}
- Eligibility: ${grant.eligibility_raw}

SECTION TO WRITE: ${sectionName}
SECTION DESCRIPTION: ${sectionDescription}
${existingContent ? `\nEXISTING DRAFT (improve this):\n${existingContent}` : ""}

Write 2-4 paragraphs for this section. Be specific to both the organization and the grant requirements. Do NOT wrap in JSON — return plain text only.`,
  };
}
