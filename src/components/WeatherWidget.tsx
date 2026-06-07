import { useEffect, useState } from "react";
import { Cloud, CloudDrizzle, CloudRain, CloudSnow, Sun, CloudSun, Wind, Loader2, ExternalLink, Thermometer } from "lucide-react";

/**
 * Live conditions on Lough Leane, powered by Open-Meteo (no API key required).
 * Two variants: `full` for the News page, `compact` for the footer.
 */
const LAT = 52.02;
const LON = -9.51;

// Windy.com — most reliable wind forecast for rowers — centred on Lough Leane / Muckross.
const WINDY_URL = `https://www.windy.com/?${LAT},${LON},11`;

type Current = {
  temperature_2m: number;
  wind_speed_10m: number;
  weather_code: number;
};

function codeToIcon(code: number) {
  if (code === 0) return Sun;
  if (code <= 2) return CloudSun;
  if (code === 3) return Cloud;
  if (code >= 51 && code <= 57) return CloudDrizzle;
  if (code >= 61 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 77) return CloudSnow;
  if (code >= 80 && code <= 99) return CloudRain;
  return Cloud;
}
function codeToLabel(code: number) {
  if (code === 0) return "Clear";
  if (code <= 2) return "Mostly sunny";
  if (code === 3) return "Overcast";
  if (code >= 45 && code <= 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95) return "Thunderstorm";
  return "Cloudy";
}

export function WeatherWidget({ variant = "full" }: { variant?: "full" | "compact" }) {
  const [data, setData] = useState<Current | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=auto`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => setData(j.current as Current))
      .catch(() => setError(true));
  }, []);

  if (error) return null;

  if (variant === "compact") {
    if (!data) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] text-primary-foreground/60">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading weather…
        </span>
      );
    }
    const Icon = codeToIcon(data.weather_code);
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[11px] text-primary-foreground/70"
        title={`Lough Leane · ${codeToLabel(data.weather_code)}`}
      >
        <Icon className="h-3.5 w-3.5 text-secondary" />
        <span className="font-medium text-primary-foreground/90">{Math.round(data.temperature_2m)}°C</span>
        <span aria-hidden>·</span>
        <span>{Math.round(data.wind_speed_10m)} km/h wind</span>
      </span>
    );
  }

  if (!data) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading conditions on Lough Leane…
      </div>
    );
  }

  const Icon = codeToIcon(data.weather_code);
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elegant">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-yellow shadow-yellow">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-foreground/70">
              Muckross weather forecast
            </p>
            <p className="mt-0.5 font-serif text-lg font-semibold text-foreground">
              {codeToLabel(data.weather_code)} on Lough Leane
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-sm">
          <span className="inline-flex items-center gap-1.5 text-foreground">
            <Thermometer className="h-4 w-4 text-primary" />
            <span className="text-xl font-bold tabular-nums">{Math.round(data.temperature_2m)}°C</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-foreground">
            <Wind className="h-4 w-4 text-primary" />
            <span className="text-xl font-bold tabular-nums">{Math.round(data.wind_speed_10m)}</span>
            <span className="text-xs font-medium text-muted-foreground">km/h wind</span>
          </span>
        </div>
      </div>
      <a
        href={WINDY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between gap-2 border-t border-border/60 bg-muted/40 px-5 py-3 text-xs font-semibold text-primary transition-colors hover:bg-muted/70 sm:px-6"
      >
        <span className="inline-flex items-center gap-2">
          <Wind className="h-3.5 w-3.5" />
          Detailed wind forecast on Windy.com (best for rowers)
        </span>
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}