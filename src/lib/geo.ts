export interface GeoPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

/**
 * Haversine formula - distance between two GPS points in km
 */
export function distanceBetween(a: GeoPoint, b: GeoPoint): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Total distance from an array of GPS points
 */
export function totalDistance(points: GeoPoint[]): number {
  let dist = 0;
  for (let i = 1; i < points.length; i++) {
    dist += distanceBetween(points[i - 1], points[i]);
  }
  return dist;
}

/**
 * Current pace in min/km based on last N points
 */
export function currentPace(points: GeoPoint[], windowSize = 5): number {
  if (points.length < 2) return 0;

  const recent = points.slice(-windowSize);
  const dist = totalDistance(recent);
  if (dist < 0.005) return 0; // too little movement

  const timeMs = recent[recent.length - 1].timestamp - recent[0].timestamp;
  const timeMin = timeMs / 60000;
  return timeMin / dist; // min/km
}

/**
 * Average pace for the entire run
 */
export function averagePace(points: GeoPoint[]): number {
  if (points.length < 2) return 0;

  const dist = totalDistance(points);
  if (dist < 0.01) return 0;

  const timeMs = points[points.length - 1].timestamp - points[0].timestamp;
  const timeMin = timeMs / 60000;
  return timeMin / dist;
}

/**
 * Lap/split pace - pace for the last ~1km segment
 */
export function lapPace(points: GeoPoint[]): number {
  if (points.length < 2) return 0;

  let dist = 0;
  let startIdx = points.length - 1;

  for (let i = points.length - 1; i > 0; i--) {
    dist += distanceBetween(points[i - 1], points[i]);
    startIdx = i - 1;
    if (dist >= 1.0) break; // ~1km segment
  }

  if (dist < 0.05) return 0;

  const timeMs = points[points.length - 1].timestamp - points[startIdx].timestamp;
  const timeMin = timeMs / 60000;
  return timeMin / dist;
}
