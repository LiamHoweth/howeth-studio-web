import type { Metadata } from "next";
import { EraSupportPage } from "@/components/era/EraSupportPage";

export const metadata: Metadata = {
  title: "Baseball Era Support",
  description: "Get help with Baseball Era, local career saves, permanent gamepasses, and Restore Purchases. Contact Beopity.",
  alternates: { canonical: "/baseball-era/support/" },
};

export default function BaseballEraSupportPage() {
  return <EraSupportPage slug="baseball-era" />;
}
