import type { Metadata } from "next";
import Link from "next/link";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";
import { footballEraConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Football Era Support",
  description:
    "Get help with Football Era on iPhone—career slots, seasons, saves, troubleshooting, and how to reach Howeth Studio support.",
  alternates: {
    canonical: "/football-era/support/",
  },
};

export default function FootballEraSupportPage() {
  return (
    <>
      <StudioSiteHeader />
      <main className="page-main">
        <div className="site-shell">
          <section className="hero-panel">
            <span className="eyebrow">Support</span>
            <h1>Support for Football Era.</h1>
            <p className="hero-copy">
              Help with installs, weekly games, careers, Lifestyle inventory,
              permanent gamepasses, and save slots—plus what to include so we can
              answer quickly.
            </p>
          </section>

          <section className="section two-column">
            <article className="section-card">
              <h2>Quick support details</h2>
              <ul className="check-list">
                <li>
                  Email:{" "}
                  <a href={`mailto:${footballEraConfig.supportEmail}`}>
                    {footballEraConfig.supportEmail}
                  </a>
                </li>
                <li>
                  Response target: within a few business days for normal questions.
                </li>
                <li>
                  This inbox is for the Football Era app only—not for general NFL or
                  league support.
                </li>
              </ul>
            </article>
            <article className="section-card">
              <h2>Include this in your message</h2>
              <ul className="check-list">
                <li>App version (Settings in the app or App Store → Football Era).</li>
                <li>iPhone model and iOS version.</li>
                <li>Whether the issue affects one career slot or every slot.</li>
                <li>Short steps that reproduce the problem, if it is repeatable.</li>
              </ul>
            </article>
          </section>

          <section className="section section-card">
            <h2>Frequently asked questions</h2>
            <div className="faq-list">
              <details className="faq-card" open>
                <summary>What are career slots?</summary>
                <div className="faq-answer">
                  Every player starts with two local career slots. The permanent
                  Extra Career Slots gamepass expands that total to five. Each slot
                  keeps its own player, league, career story, and Lifestyle collection.
                </div>
              </details>
              <details className="faq-card">
                <summary>Will my progress sync to another phone?</summary>
                <div className="faq-answer">
                  Progress is stored on the device you play on. If you replace your
                  phone, use your normal iPhone backup or transfer process; the app
                  does not currently offer a separate Football Era account for cloud
                  saves unless a future update says otherwise inside the app.
                </div>
              </details>
              <details className="faq-card">
                <summary>The app will not open or crashes on launch</summary>
                <div className="faq-answer">
                  Update iOS and install the latest Football Era build from the App
                  Store. If it still fails, force-quit the app, restart the phone, and
                  email support with your model, iOS version, and whether the crash
                  happens before or after the welcome screen.
                </div>
              </details>
              <details className="faq-card">
                <summary>How do seasons and game weeks work?</summary>
                <div className="faq-answer">
                  Use the center action in the bottom bar. It adapts to the current
                  state—advancing a regular-season week, finishing a pending game,
                  or opening the offseason checklist before the next year begins.
                </div>
              </details>
              <details className="faq-card">
                <summary>Why did my Lifestyle listings change?</summary>
                <div className="faq-answer">
                  Realty, Motors, Jewelry, and Performance each show four to seven
                  rarity-weighted listings for the current game week. Inventory
                  refreshes when the week advances, while purchased items remain in
                  your collection and career history.
                </div>
              </details>
              <details className="faq-card">
                <summary>How do I restore a gamepass?</summary>
                <div className="faq-answer">
                  Open More → Football Era Shop and choose Restore Purchases, or use
                  the restore option in Settings. Permanent purchases are restored
                  through the App Store account that originally bought them.
                </div>
              </details>
              <details className="faq-card">
                <summary>I have a billing or refund question</summary>
                <div className="faq-answer">
                  Purchases on iPhone are processed by Apple. For refunds or payment
                  issues, use reportaproblem.apple.com or the Purchases section in
                  Settings as Apple documents for your region.
                </div>
              </details>
            </div>
          </section>

          <section className="section section-card">
            <h2>Policies and marketing copy</h2>
            <p>
              App Store Connect may ask for a privacy policy URL and promotional
              text. Use the pages below as stable links for reviewers and players.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/football-era/privacy/">
                Privacy Policy
              </Link>
              <Link className="button button-secondary" href="/football-era/app-store/">
                App Store marketing copy
              </Link>
              <Link className="button button-ghost" href="/football-era/">
                Football Era home
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
