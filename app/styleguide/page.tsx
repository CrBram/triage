const colors = [
  { name: "background", hex: "#CEDCD1", className: "bg-background" },
  { name: "black", hex: "#181818", className: "bg-black" },
  { name: "accent", hex: "#98CDFF", className: "bg-accent" },
  { name: "success", hex: "#26AE60", className: "bg-success" },
  { name: "warning", hex: "#E2B93A", className: "bg-warning" },
  { name: "error", hex: "#FF6060", className: "bg-error" },
];

export default function StyleguidePage() {
  return (
    <main className="flex flex-1 w-full max-w-4xl mx-auto flex-col gap-16 px-8 py-24">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-widest text-black/50">
          Styleguide
        </p>
        <h1 className="text-5xl font-bold tracking-tight">Triage</h1>
        <p className="max-w-xl text-lg text-black/70">
          Panton in Regular, SemiBold and Bold, with a six-colour palette.
        </p>
      </header>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold">Colours</h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {colors.map((c) => (
            <li key={c.name} className="flex flex-col gap-2">
              <div
                className={`h-20 rounded-lg border border-black/10 ${c.className}`}
              />
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-semibold">{c.name}</span>
                <span className="font-mono text-black/60">{c.hex}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold">Typography</h2>
        <div className="flex flex-col gap-4">
          <p className="text-4xl font-bold">Bold 700 — The quick brown fox</p>
          <p className="text-4xl font-semibold">
            SemiBold 600 — The quick brown fox
          </p>
          <p className="text-4xl font-normal">
            Regular 400 — The quick brown fox
          </p>
          <p className="text-4xl italic">
            Regular Italic — The quick brown fox
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold">Usage</h2>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-full bg-black px-5 py-2.5 font-semibold text-background transition-colors hover:bg-black/85">
            Primary
          </button>
          <button className="rounded-full bg-accent px-5 py-2.5 font-semibold text-black transition-colors hover:bg-accent/80">
            Accent
          </button>
          <button className="rounded-full border border-black/15 px-5 py-2.5 font-semibold transition-colors hover:bg-black/5">
            Secondary
          </button>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <span className="rounded-md bg-success/15 px-2.5 py-1 text-success">
            Success
          </span>
          <span className="rounded-md bg-warning/20 px-2.5 py-1 text-warning">
            Warning
          </span>
          <span className="rounded-md bg-error/15 px-2.5 py-1 text-error">
            Error
          </span>
          <span className="rounded-md bg-accent/25 px-2.5 py-1 text-black">
            Info
          </span>
        </div>
      </section>
    </main>
  );
}
