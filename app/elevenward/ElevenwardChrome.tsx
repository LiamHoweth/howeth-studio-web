import Link from "next/link";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";
import {
  elevenwardCopy,
  elevenwardLanguageTag,
  elevenwardUiCopy,
  type ElevenwardLocale,
} from "./content";

export function elevenwardRoute(locale: ElevenwardLocale, suffix = "") {
  const prefix = locale === "en" ? "/elevenward" : `/elevenward/${locale}`;
  return `${prefix}${suffix}/`;
}

export function ElevenwardNav({ locale }: { locale: ElevenwardLocale }) {
  const ui = elevenwardUiCopy[locale];
  const home = elevenwardRoute(locale);

  return (
    <>
      <StudioSiteHeader />
      <header className="ew-header">
        <div className="ew-header__inner">
          <Link className="ew-wordmark" href={home} aria-label={`Elevenward — ${ui.overview}`}>
            <span aria-hidden="true">03</span>
            <strong>Elevenward</strong>
          </Link>

          <nav className="ew-nav" aria-label="Elevenward">
            <Link href={home}>{ui.overview}</Link>
            <Link href={`${home}#career`}>{ui.career}</Link>
            <Link href={`${home}#world`}>{ui.world}</Link>
            <Link href={`${home}#fair-play`}>{ui.fairPlay}</Link>
            <Link className="ew-nav__support" href={elevenwardRoute(locale, "/support")}>
              {ui.support}
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}

export function LanguageNav({ active }: { active: ElevenwardLocale }) {
  return (
    <nav className="ew-languages" aria-label="Language">
      {(["en", "es", "pt-br", "fr"] as ElevenwardLocale[]).map((locale) => (
        <Link
          aria-current={locale === active ? "page" : undefined}
          className={locale === active ? "is-active" : ""}
          key={locale}
          href={elevenwardRoute(locale)}
          hrefLang={elevenwardLanguageTag(locale)}
          lang={elevenwardLanguageTag(locale)}
        >
          {elevenwardCopy[locale].language}
        </Link>
      ))}
    </nav>
  );
}

export function ElevenwardFooter({ locale }: { locale: ElevenwardLocale }) {
  const ui = elevenwardUiCopy[locale];
  return (
    <footer className="ew-footer">
      <div className="ew-footer__brand">
        <strong>Elevenward</strong>
        <span>{ui.studioLine}</span>
      </div>
      <nav aria-label="Elevenward footer">
        <Link href={elevenwardRoute(locale, "/support")}>{ui.support}</Link>
        <Link href={elevenwardRoute(locale, "/privacy")}>{ui.privacy}</Link>
        <Link href={elevenwardRoute(locale, "/account-deletion")}>{ui.deleteAccount}</Link>
        <Link href={elevenwardRoute(locale, "/press")}>{ui.press}</Link>
      </nav>
      <span className="ew-footer__copyright">© {new Date().getFullYear()} Howeth Studio</span>
    </footer>
  );
}
