export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function interpolateColor(
  pressure: number,
  startColor: RGB,
  endColor: RGB
): string {
  const clamp = (val: number) => Math.max(0, Math.min(1, val));
  pressure = clamp(pressure);

  const r = Math.round(startColor.r + (endColor.r - startColor.r) * pressure);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * pressure);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * pressure);

  return `rgb(${r}, ${g}, ${b})`;
}
