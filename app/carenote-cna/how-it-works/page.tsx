import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How CareNote CNA Works",
  description:
    "See the CareNote CNA workflow from resident selection to final saved note, including optional dictation, AI-assisted extraction, and review before save.",
  alternates: {
    canonical: "/carenote-cna/how-it-works/",
  },
};

export default function CareNoteHowItWorksPage() {
  return (
    <main id="main" className="page-main">
      <div className="site-shell">
        <section className="hero-panel">
          <span className="eyebrow">How It Works</span>
          <h1>A workflow CNAs can understand in minutes.</h1>
          <p className="hero-copy">
            The workflow is intentionally simple: choose the resident, capture the
            shift details, review smart suggestions if you use them, and save a
            clear final note.
          </p>
        </section>

        <section className="section section-card">
          <h2>Step-by-step</h2>
          <div className="workflow-grid">
            <article className="workflow-step">
              <span>1</span>
              <h3>Add or choose a resident</h3>
              <p>
                Start from the hall board and pick the resident you are documenting
                for the current shift.
              </p>
            </article>
            <article className="workflow-step">
              <span>2</span>
              <h3>Enter structured observations</h3>
              <p>
                Use dedicated sections for showers, bowel movements, refusals,
                behaviors, sleep or wake checks, catheter output, and observations.
              </p>
            </article>
            <article className="workflow-step">
              <span>3</span>
              <h3>Speak or type extra details</h3>
              <p>
                Optional dictation lets you capture details after leaving the room.
                You can also type directly if that is faster.
              </p>
            </article>
            <article className="workflow-step">
              <span>4</span>
              <h3>Review smart suggestions</h3>
              <p>
                Optional note assistance can help organize details faster, but you
                stay in control of the final saved note.
              </p>
            </article>
          </div>
        </section>

        <section className="section two-column">
          <article className="section-card">
            <h2>What happens next</h2>
            <ul className="check-list">
              <li>You review the suggested structured values before keeping them.</li>
              <li>You edit the narrative note if needed.</li>
              <li>You save the final report locally on-device.</li>
              <li>You can continue documenting manually whenever you prefer.</li>
            </ul>
          </article>
          <article className="quote-card">
            <strong>Guardrail</strong>
            <p>
              CareNote CNA never takes the final chart away from the caregiver.
              Review happens before save, not after.
            </p>
          </article>
        </section>

        <section className="section section-card">
          <h2>Why this workflow works</h2>
          <p className="lede">
            CareNote CNA is built to reduce end-of-shift friction without making
            documentation harder to trust.
          </p>
          <ul className="check-list">
            <li>
              Structured sections help keep resident care details easier to review
              later.
            </li>
            <li>
              Optional voice capture helps you save time when typing every detail is
              slower.
            </li>
            <li>
              Editable note suggestions help speed up charting without skipping
              caregiver review.
            </li>
            <li>
              A final review step helps you save a cleaner, more consistent report.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
