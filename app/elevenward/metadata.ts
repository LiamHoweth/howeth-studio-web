import type { Metadata } from "next";
import { gamePreviewImage } from "@/lib/gameMarketing";
import {
  elevenwardCopy,
  elevenwardLanguageTag,
  type ElevenwardLocale,
} from "./content";

export type ElevenwardMetadataKind = "landing" | "support" | "privacy" | "account-deletion" | "press";

function pathFor(locale: ElevenwardLocale, kind: ElevenwardMetadataKind) {
  const root = locale === "en" ? "/elevenward" : `/elevenward/${locale}`;
  return `${root}${kind === "landing" ? "" : `/${kind}`}/`;
}

export function createElevenwardMetadata(
  locale: ElevenwardLocale,
  kind: ElevenwardMetadataKind = "landing",
): Metadata {
  const copy = elevenwardCopy[locale];
  const title = {
    landing: `Elevenward — ${copy.subtitle}`,
    support: copy.supportTitle,
    privacy: copy.privacyTitle,
    "account-deletion": copy.deletionTitle,
    press: copy.pressTitle,
  }[kind];
  const description = {
    landing: copy.intro,
    support: copy.supportBody,
    privacy: copy.privacyBody,
    "account-deletion": copy.deletionBody,
    press: copy.pressBody,
  }[kind];
  const languages = Object.fromEntries(
    (["en", "es", "pt-br", "fr"] as ElevenwardLocale[]).map((candidate) => [
      elevenwardLanguageTag(candidate),
      pathFor(candidate, kind),
    ]),
  );

  return {
    title,
    description,
    alternates: { canonical: pathFor(locale, kind), languages },
    openGraph: {
      type: "website",
      title,
      description,
      url: pathFor(locale, kind),
      locale: locale === "pt-br" ? "pt_BR" : locale,
      siteName: "Howeth Studio",
      images: [gamePreviewImage("elevenward")],
    },
    twitter: { card: "summary_large_image", title, description, images: [gamePreviewImage("elevenward")] },
  };
}
