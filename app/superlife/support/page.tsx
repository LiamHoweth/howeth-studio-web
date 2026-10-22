import type { Metadata } from "next";
import { SuperLifeInfoPage } from "../SuperLifeInfoPage";

export const metadata: Metadata = {
  title: "SuperLife support",
  description: "Help with SuperLife saved lives, purchases, Origin Lab, and story packs.",
  alternates: { canonical: "/superlife/support/" },
};

export default function SuperLifeSupportPage() {
  return (
    <SuperLifeInfoPage title="SuperLife support">
        <section>
        <p>For help with SuperLife: Hero Life Simulator, email <a href="mailto:howethstudio@gmail.com">howethstudio@gmail.com</a> with your app version, device model, iOS version, and a short description of the problem. A screenshot can help. Do not send passwords, payment card details, or a complete save unless you intend to share all of its fictional names, journals, and history.</p>
        </section>
        <section><h2>Saved lives</h2>
        <p>Core play works offline and saves on your device. Existing lives remain in Lives in Progress. Save exports contain the whole fictional world. Keep an export somewhere you control before removing the app or replacing your device. Do not uninstall the app to troubleshoot an unreadable save; preserve its existing files and contact support.</p>
        </section>
        <section><h2>Purchases</h2>
        <p>Use Settings → Store → Restore Purchases with the Apple Account that owns the purchase. Non-consumable unlocks can be restored. Tips are consumable and do not restore; their Supporter recognition stays on the original device. A pending purchase unlocks only after Apple approves and verifies it. If the Store is unavailable, the free game remains playable.</p>
        <p>Apple handles billing and refund requests. See <a href="https://support.apple.com/billing">Apple&#x27;s purchase support</a>.</p>
        </section>
        <section><h2>Origin Lab and story packs</h2>
        <p>Origin Lab creates separate, clearly marked sandbox lives. They cannot earn ranked scores, achievements, or challenge results. Your ordinary saved lives are preserved. Story-pack toggles affect future stories; an already-started story chain can finish after its pack is turned off.</p>
        </section>
        <section><h2>Privacy</h2>
        <p>The release candidate stores gameplay and optional diagnostics locally, has no configured ads, and does not automatically send your journal to support. See the <a href="/superlife/privacy/">SuperLife privacy policy</a> for purchase, export, sharing, and retention details.</p>
        </section>
    </SuperLifeInfoPage>
  );
}
