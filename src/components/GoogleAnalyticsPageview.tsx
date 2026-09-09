"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { GA_MEASUREMENT_ID } from "./GoogleAnalytics";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    const query = searchParams.toString();
    const page_path = query ? `${pathname}?${query}` : pathname;
    window.gtag("event", "page_view", {
      page_path,
      page_location: window.location.href,
      page_title: document.title,
      send_to: GA_MEASUREMENT_ID,
    });
  }, [pathname, searchParams]);

  return null;
}

/** Sends a GA4 page_view on every client-side route change (App Router navigations don't reload the page). */
export function GoogleAnalyticsPageview() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
