import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 gap-4 p-4">
      {/* <Sidebar /> */}
      {children}
    </div>
  );
}
