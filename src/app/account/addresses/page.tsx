import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { AccountNav } from "@/components/account/account-nav";
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
    <div className="mx-auto max-w-2xl px-4 py-16">
      <AccountNav active="/account/addresses" />
      <h1 className="font-display text-3xl">Saved Addresses</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Your default address is used at checkout.
      </p>
      <div className="mt-8">
        <AddressManager initialAddresses={addresses} states={statesRes.data ?? []} />
      </div>
    </div>
  );
}
