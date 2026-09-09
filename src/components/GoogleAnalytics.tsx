import Script from "next/script";

export const GA_MEASUREMENT_ID = "G-3NKXJ484P9";

/**
 * Google tag (gtag.js) — loaded once in the root layout so it's present on
 * every route, including ones added later. Initial page_view is disabled
 * here and sent manually by <GoogleAnalyticsPageview>, since this is a
 * single-page app: without that, client-side navigations between routes
 * (checkout, eventos, admin, ...) would never register as new pageviews.
 */
export function GoogleAnalytics() {
  return (
    <>
      <Script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
      <Script id="google-analytics-init">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
