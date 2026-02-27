import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function statusVariant(status: string) {
  if (status === "draft") return "secondary" as const;
  if (status === "review") return "default" as const;
  return "outline" as const;
}

export default async function ProposalsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let proposals: any[] = [];

  if (user) {
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (org) {
      const { data } = await supabase
        .from("proposals")
        .select("*, grants(title, agency, deadline)")
        .eq("org_id", org.id)
        .order("updated_at", { ascending: false });

      proposals = data ?? [];
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Proposals</h1>
        <p className="text-muted-foreground">
          Your grant proposal drafts.
        </p>
      </div>

      {proposals.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8">
            <p className="text-center text-sm text-muted-foreground">
              No proposals yet. Go to a{" "}
              <Link href="/grants" className="underline hover:text-foreground">
                grant
              </Link>{" "}
              and click &quot;Start Proposal&quot; to begin.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => {
            const grant = proposal.grants;
            const filledSections = Object.values(
              (proposal.sections as Record<string, string>) || {}
            ).filter((v) => v && (v as string).length > 0).length;

            return (
              <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-base">
                        {proposal.title}
                      </CardTitle>
                      <Badge variant={statusVariant(proposal.status)}>
                        {proposal.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {grant?.agency}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{filledSections}/6 sections drafted</span>
                      {grant?.deadline && (
                        <span>
                          Deadline:{" "}
                          {new Date(grant.deadline).toLocaleDateString()}
                        </span>
                      )}
                      <span>
                        Updated:{" "}
                        {new Date(proposal.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
