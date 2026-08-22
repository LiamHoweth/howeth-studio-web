function cleanUrl(value: string | undefined): string {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

export const siteUrl =
  cleanUrl(process.env.NEXT_PUBLIC_SITE_URL) || "https://howethstudio.com";

/** Shown on Howeth Studio marketing pages (home footer, /contact/, etc.). */
export const howethStudioConfig = {
  contactEmail:
    cleanUrl(process.env.NEXT_PUBLIC_HOWETH_STUDIO_CONTACT_EMAIL) ||
    "howethstudio@gmail.com",
};

export const careNoteConfig = {
  siteName: "CareNote CNA",
  supportEmail:
    cleanUrl(process.env.NEXT_PUBLIC_CARENOTE_SUPPORT_EMAIL) ||
    "carenotecna@gmail.com",
  supportFormEndpoint: cleanUrl(
    process.env.NEXT_PUBLIC_CARENOTE_SUPPORT_FORM_ENDPOINT
  ),
  appStoreUrl:
    cleanUrl(process.env.NEXT_PUBLIC_CARENOTE_APP_STORE_URL) ||
    "https://apps.apple.com/us/app/carenotecna/id6760431742",
  testFlightUrl: cleanUrl(process.env.NEXT_PUBLIC_CARENOTE_TESTFLIGHT_URL),
};

export const footballEraConfig = {
  siteName: "Football Era",
  supportEmail:
    cleanUrl(process.env.NEXT_PUBLIC_FOOTBALL_ERA_SUPPORT_EMAIL) ||
    "hello@footballera.game",
  appStoreUrl:
    cleanUrl(process.env.NEXT_PUBLIC_FOOTBALL_ERA_APP_STORE_URL) ||
    "https://apps.apple.com/us/app/football-era/id6762415210",
  testFlightUrl: cleanUrl(process.env.NEXT_PUBLIC_FOOTBALL_ERA_TESTFLIGHT_URL),
};
