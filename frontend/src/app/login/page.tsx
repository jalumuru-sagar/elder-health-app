"use client";

import Link from "next/link";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { API, ApiAuthResponse } from "@/lib/api";
import { setAuth } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PublicNav } from "@/components/PublicNav";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0,
    [email, password]
  );

  const login = useMutation({
    mutationFn: async () => {
      const { data } = await API.post<ApiAuthResponse>("/auth/login", {
        email: email.trim().toLowerCase(), // ✅ FIX
        password,
      });
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      router.replace("/dashboard");
    },
    onError: (e: unknown) => {
      const err = e as AxiosError<{ message?: string }>;
      console.error("LOGIN ERROR:", err.response?.data ?? err.message);
      if (err.response) {
        setError(err.response.data?.message ?? "Login failed");
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
          <Card title="Login" subtitle="Enter your email and password." className="shadow-lg">
            <form
              className="space-y-4"
              onSubmit={(ev) => {
                ev.preventDefault();
                setError(null);
                if (canSubmit) login.mutate();
              }}
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-900">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-900">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <Button type="submit" className="w-full" loading={login.isPending}>
                Sign in
              </Button>

              <p className="text-sm text-center">
                Don&apos;t have an account? <Link href="/register">Register</Link>
              </p>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}