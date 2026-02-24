"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Globe,
  Search,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

export default function RedditLiveScanPage() {
  return (
    <div className="space-y-8">

      {/* HEADER */}
      <Card className="flex items-center gap-3 p-5">
        <Globe className="text-brand w-6 h-6" />
        <div>
          <h2 className="page-heading text-text">
            Reddit Monitoring
          </h2>
          <p className="text-mutetext text-sm">
            Scan subreddits, posts, and comments in real time
          </p>
        </div>
      </Card>

      {/* INPUT PANEL */}
      <Card className="space-y-4 p-6">

        <h3 className="text-md font-semibold text-text flex items-center gap-2">
          <Search className="w-5 h-5 text-brand" />
          Subreddit & Keyword Monitoring
        </h3>

        <input
          className="input"
          placeholder="Enter subreddit name (e.g. r/marketplace)"
        />

        <textarea
          className="input min-h-[90px]"
          placeholder="Add keywords to monitor (optional)"
        />

        <button className="w-full bg-[#6fc4e7] text-[#121212] border border-[#6fc4e7]/60 rounded-lg py-2 font-medium hover:bg-[#6fc4e7]/90 transition shadow-[0_0_15px_rgba(174,222,241,.6)]">Start Monitoring</button>
      </Card>

      {/* RESULTS */}
      <Card className="space-y-5 p-6">

        <div className="flex items-center gap-2">
          <ShieldCheck className="text-brand w-5 h-5" />
          <h3 className="font-semibold text-text">
            Scan Results - Reddit
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <ResultStat value="1,120" label="Posts Scanned" color="text-brand" />
          <ResultStat value="7" label="Threats Detected" color="text-brand" />
          <ResultStat value="26" label="Suspicious" color="text-brand" />
          <ResultStat value="1,087" label="Clean Posts" color="text-brand" />

        </div>

        <div className="flex gap-3 flex-wrap text-sm">

          <span className="bg-brand/20 text-brand px-3 py-1 rounded-full">
            Scan completed in 0.78s
          </span>

          <span className="bg-brand/20 text-brand px-3 py-1 rounded-full flex items-center gap-1">
            <AlertTriangle size={14} />
            High Risk Content Found
          </span>

        </div>
      </Card>

    </div>
  );
}

/* SMALL COMPONENT */

function ResultStat({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <Card className="text-center py-4 space-y-1 bg-card">
      <div className={`text-3xl font-bold ${color}`}>
        {value}
      </div>
      <p className="text-mutetext text-sm">{label}</p>
    </Card>
  );
}
