import { cn } from "@/lib/utils";

/**
 * Subtle decorative divider — two crossed oar blades over a thin rule.
 * Uses currentColor so it inherits parent text color.
 */
export function OarDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center gap-4 text-border", className)}
      aria-hidden="true"
    >
      <span className="h-px flex-1 max-w-[120px] bg-current" />
      <svg
        width="64"
        height="20"
        viewBox="0 0 64 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-secondary"
      >
        {/* Left oar */}
        <g transform="rotate(-15 32 10)">
          <rect x="2" y="8.4" width="28" height="3.2" rx="1.6" fill="currentColor" />
          <ellipse cx="6" cy="10" rx="5" ry="3.2" fill="currentColor" />
        </g>
        {/* Right oar */}
        <g transform="rotate(15 32 10)">
          <rect x="34" y="8.4" width="28" height="3.2" rx="1.6" fill="currentColor" />
          <ellipse cx="58" cy="10" rx="5" ry="3.2" fill="currentColor" />
        </g>
      </svg>
      <span className="h-px flex-1 max-w-[120px] bg-current" />
    </div>
  );
}