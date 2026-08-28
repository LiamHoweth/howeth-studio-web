import type { Metadata } from "next";
import Link from "next/link";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";

export const metadata: Metadata = {
  title: "Football Era — App Store Details",
  description:
    "Store submission details for Football Era accounts, cloud career saves, authenticated leaderboards, and privacy declarations.",
  alternates: {
    canonical: "/football-era/app-store/",
  },
};

function CopyBlock({
  label,
  limit,
  children,
}: {
  label: string;
  limit?: string;
  children: string;
}) {
  return (
    <article className="section-card">
      <h2>
        {label}
        {limit ? <span className="fe-copy-limit"> ({limit})</span> : null}
      </h2>
      <pre className="fe-asc-block">{children.trim()}</pre>
      <p className="fe-copy-hint">
        Copy from the box above and paste into the matching field in App Store
        Connect. Adjust for your final build and any Apple character limits that
        change over time.
      </p>
    </article>
  );
}

export default function FootballEraAppStorePage() {
  return (
    <>
      <StudioSiteHeader />
      <main className="page-main">
        <div className="site-shell">
          <section className="hero-panel">
            <span className="eyebrow">App Store · Account-enabled release</span>
            <h1>The next Football Era release.</h1>
            <p className="hero-copy">
              Submission-ready product and privacy language for optional Apple and
              Google accounts, cloud career saves, authenticated leaderboards, and
              guest-first offline play.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/football-era/privacy/">
                Privacy Policy URL
              </Link>
              <Link className="button button-secondary" href="/football-era/support/">
                Support URL
              </Link>
              <Link className="button button-ghost" href="/football-era/">
                Product page
              </Link>
            </div>
          </section>

          <section className="section">
            <CopyBlock label="Name" limit="30 characters">
{`Football Era`}
            </CopyBlock>

            <CopyBlock label="Subtitle" limit="30 characters">
{`Build Your Football Legacy`}
            </CopyBlock>

            <CopyBlock label="Promotional text" limit="170 characters">
{`Create your player, own spotlight decisions, chase records, spend your contracts, and build a football career worthy of the Hall of Fame.`}
            </CopyBlock>

            <CopyBlock label="Description" limit="4,000 characters">
{`Create a quarterback, running back, or wide receiver and build a complete professional football career—one week, one decision, and one season at a time.

OWN THE BIG MOMENTS
Spotlight games put the situation in your hands. Read the score, clock, down, and distance, then choose the play that can change the game. Team-specific stadium arrivals set the stage before kickoff across the full 32-club league.

BUILD YOUR PLAYER
Develop position-specific attributes, spend skill points, earn coach trust, fight for a depth-chart role, and turn production into contracts. Choose offseason training and commit to new season goals as your career evolves.

FOLLOW THE WHOLE LEAGUE
Track news, standings, playoff brackets, rosters, awards, records, and position leaderboards. Season and all-time boards show exactly where your QB, RB, or WR stands.

LIVE BEYOND FOOTBALL
Spend career earnings across Realty, Motors, Jewelry, and Performance. Every category contains more than 100 possible items, but only 4–7 rarity-weighted listings appear each week. Build a collection, chase legendary finds, or invest in services that improve development, recovery, opinion, followers, and earnings.

WRITE A COMPLETE CAREER STORY
Seasons, contracts, trades, awards, purchases, milestones, and records become part of your saved career history. When you choose to retire, review the trophy case, greatest moments, legacy score, and Hall of Fame result.

PREMIUM BY DESIGN
Football Era has no ads, no subscriptions, and no consumable currency. Optional VIP, 2x XP, 2x Money, and Extra Career Slots gamepasses are permanent App Store purchases and can be restored.

Football Era is local-first and remains fully playable without an account or network connection. Optional Apple or Google sign-in adds cloud career saves and validated online leaderboards using server-generated public aliases.`}
            </CopyBlock>

            <CopyBlock label="Keywords" limit="100 characters (comma-separated, no spaces after commas per Apple guidance)">
{`football,career,sim,season,sports,legacy,quarterback,offline,manager,rpg`}
            </CopyBlock>
          </section>

          <section className="section two-column">
            <article className="section-card">
              <h2>What’s New</h2>
              <pre className="fe-asc-block">{`• Optional Sign in with Apple and Google accounts—guest play remains fully available.
• Cloud synchronization for durable career slots, with offline-first conflict recovery.
• Authenticated leaderboards with private in-game names and server-generated public aliases.
• Repairs for careers that could become stuck after playoff elimination or before the offseason.
• Explicit analytics controls, original offline audio, account sync, sign-out, and permanent deletion.`}</pre>
            </article>
            <article className="section-card">
              <h2>Review notes (template)</h2>
              <p>
                No login is required. On the first New Career or Continue Career action
                after launch, choose Continue as Guest to use the complete offline game.
                Apple and Google sign-in enable cloud saves and online leaderboards.
                Account status, sign-out, sync retry, and deletion are in More →
                Settings. The first-launch analytics prompt can be declined without
                limiting gameplay. Public leaderboards use server-generated aliases;
                private career names are not displayed. Permanent gamepasses are
                restored separately through the storefront account.
              </p>
            </article>
          </section>

          <section className="section section-card">
            <span className="eyebrow">App Privacy answers · API-enabled build</span>
            <h2>Declare collection before submitting the next version</h2>
            <div className="feature-grid">
              <article className="feature-card">
                <h3>Contact Info · Email Address</h3>
                <p>
                  Used for app functionality when a sign-in provider supplies a
                  verified email. Linked to the optional Football Era account and not
                  used for tracking.
                </p>
              </article>
              <article className="feature-card">
                <h3>Identifiers · User ID</h3>
                <p>
                  Used for authentication, cloud saves, leaderboards, security, and
                  account deletion. Linked to the optional account and not used for
                  tracking. The separate random installation identifier is used for
                  unlinked analytics.
                </p>
              </article>
              <article className="feature-card">
                <h3>User Content · Gameplay Content</h3>
                <p>
                  Used for cloud career saves, authenticated public leaderboards, and
                  app functionality. Private cloud saves can contain the in-game name;
                  public boards display a server-generated alias. Account cloud saves
                  and published careers are linked to the user ID; anonymous analytics
                  remain separate. Not used for tracking.
                </p>
              </article>
              <article className="feature-card">
                <h3>Usage Data · Product Interaction</h3>
                <p>
                  Used for optional analytics, covering sessions, feature areas,
                  progression, seasons, and retirement milestones. Associated only
                  with a random installation ID, not the optional account, and not used
                  for tracking. Collection begins only after an explicit in-app choice.
                </p>
              </article>
            </div>
            <p className="lede">
              Select “Data Used to Track You: No” for every category. Mark Email
              Address, User ID, and account Gameplay Content as linked to the user;
              mark anonymous Product Interaction and its random installation ID as not
              linked. Use https://howethstudio.com/football-era/privacy/ for privacy
              and https://howethstudio.com/football-era/account-deletion/ for deletion.
            </p>
          </section>

          <section className="section section-card">
            <span className="eyebrow">Google Play Data Safety · Android release</span>
            <h2>Declare account and gameplay collection</h2>
            <p>
              Declare email address and user ID as optional personal information used
              for account management and app functionality. Declare cloud career saves
              and published server-generated leaderboard aliases as app activity used
              for app functionality. Declare the separate random
              installation ID and product interaction as optional analytics. Data is
              encrypted in transit, is not sold, and is not used for advertising or
              cross-app tracking. Service-provider processing does not change the
              purpose. Confirm the current Play Console taxonomy against the exact
              release build before submission.
            </p>
            <p className="lede">
              Answer that users can request deletion and provide
              https://howethstudio.com/football-era/account-deletion/ as the external
              account-deletion resource.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
