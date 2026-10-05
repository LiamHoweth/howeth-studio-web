import type { Metadata } from "next";
import { EraPrivacyPolicy } from "@/components/era/EraPrivacyPolicy";

export const metadata: Metadata = {
  title: "Baseball Era Privacy Policy",
  description: "How Baseball Era handles local careers, optional permanent purchases, purchase verification, and support requests.",
  alternates: { canonical: "/baseball-era/privacy/" },
};

export default function BaseballEraPrivacyPage() {
  return <EraPrivacyPolicy slug="baseball-era" />;
}
