import { useRouter, useLocation } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

/**
 * Floating bottom-left back button. Mobile only. Hidden on the home route.
 */
export function MobileBackButton() {
  const router = useRouter();
  const location = useLocation();

  if (location.pathname === "/") return null;

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      router.navigate({ to: "/" });
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Go back to previous page"
      className="fixed bottom-4 left-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elegant ring-1 ring-secondary/40 transition-transform hover:scale-105 active:scale-95 md:hidden"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}