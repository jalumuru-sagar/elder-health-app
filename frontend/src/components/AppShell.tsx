"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAuth, getUser } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [name] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const u = getUser();
    return u?.name ?? null;
  });
  const [role] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const u = getUser();
    return u?.role ?? null;
  });

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-zinc-900 text-white grid place-items-center shadow-sm">
              <span className="text-sm font-semibold">EH</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight text-zinc-900">Elder Health</div>
              <div className="text-xs text-zinc-500">{role ? role.replace("_", " ") : "Monitoring"}</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {name && <div className="hidden sm:block text-sm text-zinc-600">Signed in as <span className="font-medium text-zinc-900">{name}</span></div>}
            <Button
              variant="secondary"
              onClick={() => {
                clearAuth();
                router.replace("/login");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

