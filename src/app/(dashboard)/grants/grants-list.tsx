"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Grant } from "@/types/database";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
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

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "upcoming", label: "Upcoming" },
  { value: "closed", label: "Closed" },
];

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
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusColor(status: string) {
  switch (status) {
    case "open":
      return "default";
    case "upcoming":
      return "secondary";
    case "closed":
      return "outline";
    default:
      return "outline";
  }
}

export function GrantsList({
  grants,
  initialQuery,
  initialStatus,
  initialCategory,
}: {
  grants: Grant[];
  initialQuery: string;
  initialStatus: string;
  initialCategory: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/grants?${params.toString()}`);
    },
    [router, searchParams]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams("q", query);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex-1">
          <Input
            placeholder="Search grants..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-[200px]"
          />
        </form>
        <Select
          defaultValue={initialStatus}
          onValueChange={(v) => updateParams("status", v)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          defaultValue={initialCategory || "all"}
          onValueChange={(v) => updateParams("category", v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {grants.length} grant{grants.length !== 1 ? "s" : ""} found
      </p>

      {/* Grant cards */}
      <div className="space-y-3">
        {grants.map((grant) => (
          <Link key={grant.id} href={`/grants/${grant.id}`}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{grant.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {grant.agency}
                    </p>
                  </div>
                  <Badge variant={statusColor(grant.status)}>
                    {grant.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    {formatCurrency(grant.amount_min)} –{" "}
                    {formatCurrency(grant.amount_max)}
                  </span>
                  <span>Deadline: {formatDate(grant.deadline)}</span>
                  <span className="capitalize">
                    {grant.source.replace("_", " ")}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {grant.category.map((cat) => (
                    <Badge key={cat} variant="outline" className="text-xs">
                      {cat.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {grants.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            No grants match your search criteria.
          </p>
        )}
      </div>
    </div>
  );
}
