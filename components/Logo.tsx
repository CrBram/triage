import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex items-baseline gap-0 font-bold tracking-tight text-black"
      aria-label="nimblecare"
    >
      <span className="text-md font-bold">nimble</span>
      <span className="text-2xl font-bold">care</span>
    </Link>
  );
}
