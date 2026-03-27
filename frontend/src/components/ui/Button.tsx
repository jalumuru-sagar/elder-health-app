import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger";

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }
>(function Button({ className = "", variant = "primary", loading, disabled, children, ...props }, ref) {
  const base =
    "inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:opacity-60 disabled:cursor-not-allowed";

  const styles: Record<Variant, string> = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800",
    secondary: "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50",
    danger: "bg-red-600 text-white hover:bg-red-500",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[base, styles[variant], className].join(" ")}
      {...props}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
});

