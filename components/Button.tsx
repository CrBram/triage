import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "accent" | "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const base =
  "inline-flex cursor-pointer items-center justify-center rounded-lg px-5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const variants: Record<ButtonVariant, string> = {
  accent: "bg-accent text-black hover:bg-accent/80",
  primary: "bg-black text-background hover:bg-black/85",
  secondary: "border border-black/15 text-black hover:bg-black/5",
};

export default function Button({
  variant = "accent",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
