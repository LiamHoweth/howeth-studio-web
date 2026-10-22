import type { Metadata } from "next";
import { SuperLifeInfoPage } from "../SuperLifeInfoPage";

export const metadata: Metadata = {
  title: "SuperLife privacy policy",
  description: "How SuperLife handles local saved lives, diagnostics, exports, and support.",
  alternates: { canonical: "/superlife/privacy/" },
};

export default function SuperLifePrivacyPage() {
  return (
    <SuperLifeInfoPage title="SuperLife privacy policy">
        <section>
          <p>SuperLife: Hero Life Simulator is an offline superhero life simulation by Howeth Studio. This policy describes the free first release. No in-app purchases, advertising provider, analytics service, iCloud saves, or Game Center service are enabled.</p>
        </section>
        <section>
          <h2>Your fictional lives and preferences</h2>
          <p>Names, journals, family relationships, fictional finances, possessions, health, legal history, careers, and challenges are stored on your device. Sound, haptics, and appearance preferences are also stored locally. These are fictional gameplay records. We do not automatically receive them.</p>
          <p>SuperLife does not require an in-app account. Core play works without an internet connection. The app does not request your location, contacts, microphone, camera, or tracking permission. Ordinary device backups may include saved lives and cosmetic preferences, depending on your Apple settings.</p>
        </section>
        <section>
          <h2>Free first release</h2>
          <p>The first release is free to play and has no in-app purchases or subscriptions. Planned extras marked “Coming soon” are unavailable in this release. They cannot be purchased or unlocked. This release does not collect payment or purchase-transaction information.</p>
        </section>
        <section>
          <h2>Exports and sharing</h2>
          <p>Sharing a save is your choice. A save export contains the complete fictional world, including names and journals. Review it before sharing. Apple provides the system export and share interfaces. A destination you choose handles the copy under its own policies and permission controls.</p>
        </section>
        <section>
          <h2>Local diagnostics</h2>
          <p>Diagnostics recording starts off at each launch. If you opt in, the app records only fixed event and outcome categories, UTC day, and coarse duration/count buckets. It does not include fictional names, journal text, save contents, payment details, or free-form error messages. Records stay on your device unless you deliberately export and share them.</p>
          <p>Previously recorded diagnostics may remain until cleared or pruned during enabled use. Turning recording off stops new recording and attempts to delete the stored archive; the app reports deletion failures. You can also use Clear diagnostics.</p>
        </section>
        <section>
          <h2>Online services and advertising</h2>
          <p>This release has no configured advertising provider, analytics endpoint, private iCloud checkpoint service, or Game Center leaderboard service. It does not upload your fictional lives, submit rankings automatically, or display third-party ads. Opening a support or privacy link uses your browser and the destination website&#x27;s ordinary hosting services.</p>
          <p>If a later release enables purchases, optional online services, or advertising, its policy and store disclosures must be updated to describe the actual data flows before those features are enabled.</p>
        </section>
        <section>
          <h2>Deletion and support</h2>
          <p>Deleting a saved life through the app removes its local slot. Copies you have exported, shared, or retained in device backups are separate copies. Removing the app removes its local app data. Do not delete your app as a troubleshooting step unless you have retained any saves you want to keep.</p>
          <p>You can contact Howeth Studio at <a href="mailto:howethstudio@gmail.com">howethstudio@gmail.com</a>. If you email us, we receive the address, message, and attachments you choose to send so we can answer your request. Please avoid sending passwords, payment information, or personal information in fictional character names or attachments.</p>
        </section>
        <section>
          <h2>Changes</h2>
          <p>We will update this policy when the app&#x27;s relevant behavior changes. The published page will identify its effective date.</p>
        </section>
    </SuperLifeInfoPage>
  );
}
