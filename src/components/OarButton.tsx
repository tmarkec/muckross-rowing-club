import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { OarBladeIcon } from "./OarBladeIcon";

/**
 * Signature CTA button — a clean pill with a hatchet oar-blade icon as
 * the leading mark. Used on the hero CTA and the navbar ClubForce link
 * so both share an identical look.
 */
export interface OarButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "yellow" | "navy";
  size?: "sm" | "md";
}

export const OarButton = React.forwardRef<HTMLButtonElement, OarButtonProps>(
  ({ className, asChild, variant = "yellow", size = "md", style, children, ...props }, ref) => {
    const Comp = (asChild ? Slot : "button") as React.ElementType;
    const palette =
      variant === "yellow"
        ? "bg-gradient-yellow text-primary shadow-yellow"
        : "bg-gradient-navy text-primary-foreground shadow-elegant";
    const sizing =
      size === "sm"
        ? "px-5 py-2 text-xs gap-2"
        : "px-7 py-3 text-sm gap-2.5";
    const iconSize = size === "sm" ? "h-3.5" : "h-4";
    return (
      <Comp
        ref={ref}
        className={cn(
          "group relative inline-flex items-center justify-center rounded-full font-semibold uppercase tracking-wider transition-transform hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
          sizing,
          palette,
          className,
        )}
        style={style}
        {...props}
      >
        <OarBladeIcon className={cn(iconSize, "-scale-x-100")} />
        {children}
      </Comp>
    );
  },
);
OarButton.displayName = "OarButton";