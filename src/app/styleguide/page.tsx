import type { Metadata } from "next";
import { Check, Clock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeSwitcher } from "./theme-switcher";

export const metadata: Metadata = {
  title: "Styleguide · Panthiya",
};

// Temporary page (T-006): every design token from docs/DESIGN.md in one place.

const typeScale = [
  { className: "text-display-sm", name: "display-sm", spec: "28px / 600" },
  { className: "text-title-lg", name: "title-lg", spec: "22px / 600" },
  { className: "text-title-md", name: "title-md", spec: "18px / 600" },
  { className: "text-title-sm", name: "title-sm", spec: "16px / 600" },
  { className: "text-body-md", name: "body-md", spec: "16px / 400" },
  { className: "text-body-sm", name: "body-sm", spec: "14px / 400" },
  { className: "text-caption", name: "caption", spec: "13px / 500" },
] as const;

const surfaces = [
  { className: "bg-background", name: "background" },
  { className: "bg-muted", name: "muted" },
  { className: "bg-secondary", name: "secondary" },
  { className: "bg-card", name: "card" },
  { className: "bg-primary", name: "primary" },
  { className: "bg-success", name: "success" },
  { className: "bg-warning", name: "warning" },
  { className: "bg-destructive", name: "destructive" },
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-title-lg">{title}</h2>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 md:px-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-display-sm">Styleguide</h1>
          <p className="text-body-sm text-muted-foreground">
            Design tokens from DESIGN.md. Switch the theme to check both palettes.
          </p>
        </div>
        <ThemeSwitcher />
      </header>

      <Section title="Colours">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {surfaces.map((s) => (
            <div key={s.name} className="flex flex-col gap-2">
              <div className={`h-16 rounded-xl border ${s.className}`} />
              <span className="font-mono text-caption text-muted-foreground">{s.name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="flex flex-col gap-4 rounded-xl border p-6">
          {typeScale.map((t) => (
            <div
              key={t.name}
              className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <span className="w-52 shrink-0 font-mono text-caption text-muted-foreground">
                {t.name} · {t.spec}
              </span>
              <span className={t.className}>Students and monthly fees</span>
            </div>
          ))}
          <p className="text-body-md text-body">
            Body text uses the body colour, slightly softer than headings.
          </p>
          <p lang="si" className="text-title-md">
            පන්ති කළමනාකරණය · සිසුන් සහ මාසික ගාස්තු
          </p>
          <p lang="si" className="text-body-md text-body">
            සිංහල අකුරු Noto Sans Sinhala වලින්. පේළි උස 1.6 නිසා පිලි කැපෙන්නේ නෑ.
          </p>
          <p className="text-body-sm">
            Mono: <span className="font-mono">ADM-0042</span> · Receipt{" "}
            <span className="font-mono">RC-2026-0001</span> · Tabular{" "}
            <span className="tabular-nums">Rs. 2,500.00</span>
          </p>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button>Add student</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Input">
        <div className="flex max-w-[560px] flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sg-name">Full name</Label>
            <Input id="sg-name" placeholder="Nimal Perera" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sg-phone">Phone</Label>
            <Input id="sg-phone" placeholder="077 123 4567" aria-invalid="true" />
            <p className="text-body-sm text-destructive-foreground">Enter a valid phone number.</p>
          </div>
        </div>
      </Section>

      <Section title="Status badges">
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">
            <Check data-icon="inline-start" aria-hidden />
            Present
          </Badge>
          <Badge variant="success">Paid</Badge>
          <Badge variant="success">Active</Badge>
          <Badge variant="warning">
            <Clock data-icon="inline-start" aria-hidden />
            Late
          </Badge>
          <Badge variant="warning">Partially paid</Badge>
          <Badge variant="destructive">
            <X data-icon="inline-start" aria-hidden />
            Absent
          </Badge>
          <Badge variant="destructive">Unpaid</Badge>
          <Badge variant="destructive">Overdue</Badge>
          <Badge variant="neutral">Inactive</Badge>
          <Badge variant="discount-half">Half card</Badge>
          <Badge variant="discount-free">Free card</Badge>
          <Badge variant="discount-custom">Custom 20%</Badge>
        </div>
      </Section>

      <Section title="Card">
        <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardDescription className="text-caption">Collected this month</CardDescription>
              <CardTitle className="text-display-sm tabular-nums">Rs. 84,500.00</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-title-md">Grade 10 Maths</CardTitle>
              <CardDescription>Saturday · 8:00 to 10:00</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Badge variant="success">24 enrolled</Badge>
            </CardContent>
            <CardFooter>
              <Button variant="outline">View class</Button>
            </CardFooter>
          </Card>
        </div>
      </Section>
    </main>
  );
}
