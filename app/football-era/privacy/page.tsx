import type { Metadata } from "next";
import Link from "next/link";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";
import { footballEraConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Football Era Privacy Policy",
  description:
    "How Football Era handles local career data, anonymous gameplay analytics, optional public leaderboards, and support requests.",
  alternates: {
    canonical: "/football-era/privacy/",
  },
};

export default function FootballEraPrivacyPage() {
  return (
    <>
      <StudioSiteHeader />
      <main className="page-main">
        <div className="site-shell">
          <section className="hero-panel">
            <span className="eyebrow">Privacy Policy</span>
            <h1>Football Era Privacy Policy</h1>
            <p className="hero-copy">
              Effective date: August 22, 2026. This policy describes how Football Era
              (“the app”), published by Howeth Studio, treats information on your
              device when you play.
            </p>
          </section>

          <section className="section two-column">
            <article className="section-card">
              <h2>What stays on your iPhone</h2>
              <p>
                Career progress, slot saves, preferences, and other gameplay state
                needed to run Football Era are stored locally on your device. Howeth
                Studio does not require an account and does not upload your complete
                save file. The app remains playable when online services are
                unavailable.
              </p>
            </article>
            <article className="section-card">
              <h2>When information is processed off-device</h2>
              <p>
                When anonymous gameplay analytics are enabled, the app sends a random
                installation identifier, app version and platform, session start/end
                times, feature areas opened, weekly outcomes, aggregate progression,
                Lifestyle purchase category and rarity, skill upgrades, contract
                milestones, season results, and retirement outcomes. Career snapshots
                can include position, team, season, games, yards, touchdowns,
                championships, overall rating, followers, net worth, and legacy score.
                This helps us measure retention, find progression or balance problems,
                and improve features. We do not send your complete save, email address,
                contacts, advertising identifier, payment details, or precise location.
              </p>
            </article>
          </section>

          <section className="section two-column">
            <article className="section-card">
              <h2>Analytics and diagnostics</h2>
              <p>
                The app does not use this information for advertising, cross-app
                tracking, or sale to data brokers. The random installation identifier
                is used only to deduplicate events, calculate anonymous retention, and
                protect your own synced career records. Leaderboard totals are checked
                against gameplay limits, and rejected submission reasons may be kept
                temporarily to detect abuse. We use Railway to host the API, database,
                encrypted backup data, and operational logs; Railway may process limited
                network and request metadata to operate and secure those services.
              </p>
            </article>
            <article className="section-card">
              <h2>What we do not do by design</h2>
              <ul className="check-list">
                <li>We do not sell your personal information.</li>
                <li>
                  We do not require you to create a Football Era account for the
                  experiences described here.
                </li>
                <li>
                  We do not use your saved careers to train third-party generative
                  models.
                </li>
                <li>We do not upload StoreKit payment details or your Apple Account.</li>
              </ul>
            </article>
          </section>

          <section className="section two-column">
            <article className="section-card">
              <h2>Children and families</h2>
              <p>
                Football Era is a game for a general audience. Parents and guardians
                should use Apple’s Screen Time and Family Sharing controls if they want
                to manage downloads, purchases, or play time for minors.
              </p>
            </article>
            <article className="section-card">
              <h2>Changes to this policy</h2>
              <p>
                Raw gameplay events are retained for up to 13 months. Rejected
                leaderboard audit records are retained for up to 90 days. An anonymous
                installation and its career snapshots are deleted after 24 months of
                inactivity or sooner when deletion is requested from Settings. Backup
                copies age out according to the backup retention schedule. We may keep
                statistics that have been aggregated so they no longer identify an
                installation. We may update this policy when the app or legal requirements change.
                The effective date at the top will change when we publish a revision.
                Continued use of the app after an update means you accept the revised
                policy.
              </p>
            </article>
          </section>

          <section className="section two-column">
            <article className="section-card">
              <h2>Your choices</h2>
              <ul className="check-list">
                <li>
                  Deleting the app from your iPhone removes local app data from that
                  device, subject to how iOS handles backups.
                </li>
                <li>
                  You can control optional Apple analytics and sharing in iOS
                  Settings.
                </li>
                <li>
                  Anonymous gameplay analytics can be turned off in Football Era
                  Settings. Turning it off also requests deletion of that installation’s
                  online events and career snapshots.
                </li>
                <li>
                  Public leaderboard sharing is separate and off by default. When you
                  turn it on, your in-game player name, position, team, and aggregate
                  score become visible to other players. Turning it off removes the
                  name and career from public results.
                </li>
              </ul>
            </article>
            <article className="section-card">
              <h2>Contact</h2>
              <p>
                Questions about this policy can be sent to{" "}
                <a href={`mailto:${footballEraConfig.supportEmail}`}>
                  {footballEraConfig.supportEmail}
                </a>
                .
              </p>
            </article>
          </section>

          <section className="section section-card">
            <h2>Related links</h2>
            <div className="hero-actions">
              <Link className="button button-primary" href="/football-era/support/">
                Support
              </Link>
              <Link className="button button-secondary" href="/football-era/">
                Football Era home
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
