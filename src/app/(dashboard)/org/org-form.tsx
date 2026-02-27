"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { saveOrganization } from "./actions";
import type { Organization, OrgType, FocusArea } from "@/types/database";

const ORG_TYPES: { value: OrgType; label: string }[] = [
  { value: "nonprofit", label: "Nonprofit" },
  { value: "school_district", label: "School District" },
  { value: "municipality", label: "Municipality" },
  { value: "public_health", label: "Public Health Org" },
  { value: "other", label: "Other" },
];

const FOCUS_AREAS: { value: FocusArea; label: string }[] = [
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "environment", label: "Environment" },
  { value: "housing", label: "Housing" },
  { value: "workforce", label: "Workforce" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "arts_culture", label: "Arts & Culture" },
  { value: "public_safety", label: "Public Safety" },
  { value: "food_agriculture", label: "Food & Agriculture" },
  { value: "technology", label: "Technology" },
];

export function OrgForm({ org }: { org: Organization | null }) {
  const [name, setName] = useState(org?.name ?? "");
  const [type, setType] = useState<OrgType>(org?.type ?? "nonprofit");
  const [mission, setMission] = useState(org?.mission ?? "");
  const [location, setLocation] = useState(org?.location ?? "");
  const [annualBudget, setAnnualBudget] = useState(
    org?.annual_budget?.toString() ?? ""
  );
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>(
    org?.focus_areas ?? []
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function toggleFocusArea(area: FocusArea) {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const result = await saveOrganization({
      name,
      type,
      mission,
      location,
      annual_budget: annualBudget,
      focus_areas: focusAreas,
    });

    setSaving(false);

    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage("Organization saved successfully.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sunrise Community Foundation"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Organization Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as OrgType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORG_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (State / Region)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. California"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Annual Budget ($)</Label>
            <Input
              id="budget"
              type="number"
              value={annualBudget}
              onChange={(e) => setAnnualBudget(e.target.value)}
              placeholder="e.g. 500000"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            placeholder="Describe your organization's mission and the communities you serve..."
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Focus Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            Select all areas your organization works in. These help match you
            with relevant grants.
          </p>
          <div className="flex flex-wrap gap-2">
            {FOCUS_AREAS.map((area) => (
              <Badge
                key={area.value}
                variant={
                  focusAreas.includes(area.value) ? "default" : "outline"
                }
                className="cursor-pointer select-none"
                onClick={() => toggleFocusArea(area.value)}
              >
                {area.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {message && (
        <p
          className={`text-sm ${message.includes("success") ? "text-green-600" : "text-destructive"}`}
        >
          {message}
        </p>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : org ? "Update Organization" : "Save Organization"}
      </Button>
    </form>
  );
}
