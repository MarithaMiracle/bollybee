"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StateOption {
  id: string;
  name: string;
}

interface LgaOption {
  id: string;
  name: string;
  state_id: string;
}

interface ShippingCreateFormProps {
  states: StateOption[];
  lgas: LgaOption[];
}

export function ShippingCreateForm({ states, lgas }: ShippingCreateFormProps) {
  const [stateId, setStateId] = useState("");

  const filteredLgas = useMemo(
    () => lgas.filter((l) => l.state_id === stateId),
    [lgas, stateId]
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <Label htmlFor="stateId">State</Label>
        <Select
          id="stateId"
          name="stateId"
          required
          value={stateId}
          onChange={(e) => setStateId(e.target.value)}
        >
          <option value="">Select state</option>
          {states.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="lgaId">LGA (optional)</Label>
        <Select id="lgaId" name="lgaId" disabled={!stateId}>
          <option value="">State-wide rate</option>
          {filteredLgas.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="price">Price (₦)</Label>
        <Input id="price" name="price" type="number" min={0} step={100} required placeholder="2500" />
      </div>
      <div className="flex items-end">
        <Button type="submit" className="w-full sm:w-auto">
          Add rate
        </Button>
      </div>
    </div>
  );
}
