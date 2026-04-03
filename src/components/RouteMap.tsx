"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RouteMapProps {
  points: Array<{ lat: number; lng: number }>;
}

export default function RouteMap({ points }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || points.length < 2) return;

    // Cleanup previous map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    });

    // Dark map tiles
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 }
    ).addTo(map);

    // Route polyline
    const latlngs = points.map((p) => [p.lat, p.lng] as L.LatLngTuple);
    const polyline = L.polyline(latlngs, {
      color: "#ffffff",
      weight: 4,
      opacity: 0.9,
      smoothFactor: 1,
    }).addTo(map);

    // Start marker
    const startIcon = L.divIcon({
      html: '<div style="width:14px;height:14px;background:#22c55e;border:3px solid #131313;border-radius:50%;"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      className: "",
    });
    L.marker(latlngs[0], { icon: startIcon }).addTo(map);

    // End marker
    const endIcon = L.divIcon({
      html: '<div style="width:14px;height:14px;background:#ffffff;border:3px solid #131313;border-radius:50%;"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      className: "",
    });
    L.marker(latlngs[latlngs.length - 1], { icon: endIcon }).addTo(map);

    // Fit bounds
    map.fitBounds(polyline.getBounds(), { padding: [30, 30] });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [points]);

  if (points.length < 2) {
    return (
      <div className="w-full h-64 rounded-2xl bg-surface-container-low flex items-center justify-center">
        <p className="text-on-surface-variant text-sm">Brak danych GPS dla tego treningu</p>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-72 rounded-2xl overflow-hidden"
      style={{ background: "#131313" }}
    />
  );
}
