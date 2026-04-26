import * as React from "react";
import { cn } from "@/lib/utils";
import { OarBladeIcon } from "./OarBladeIcon";

/**
 * Signature CTA button — a clean pill with a hatchet oar-blade icon as
 * the leading mark. Used on the hero CTA and the navbar ClubForce link
 * so both share an identical look.
 */
export interface OarButtonProps
  extends React.HTMLAttributes<HTMLElement> {
  variant?: "yellow" | "navy";
  size?: "sm" | "md";
  /** Render as an anchor with this href instead of a button. */
  href?: string;
  target?: string;
  rel?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export const OarButton = React.forwardRef<HTMLElement, OarButtonProps>(
  ({ className, variant = "yellow", size = "md", style, children, href, target, rel, type, disabled, ...props }, ref) => {
    const palette =
      variant === "yellow"
        ? "bg-gradient-yellow text-primary shadow-yellow"
        : "bg-gradient-navy text-primary-foreground shadow-elegant";
    const sizing =
      size === "sm"
        ? "px-5 py-2 text-xs gap-2"
        : "px-7 py-3 text-sm gap-2.5";
    const iconSize = size === "sm" ? "h-3.5" : "h-4";
    const classes = cn(
      "group relative inline-flex items-center justify-center rounded-full font-semibold uppercase tracking-wider transition-transform hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
      sizing,
      palette,
      className,
    );
    const inner = (
      <>
        <OarBladeIcon className={cn(iconSize, "-scale-x-100")} />
        {children}
      </>
    );
    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={rel}
          className={classes}
          style={style}
          {...props}
        >
          {inner}
        </a>
      );
    }
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type ?? "button"}
        disabled={disabled}
        className={classes}
        style={style}
        {...props}
      >
        {inner}
      </button>
    );
  },
);
OarButton.displayName = "OarButton";