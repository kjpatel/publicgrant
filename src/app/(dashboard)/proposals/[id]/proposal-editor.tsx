"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  updateProposalSection,
  generateSection,
  updateProposalStatus,
} from "../actions";
import { PROPOSAL_SECTIONS } from "@/lib/proposals/sections";

interface ProposalEditorProps {
  proposalId: string;
  title: string;
  status: "draft" | "review" | "submitted";
  sections: Record<string, string>;
  grantTitle: string;
  grantAgency: string | null;
}

function statusVariant(status: string) {
  if (status === "draft") return "secondary" as const;
  if (status === "review") return "default" as const;
  return "outline" as const;
}

export function ProposalEditor({
  proposalId,
  title,
  status: initialStatus,
  sections: initialSections,
  grantTitle,
  grantAgency,
}: ProposalEditorProps) {
  const [sections, setSections] = useState<Record<string, string>>(
    initialSections || {}
  );
  const [status, setStatus] = useState(initialStatus);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filledCount = Object.values(sections).filter(
    (v) => v && v.length > 0
  ).length;

  async function handleGenerate(sectionKey: string) {
    setGenerating(sectionKey);
    setError(null);
    const result = await generateSection(proposalId, sectionKey);
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setSections((prev) => ({ ...prev, [sectionKey]: result.data! }));
    }
    setGenerating(null);
  }

  async function handleSave(sectionKey: string) {
    setSaving(sectionKey);
    setError(null);
    const result = await updateProposalSection(
      proposalId,
      sectionKey,
      sections[sectionKey] || ""
    );
    if (result.error) {
      setError(result.error);
    }
    setSaving(null);
  }

  async function handleStatusChange(newStatus: "draft" | "review" | "submitted") {
    const result = await updateProposalStatus(proposalId, newStatus);
    if (result.error) {
      setError(result.error);
    } else {
      setStatus(newStatus);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {grantAgency} &middot; {filledCount}/{PROPOSAL_SECTIONS.length}{" "}
            sections drafted
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(status)}>{status}</Badge>
          {status === "draft" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("review")}
            >
              Mark for Review
            </Button>
          )}
          {status === "review" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("draft")}
            >
              Back to Draft
            </Button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Sections */}
      {PROPOSAL_SECTIONS.map((sectionDef) => {
        const content = sections[sectionDef.key] || "";
        const isActive = activeSection === sectionDef.key;
        const isGenerating = generating === sectionDef.key;
        const isSaving = saving === sectionDef.key;

        return (
          <Card key={sectionDef.key}>
            <CardHeader
              className="cursor-pointer"
              onClick={() =>
                setActiveSection(isActive ? null : sectionDef.key)
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">
                    {sectionDef.label}
                  </CardTitle>
                  {content ? (
                    <Badge variant="secondary" className="text-xs">
                      drafted
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      empty
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {isActive ? "▲" : "▼"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {sectionDef.description}
              </p>
            </CardHeader>

            {isActive && (
              <CardContent className="space-y-3">
                <Textarea
                  value={content}
                  onChange={(e) =>
                    setSections((prev) => ({
                      ...prev,
                      [sectionDef.key]: e.target.value,
                    }))
                  }
                  placeholder={`Write your ${sectionDef.label.toLowerCase()} here, or click "Generate with AI" to get a draft...`}
                  rows={12}
                  className="font-mono text-sm"
                />
                <div className="flex items-center justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerate(sectionDef.key)}
                    disabled={generating !== null}
                  >
                    {isGenerating
                      ? "Generating..."
                      : content
                        ? "Regenerate with AI"
                        : "Generate with AI"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSave(sectionDef.key)}
                    disabled={saving !== null}
                  >
                    {isSaving ? "Saving..." : "Save Section"}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Generating indicator */}
      {generating && (
        <Card>
          <CardContent className="py-4">
            <p className="text-center text-sm text-muted-foreground animate-pulse">
              AI is writing your{" "}
              {PROPOSAL_SECTIONS.find((s) => s.key === generating)?.label}...
              This may take 10-15 seconds.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
