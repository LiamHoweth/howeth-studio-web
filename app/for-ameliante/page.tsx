import type { Metadata } from "next";
import { AmelianteExperience } from "./AmelianteExperience";
import "./ameliante.css";

export const metadata: Metadata = {
  title: "For Ameliante",
  description: "A little piece of my heart, made just for you.",
  robots: {
    index: false,
    follow: false,
    noimageindex: true,
  },
  openGraph: {
    title: "A little something for Ameliante ♡",
    description: "Made with love, from Liam.",
    images: ["/ameliante/lightning.webp"],
  },
};

export default function ForAmeliantePage() {
  return <AmelianteExperience />;
}
