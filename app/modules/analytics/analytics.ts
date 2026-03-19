declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: unknown[]) => void;
  }
}

let gaId: string | null = null;

export function initialize(id: string) {
  if (gaId) return;
  gaId = id;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  window.gtag("js", new Date());
  window.gtag("config", gaId, { send_page_view: false });

  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  script.async = true;
  document.head.appendChild(script);
}

export function trackPageView(pagePath: string) {
  window.gtag?.("event", "page_view", {
    page_path: pagePath,
    send_to: gaId,
  });
}

export function trackEvent(name: string, params?: Record<string, string>) {
  window.gtag?.("event", name, params);
}
