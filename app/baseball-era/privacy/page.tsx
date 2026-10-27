import type { Metadata } from "next";
import Link from "next/link";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";
import { StudioSiteFooter } from "@/components/studio/StudioMarketing";
import { howethStudioConfig } from "@/lib/siteConfig";
import "@/styles/product-policy.css";

export const metadata: Metadata = {
  title: "Baseball Era Privacy Policy",
  description: "How Baseball Era handles local careers, voluntary sharing and discovery, native review requests, and optional permanent purchases.",
  alternates: { canonical: "/baseball-era/privacy/" },
};

const sections = [
  { title: "Your career stays local", body: "Baseball Era careers are playable offline and stay on this device. The game has no accounts, third-party advertising, gameplay analytics, tracking or career cloud synchronization. Optional permanent gamepasses use the App Store and RevenueCat when the shop is configured." },
  { title: "What is stored", body: "This device stores your fictional athlete name and portrait choice, career progress, game results, unfinished setup, settings, verified gamepass ownership and local backup and recovery copies. Athlete names are optional; use a fictional name. Browser saves and iPhone or iPad saves are separate." },
  { title: "Sharing and discovery", body: "Optional Share buttons let you preview a game or career summary, then choose where to send it using your device’s share menu. Shared summaries contain game stats and a public game link; they omit your athlete name, save data and player identifier. Discover Howeth Studio Games opens the studio website in your browser. Public links include campaign labels identifying Baseball Era and the share or discovery action, never a device or player identifier. Your browser and chosen sharing app handle information under their own policies. Review requests use Apple’s system prompt. Only the first observed use and previous request date and app version are stored locally; we cannot see whether Apple shows the prompt or whether you leave a review." },
  { title: "Backups and deletion", body: "Deleting a career slot removes it from your active saves. Earlier local backup or recovery copies may still contain it. Removing the app removes its app data from the device, but device or browser backups are controlled by your operating system or browser and may restore an earlier copy. Baseball Era does not transfer or recover saves through a developer-operated service." },
  { title: "Permissions and purchases", body: "The game does not request your contacts, photos, microphone, location or tracking permission. Life shops spend fictional money earned in your career; they never charge real money. The separate Baseball Era Shop offers optional permanent purchases with App Store prices and Restore Purchases. These purchases require a connection. Developer builds may also connect to a local development server." },
  { title: "Purchase verification", body: "When the shop is configured, Apple processes payment and RevenueCat verifies purchase history and permanent access. RevenueCat receives an anonymous app customer identifier, purchase and transaction records, and technical information needed to verify purchases. Baseball Era does not send athlete names, career saves or game results to RevenueCat, and does not receive payment-card details. Automatic device-identifier collection is disabled. Purchase data is used for app functionality and restoration, and RevenueCat uses purchase history for its purchase dashboard and revenue analytics. It is not used for advertising or tracking. Restoring purchases restores gamepasses, not local career saves." },
  { title: "Policy changes", body: "If a future version adds online services or data collection, its privacy information will be updated before those features are made available." },
];

export default function BaseballPrivacyPage() {
  return <div className="product-policy">
    <a className="studio-skip" href="#main">Skip to main content</a><StudioSiteHeader />
    <main id="main" className="product-policy__main">
      <nav aria-label="Breadcrumb"><Link href="/baseball-era/">Baseball Era</Link><span aria-hidden="true"> / </span><span aria-current="page">Privacy</span></nav>
      <header><p className="product-policy__eyebrow">Privacy policy</p><h1>Baseball Era Privacy Policy</h1><p>Updated October 5, 2026. This policy covers local careers, optional sharing and discovery, native review requests and optional permanent App Store purchases in Baseball Era.</p></header>
      {sections.map((section) => <section key={section.title}><h2>{section.title}</h2><p>{section.body}</p></section>)}
      <section><h2>Contact</h2><p>For questions about this policy, email <a href={`mailto:${howethStudioConfig.contactEmail}`}>{howethStudioConfig.contactEmail}</a>.</p></section>
    </main><StudioSiteFooter year={new Date().getFullYear()} />
  </div>;
}
