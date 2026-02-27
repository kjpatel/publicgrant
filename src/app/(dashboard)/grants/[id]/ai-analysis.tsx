"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyzeGrant, extractEligibility, scoreGrantFit } from "./actions";

interface SummaryResult {
  summary: string;
  key_requirements: string[];
  ideal_applicant: string;
  tips: string[];
}

interface EligibilityResult {
  org_types: string[];
  requirements: string[];
  disqualifiers: string[];
  preferred: string[];
  min_budget: number | null;
  geographic: string | null;
}

interface FitResult {
  fit_score: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

function scoreColor(score: number) {
  if (score >= 75) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-600";
}

export function AIAnalysis({
  grantId,
  cachedSummary,
  cachedEligibility,
}: {
  grantId: string;
  cachedSummary: SummaryResult | null;
  cachedEligibility: EligibilityResult | null;
}) {
  const [summary, setSummary] = useState<SummaryResult | null>(cachedSummary);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(
    cachedEligibility
  );
  const [fitScore, setFitScore] = useState<FitResult | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setLoading("summary");
    setError(null);
    const result = await analyzeGrant(grantId);
    if (result.error) setError(result.error);
    else setSummary(result.data);
    setLoading(null);
  }

  async function handleEligibility() {
    setLoading("eligibility");
    setError(null);
    const result = await extractEligibility(grantId);
    if (result.error) setError(result.error);
    else setEligibility(result.data);
    setLoading(null);
  }

  async function handleFitScore() {
    setLoading("fit");
    setError(null);
    const result = await scoreGrantFit(grantId);
    if (result.error) setError(result.error);
    else setFitScore(result.data);
    setLoading(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">AI Analysis</h2>
        <div className="flex gap-2">
          {!summary && (
            <Button
              size="sm"
              onClick={handleAnalyze}
              disabled={loading !== null}
            >
              {loading === "summary" ? "Analyzing..." : "Summarize"}
            </Button>
          )}
          {!eligibility && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleEligibility}
              disabled={loading !== null}
            >
              {loading === "eligibility"
                ? "Extracting..."
                : "Extract Eligibility"}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleFitScore}
            disabled={loading !== null}
          >
            {loading === "fit" ? "Scoring..." : "Score Fit"}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plain English Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed">{summary.summary}</p>
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                Key Requirements
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {summary.key_requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                Ideal Applicant
              </p>
              <p className="text-sm text-muted-foreground">
                {summary.ideal_applicant}
              </p>
            </div>
            {summary.tips.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                  Tips
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {summary.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Eligibility */}
      {eligibility && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Structured Eligibility Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                Eligible Organization Types
              </p>
              <div className="flex flex-wrap gap-1">
                {eligibility.org_types.map((type, i) => (
                  <Badge key={i} variant="secondary">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                Requirements
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {eligibility.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
            {eligibility.disqualifiers.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                  Disqualifiers
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-destructive/80">
                  {eligibility.disqualifiers.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
            {eligibility.preferred.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                  Preferred (Not Required)
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {eligibility.preferred.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            {eligibility.geographic && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Geographic: </span>
                {eligibility.geographic}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fit Score */}
      {fitScore && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Organization Fit Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <span
                className={`text-4xl font-bold ${scoreColor(fitScore.fit_score)}`}
              >
                {fitScore.fit_score}
              </span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <p className="text-sm leading-relaxed">
              {fitScore.recommendation}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                  Strengths
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-green-700">
                  {fitScore.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                  Gaps
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-yellow-700">
                  {fitScore.gaps.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!summary && !eligibility && !fitScore && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-6">
            <p className="text-center text-sm text-muted-foreground">
              Click the buttons above to run AI analysis on this grant.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {loading && (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-sm text-muted-foreground animate-pulse">
              {loading === "summary" && "Analyzing grant with AI..."}
              {loading === "eligibility" && "Extracting eligibility criteria..."}
              {loading === "fit" && "Scoring fit against your organization..."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
