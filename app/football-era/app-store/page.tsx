import type { Metadata } from "next";
import Link from "next/link";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";

export const metadata: Metadata = {
  title: "Football Era — App Store Details",
  description:
    "Current App Store details for Football Era 1.1, including its football career simulation, weekly moments, lifestyle market, records, and permanent gamepasses.",
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
            <span className="eyebrow">App Store · Version 1.1</span>
            <h1>The current Football Era release.</h1>
            <p className="hero-copy">
              Release-aligned product language for the live iPhone game: weekly
              career decisions, league history, an expanded Lifestyle economy,
              stadium arrivals, and permanent upgrades with no subscriptions.
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

Football Era is local-first and remains fully playable without an account or network connection.`}
            </CopyBlock>

            <CopyBlock label="Keywords" limit="100 characters (comma-separated, no spaces after commas per Apple guidance)">
{`football,career,sim,season,sports,legacy,quarterback,offline,manager,rpg`}
            </CopyBlock>
          </section>

          <section className="section two-column">
            <article className="section-card">
              <h2>What’s New in 1.1</h2>
              <pre className="fe-asc-block">{`• A redesigned Lifestyle experience with 100+ items in every category and fresh weekly listings.
• Team-specific stadium arrivals and improved Game Moment presentation.
• Permanent VIP, 2x XP, 2x Money, and Extra Career Slots gamepasses with restore support.
• Expanded career records, history, progression, and interface polish.`}</pre>
            </article>
            <article className="section-card">
              <h2>Review notes (template)</h2>
              <p>
                No login is required. Create or select a career, then open More →
                Football Era Shop to review the permanent gamepasses. Purchases can
                be restored from Shop or Settings, and the full career remains
                playable offline.
              </p>
            </article>
          </section>
        </div>
      </main>
    </>
  );
}
