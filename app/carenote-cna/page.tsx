import type { Metadata } from "next";
import { ProductPage } from "@/components/studio/ProductPage";
import { careNoteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "CareNote CNA — Clearer Notes, Calmer Shifts",
  description:
    "CareNote CNA helps caregivers document shifts on iPhone with structured charting, optional voice capture, and editable suggestions reviewed before save.",
  alternates: { canonical: "/carenote-cna/" },
};

const features = [
  {
    title: "Start with the person.",
    description:
      "Find residents by hall, open the current shift, and keep observations and saved reports together. A clear starting point for repeated daily charting.",
  },
  {
    title: "Capture the details quickly.",
    description:
      "Use structured fields for routine care, one-tap bowel counters, refusal quick picks, and behavior chips. Type directly or use optional dictation after leaving the room.",
  },
  {
    title: "A suggestion, then your decision.",
    description:
      "Optional smart assistance organizes captured observations into draft suggestions. Every field and narrative stays editable, with caregiver review before the final save.",
  },
  {
    title: "Finish with a clear record.",
    description:
      "Review the report, adjust the details, and save locally on your iPhone. Resident information, observations, and shift reports stay easier to follow throughout the day or night.",
  },
];

export default function CareNoteHomePage() {
  const links = [
    {
      label: careNoteConfig.appStoreUrl ? "Download on the App Store" : "Download information",
      href: careNoteConfig.appStoreUrl || "/carenote-cna/download/",
    },
    ...(careNoteConfig.testFlightUrl
      ? [{ label: "Join TestFlight", href: careNoteConfig.testFlightUrl }]
      : []),
    { label: "All features", href: "/carenote-cna/features/" },
    { label: "How it works", href: "/carenote-cna/how-it-works/" },
    { label: "Support", href: "/carenote-cna/support/" },
    { label: "Privacy", href: "/carenote-cna/privacy/" },
  ];

  return (
    <ProductPage
      slug="carenote-cna"
      eyebrow="Caregiver documentation · iPhone"
      headline="Clearer notes. Calmer shifts."
      description="A practical place to capture what happened, organize the details, and finish shift documentation. Built for CNAs, with you in control of every saved note."
      features={features}
      detail={{
        title: "Review is part of the workflow.",
        paragraphs: [
          "Choose a resident, enter observations, review any suggestions, and save. You can complete reports manually without voice or AI assistance.",
          "Resident profiles and reports are stored locally. Optional AI features may send reviewed information to CareNote servers and processing providers; the privacy policy explains that flow so you can evaluate it for your setting.",
        ],
      }}
      links={links}
      note="Optional voice and smart assistance. Every note remains editable before save."
      renderHeader={false}
      renderFooter={false}
    />
  );
}
