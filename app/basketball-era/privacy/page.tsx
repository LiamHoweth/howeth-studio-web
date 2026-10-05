import type { Metadata } from "next";
import { EraPrivacyPolicy } from "@/components/era/EraPrivacyPolicy";

export const metadata: Metadata = {
  title: "Basketball Era Privacy Policy",
  description: "How Basketball Era handles local careers, optional permanent purchases, purchase verification, and support requests.",
  alternates: { canonical: "/basketball-era/privacy/" },
};

export default function BasketballEraPrivacyPage() {
  return <EraPrivacyPolicy slug="basketball-era" />;
}
