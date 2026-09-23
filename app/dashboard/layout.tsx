import Sidebar from "@/components/Sidebar";
import { ActiveInstanceProvider } from "@/components/ActiveInstanceProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ActiveInstanceProvider>
      <div className="flex min-h-dvh gap-4 p-4">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-2 sm:px-6">{children}</main>
      </div>
    </ActiveInstanceProvider>
  );
}
