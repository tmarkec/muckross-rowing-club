import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

/**
 * Oar-blade shaped button. Uses clip-path to evoke the silhouette of a
 * rowing blade — rounded leading edge, tapered neck. Use sparingly as a
 * signature CTA; standard buttons should still use rectangular pills.
 */

// Blade silhouette: tall rounded-rect blade on the left tapering into a
// shorter shaft handle on the right. Defined in % so it scales with the box.
const BLADE_CLIP =
  "polygon(8% 0%, 92% 18%, 100% 50%, 92% 82%, 8% 100%, 0% 85%, 0% 15%)";

export interface OarButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "yellow" | "navy";
}

export const OarButton = React.forwardRef<HTMLButtonElement, OarButtonProps>(
  ({ className, asChild, variant = "yellow", style, children, ...props }, ref) => {
    const Comp = (asChild ? Slot : "button") as React.ElementType;
    const palette =
      variant === "yellow"
        ? "bg-gradient-yellow text-primary shadow-yellow"
        : "bg-gradient-navy text-primary-foreground shadow-elegant";
    return (
      <Comp
        ref={ref}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-semibold uppercase tracking-wider transition-transform hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
          palette,
          className,
        )}
        style={{ clipPath: BLADE_CLIP, WebkitClipPath: BLADE_CLIP, ...style }}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
OarButton.displayName = "OarButton";