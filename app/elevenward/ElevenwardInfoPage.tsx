import Image from "next/image";
import Link from "next/link";
import { ElevenwardFooter, ElevenwardNav, LanguageNav, elevenwardRoute } from "./ElevenwardChrome";
import { ElevenwardDeletionForm } from "./ElevenwardDeletionForm";
import {
  elevenwardCopy,
  elevenwardDetails,
  elevenwardLanguageTag,
  elevenwardUiCopy,
  type ElevenwardLocale,
} from "./content";

export type InfoKind = "support" | "privacy" | "account-deletion" | "press";

export function ElevenwardInfoPage({ locale, kind }: { locale: ElevenwardLocale; kind: InfoKind }) {
  const copy = elevenwardCopy[locale];
  const details = elevenwardDetails[locale];
  const ui = elevenwardUiCopy[locale];
  const [title, body] = {
    support: [copy.supportTitle, copy.supportBody],
    privacy: [copy.privacyTitle, copy.privacyBody],
    "account-deletion": [copy.deletionTitle, copy.deletionBody],
    press: [copy.pressTitle, copy.pressBody],
  }[kind];
  const sectionLabel = {
    support: ui.support,
    privacy: ui.privacy,
    "account-deletion": ui.deleteAccount,
    press: ui.press,
  }[kind];

  return (
    <div className="ew-root" lang={elevenwardLanguageTag(locale)}>
      <a className="ew-skip" href="#ew-main">{ui.skip}</a>
      <ElevenwardNav locale={locale} active={kind === "support" ? "support" : undefined} />
      <main className="ew-info" id="ew-main">
        <div className="ew-info__breadcrumbs">
          <Link href={elevenwardRoute(locale)}>Elevenward</Link>
          <span aria-hidden="true">/</span>
          <span>{sectionLabel}</span>
        </div>
        <header className="ew-info__header">
          <p className="ew-kicker">{sectionLabel}</p>
          <h1>{title}</h1>
          <p className="ew-info__lead">{body}</p>
        </header>
        <DetailGrid details={details[kind === "account-deletion" ? "deletion" : kind]} />
        {kind === "press" ? <PressDownloads locale={locale} /> : null}
        {kind === "account-deletion" ? <ElevenwardDeletionForm copy={details.deletionForm} /> : null}
        <div className="ew-info__languages"><LanguageNav active={locale} /></div>
      </main>
      <ElevenwardFooter locale={locale} />
    </div>
  );
}

const pressDownloadCopy: Record<ElevenwardLocale, {
  eyebrow: string;
  title: string;
  body: string;
  download: string;
  assets: string;
  factSheet: string;
  factSheetBody: string;
  wordmark: string;
  wordmarkBody: string;
  icon: string;
  iconBody: string;
  launchArt: string;
  launchArtBody: string;
  studioHeading: string;
  studioBody: string;
  usageHeading: string;
  usageBody: string;
}> = {
  en: {
    eyebrow: "Downloads", title: "Ready-to-use press materials", body: "Download the current artwork and localized fact sheet. Please preserve the artwork’s proportions and colors.", download: "Download", assets: "Brand artwork", factSheet: "English fact sheet", factSheetBody: "Product overview, launch scope, business model, links, and press contact.", wordmark: "Elevenward wordmark", wordmarkBody: "Wide dark-background SVG lockup with the official brand line.", icon: "Elevenward app icon", iconBody: "The current 1024-pixel graphite 11 app icon for editorial layouts and listings.", launchArt: "Launch artwork", launchArtBody: "Original text-free editorial artwork for accurate Elevenward coverage.", studioHeading: "About Howeth Studio", studioBody: "Howeth Studio is an independent studio creating thoughtful, privacy-conscious digital products and original games.", usageHeading: "Editorial use", usageBody: "Use these assets for accurate editorial coverage of Elevenward. Keep proportions, colors, and clear space intact; do not imply endorsement or alter the marks. Contact the studio for another format or use.",
  },
  es: {
    eyebrow: "Descargas", title: "Material de prensa listo para usar", body: "Descarga los recursos gráficos y la ficha localizada. Conserva las proporciones y los colores.", download: "Descargar", assets: "Recursos de marca", factSheet: "Ficha en español", factSheetBody: "Resumen, alcance, modelo de negocio, enlaces y contacto de prensa.", wordmark: "Logotipo de Elevenward", wordmarkBody: "Composición SVG horizontal oscura con el lema oficial.", icon: "Icono de Elevenward", iconBody: "Icono actual de 1024 píxeles con el 11 sobre fondo grafito, para artículos y listados.", launchArt: "Imagen de lanzamiento", launchArtBody: "Imagen editorial original y sin texto para presentar Elevenward con fidelidad.", studioHeading: "Sobre Howeth Studio", studioBody: "Howeth Studio es un estudio independiente que crea productos digitales reflexivos, respetuosos con la privacidad y juegos originales.", usageHeading: "Uso editorial", usageBody: "Utiliza estos recursos para una cobertura editorial fiel de Elevenward. Mantén proporciones, colores y espacio libre; no alteres las marcas ni sugieras respaldo. Contacta con el estudio para otros formatos o usos.",
  },
  "pt-br": {
    eyebrow: "Downloads", title: "Materiais de imprensa prontos", body: "Baixe as artes e a ficha localizada. Preserve as proporções e cores.", download: "Baixar", assets: "Arte da marca", factSheet: "Ficha em português", factSheetBody: "Resumo, escopo, modelo de negócio, links e contato de imprensa.", wordmark: "Logotipo Elevenward", wordmarkBody: "Assinatura SVG horizontal escura com a frase oficial.", icon: "Ícone do Elevenward", iconBody: "Ícone atual de 1024 pixels com o 11 em fundo grafite, para matérias e listagens.", launchArt: "Arte de lançamento", launchArtBody: "Arte editorial original e sem texto para apresentar o Elevenward com fidelidade.", studioHeading: "Sobre a Howeth Studio", studioBody: "A Howeth Studio é um estúdio independente que cria produtos digitais cuidadosos, com respeito à privacidade, e jogos originais.", usageHeading: "Uso editorial", usageBody: "Use estes materiais para cobertura editorial fiel do Elevenward. Preserve proporções, cores e área de respiro; não altere as marcas nem sugira endosso. Fale com o estúdio para outros formatos ou usos.",
  },
  fr: {
    eyebrow: "Téléchargements", title: "Ressources presse prêtes à l’emploi", body: "Téléchargez les visuels et la fiche localisée. Conservez les proportions et les couleurs.", download: "Télécharger", assets: "Visuel de marque", factSheet: "Fiche en français", factSheetBody: "Présentation, contenu, modèle économique, liens et contact presse.", wordmark: "Logotype Elevenward", wordmarkBody: "Signature SVG horizontale sombre avec la devise officielle.", icon: "Icône Elevenward", iconBody: "Icône actuelle de 1024 pixels avec le 11 sur fond graphite, pour les articles et fiches produit.", launchArt: "Visuel de lancement", launchArtBody: "Visuel éditorial original et sans texte pour présenter Elevenward fidèlement.", studioHeading: "À propos de Howeth Studio", studioBody: "Howeth Studio est un studio indépendant qui crée des produits numériques réfléchis, respectueux de la vie privée, et des jeux originaux.", usageHeading: "Utilisation éditoriale", usageBody: "Utilisez ces ressources pour présenter Elevenward fidèlement. Préservez les proportions, les couleurs et l’espace libre ; ne modifiez pas les marques et ne suggérez aucun soutien. Contactez le studio pour tout autre format ou usage.",
  },
};

