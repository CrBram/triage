import Link from "next/link";

type LogoProps = {
  href?: string;
  size?: "sm" | "md";
};

export default function Logo({ href = "/", size = "md" }: LogoProps) {
  const nimbleClass = size === "sm" ? "text-sm font-bold" : "text-md font-bold";
  const careClass = size === "sm" ? "text-lg font-bold" : "text-2xl font-bold";

  return (
    <Link
      href={href}
      className="inline-flex items-baseline gap-0 font-bold tracking-tight text-black"
      aria-label="nimblecare"
    >
      <span className={nimbleClass}>nimble</span>
      <span className={careClass}>care</span>
    </Link>
  );
}
