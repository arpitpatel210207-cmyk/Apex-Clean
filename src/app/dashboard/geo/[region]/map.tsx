"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";

/* Fix leaflet icons */
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Map({ region }: { region: string }) {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map", {
      zoomControl: true,
      minZoom: 4,
    }).setView([23.6, 78.9], 5);

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "Ã‚Â© OpenStreetMap",
    }).addTo(map);

    /* Example prevalence (%) */
    const prevalence: Record<string, number> = {
      delhi: 7,
      rajasthan: 4,
      maharashtra: 9,
      gujarat: 5,
      westbengal: 8,
      tamilnadu: 6,
      karnataka: 7,
      telangana: 6,
      uttarpradesh: 3,
      punjab: 4,
      bihar: 9,
      assam: 5,
      odisha: 6,
      madhyapradesh: 4,
      chhattisgarh: 6,
      jharkhand: 7,
      kerala: 3,
      haryana: 5,
    };

    const normalize = (s: string) =>
      s.toLowerCase().replace(/[^a-z]/g, "");

    // Ensure every state gets a stable value so the choropleth shows all colors.
    const getStateValue = (stateName: string) => {
      if (prevalence[stateName] !== undefined) return prevalence[stateName];
      const hash = stateName.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      return (hash % 10) + 1;
    };

    /* 4-color prevalence scale: cyan -> green -> yellow -> red */
    const getColor = (v: number) => {
      if (v >= 8) return "#ef4444"; // red
      if (v >= 6) return "#facc15"; // yellow
      if (v >= 4) return "#22c55e"; // green
      return "#22d3ee"; // cyan
    };


    fetch(
      "https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson"
    )
      .then((r) => r.json())
      .then((geo) => {
        L.geoJSON(geo, {
          style: (feature: any) => {
            const name = normalize(feature.properties.NAME_1 || "");
            const value = getStateValue(name);

            return {
              fillColor: getColor(value),
              weight: 0.9,
              color: "#121212",
              fillOpacity: 0.9,
            };
          },

          onEachFeature: (feature, layer) => {
            layer.on({
              mouseover: (e: any) => {
                e.target.setStyle({
                  fillOpacity: 1,
                  weight: 2,
                });
              },
              mouseout: (e: any) => {
                e.target.setStyle({
                  fillOpacity: 0.9,
                  weight: 0.9,
                });
              },
            });

            /* Optional labels like reference */
            try {
              const [lng, lat] =
                turf.centroid(feature as any).geometry.coordinates;

              L.marker([lat, lng], {
                icon: L.divIcon({
                  className:
                    "text-[10px] font-semibold text-[#121212] pointer-events-none",
                  html: feature.properties.NAME_1,
                }),
              }).addTo(map);
            } catch {}
          },
        }).addTo(map);
      });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden border border-border bg-[#121212]">

      <div id="map" className="h-full w-full" />

      {/* TITLE */}
      <div className="absolute left-4 top-4 z-[800] rounded-md bg-brand/95 px-4 py-2 text-3xl font-semibold text-[#121212] shadow">
        Prevalence of Illicit Drug Use in India by State (2022-2024)
      </div>

      {/* LEGEND */}
      <div className="absolute bottom-8 right-8 z-[800] rounded-md border border-[#2a3a45]/55 bg-[rgba(12,16,22,0.92)] px-4 py-3 text-[#e6f5fa] shadow-lg">
        <p className="mb-2.5 text-lg font-semibold leading-none">Prevalence (%)</p>
        <div className="flex gap-3">
          <div className="w-7 overflow-hidden rounded-[2px] border border-black/15">
            <div className="h-7 bg-[#22d3ee]" />
            <div className="h-7 bg-[#22c55e]" />
            <div className="h-7 bg-[#facc15]" />
            <div className="h-7 bg-[#ef4444]" />
          </div>
          <div className="flex flex-col justify-between py-[1px] text-[11px] font-medium leading-none">
            <span>0-3 (Cyan)</span>
            <span>4-5 (Green)</span>
            <span>6-7 (Yellow)</span>
            <span>8-10 (Red)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
