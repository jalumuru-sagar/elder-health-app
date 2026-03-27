export function Badge({ tone, children }: { tone: "normal" | "warning" | "alert" | "critical"; children: string }) {
  const map = {
    normal: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    warning: "bg-orange-50 text-orange-700 ring-orange-600/15",
    alert: "bg-yellow-50 text-yellow-700 ring-yellow-600/15",
    critical: "bg-red-50 text-red-700 ring-red-600/15",
  } as const;

  return (
    <span className={["inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1", map[tone]].join(" ")}>
      {children}
    </span>
  );
}

