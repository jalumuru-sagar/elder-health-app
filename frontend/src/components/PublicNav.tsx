"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";

function isActive(pathname: string, href: string) {
  return pathname === href;
}

export function PublicNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/90 backdrop-blur shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-zinc-900 text-white grid place-items-center shadow-sm">
            <span className="text-sm font-semibold">EH</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900">Elder Health</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant={isActive(pathname, "/login") ? "primary" : "secondary"} className="h-10 px-3">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button variant={isActive(pathname, "/register") ? "primary" : "secondary"} className="h-10 px-3">
              Register
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

