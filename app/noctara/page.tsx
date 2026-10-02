import type { Metadata } from "next";
import { ProductPage } from "@/components/studio/ProductPage";

export const metadata: Metadata = {
  title: "Noctara Sleep & Recovery",
  description:
    "Understand your night and plan your day with Apple Health sleep insights, recovery estimates, flexible schedules, and optional bedtime sessions. Free on the App Store.",
  alternates: { canonical: "/noctara/" },
};

const features = [
  {
    title: "Make sense of your morning",
    description:
      "See Recovery and Sleep Scores with clear context, an estimated Energy Forecast, and a restedness check-in that starts with how you feel.",
  },
  {
    title: "Find your patterns",
    description:
      "Explore available sleep stages, longer-term trends, weekly insights, and habit associations with sample counts to keep the picture in perspective.",
  },
  {
    title: "Plan around your life",
    description:
      "Set weekday and weekend schedules, adjust tomorrow’s wake time, and review a suggested sleep window with practical guidance for tonight.",
  },
  {
    title: "Try a phone bedtime session",
    description:
      "Start an optional session yourself, then review and confirm a lower-confidence sleep-time estimate. Sound analysis and optional short clips stay on your device.",
  },
  {
    title: "Wake with a backup",
    description:
      "Set an iPhone deadline alarm or add a movement-based Apple Watch wake window while the Watch app is active. The iPhone deadline remains your backup.",
  },
  {
    title: "Ease into the evening",
    description:
      "Wind down with three original narrated stories or three ambient soundscapes, with a timer and fade-out. Bring Tonight and Recovery to your Watch complications.",
  },
];

export default function NoctaraPage() {
  return (
    <ProductPage
      slug="noctara"
      eyebrow="Sleep, recovery & energy"
      headline="Understand your night. Own your day."
      description="A calmer view of rest. Noctara turns supported Apple Health sleep and recovery information into clear context for today, and a practical plan for tonight."
      features={features}
      detail={{
        title: "Start locally. Sync if you want.",
        paragraphs: [
          "Every current feature is free, with no account or purchase required. Noctara reads Apple Health without writing to it. Raw Health records and detailed sleep-stage timelines stay on your device.",
          "Optional Sign in with Apple syncs supported derived summaries, permanent preferences, and weekly reports. Phone audio, raw sound activity, phone-session estimates, check-ins, habits, and Watch motion readings stay outside account sync.",
          "Short sound-event clips are off by default. If you choose to retain them, you can delete them in the app, and they expire after 30 days.",
        ],
      }}
      links={[
        {
          label: "Download on the App Store",
          href: "https://apps.apple.com/us/app/noctara-sleep-recovery/id6813928927",
        },
        {
          label: "Support",
          href: "https://noctara-api-production.up.railway.app/support",
        },
        {
          label: "Privacy",
          href: "https://noctara-api-production.up.railway.app/privacy",
        },
      ]}
      note="Requires iOS 26 or later. The Apple Watch companion requires watchOS 10 or later. Scores, forecasts, and phone sleep-time estimates provide wellness context, not medical advice."
    />
  );
}
