"use client";

import Link from "next/link";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { API } from "@/lib/api";
import { Role } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PublicNav } from "@/components/PublicNav";

function isStrongPassword(value: string) {
  return value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value);
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("parent");
  const [error, setError] = useState<string | null>(null);

  const strongPassword = useMemo(() => isStrongPassword(password), [password]);

  const register = useMutation({
    mutationFn: async () => {
      const { data } = await API.post("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(), // ✅ FIX
        password,
        role,
      });
      return data;
    },
    onSuccess: () => {
      router.replace("/login");
    },
    onError: (e: unknown) => {
      const err = e as AxiosError<{ message?: string }>;
      console.error("REGISTER ERROR:", err.response?.data ?? err.message);
      if (err.response) {
        setError(err.response.data?.message ?? "Registration failed");
      } else {
        setError("Server not reachable");
      }
    },
  });

  return (
    <div className="min-h-screen">
      <PublicNav />
      <div className="grid place-items-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card title="Register" subtitle="Create account" className="shadow-lg">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                register.mutate();
              }}
            >
              <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

              {!strongPassword && password.length > 0 && (
                <p className="text-red-500 text-sm">Strong password required</p>
              )}

              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-300 focus:ring-2 focus:ring-zinc-900/10"
              >
                <option value="care_manager">Care Manager</option>
                <option value="parent">Parent</option>
                <option value="child">Child</option>
              </select>

              {error && <p className="text-red-500">{error}</p>}

              <Button type="submit">Register</Button>

              <p className="text-sm text-center">
                Already have an account? <Link href="/login">Login</Link>
              </p>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}