import type { Metadata } from "next";
import Link from "next/link";
import { ProductInfoPage } from "@/components/studio/ProductInfoPage";
import { mathWarsConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Math Wars Support",
  description: "Get help with Math Wars: how to play, Online versus, saved progress, and deleting your data. Contact Beopity.",
  alternates: { canonical: "/math-wars/support/" },
};

const mailto = `mailto:${mathWarsConfig.supportEmail}?subject=${encodeURIComponent("Math Wars support")}`;

export default function MathWarsSupportPage() {
  return (
    <ProductInfoPage slug="math-wars" label="Support" title="Help for every shot." description="Answers about playing Math Wars, online matches, and your saved progress. Email us whenever you need a hand.">
      <section className="product-info__contact">
        <h2>Talk to Beopity</h2>
        <p>Email <a href={mailto}>{mathWarsConfig.supportEmail}</a> with your app version, device model, iOS or iPadOS version, and a short description of what happened. A screenshot or the function you typed can help. If you are under 13, please ask a parent or guardian to email for you.</p>
        <p>Please do not send passwords, payment details, or other personal information. If your progress is affected, keep the app installed while we look into it.</p>
        <a className="product-action product-action--primary" href={mailto}>Email support <span aria-hidden="true">↗</span></a>
      </section>
      <section>
        <h2>Common questions</h2>
        <div className="product-info__faq">
          <details open>
            <summary>How do I play?</summary>
            <p>On your turn, tap the equation bar and type a function such as 0.5x on the math keypad. Pick a direction, left or right, then tap Fire. Your shot starts at your character and follows the graph. Brick blocks crumble as your shot breaks through, and breaking two or more makes the hit count double. Steel blocks stop every shot. The last player standing wins.</p>
            <p>New to graphs? The tutorial guides you through a first match, and the challenges under Home → Challenges teach one curve shape at a time.</p>
          </details>
          <details>
            <summary>Why did my shot fizzle?</summary>
            <p>A shot fizzles when the function has a typo or reaches a value that is undefined, such as the square root of a negative number or a division by zero. The game explains what went wrong in plain words so you can fix it and try again.</p>
          </details>
          <details>
            <summary>How does Online versus work?</summary>
            <p>Open Home → Online versus while connected to the internet. Find a match pairs you with another player. To play a friend, tap Make a code and share the five-letter code; your friend enters it and taps Join. A code works for 10 minutes. Your versus rating helps pair players and sets how busy the map is.</p>
            <p>Online players see only a nickname the server generates, such as “Swift Comet 42”, plus an avatar and rating. There is no chat and no free text. Bots, Pass &amp; Play, and challenges all work offline.</p>
          </details>
          <details>
            <summary>What does online play send, and is it kept?</summary>
            <p>Our relay server passes your generated nickname, avatar, rating, and turn data, such as the functions you fire and where you move, between the two players. It has no gameplay database, and live match history is removed when the match ends. Operational hosting logs, including connection metadata, are retained separately for up to 90 days. See the <Link href="/math-wars/privacy/">privacy policy</Link> for details.</p>
          </details>
          <details>
            <summary>Do I need an account, or do I have to pay for anything?</summary>
            <p>No. There are no accounts, ads, or in-app purchases. Coins, characters, trails, hats, titles, abilities, and badges are earned by playing and have no real-money value.</p>
          </details>
          <details>
            <summary>Will my progress move to another device?</summary>
            <p>Progress is saved only on the device where you play. Math Wars has no account or cloud sync. If you set up a new iPhone or iPad from an iCloud or computer backup of your old one, the backup may bring your progress with it, depending on your Apple settings.</p>
          </details>
          <details>
            <summary>How do I delete my data?</summary>
            <p>Delete the app: touch and hold the Math Wars icon, then choose Remove App → Delete App. This permanently removes your save and its backup copy from the device. Older iCloud or computer backups of your device may still contain it until they are deleted or replaced.</p>
            <p>We do not receive your saved progress. Deleting the app does not delete retained hosting logs or emails you sent us. The <Link href="/math-wars/privacy/">privacy policy</Link> explains log retention and how to request deletion of support information.</p>
          </details>
          <details>
            <summary>Can I change the turn timer or controls?</summary>
            <p>Yes. In Settings you can choose a relaxed, standard, or speedy turn timer, or none at all, and turn sound, haptics, the aim preview, and coordinate labels on or off. A left-handed keypad layout is available, and iPad supports a hardware keyboard. Math Wars also follows your device’s Reduce Motion setting.</p>
          </details>
          <details>
            <summary>The app will not open or cannot connect</summary>
            <p>Install the latest available update, force-quit the app, and restart your device. For Online versus, check your internet connection; offline modes stay available either way. If the problem continues, email support with your device model, iOS or iPadOS version, and what you see on screen. Keep the app installed to preserve your progress.</p>
          </details>
        </div>
      </section>
      <section>
        <h2>Privacy</h2>
        <p>Read the <Link href="/math-wars/privacy/">Math Wars privacy policy</Link> to see what stays on your device, what online play sends, and how hosting logs and support messages are handled.</p>
      </section>
    </ProductInfoPage>
  );
}
