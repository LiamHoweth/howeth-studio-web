import type { Metadata } from "next";
import Link from "next/link";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";
import { footballEraConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Football Era Privacy Policy",
  description:
    "How Football Era handles optional accounts, cloud career saves, authenticated leaderboards, and anonymous gameplay analytics.",
  alternates: { canonical: "/football-era/privacy/" },
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
              Effective date: August 22, 2026. This policy explains how Football Era
              (“the app”), published by Howeth Studio, handles information when you
              play as a guest or choose to create an account.
            </p>
          </section>

          <section className="section two-column">
            <article className="section-card">
              <h2>Guest play and local data</h2>
              <p>
                No account is required. Guests can create careers, play the complete
                offline game, and use local league records. Career saves, preferences,
                reminders, interface state, and verified App Store or Play purchases
                remain on the device unless this policy says otherwise. Guests cannot
                view or publish to the online leaderboard or use Football Era cloud
                saves.
              </p>
            </article>
            <article className="section-card">
              <h2>Optional Apple and Google accounts</h2>
              <p>
                If you sign in, we receive a provider-specific account identifier and,
                when the provider supplies it, a verified email address. We do not
                receive your provider password or store a provider profile. Apple and
                Google sign-ins create separate Football Era accounts even when they
                use the same email address. Authentication sessions are stored as
                one-way hashes, and Apple refresh credentials are encrypted so we can
                revoke them when an account is deleted.
              </p>
            </article>
          </section>

          <section className="section two-column">
            <article className="section-card">
              <h2>Cloud career saves</h2>
              <p>
                Signing in uploads eligible durable career slots, including empty-slot
                deletion markers, and keeps up to five slots associated with that
                account. Slot data can include the player, league, season, career
                history, inventory, and other progress needed to restore that career.
                Purchases and entitlements, preferences, reminders, and transient
                interface state are not part of cloud saves. When copies conflict, the
                copy with the latest update time wins; the cloud copy wins a tie.
              </p>
            </article>
            <article className="section-card">
              <h2>Authenticated leaderboards</h2>
              <p>
                Occupied careers are published automatically while signed in. Other
                signed-in players can see a server-generated public alias, position,
                team, and validated aggregate scores such as legacy, yards,
                touchdowns, championships, overall rating, followers, and net worth.
                The career&apos;s in-game player name is included in its private cloud
                save but is never shown on the public leaderboard. Server-side checks
                validate submitted totals. Rejected submission reasons may be retained
                temporarily to detect abuse.
              </p>
            </article>
          </section>

          <section className="section two-column">
            <article className="section-card">
              <h2>Anonymous analytics and diagnostics</h2>
              <p>
                Separately from any account, optional analytics use a random
                installation identifier and may include app version and platform,
                sessions, features opened, weekly outcomes, aggregate progression,
                purchase category and rarity, skill upgrades, contracts, season and
                retirement results, and aggregate career statistics. We use this to
                measure reliability, retention, and game balance. It is not used for
                advertising or cross-app tracking, and it is not combined with your
                Apple or Google account identity. Football Era asks for your choice
                before registering an analytics installation or sending an event.
              </p>
            </article>
            <article className="section-card">
              <h2>Service providers and security</h2>
              <p>
                Apple or Google processes your sign-in according to the provider you
                choose. Railway hosts our API, PostgreSQL database, encrypted backups,
                and operational logs and may process limited network and request
                metadata to operate and secure those services. Apple processes App
                Store purchases; Howeth Studio does not receive payment-card details.
                We do not sell personal information or use saved careers to train
                third-party generative models.
              </p>
            </article>
          </section>

          <section className="section two-column">
            <article className="section-card">
              <h2>Retention and deletion</h2>
              <p>
                Account data and cloud careers remain until you delete the account.
                Sessions expire after 90 days of inactivity and roll forward while
                used. Raw anonymous gameplay events are retained for up to 13 months,
                rejected leaderboard audits for up to 90 days, and inactive anonymous
                installations and snapshots for up to 24 months. Backups expire on
                their normal schedule, and statistics may be kept only after they have
                been aggregated so they no longer identify an account or installation.
              </p>
            </article>
            <article className="section-card">
              <h2>Your choices</h2>
              <ul className="check-list">
                <li>Play the full offline game without creating an account.</li>
                <li>Allow or decline anonymous gameplay analytics before collection begins.</li>
                <li>Withdraw analytics consent in Settings and request deletion of that installation&apos;s analytics data.</li>
                <li>Sign out while keeping downloaded careers playable as a guest.</li>
                <li>
                  Delete your account in Settings to remove its sessions, linked
                  identity, cloud saves, and leaderboard entries. Local careers remain
                  on that device as guest careers.
                </li>
                <li>
                  Use our external deletion instructions if you no longer have the app.
                </li>
              </ul>
            </article>
          </section>

          <section className="section two-column">
            <article className="section-card">
              <h2>Children and families</h2>
              <p>
                Football Era is a general-audience game. Parents and guardians can use
                Apple Screen Time, Family Sharing, or Google Play family controls to
                manage downloads, purchases, or play time for minors.
              </p>
            </article>
            <article className="section-card">
              <h2>Changes and contact</h2>
              <p>
                We may update this policy when the app, our services, or legal
                requirements change. We will revise the effective date above. Questions
                can be sent to{" "}
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
              <Link className="button button-primary" href="/football-era/account-deletion/">
                Delete an account
              </Link>
              <Link className="button button-secondary" href="/football-era/support/">
                Support
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
