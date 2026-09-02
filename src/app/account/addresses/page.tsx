import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { AddressManager } from "@/components/account/address-manager";
import { getSavedAddresses } from "@/actions/addresses";

export const dynamic = "force-dynamic";

export default async function AccountAddressesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");

  const [addresses, statesRes] = await Promise.all([
    getSavedAddresses(),
    createServiceClient().from("states").select("id, name").eq("active", true).order("name"),
  ]);

  return (
    <>
      <p className="text-sm text-[var(--muted-foreground)]">
        Your default address is used at checkout.
      </p>
      <div className="mt-6">
        <AddressManager initialAddresses={addresses} states={statesRes.data ?? []} />
      </div>
    </>
  );
}