function PressDownloads({ locale }: { locale: ElevenwardLocale }) {
  const copy = pressDownloadCopy[locale];
  const factLocale = locale === "pt-br" ? "pt-br" : locale;
  const downloads = [
    {
      title: copy.wordmark,
      body: copy.wordmarkBody,
      meta: "SVG · 1200 × 320",
      href: "/elevenward/press/elevenward-wordmark.svg",
      image: "/elevenward/press/elevenward-wordmark.svg",
      width: 1200,
      height: 320,
    },
    {
      title: copy.icon,
      body: copy.iconBody,
      meta: "PNG · 1024 × 1024",
      href: "/elevenward/press/elevenward-app-icon.png",
      image: "/elevenward/press/elevenward-app-icon.png",
      width: 1024,
      height: 1024,
    },
    {
      title: copy.launchArt,
      body: copy.launchArtBody,
      meta: "PNG · 1536 × 1024",
      href: "/elevenward/press/elevenward-launch-hero.png",
      image: "/elevenward/press/elevenward-launch-hero.webp",
      width: 1536,
      height: 1024,
      cover: true,
    },
  ];
  return (
    <section className="ew-press-downloads" aria-labelledby="ew-press-downloads-title">
      <p className="ew-kicker">{copy.eyebrow}</p>
      <h2 id="ew-press-downloads-title">{copy.title}</h2>
      <p className="ew-press-downloads__lead">{copy.body}</p>
      <div className="ew-press-downloads__grid">
        {downloads.map((item) => (
          <article key={item.href}>
            <div className={`ew-press-downloads__preview${"cover" in item ? " is-cover" : ""}`}>
              <Image src={item.image} width={item.width} height={item.height} alt="" />
            </div>
            <p className="ew-press-downloads__meta">{item.meta}</p>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            <a className="ew-button ew-button--secondary" href={item.href} download>{copy.download} <span aria-hidden="true">↓</span></a>
          </article>
        ))}
        <article>
          <div className="ew-press-downloads__document" aria-hidden="true"><span>11</span><b>TXT</b></div>
          <p className="ew-press-downloads__meta">UTF-8 · TXT</p>
          <h3>{copy.factSheet}</h3>
          <p>{copy.factSheetBody}</p>
          <a className="ew-button ew-button--secondary" href={`/elevenward/press/elevenward-fact-sheet-${factLocale}.txt`} download>{copy.download} <span aria-hidden="true">↓</span></a>
        </article>
      </div>
      <div className="ew-press-guidance">
        <article><h3>{copy.studioHeading}</h3><p>{copy.studioBody}</p></article>
        <article><h3>{copy.usageHeading}</h3><p>{copy.usageBody}</p></article>
      </div>
    </section>
  );
}

function DetailGrid({ details }: { details: Array<[string, string]> }) {
  return <div className="ew-info__grid">{details.map(([heading, body], index) => (
    <article key={heading}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h2>{heading}</h2><p>{body}</p></div></article>
  ))}</div>;
}
