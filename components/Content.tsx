import type { ReactNode } from "react";

type ContentProps = {
  title?: ReactNode;
  children: ReactNode;
};

export default function Content({ title, children }: ContentProps) {
  return (
    <section className="flex min-w-0 flex-1 flex-col">
      {title && (
        <header className="flex justify-center pt-4 pb-6 text-xs text-black/70">
          {title}
        </header>
      )}
      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-24">
        {children}
      </div>
    </section>
  );
}
