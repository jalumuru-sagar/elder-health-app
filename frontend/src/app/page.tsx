import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PublicNav } from "@/components/PublicNav";

export default function Home() {
  return (
    <div className="min-h-screen">
      <PublicNav />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
              Elder Health Monitoring System
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-600">
              Log vitals, monitor trends, and classify readings with clear status labels for families and care teams.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login">
                <Button className="w-full sm:w-auto">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Create account
                </Button>
              </Link>
            </div>
          </div>

          <Card
            title="Overview"
            subtitle="Built for daily check-ins and quick escalation."
            className="lg:ml-auto"
          >
            <ul className="space-y-3 text-sm text-zinc-700">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                <span>Care managers can add health readings for a patient.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                <span>Parents can view readings and access an emergency button (UI only).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-zinc-900" />
                <span>Children get read-only access to vitals and alerts.</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
