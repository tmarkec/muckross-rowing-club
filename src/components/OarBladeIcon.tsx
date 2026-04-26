import { cn } from "@/lib/utils";

/**
 * Hatchet-style oar blade icon. Matches the asymmetric rowing blade
 * silhouette: long flat top edge, vertical trailing edge, flat bottom,
 * and a diagonal leading edge that slices down into the shaft.
 * Uses currentColor so it inherits the parent text color.
 */
export function OarBladeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-4 w-auto", className)}
      aria-hidden="true"
    >
      {/* Hatchet blade: flat top, vertical right, flat bottom,
          slanted leading edge tapering into the shaft on the left. */}
      <path
        d="M14 4 H40 V16 H22 L14 14 Z"
        fill="currentColor"
      />
      {/* Shaft + sleeve */}
      <rect x="40" y="9.2" width="22" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="38" y="8.4" width="3" height="3.2" rx="0.4" fill="currentColor" />
    </svg>
  );
}