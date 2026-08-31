import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <AdminSidebar />
      <main className="min-w-0 md:pl-64">
        <div className="mx-auto max-w-6xl p-4 sm:p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}
