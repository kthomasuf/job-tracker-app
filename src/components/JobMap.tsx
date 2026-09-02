"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Application } from "@/lib/types";
import { COST_OF_LIVING_SAMPLE } from "@/lib/cost-of-living";

const STATUS_COLORS: Record<string, string> = {
  Applied: "var(--status-applied)",
  Screening: "var(--status-screening)",
  Interviewing: "var(--status-interviewing)",
  Offer: "var(--status-offer)",
  Awaiting: "var(--status-awaiting)",
  Rejected: "var(--status-rejected)",
};

function costOfLivingColor(index: number) {
  if (index >= 160) return "#dc2626";
  if (index >= 130) return "#f59e0b";
  if (index >= 110) return "#eab308";
  return "#16a34a";
}

function createMarkerElement(color: string) {
  const el = document.createElement("div");
  el.style.width = "22px";
  el.style.height = "22px";
  el.style.borderRadius = "9999px";
  el.style.backgroundColor = color;
  el.style.border = "3px solid var(--surface)";
  el.style.boxShadow = "0 0 3px rgba(0,0,0,0.6)";
  el.style.cursor = "pointer";
  return el;
}

function applicationPopupContent(app: Application, onViewProfile?: () => void) {
  const container = document.createElement("div");
  container.className = "flex flex-col gap-1 text-sm";

  const title = document.createElement("div");
  title.className = "font-semibold";
  title.textContent = `${app.role} @ ${app.company}`;

  const location = document.createElement("div");
  location.textContent = app.location;

  container.append(title, location);

  if (onViewProfile) {
    const button = document.createElement("button");
    button.textContent = "View Profile";
    button.className =
      "mt-1 self-start rounded bg-[var(--accent)] px-2 py-1 text-xs text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)]";
    button.addEventListener("click", onViewProfile);
    container.append(button);
  }
  return container;
}

export default function JobMap({
  applications,
  onViewProfile,
}: {
  applications: Application[];
  onViewProfile?: (app: Application) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] =
      applications.length > 0
        ? [
            applications.reduce((sum, a) => sum + a.lng, 0) / applications.length,
            applications.reduce((sum, a) => sum + a.lat, 0) / applications.length,
          ]
        : [-98.5795, 39.8283];

    const map = new maplibregl.Map({
      container: containerRef.current,
      // OpenFreeMap's free, no-API-key hosted style/tiles (planet-wide coverage)
      style: "https://tiles.openfreemap.org/styles/bright",
      center,
      zoom: 4,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      map.addSource("cost-of-living", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: COST_OF_LIVING_SAMPLE.map((col) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [col.lng, col.lat] },
            properties: {
              location: col.location,
              index: col.index,
              color: costOfLivingColor(col.index),
            },
          })),
        },
      });

      map.addLayer({
        id: "cost-of-living-circles",
        type: "circle",
        source: "cost-of-living",
        paint: {
          "circle-radius": 10,
          "circle-color": ["get", "color"],
          "circle-opacity": 0.85,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      setLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Only ever initialize the map once; application markers update separately below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = applications.map((app) => {
      const popup = new maplibregl.Popup({ offset: 12 });
      popup.setDOMContent(
        applicationPopupContent(
          app,
          onViewProfile &&
            (() => {
              popup.remove();
              onViewProfile(app);
            }),
        ),
      );

      const element = createMarkerElement(
        STATUS_COLORS[app.status] ?? STATUS_COLORS.Applied,
      );

      return new maplibregl.Marker({ element })
        .setLngLat([app.lng, app.lat])
        .setPopup(popup)
        .addTo(map);
    });
  }, [applications, loaded, onViewProfile]);

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[300px] w-full overflow-hidden rounded-lg"
    />
  );
}
