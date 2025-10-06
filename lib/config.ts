// App configuration
export const APP_CONFIG = {
  domain: process.env.NEXT_PUBLIC_APP_DOMAIN || "https://pay.nealjain.website",
  appName: "PayDhan",
  supportEmail: "support@nealjain.website",
}

export function getAppUrl(path: string = ""): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`
  }
  return `${APP_CONFIG.domain}${path}`
}
