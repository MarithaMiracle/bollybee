"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Truck,
  Mail,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/shipping", label: "Shipping", icon: Truck },
  { href: "/admin/contacts", label: "Contacts", icon: Mail },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return null;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <aside className="hidden w-64 shrink-0 border-r border-[var(--border)] bg-white md:block">
      <div className="sticky top-0 p-6">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">Bollybee Admin</p>
        <nav className="mt-8 space-y-1">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                pathname === href
                  ? "bg-[var(--surface)] text-[var(--plum)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              {label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 flex w-full items-center gap-3 px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
