"use client";

import { Card } from "@/components/ui/card";
import { Send, Users } from "lucide-react";
import { Button } from "../ui/button";

export default function TelegramScan() {
  return (
    <div className="space-y-6">

      {/* TELEGRAM HEADER */}
      <Card className="flex items-center gap-3 p-4 bg-card">
        <Send className="text-brand w-5 h-5" />
        <div>
          <h2 className="font-semibold text-text">
            Telegram Tracking
          </h2>
          <p className="text-mutetext text-sm">
            Monitor Telegram channels and group conversations
          </p>
        </div>
      </Card>

      {/* GROUP MONITOR CARD */}
      <Card className="p-6 space-y-4">

        <div className="flex items-center gap-2 font-medium text-text">
          <Users className="w-4 h-4 text-brand" />
          Group Chat Monitoring
        </div>

        <p className="text-mutetext text-sm">
          Monitor public Telegram groups and channels for suspicious activities
        </p>

        <input
          className="input"
          placeholder="Enter group/channel name or link"
        />

        <textarea
          className="input h-24 resize-none"
          placeholder="Add specific keywords to monitor (optional)"
        />

        <button className="w-full bg-[#6fc4e7] text-[#121212] border border-[#6fc4e7]/60 rounded-xl py-3 font-semibold
          hover:bg-[#6fc4e7]/90 transition shadow-[0_0_16px_rgba(174,222,241,.7)]">Start Monitoring</button>

      </Card>

      {/* RESULTS */}
      <Card className="p-6 space-y-4">

        <h3 className="font-semibold text-text">
          Scan Results - Telegram
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <Result value="494" label="Total Messages" color="text-brand" />
          <Result value="3" label="Threats" color="text-brand" />
          <Result value="12" label="Suspicious" color="text-brand" />
          <Result value="479" label="Clean" color="text-brand" />

        </div>

      </Card>

    </div>
  );
}

/* ================= */

function Result({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="bg-[#121212]/30 rounded-xl p-4 text-center">
      <div className={`text-3xl font-bold ${color}`}>
        {value}
      </div>
      <p className="text-mutetext text-sm">
        {label}
      </p>
    </div>
  );
}
