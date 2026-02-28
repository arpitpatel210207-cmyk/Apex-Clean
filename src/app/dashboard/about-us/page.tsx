"use client";

import { Card } from "@/components/ui/card";
import { Activity, BrainCircuit, Globe2, ShieldCheck } from "lucide-react";

const stats = [
  { value: "98.7%", label: "Detection Accuracy" },
  { value: "50K+", label: "Daily Scans" },
  { value: "15+", label: "Platforms" },
];

const points = [
  {
    icon: BrainCircuit,
    title: "Smart Detection",
    text: "AI models detect suspicious drug-related patterns in real time.",
  },
  {
    icon: Globe2,
    title: "Cross-Platform Monitoring",
    text: "Track activity across Telegram, 4chan, Discord, and more in one place.",
  },
  {
    icon: ShieldCheck,
    title: "Fast Response",
    text: "Risk alerts and context signals help teams act quickly and confidently.",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-6 pb-6">
      <section className="surface animate-stagger-in rounded-3xl border border-[#2a3a45]/55 p-5 sm:p-7 md:p-9">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#2f4250]/55 bg-[rgba(111,196,231,0.12)] px-3 py-1 text-xs uppercase tracking-[0.12em] text-brand">
          <Activity size={14} />
          About Apex Clean
        </div>

        <h1 className="page-heading mt-4 text-text text-3xl sm:text-[34px]">Simple, fast AI threat monitoring</h1>

        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-mutetext md:text-base">
          Apex Clean helps teams detect and track illicit drug activity across social
          channels. We combine live signal monitoring with explainable AI scoring so
          investigations can move faster.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((item, index) => (
          <Card
            key={item.label}
            className="animate-stagger-in rounded-2xl border border-[#2a3a45]/50 bg-card p-5"
            style={{ animationDelay: `${80 + index * 70}ms` }}
          >
            <p className="text-3xl font-semibold text-brand">{item.value}</p>
            <p className="mt-1 text-sm text-mutetext">{item.label}</p>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {points.map((item, index) => (
          <Card
            key={item.title}
            className="animate-stagger-in rounded-2xl border border-[#2a3a45]/50 bg-card p-6 transition hover:-translate-y-0.5"
            style={{ animationDelay: `${180 + index * 80}ms` }}
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#2f4250]/55 bg-[rgba(111,196,231,0.12)] text-brand">
              <item.icon size={18} />
            </div>
            <h3 className="text-lg font-semibold text-text">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-mutetext">{item.text}</p>
          </Card>
        ))}
      </section>

      <section className="animate-stagger-in rounded-3xl border border-[#2a3a45]/50 bg-[linear-gradient(180deg,rgba(16,20,26,0.72),rgba(12,16,22,0.88))] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-text">Our Mission</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-mutetext md:text-base">
          Build a safer digital ecosystem by transforming noisy online activity into
          clear, actionable intelligence for prevention teams.
        </p>
      </section>
    </div>
  );
}
