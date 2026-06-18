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
      <img
        src="/crossed-oars-black.png"
        alt=""
        role="presentation"
        width={120}
        height={48}
        className="h-10 w-auto select-none"
        draggable={false}
      />
      <span className="h-px flex-1 max-w-[120px] bg-current" />
    </div>
  );
}