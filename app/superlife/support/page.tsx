import type { Metadata } from "next";
import { SuperLifeInfoPage } from "../SuperLifeInfoPage";

export const metadata: Metadata = {
  title: "SuperLife support",
  description: "Help with SuperLife saved lives, the free first release, and planned extras.",
  alternates: { canonical: "/superlife/support/" },
};

export default function SuperLifeSupportPage() {
  return (
    <SuperLifeInfoPage title="SuperLife support">
        <section>
          <p>For help with SuperLife: Hero Life Simulator, email <a href="mailto:howethstudio@gmail.com">howethstudio@gmail.com</a> with your app version, device model, iOS version, and a short description of the problem. A screenshot can help. Do not send passwords, payment card details, or a complete save unless you intend to share all of its fictional names, journals, and history.</p>
        </section>
        <section>
          <h2>Saved lives</h2>
          <p>Core play works offline and saves on your device. Existing lives remain in Lives in Progress. Save exports contain the whole fictional world. Keep an export somewhere you control before removing the app or replacing your device. Do not uninstall the app to troubleshoot an unreadable save; preserve its existing files and contact support.</p>
        </section>
        <section>
          <h2>Free first release and planned extras</h2>
          <p>The first release is free to play and has no in-app purchases or subscriptions. Items marked “Coming soon” are planned extras and are unavailable in this release. They cannot be purchased or unlocked. You can continue playing the free life simulator without them.</p>
        </section>
        <section>
          <h2>Privacy</h2>
          <p>This release stores gameplay and optional diagnostics locally. It has no configured advertising provider, analytics service, iCloud saves, or Game Center leaderboard service, and does not automatically send your journal to support. See the <a href="/superlife/privacy/">SuperLife privacy policy</a> for export, sharing, and retention details.</p>
        </section>
    </SuperLifeInfoPage>
  );
}
