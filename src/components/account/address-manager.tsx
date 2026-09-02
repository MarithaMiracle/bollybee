"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { saveAddress, deleteAddress, setDefaultAddress } from "@/actions/addresses";
import { useConfirm } from "@/components/ui/confirm-provider";

interface SavedAddress {
  id: string;
  label: string;
  first_name: string;
  last_name: string;
  phone: string;
  shipping_state: string;
  shipping_lga: string;
  shipping_city: string;
  shipping_address: string;
  shipping_landmark: string | null;
  shipping_postal_code: string | null;
  is_default: boolean;
}

interface AddressFormProps {
  states: { id: string; name: string }[];
}

export function AddressManager({
  initialAddresses,
  states,
}: {
  initialAddresses: SavedAddress[];
  states: { id: string; name: string }[];
}) {
  const confirm = useConfirm();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lgas, setLgas] = useState<{ id: string; name: string }[]>([]);
  const [selectedState, setSelectedState] = useState("");

  async function loadLgas(stateName: string) {
    setSelectedState(stateName);
    const state = states.find((s) => s.name === stateName);
    if (!state) return;
    const res = await fetch(`/api/shipping/lgas?state_id=${state.id}`);
    const data = await res.json();
    setLgas(data.lgas ?? []);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await saveAddress(new FormData(e.currentTarget));
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Address saved");
      setShowForm(false);
      window.location.reload();
    }
  }

  async function handleDelete(id: string, label: string) {
    const ok = await confirm({
      title: "Delete this address?",
      description: `"${label}" will be permanently removed from your saved addresses.`,
      confirmLabel: "Delete address",
      variant: "destructive",
    });
    if (!ok) return;

    await deleteAddress(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Address deleted");
  }

  async function handleSetDefault(id: string) {
    await setDefaultAddress(id);
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, is_default: a.id === id }))
    );
    toast.success("Default address updated");
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Add new address"}
      </Button>

      {showForm && (
        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]/40 p-5 md:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input id="label" name="label" defaultValue="Home" required />
            </div>
            <div className="flex items-end gap-2 pb-2">
              <input type="checkbox" id="isDefault" name="isDefault" className="h-4 w-4" />
              <Label htmlFor="isDefault">Set as default</Label>
            </div>
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" required />
            </div>
            <div>
              <Label htmlFor="shippingState">State</Label>
              <Select
                id="shippingState"
                name="shippingState"
                required
                value={selectedState}
                onChange={(e) => loadLgas(e.target.value)}
              >
                <option value="">Select state</option>
                {states.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="shippingLga">LGA</Label>
              {lgas.length > 0 ? (
                <Select
                  id="shippingLga"
                  name="shippingLga"
                  required
                  disabled={!selectedState}
                >
                  <option value="">Select LGA</option>
                  {lgas.map((l) => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
                </Select>
              ) : (
                <Input
                  id="shippingLga"
                  name="shippingLga"
                  required
                  placeholder={selectedState ? "Enter your LGA" : "Select a state first"}
                  disabled={!selectedState}
                />
              )}
            </div>
            <div>
              <Label htmlFor="shippingCity">City</Label>
              <Input id="shippingCity" name="shippingCity" required />
            </div>
            <div>
              <Label htmlFor="shippingPostalCode">Postal code</Label>
              <Input id="shippingPostalCode" name="shippingPostalCode" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="shippingAddress">Address</Label>
              <Input id="shippingAddress" name="shippingAddress" required />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="shippingLandmark">Landmark</Label>
              <Input id="shippingLandmark" name="shippingLandmark" />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save address"}
          </Button>
        </form>
      )}

      {!addresses.length ? (
        <p className="text-sm text-[var(--muted-foreground)]">No saved addresses yet.</p>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {addresses.map((a) => (
            <li key={a.id} className="py-5 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {a.label}
                    {a.is_default && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-[var(--plum)]">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="mt-1 break-words text-sm">{a.first_name} {a.last_name} · {a.phone}</p>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                    {a.shipping_address}, {a.shipping_city}<br />
                    {a.shipping_lga}, {a.shipping_state}
                  </p>
                </div>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                  {!a.is_default && (
                    <Button type="button" variant="outline" size="sm" onClick={() => handleSetDefault(a.id)}>
                      Set default
                    </Button>
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={() => handleDelete(a.id, a.label)}>
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
