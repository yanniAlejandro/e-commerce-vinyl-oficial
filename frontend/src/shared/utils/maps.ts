export function getGoogleMapsDirectionsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

export function getOsmDirectionsUrl(latitude: number, longitude: number): string {
  return `https://www.openstreetmap.org/directions?to=${latitude},${longitude}`;
}

export function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}
