import { createClient } from "@/lib/supabase/server";
import { OrgForm } from "./org-form";
import type { Organization } from "@/types/database";

export default async function OrgPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let org: Organization | null = null;

  if (user) {
    const { data } = await supabase
      .from("organizations")
      .select("*")
      .eq("user_id", user.id)
      .single();

    org = data as Organization | null;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Organization Profile</h1>
        <p className="text-muted-foreground">
          Tell us about your organization so we can match you with relevant
          grants.
        </p>
      </div>
      <OrgForm org={org} />
    </div>
  );
}
