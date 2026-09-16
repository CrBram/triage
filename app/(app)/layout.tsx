import Logo from "@/components/Logo";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative flex flex-1 flex-col p-4">
      <div className="absolute top-4 left-8 z-10">
        <Logo />
      </div>
      {children}
    </div>
  );
}
