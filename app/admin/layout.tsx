import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="dark" className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 min-w-0 lg:ml-0">
          {children}
        </main>
      </div>
    </div>
  );
}
