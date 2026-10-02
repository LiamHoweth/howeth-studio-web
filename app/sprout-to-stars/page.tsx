import type { Metadata } from "next";
import { ProductPage } from "@/components/studio/ProductPage";

export const metadata: Metadata = {
  title: "Sprout to Stars",
  description:
    "A cozy 3D farm game in development. Grow extraordinary crops, improve your farm, and keep a personal collection in the Plant Lab.",
  alternates: { canonical: "/sprout-to-stars/" },
};

export default function SproutToStarsPage() {
  return (
    <ProductPage
      slug="sprout-to-stars"
      eyebrow="Cozy crop evolution"
      headline="Start with a sprout. Grow something extraordinary."
      description="Build a small working farm into a place for extraordinary crops. Send out your crew, improve the journey from field to delivery, and make room for a little botanical imagination."
      features={[
        {
          title: "A little world at work",
          description:
            "Watch crews travel across a 3D farm as crops grow, harvests move through packing and storage, and vehicles carry produce out for delivery.",
        },
        {
          title: "Every crop opens a new chapter",
          description:
            "Progress through fifteen crop stages, from Sweetcorn to Quantum Pineapple. Improve your facilities, learn permanent methods, and discover what your farm needs next.",
        },
        {
          title: "Keep what you create",
          description:
            "Step into the Plant Lab to tend your personal collection, experiment with plants, arrange your space, and photograph specimens for your album.",
        },
      ]}
      detail={{
        title: "Progress with a place to call your own.",
        paragraphs: [
          "The farm connects cultivation, harvesting, packing, and dispatch. Research and upgrades help you improve the part of the operation that needs attention, while each new crop changes what you are growing.",
          "Sprout to Stars is in development. Its working farm and Plant Lab are already part of the game; public release details will appear here as development continues.",
        ],
      }}
      note="In development."
    />
  );
}
