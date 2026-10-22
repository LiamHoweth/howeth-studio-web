import type { Metadata } from "next";
import { SuperLifeInfoPage } from "../SuperLifeInfoPage";

export const metadata: Metadata = {
  title: "SuperLife privacy policy",
  description: "How SuperLife handles local saved lives, optional App Store purchases, diagnostics, exports, and support.",
  alternates: { canonical: "/superlife/privacy/" },
};

export default function SuperLifePrivacyPage() {
  return (
    <SuperLifeInfoPage title="SuperLife privacy policy">
        <section>
        <p>SuperLife: Hero Life Simulator is an offline superhero life simulation by Howeth Studio. This policy describes the release candidate with optional App Store purchases, no advertising provider, no configured iCloud saves or Game Center service, and no analytics service.</p>
        </section>
        <section><h2>Your fictional lives and preferences</h2>
        <p>Names, journals, family relationships, fictional finances, possessions, health, legal history, careers, challenges, and sandbox settings are stored on your device. Sound, haptics, appearance presets, avatar frames, and family crests are also stored locally. These are fictional gameplay records. We do not automatically receive them.</p>
        <p>SuperLife does not require an in-app account. Core play works without an internet connection. The app does not request your location, contacts, microphone, camera, or tracking permission. Ordinary device backups may include saved lives and cosmetic preferences, depending on your Apple settings.</p>
        </section>
        <section><h2>Purchases</h2>
        <p>Optional purchases use Apple&#x27;s App Store and StoreKit. Apple processes payment and supplies verified transaction information to the app so it can unlock your purchases. We do not receive your payment card details or send your transaction information to a developer server.</p>
        <p>Non-consumable purchases can be restored through Restore Purchases using the appropriate Apple Account. Optional tips are consumable purchases and are not restored by Apple. A device-local, backup-excluded supporter record stores a tip count, first-tip date, and a bounded list of recently delivered transaction identifiers to prevent duplicate delivery. It grants cosmetic recognition only.</p>
        </section>
        <section><h2>Exports and sharing</h2>
        <p>Sharing a save is your choice. A save export contains the complete fictional world, including names and journals. Review it before sharing. A legend card contains the fictional details displayed in its preview, including the life name, dates, power, career, honor, fame, family achievements, and crest. Apple provides the system share interface. If you choose Save Image or another destination, that destination handles the copy under its own policies and permission controls.</p>
        </section>
        <section><h2>Local diagnostics</h2>
        <p>Diagnostics recording starts off at each launch. If you opt in, the app records only fixed event and outcome categories, UTC day, and coarse duration/count buckets. It does not include fictional names, journal text, save contents, payment details, or free-form error messages. Records stay on your device unless you deliberately export and share them.</p>
        <p>Previously recorded diagnostics may remain until cleared or pruned during enabled use. Turning recording off stops new recording and attempts to delete the stored archive; the app reports deletion failures. You can also use Clear diagnostics.</p>
        </section>
        <section><h2>Online services and advertising</h2>
        <p>This release candidate has no configured advertising provider, analytics endpoint, private iCloud checkpoint service, or Game Center leaderboard service. It does not upload your fictional lives, submit rankings automatically, or display third-party ads. Purchases require communication with Apple. Opening a support or privacy link uses your browser and the destination website&#x27;s ordinary hosting services.</p>
        <p>If a later release enables optional online services or advertising, its policy and store disclosures must be updated to describe the actual data flows before those features are enabled.</p>
        </section>
        <section><h2>Deletion and support</h2>
        <p>Deleting a saved life through the app removes its local slot. Copies you have exported, shared, or retained in device backups are separate copies. Removing the app removes its local app data; Apple purchase history remains managed by Apple. Do not delete your app as a troubleshooting step unless you have retained any saves you want to keep.</p>
        <p>You can contact Howeth Studio at <a href="mailto:howethstudio@gmail.com">howethstudio@gmail.com</a>. If you email us, we receive the address, message, and attachments you choose to send so we can answer your request. Please avoid sending passwords, payment information, or personal information in fictional character names or attachments.</p>
        </section>
        <section><h2>Changes</h2>
        <p>We will update this policy when the app&#x27;s relevant behavior changes. The published page will identify its effective date.</p>
        </section>
    </SuperLifeInfoPage>
  );
}
