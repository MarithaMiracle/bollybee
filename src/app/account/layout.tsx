import { AccountLayoutShell } from "@/components/account/account-layout-shell";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountLayoutShell>{children}</AccountLayoutShell>;
}
