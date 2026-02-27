import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-xl font-bold">PublicGrant</span>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Find and win grants with AI
          </h1>
          <p className="text-lg text-muted-foreground">
            PublicGrant helps nonprofits, school districts, and public agencies
            discover funding opportunities, understand eligibility, and draft
            stronger proposals — powered by AI.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/signup">
            <Button size="lg">Start Free</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Log in
            </Button>
          </Link>
        </div>

        {/* Value props */}
        <div className="mt-16 grid max-w-4xl gap-8 sm:grid-cols-3">
          <div className="space-y-2">
            <h3 className="font-semibold">Discover</h3>
            <p className="text-sm text-muted-foreground">
              Search federal, state, and foundation grants matched to your
              organization&apos;s mission.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Understand</h3>
            <p className="text-sm text-muted-foreground">
              AI translates dense RFP language into plain English and extracts
              eligibility criteria.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Apply</h3>
            <p className="text-sm text-muted-foreground">
              Generate draft proposals tailored to your org profile and grant
              requirements.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-4 text-center text-sm text-muted-foreground">
        PublicGrant — AI-powered grant intelligence for social good.
      </footer>
    </div>
  );
}
