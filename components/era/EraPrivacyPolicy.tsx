import { ProductInfoPage } from "@/components/studio/ProductInfoPage";
import { getProduct } from "@/lib/products";
import { howethStudioConfig } from "@/lib/siteConfig";

export function EraPrivacyPolicy({ slug }: { slug: "basketball-era" | "baseball-era" }) {
  const { name } = getProduct(slug);
  return (
    <ProductInfoPage
      slug={slug}
      label="Privacy"
      title={`${name} privacy policy`}
      description={`Effective October 5, 2026. This policy explains how Howeth Studio handles information when you play ${name}, use optional permanent purchases, or contact support.`}
    >
      <section>
        <h2>Your career stays on your device</h2>
        <p>{name} is playable offline. There are no game accounts, developer-operated cloud saves, advertising, gameplay analytics, or cross-app tracking. Your career is not sent to Howeth Studio or published to an online leaderboard.</p>
        <p>Your device stores your fictional player name, portrait and profile choices, career progress, game results, unfinished setup, preferences, verified purchase access, and local backup or recovery copies. Use a fictional player name if you prefer. Browser saves and native iPhone or iPad saves are separate.</p>
      </section>
      <section>
        <h2>Optional purchases</h2>
        <p>The separate {name} Shop offers optional permanent gamepasses through Apple In-App Purchase. Apple processes payment; Howeth Studio does not receive your payment-card information. Prices are shown in the app for your storefront before you confirm a purchase.</p>
        <p>RevenueCat verifies purchase history and access, and helps restore permanent purchases. When the purchase service is configured, it receives an anonymous app customer identifier, purchase and transaction records, and technical information, such as device type, operating system, and current iOS permission status for app tracking. Purchase and subscriber requests also send an app-vendor device identifier (IDFV) to RevenueCat when available. We do not send your player name, career saves, or game results to RevenueCat.</p>
        <p>Purchase information is used for app functionality, verification, and restoration, and for the RevenueCat purchase dashboard and revenue analytics. It is not used for advertising or cross-app tracking. Apple and RevenueCat may retain transaction information under their own policies and applicable requirements. Read <a href="https://www.apple.com/legal/privacy/">Apple’s privacy policy</a> and <a href="https://www.revenuecat.com/privacy">RevenueCat’s privacy policy</a> for their information practices.</p>
        <p>Life shops spend fictional money earned in your career. They do not charge real money. Restore Purchases restores gamepasses, not your local career saves.</p>
      </section>
      <section>
        <h2>Backups and deletion</h2>
        <p>Deleting a career removes that slot from your active saves. Earlier local backup or recovery copies may still contain it. Removing the app removes its app data from the device; operating-system or browser backups are controlled separately and may restore an earlier copy. Howeth Studio cannot recover or synchronize your career through a server.</p>
        <p>If you choose to export or share recovery data, the destination you select controls that copy. Only share it with someone you trust. Deleting the app does not delete Apple’s purchase records or automatically remove RevenueCat transaction information. Contact us if you have a purchase-data privacy request; we may need the app’s anonymous purchase identifier or transaction information to locate a record.</p>
      </section>
      <section>
        <h2>Permissions</h2>
        <p>The game does not request access to your contacts, location, photos, microphone, or advertising tracking permission. Purchase verification and restoration require an internet connection. Your offline career remains playable without one.</p>
      </section>
      <section>
        <h2>When you contact support</h2>
        <p>Emailing Howeth Studio sends the information you choose to include, such as your email address, message, app version, device details, screenshots, or a recovery file. We use it to respond and investigate your request. Sending support information is optional; the app does not automatically upload gameplay telemetry or support files.</p>
        <p>We retain support correspondence while it is needed to resolve the request and maintain necessary business records. You can ask us to delete support information, subject to any applicable recordkeeping obligations. Do not send passwords, payment-card details, or unnecessary personal information.</p>
      </section>
      <section>
        <h2>Changes and contact</h2>
        <p>We will update this policy before making new online services or information collection available. The effective date above identifies this version.</p>
        <p>For support or privacy requests, email <a href={`mailto:${howethStudioConfig.contactEmail}?subject=${encodeURIComponent(`${name} privacy request`)}`}>{howethStudioConfig.contactEmail}</a>. Howeth Studio publishes {name}.</p>
      </section>
    </ProductInfoPage>
  );
}
