"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createProposal } from "../../proposals/actions";

export function StartProposalButton({ grantId }: { grantId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const result = await createProposal(grantId);
    // If we get here, redirect didn't happen, so there was an error
    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div>
      <Button onClick={handleClick} disabled={loading}>
        {loading ? "Creating..." : "Start Proposal"}
      </Button>
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
