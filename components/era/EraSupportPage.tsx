import Link from "next/link";
import { ProductInfoPage } from "@/components/studio/ProductInfoPage";
import { getProduct } from "@/lib/products";
import { howethStudioConfig } from "@/lib/siteConfig";

export function EraSupportPage({ slug }: { slug: "basketball-era" | "baseball-era" }) {
  const { name } = getProduct(slug);
  return (
    <ProductInfoPage slug={slug} label="Support" title="Keep your career moving." description={`Help with ${name}, saved careers, and optional purchases. Contact Howeth Studio when you need a hand.`}>
      <section className="product-info__contact">
        <h2>Talk to Howeth Studio</h2>
        <p>Email <a href={`mailto:${howethStudioConfig.contactEmail}?subject=${encodeURIComponent(`${name} support`)}`}>{howethStudioConfig.contactEmail}</a> with your app version, device model, iOS or iPadOS version, and a short description of what happened. Let us know whether it affects one career or all of them.</p>
        <p>A screenshot or steps to reproduce the issue help. Do not send passwords or payment-card details. If your progress is affected, keep the app installed while we investigate.</p>
        <a className="product-action product-action--primary" href={`mailto:${howethStudioConfig.contactEmail}?subject=${encodeURIComponent(`${name} support`)}`}>Email support <span aria-hidden="true">↗</span></a>
      </section>
      <section>
        <h2>Common questions</h2>
        <div className="product-info__faq">
          <details open>
            <summary>Do I need an account or internet connection?</summary>
            <p>No account is needed. You can create and play a complete career offline. Purchases and Restore Purchases need a connection.</p>
          </details>
          <details>
            <summary>Will my career move to another device?</summary>
            <p>Careers stay on the device where you play. There is no game account or developer-operated cloud synchronization. App Store purchase restoration does not restore your career. Avoid deleting or reinstalling the app when investigating missing progress.</p>
          </details>
          <details>
            <summary>What happens when I delete a career?</summary>
            <p>The selected active slot is removed. Older local backup or recovery copies may still contain it. Removing the app removes its app data, while operating-system or browser backups are controlled separately. See the <Link href={`/${slug}/privacy/`}>privacy policy</Link> for details.</p>
          </details>
          <details>
            <summary>Are Life shops real-money purchases?</summary>
            <p>No. Life purchases use fictional cash earned in your career. The separate {name} Shop offers optional permanent gamepasses with localized App Store prices. These are one-time non-consumable purchases, with no subscription.</p>
          </details>
          <details>
            <summary>How do I restore a purchased gamepass?</summary>
            <p>Open More → {name} Shop → Restore Purchases while connected to the internet. Use the same Apple Account that made the purchase. The Shop is also available from Welcome. Restoration restores permanent passes, not local careers. See <a href="https://support.apple.com/en-us/108096">Apple’s purchase restoration guidance</a>.</p>
          </details>
          <details>
            <summary>How do the gamepasses work together?</summary>
            <p>VIP Starter Pack gives 1.5× eligible game XP and cash plus five total career slots. 2x XP and 2x Money double their respective eligible game rewards; with VIP, each reaches 3×. Extra Career Slots gives five total slots. All-Access Pass includes all those benefits once, with at most 3× eligible game XP and cash and five slots. Overlapping passes do not increase these limits.</p>
            <p>Bonuses apply to future eligible game rewards. They do not change past results, player statistics, league standings, or simulated opponents. Other rewards keep the values shown in the game.</p>
          </details>
          <details>
            <summary>What happens if a purchase is refunded?</summary>
            <p>Purchase access may be removed after verification. Existing careers remain available; you may be unable to create another career in an extra slot until you have the required pass again.</p>
          </details>
          <details>
            <summary>The Shop is unavailable or a purchase is pending</summary>
            <p>Check your connection and try the Shop’s retry action. A pending purchase needs approval or completion through Apple before a pass unlocks. Your offline career stays available. If Apple charged you but a pass is missing, try Restore Purchases, then contact support with the product name and approximate purchase date.</p>
          </details>
          <details>
            <summary>I need help with billing or a refund</summary>
            <p>Apple handles App Store billing and refund requests. Visit <a href="https://reportaproblem.apple.com/">Report a Problem</a> or follow <a href="https://support.apple.com/en-us/118223">Apple’s refund guidance</a>. Refund eligibility is determined by Apple.</p>
          </details>
          <details>
            <summary>The app will not open</summary>
            <p>Install the latest available update, force-quit the app, then restart your device. If it continues, email support with your device model, operating-system version, and whether the issue happens before or after the welcome screen. Keep the app installed to preserve local progress.</p>
          </details>
        </div>
      </section>
    </ProductInfoPage>
  );
}
