import type { ReactNode } from "react";

type ContentProps = {
  title?: ReactNode;
  children: ReactNode;
};

export default function Content({ title, children }: ContentProps) {
  return (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {title && (
        <header className="flex shrink-0 justify-center pt-14 pb-4 text-xs text-black/70 sm:pt-4">
          {title}
        </header>
      )}
      <div className="flex min-h-0 flex-1 flex-col items-center overflow-hidden px-4 pb-4 sm:px-8">
        {children}
      </div>
    </section>
  );
}
