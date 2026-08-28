import type { Metadata } from "next";
import Link from "next/link";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";
import { footballEraConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Delete a Football Era Account",
  description:
    "Delete your Football Era account in the app or request deletion by email using your account ID.",
  alternates: { canonical: "/football-era/account-deletion/" },
};

const requestSubject = encodeURIComponent("Football Era account deletion request");
const requestBody = encodeURIComponent(
  "Football Era account ID:\nSign-in provider (Apple or Google):\nVerified email, if shown in Settings:\n\nI request permanent deletion of this Football Era account."
);

export default function FootballEraAccountDeletionPage() {
  const requestHref = `mailto:${footballEraConfig.supportEmail}?subject=${requestSubject}&body=${requestBody}`;

  return (
    <>
      <StudioSiteHeader />
      <main className="page-main">
        <div className="site-shell">
          <section className="hero-panel">
            <span className="eyebrow">Account deletion</span>
            <h1>Delete your Football Era account.</h1>
            <p className="hero-copy">
              The fastest option is inside the app. If you no longer have access to
              it, send us a deletion request using the account details below.
            </p>
          </section>

          <section className="section two-column">
            <article className="section-card">
              <h2>Delete in the app</h2>
              <ol className="check-list">
                <li>Open Football Era and go to More → Settings.</li>
                <li>Find the Account card and confirm the displayed account ID.</li>
                <li>Choose Delete Account and confirm permanent deletion.</li>
              </ol>
              <p>
                This removes the account, active sessions, linked Apple or Google
                identity, cloud career slots, and public leaderboard entries.
              </p>
            </article>
            <article className="section-card">
              <h2>Request deletion by email</h2>
              <p>
                Include the Football Era account ID shown in Settings, whether you
                used Apple or Google, and the verified email if the app displays one.
                We may ask for a limited verification step before deleting the account.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href={requestHref}>
                  Email deletion request
                </a>
              </div>
            </article>
          </section>

          <section className="section section-card">
            <h2>What happens to local careers?</h2>
            <p>
              Careers already stored on your device remain playable as guest careers.
              They no longer sync to the deleted account or appear in its online
              leaderboards. Removing the app may separately remove local data according
              to your device backup settings. Account deletion does not cancel or erase
              App Store or Google Play purchase records.
            </p>
            <div className="hero-actions">
              <Link className="button button-secondary" href="/football-era/privacy/">
                Read the privacy policy
              </Link>
              <Link className="button button-ghost" href="/football-era/support/">
                Support
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
