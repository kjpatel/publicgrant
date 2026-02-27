import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Grant } from "@/types/database";
import { AIAnalysis } from "./ai-analysis";
import { StartProposalButton } from "./start-proposal-button";

function formatCurrency(amount: number | null) {
  if (!amount) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function GrantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("grants")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const grant = data as Grant;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back link */}
      <Link
        href="/grants"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to Grants
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold">{grant.title}</h1>
          <Badge
            variant={
              grant.status === "open"
                ? "default"
                : grant.status === "upcoming"
                  ? "secondary"
                  : "outline"
            }
          >
            {grant.status}
          </Badge>
        </div>
        <p className="text-muted-foreground">{grant.agency}</p>
        <div className="flex flex-wrap gap-1">
          {grant.category.map((cat) => (
            <Badge key={cat} variant="outline" className="text-xs">
              {cat.replace("_", " ")}
            </Badge>
          ))}
        </div>
      </div>

      {/* Key details */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
              Funding Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {formatCurrency(grant.amount_min)} –{" "}
              {formatCurrency(grant.amount_max)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
              Deadline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {formatDate(grant.deadline)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
              Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold capitalize">
              {grant.source.replace("_", " ")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Description */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Description</h2>
        <p className="leading-relaxed text-muted-foreground">
          {grant.description}
        </p>
      </div>

      {/* Eligibility */}
      {grant.eligibility_raw && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Eligibility</h2>
          <p className="leading-relaxed text-muted-foreground">
            {grant.eligibility_raw}
          </p>
        </div>
      )}

      {/* AI Analysis */}
      <AIAnalysis
        grantId={grant.id}
        cachedSummary={grant.ai_summary ? JSON.parse(grant.ai_summary) : null}
        cachedEligibility={
          grant.eligibility_parsed &&
          typeof grant.eligibility_parsed === "object" &&
          "org_types" in grant.eligibility_parsed
            ? (grant.eligibility_parsed as any)
            : null
        }
      />

      {/* Actions */}
      {grant.status === "open" && (
        <div className="flex gap-3">
          <StartProposalButton grantId={grant.id} />
          {grant.source_url && (
            <a href={grant.source_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">View Original</Button>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
