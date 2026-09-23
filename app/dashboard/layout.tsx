import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-1 gap-4 overflow-hidden p-4">
      <Sidebar />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-2 sm:px-6">
        {children}
      </main>
    </div>
  );
}
