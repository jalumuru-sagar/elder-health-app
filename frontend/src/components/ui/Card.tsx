import { ReactNode } from "react";

export function Card({
  title,
  subtitle,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-xl border border-zinc-200/70 bg-white shadow-lg",
        "hover:shadow-xl hover:border-zinc-200 transition-shadow transition-colors",
        className,
      ].join(" ")}
    >
      {(title || subtitle) && (
        <div className="px-6 pt-6 pb-3">
          {title && <h2 className="text-lg font-semibold tracking-tight text-zinc-900">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 pb-6">{children}</div>
    </div>
  );
}

