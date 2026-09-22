import Logo from "@/components/Logo";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden p-4">
      <div className="absolute top-4 left-8 z-10">
        <Logo />
      </div>
      {children}
    </div>
  );
}
