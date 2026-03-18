declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

export function initialize(gaId: string) {
  if (initialized) return;

  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  script.async = true;
  document.head.appendChild(script);

  script.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    window.gtag("js", new Date());
    window.gtag("config", gaId);
    initialized = true;
  };
}

export function trackPageView(gaId: string, pagePath: string) {
  if (!initialized) return;
  window.gtag?.("config", gaId, { page_path: pagePath });
}

export function trackEvent(name: string, params?: Record<string, string>) {
  if (!initialized) return;
  window.gtag?.("event", name, params);
}
