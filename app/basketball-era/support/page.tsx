import type { Metadata } from "next";
import { EraSupportPage } from "@/components/era/EraSupportPage";

export const metadata: Metadata = {
  title: "Basketball Era Support",
  description: "Get help with Basketball Era, local career saves, permanent gamepasses, and Restore Purchases. Contact Beopity.",
  alternates: { canonical: "/basketball-era/support/" },
};

export default function BasketballEraSupportPage() {
  return <EraSupportPage slug="basketball-era" />;
}
