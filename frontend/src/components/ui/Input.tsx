import { forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }
>(function Input({ className = "", error, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={[
        "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-zinc-900 shadow-sm outline-none",
        "placeholder:text-zinc-400",
        "focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300",
        error ? "border-red-300 focus:ring-red-500/15 focus:border-red-400" : "border-zinc-200",
        className,
      ].join(" ")}
      {...props}
    />
  );
});

