"use client";

import { use } from "react";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./map"), { ssr: false });

export default function GeoPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = use(params); // ✅ unwrap promise

  return (
    <div className="h-[calc(100dvh-128px)] min-h-[420px] w-full sm:h-[calc(100vh-140px)]">
      <LeafletMap region={region} />
    </div>
  );
}
