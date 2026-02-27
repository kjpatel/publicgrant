import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Proposal, Grant } from "@/types/database";
import { ProposalEditor } from "./proposal-editor";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("proposals")
    .select("*, grants(title, agency, deadline)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const proposal = data as Proposal & { grants: Pick<Grant, "title" | "agency" | "deadline"> };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/proposals"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to Proposals
      </Link>

      <ProposalEditor
        proposalId={proposal.id}
        title={proposal.title}
        status={proposal.status}
        sections={proposal.sections}
        grantTitle={proposal.grants.title}
        grantAgency={proposal.grants.agency}
      />
    </div>
  );
}
