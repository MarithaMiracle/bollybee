"use client";

import { usePathname } from "next/navigation";
import { AccountHeader, AccountTabs } from "@/components/account/account-nav";

export function AccountLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (
    pathname === "/account/login" ||
    pathname === "/account/forgot-password" ||
    pathname === "/account/reset-password"
  ) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-1 flex-col bg-[var(--satin-light)]">
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-8 pt-12 sm:pb-10 sm:pt-14 md:px-8 md:py-14">
        <AccountHeader />
        <AccountTabs />
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
