import type { Metadata } from "next";
import Link from "next/link";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";
import { footballEraConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Football Era — Build Your Football Legacy",
  description:
    "Football Era is a premium iPhone football career simulation. Play as a QB, RB, or WR through weekly decisions, contracts, records, lifestyle, and retirement.",
  alternates: { canonical: "/football-era/" },
};

const careerLenses = [
  {
    index: "01",
    title: "Career",
    copy: "Advance the week, manage your role, spend skill points, track attributes, and turn production into trust, money, and a better contract.",
  },
  {
    index: "02",
    title: "League",
    copy: "Follow news, standings, playoffs, rosters, awards, and position-specific record boards that move with every simulated week.",
  },
  {
    index: "03",
    title: "Life",
    copy: "Shop weekly Realty, Motors, Jewelry, and Performance listings. Collect rare finds or invest in services that support your career.",
  },
  {
    index: "04",
    title: "More",
    copy: "Develop skills, switch save slots, manage permanent gamepasses, tune accessibility, get support, or decide when your career is complete.",
  },
] as const;

const gamepasses = [
  ["VIP", "1.5× XP + 1.5× money"],
  ["2× XP", "Permanent development boost"],
  ["2× Money", "Permanent earnings boost"],
  ["Extra Slots", "Expand from two careers to five"],
] as const;

