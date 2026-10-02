import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CareNote CNA Features",
  description:
    "Explore CareNote CNA features including structured charting, optional voice capture, smart note assistance, and a caregiver-first review workflow.",
  alternates: {
    canonical: "/carenote-cna/features/",
  },
};

export default function CareNoteFeaturesPage() {
  return (
    <main id="main" className="page-main">
      <div className="site-shell">
        <section className="hero-panel">
          <span className="eyebrow">Features</span>
          <h1>Everything you need for faster, clearer shift notes.</h1>
          <p className="hero-copy">
            CareNote CNA is designed to help caregivers move through documentation
            with less friction. Structured charting stays at the center, and smart
            note assistance helps speed up the parts that usually take the longest.
          </p>
        </section>

        <section className="section section-card">
          <h2>Core product pillars</h2>
          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon">A</div>
              <h3>Resident tracking by hall</h3>
              <p>
                Use hall-based organization to keep large resident lists easier to
                scan during a shift.
              </p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">B</div>
              <h3>Structured charting sections</h3>
              <p>
                Document appointments, showers, bowel movements, refusals,
                behaviors, sleep or wake status, catheter output, and notable
                observations in discrete fields.
              </p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">C</div>
              <h3>Quick picks for repeat actions</h3>
              <p>
                Move faster with refusal templates, behavior chips, and one-tap
                bowel movement counters by size.
              </p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">D</div>
              <h3>Optional voice capture</h3>
              <p>
                Capture observations quickly after leaving the room, then review
                and adjust the details before save.
              </p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">E</div>
              <h3>Smart note assistance</h3>
              <p>
                Turn recorded observations into draft suggestions faster while
                keeping the caregiver in charge of the final note.
              </p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">F</div>
              <h3>Review before save</h3>
              <p>
                Nothing is locked in automatically. Edit the note, verify the
                details, and save only when it looks right.
              </p>
            </article>
          </div>
        </section>

        <section className="section metric-grid">
          <article className="metric-card">
            <strong>1</strong>
            <h3>organized workflow</h3>
            <p>
              Resident details, structured sections, and final review all stay in
              one place.
            </p>
          </article>
          <article className="metric-card">
            <strong>100%</strong>
            <h3>editable notes</h3>
            <p>
              Caregivers can review and edit note suggestions before the final save.
            </p>
          </article>
          <article className="metric-card">
            <strong>iPhone</strong>
            <h3>first design</h3>
            <p>The app is designed for fast use on iPhone during real shift work.</p>
          </article>
          <article className="metric-card">
            <strong>Fast</strong>
            <h3>shift-ready tools</h3>
            <p>
              Quick picks and structured fields help reduce repeated typing
              throughout the shift.
            </p>
          </article>
        </section>

        <section className="section two-column">
          <article className="section-card">
            <h2>Designed for control</h2>
            <ul className="check-list">
              <li>Nothing is auto-finalized without user review.</li>
              <li>Generated notes remain editable until save.</li>
              <li>
                Structured charting keeps the note organized and easier to scan
                later.
              </li>
              <li>Optional smart assistance helps with speed, not final authority.</li>
              <li>Privacy and review stay built into the workflow.</li>
            </ul>
          </article>
          <article className="section-card">
            <h2>Made for everyday shifts</h2>
            <p>
              CareNote CNA is built for repeated daily use: selecting a resident
              quickly, capturing what happened during the shift, reviewing the
              note, and saving without losing time at the end of the day.
            </p>
            <p>
              It is especially useful for caregivers who want a cleaner process
              than scattered notes, memory-based charting, or rushed end-of-shift
              summaries.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
