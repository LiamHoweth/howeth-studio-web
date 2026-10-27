import Link from "next/link";
import { StudioSiteFooter } from "@/components/studio/StudioMarketing";
import { careNoteConfig } from "@/lib/siteConfig";

const footerLinks = [
  { href: "/carenote-cna/features/", label: "Features" },
  { href: "/carenote-cna/how-it-works/", label: "How it works" },
  { href: "/carenote-cna/support/", label: "Support" },
  { href: "/carenote-cna/download/", label: "Download" },
  { href: "/carenote-cna/privacy/", label: "Privacy" },
  { href: "/carenote-cna/contact/", label: "Contact" },
] as const;

export function CareNoteSiteFooter() {
  return (
    <>
      <div className="cn-product-footer">
        <div className="cn-product-footer__brand">
          <Link href="/carenote-cna/">CareNote CNA</Link>
          <span>Clearer notes. Calmer shifts.</span>
        </div>
        <nav aria-label="CareNote CNA footer">
          {footerLinks.map((page) => <Link key={page.href} href={page.href}>{page.label}</Link>)}
        </nav>
        <a className="cn-product-footer__support" href={`mailto:${careNoteConfig.supportEmail}`}>
          {careNoteConfig.supportEmail}
        </a>
      </div>
      <StudioSiteFooter year={new Date().getFullYear()} />
    </>
  );
}