export default function FootballEraPage() {
  const appStoreUrl = footballEraConfig.appStoreUrl;
  const testFlightUrl = footballEraConfig.testFlightUrl;
  const storeClass = "button button-primary" + (appStoreUrl ? "" : " is-disabled");
  const tfClass = "button button-secondary" + (testFlightUrl ? "" : " is-disabled");
  const storeHref = appStoreUrl || "#";
  const tfHref = testFlightUrl || "#";

  return (
    <>
      <StudioSiteHeader />
      <main className="page-main">
        <div className="site-shell">
          <section className="hero-panel fe-game-hero">
            <div className="hero-grid">
              <div className="fe-game-hero__copy">
                <span className="eyebrow">Football career simulation · v1.1</span>
                <h1>Build a career worth remembering.</h1>
                <p className="hero-copy">
                  Create a quarterback, running back, or wide receiver and live the
                  full arc: weekly games, spotlight decisions, depth-chart battles,
                  contracts, records, life away from football, and the final Hall of
                  Fame verdict.
                </p>
                <div className="hero-actions">
                  <a className={storeClass} href={storeHref}>
                    Download on the App Store
                  </a>
                  {testFlightUrl ? (
                    <a className={tfClass} href={tfHref}>
                      Join TestFlight
                    </a>
                  ) : null}
                  <Link className="button button-ghost" href="/football-era/support/">
                    Support
                  </Link>
                </div>
                <div className="fe-stat-strip">
                  <div className="fe-stat-cell">
                    <span className="fe-stat-label">League</span>
                    <span className="fe-stat-value">32 clubs</span>
                  </div>
                  <div className="fe-stat-cell">
                    <span className="fe-stat-label">Choose</span>
                    <span className="fe-stat-value">QB · RB · WR</span>
                  </div>
                  <div className="fe-stat-cell">
                    <span className="fe-stat-label">Regular season</span>
                    <span className="fe-stat-value">17 weeks</span>
                  </div>
                  <div className="fe-stat-cell">
                    <span className="fe-stat-label">Lifestyle</span>
                    <span className="fe-stat-value">100+ / category</span>
                  </div>
                </div>
              </div>

              <div className="fe-career-board" aria-label="Football Era career dashboard preview">
                <div className="fe-career-board__kicker">Career · Year 4</div>
                <div className="fe-career-board__player">
                  <div>
                    <span className="fe-career-board__label">Player</span>
                    <strong>Jordan Hale</strong>
                  </div>
                  <span className="fe-career-board__ovr">87 OVR</span>
                </div>
                <div className="fe-career-board__meters">
                  <div><span>Role</span><strong>R1 · Starter</strong></div>
                  <div><span>Trust</span><strong>82</strong></div>
                  <div><span>Health</span><strong>94</strong></div>
                  <div><span>Money</span><strong>$4.8M</strong></div>
                </div>
                <div className="fe-career-board__matchup">
                  <span className="fe-career-board__label">Next · Week 9 · Away</span>
                  <div className="fe-career-board__teams">
                    <strong>Chicago</strong><span>at</span><strong>Detroit</strong>
                  </div>
                  <div className="fe-career-board__venue">
                    <span className="fe-career-board__field" aria-hidden="true" />
                    <span>Pregame stadium arrival</span>
                  </div>
                </div>
                <div className="fe-career-board__dock" aria-hidden="true">
                  <span>Career</span><span>League</span><strong>+</strong><span>Life</span><span>More</span>
                </div>
              </div>
            </div>
          </section>

          <section className="section fe-section-intro">
            <p className="fe-section-index">001 · The weekly loop</p>
            <h2>Your season moves one decision at a time.</h2>
            <p>
              Football Era compresses a complete pro career into a rhythm made for
              the phone. Read the matchup, advance, own the moments that matter, and
              live with what the result changes.
            </p>
          </section>

          <section className="section fe-week-grid" aria-label="Football Era weekly game loop">
            <article><span>01</span><h3>Read the week</h3><p>See your opponent, team record, role, goals, health, and career state before kickoff.</p></article>
            <article><span>02</span><h3>Arrive at the venue</h3><p>Home and away games open with team-specific stadium presentation across all 32 clubs.</p></article>
            <article><span>03</span><h3>Own the moment</h3><p>Down, distance, clock, and score frame the choices that decide spotlight games.</p></article>
            <article><span>04</span><h3>Take the result</h3><p>Stats, XP, money, trust, confidence, health, news, and records all move forward together.</p></article>
          </section>

          <section className="section fe-moment-stage">
            <div className="fe-stadium-visual" aria-hidden="true">
              <div className="fe-stadium-visual__lights" />
              <div className="fe-stadium-visual__bowl" />
              <div className="fe-stadium-visual__field"><span>DETROIT</span></div>
            </div>
            <div className="fe-moment-card">
              <p className="fe-section-index">Spotlight game · 4th quarter</p>
              <div className="fe-moment-card__score"><span>CHI 24</span><strong>DET 27</strong><span>01:18</span></div>
              <h2>3rd &amp; 6. The season is on this drive.</h2>
              <p>
                Pressure closes in. Trust your release, escape the pocket, or take
                the safe completion and live for fourth down.
              </p>
              <div className="fe-choice-list" aria-hidden="true">
                <span>Attack the boundary</span><span>Escape and run</span><span>Check it down</span>
              </div>
            </div>
          </section>

          <section className="section fe-section-intro">
            <p className="fe-section-index">002 · One career, four lenses</p>
            <h2>Everything important stays one tap away.</h2>
            <p>
              The current game is organized around Career, League, Life, and More,
              with a center action that always knows whether you are advancing a
              week, finishing a game, or completing an offseason checklist.
            </p>
          </section>

          <section className="section fe-lens-grid">
            {careerLenses.map((lens) => (
              <article key={lens.index}>
                <span>{lens.index}</span><h3>{lens.title}</h3><p>{lens.copy}</p>
              </article>
            ))}
          </section>

          <section className="section fe-life-section">
            <div className="fe-life-section__copy">
              <p className="fe-section-index">003 · Life beyond the field</p>
              <h2>Spend the contract. Shape the story.</h2>
              <p>
                Every category holds more than one hundred possible items, while
                only four to seven appear each week. Common finds keep life moving;
                legendary listings make a season memorable.
              </p>
              <ul className="check-list">
                <li>Realty — condos, estates, penthouses, and private compounds.</li>
                <li>Motors — daily drivers, performance cars, and rare allocations.</li>
                <li>Jewelry — watches, chains, rings, and collector pieces.</li>
                <li>Performance — training, recovery, media, and career services.</li>
              </ul>
            </div>
            <div className="fe-market-board" aria-label="Weekly lifestyle market preview">
              <div className="fe-market-board__head"><span>Weekly market · Year 4 · Week 9</span><strong>4–7 fresh listings</strong></div>
              <div className="fe-market-row"><span>Realty</span><strong>North Shore Penthouse</strong><em>EPIC</em></div>
              <div className="fe-market-row"><span>Motors</span><strong>Nova Track Special</strong><em>RARE</em></div>
              <div className="fe-market-row"><span>Jewelry</span><strong>Onyx Championship Band</strong><em>LEGENDARY</em></div>
              <div className="fe-market-row"><span>Performance</span><strong>Recovery Science Lab</strong><em>UNCOMMON</em></div>
            </div>
          </section>

          <section className="section fe-legacy-section">
            <div className="fe-record-board">
              <div className="fe-record-board__head">
                <div><span className="fe-section-index">Position records</span><h3>All-time receiving yards</h3></div>
                <span>WR · Career</span>
              </div>
              <ol>
                <li><span>01</span><strong>Dax Holliday</strong><em>15,604</em></li>
                <li><span>02</span><strong>Jordan Hale · You</strong><em>14,988</em></li>
                <li><span>03</span><strong>Rowan Mercer</strong><em>14,612</em></li>
                <li><span>04</span><strong>Vance Redford</strong><em>13,940</em></li>
              </ol>
            </div>
            <div className="fe-legacy-section__copy">
              <p className="fe-section-index">004 · The long game</p>
              <h2>Leave a record behind.</h2>
              <p>
                Career history now remembers the arc—not only the final totals.
                Seasons, trades, contracts, awards, purchases, records, and title
                moments build a timeline you can review when you choose to retire.
              </p>
              <ul className="check-list">
                <li>Season and all-time boards tuned for QB, RB, and WR.</li>
                <li>Goals, team promises, depth-chart roles, and offseason training.</li>
                <li>Trophy case, greatest moments, legacy score, and Hall of Fame result.</li>
              </ul>
            </div>
          </section>

          <section className="section fe-upgrade-section">
            <div>
              <p className="fe-section-index">Premium by design</p>
              <h2>No ads. No subscriptions. No consumable currency.</h2>
              <p>
                The full career remains playable offline. Optional gamepasses are
                permanent App Store purchases, restore across devices on the same
                Apple Account, and explain every multiplier in the reward breakdown.
              </p>
            </div>
            <div className="fe-gamepass-grid">
              {gamepasses.map(([title, detail]) => (
                <article key={title}><strong>{title}</strong><span>{detail}</span></article>
              ))}
            </div>
          </section>

          <section className="section fe-final-cta">
            <div><p className="fe-section-index">Your era starts at 60 OVR</p><h2>What happens next is yours.</h2></div>
            <div className="fe-final-cta__actions">
              <a className={storeClass} href={storeHref}>Download on the App Store</a>
              <Link className="button button-secondary" href="/football-era/support/">Get support</Link>
            </div>
            <p className="fe-footnote-links">
              <Link href="/football-era/privacy/">Privacy</Link><span aria-hidden="true"> · </span>
              <Link href="/football-era/app-store/">App Store details</Link><span aria-hidden="true"> · </span>
              <Link href="/">Howeth Studio</Link>
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
