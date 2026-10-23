import type { Metadata } from "next";
import { ProductInfoPage } from "@/components/studio/ProductInfoPage";
import { mathWarsConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Math Wars Privacy Policy",
  description: "How Math Wars keeps progress on your device, what Online versus sends for a live match, and how to delete your data.",
  alternates: { canonical: "/math-wars/privacy/" },
};

export default function MathWarsPrivacyPage() {
  const email = <a href={`mailto:${mathWarsConfig.supportEmail}`}>{mathWarsConfig.supportEmail}</a>;
  return (
    <ProductInfoPage
      slug="math-wars"
      label="Privacy"
      title="Math Wars privacy policy"
      description="Effective October 23, 2026. Math Wars for iPhone and iPad is published by Liam Howeth (“we”, “us”). This policy explains what the game stores on your device and what Online versus sends during a match."
    >
      <section>
        <h2>The short version</h2>
        <p><strong>We don’t collect anything about you.</strong> Not your name, not your email, not where you are, and nothing about how you play.</p>
        <p><strong>Your game stays on your device.</strong> Your player name, coins, badges, stars, and settings are saved on your iPhone or iPad only. We can’t see them.</p>
        <p><strong>Online play shares only what the match needs.</strong> Other players see a nickname the server makes up, your avatar, your rating, and your shots. Nothing is kept after the match.</p>
        <p><strong>No ads, accounts, chat, or tracking.</strong> Nobody in the game can message you.</p>
        <p><strong>Want to erase everything?</strong> Delete the app. That removes all of your game data from the device.</p>
        <p><strong>Questions?</strong> Ask a parent or guardian to email us at {email}.</p>
      </section>
      <section>
        <h2>1. Summary</h2>
        <p>Math Wars is designed to work without collecting personal information from anyone, including children. The game contains no advertising, analytics, crash-reporting, tracking, or other third-party software. The only server we operate for the game is a relay for Online versus, which passes match data between players while a match is live and keeps no record of it afterward.</p>
      </section>
      <section>
        <h2>2. Information we collect</h2>
        <p>None. We do not have an account or profile for you, and we do not keep a copy of your game data. Online versus sends a small amount of match data through our relay server, described in section 4, but the server does not store it, so we do not collect or retain it.</p>
      </section>
      <section>
        <h2>3. Information stored only on your device</h2>
        <p>To save your progress, the app writes a small file in its private storage area on your device. iOS keeps this area separate from other apps. The file contains:</p>
        <p><strong>Player profile:</strong> the display name you type (up to 16 letters, numbers, and spaces) and your avatar, so the game can show your player.</p>
        <p><strong>Progress:</strong> experience level, coins earned in the game, cosmetic items owned and equipped, your equipped ability, badges with the date earned, challenge stars, and your versus rating, so you keep what you earned.</p>
        <p><strong>Play statistics:</strong> matches played and won by mode, shots, hits, blocks broken, win streaks, and which kinds of math functions you used, for your Profile and Stats screen and for badges.</p>
        <p><strong>Recent functions:</strong> up to 12 equations you fired recently, such as 0.5x + 2, so you can reuse them quickly.</p>
        <p><strong>Settings:</strong> sound, haptics, turn timer, aim preview, coordinate labels, and the left-handed keypad, so the game remembers your choices.</p>
        <p><strong>File details:</strong> the save-format version and when the save was created and last updated, so the game can upgrade older saves safely.</p>
        <p>The app also keeps a backup copy of the previous save, so a damaged file can be recovered, and moves any unreadable save aside rather than overwriting it. These files stay on your device. Names typed for Pass &amp; Play players are used on that device only.</p>
        <p>If you back up your device with iCloud Backup or to a computer, iOS may include the app’s data in that backup. Apple or your computer handles those backups under your settings, and we never receive them.</p>
      </section>
      <section>
        <h2>4. Online versus</h2>
        <p>Online versus is optional. Bots, Pass &amp; Play, challenges, and the tutorial work without an internet connection. When you open Online versus, the app connects to our relay server over an encrypted connection and sends only what a live match needs:</p>
        <p><strong>A generated nickname.</strong> The server makes up a nickname for each connection, such as “Swift Comet 42”. Your typed player name is never sent.</p>
        <p><strong>Your avatar and rating.</strong> A short catalogue id for your avatar, and your versus rating from your device, used to pair players and choose the map.</p>
        <p><strong>Turn data.</strong> The functions you fire (only characters the math keypad can type, up to 160 of them), your chosen direction, the path and result of each shot, and where you move. The server passes these to the other player so both games stay in step.</p>
        <p><strong>Match codes and resume tokens.</strong> A five-character friend code lasts up to 10 minutes. A random resume token lets you rejoin after a dropped connection and lasts only for that match.</p>
        <p>The other player sees your nickname, avatar, rating, and shots. There is no chat or free text, so players cannot send each other messages. The server keeps this information in memory only while the match is live. It has no database and keeps nothing after the match ends. Its logs contain only event names and match ids.</p>
        <p>As with any internet connection, the hosting provider that runs our server handles your device’s IP address to deliver the connection, and its standard request logs may record it. We do not use IP addresses to identify, track, or profile players.</p>
      </section>
      <section>
        <h2>5. Things the app does not do</h2>
        <p>The app does not ask for or use your location, contacts, photos, camera, microphone, health data, or advertising identifier. It does not show ads or link to advertisers, and it does not include analytics, crash-reporting, or other third-party software development kits.</p>
        <p>It has no accounts, no chat or messaging, and no in-app purchases. Coins and cosmetic items are earned by playing and have no real-money value. Math Wars does not use Game Center.</p>
      </section>
      <section>
        <h2>6. Sharing a shot</h2>
        <p>If you tap Share my shot on a results screen, the app creates a picture of your shot and opens Apple’s standard share sheet so that you choose where it goes, for example Messages or Photos. The app does not send the picture anywhere by itself, and we never receive it. The app or service you choose handles it under its own privacy policy. If you don’t tap Share, nothing is shared.</p>
      </section>
      <section>
        <h2>7. Information Apple may provide to us</h2>
        <p>Apple runs the App Store and may collect information under <a href="https://www.apple.com/legal/privacy/">Apple’s privacy policy</a>. If you have chosen in your device settings to share analytics with app developers, Apple may give us aggregated statistics and crash reports, such as how many devices installed the app or where a crash happened in our code. This information does not identify you, and we use it only to fix bugs and improve the game. You can turn this sharing off in Settings → Privacy &amp; Security → Analytics &amp; Improvements.</p>
      </section>
      <section>
        <h2>8. Children’s privacy</h2>
        <p>Math Wars is made for players of all ages. We designed it so that it does not collect personal information from children under 13, or from anyone else. Online play uses generated nicknames and allows no free text, so players cannot share personal details with each other through the game. Because the app collects no personal information, it does not ask for parental consent, and there is no child data for us to review or delete.</p>
        <p>If you are a parent or guardian and believe information about your child has reached us, for example in an email, contact {email} and we will delete it promptly.</p>
      </section>
      <section>
        <h2>9. How to see, change, or delete your data</h2>
        <p><strong>See or change it:</strong> your name, avatar, and settings are on the Profile and Settings screens.</p>
        <p><strong>Delete all of it:</strong> delete the app from your device. Touch and hold the app icon, then choose Remove App → Delete App. This permanently removes the save file and its backups from the device.</p>
        <p><strong>Remove it from backups:</strong> on iPhone or iPad, go to Settings → your name → iCloud → Manage Storage (or Manage Account Storage) → Backups. Older device backups may still contain the data until they are deleted or replaced.</p>
        <p>Because we hold no personal information, we have nothing to give you, correct, or delete on our side. You can still contact us with any request, and we will reply.</p>
      </section>
      <section>
        <h2>10. Security</h2>
        <p>Your game data is stored in the app’s private container and protected by iOS security, including device encryption when your device has a passcode. Online versus uses an encrypted connection. We do not keep a copy of your game data.</p>
      </section>
      <section>
        <h2>11. Your rights</h2>
        <p>Depending on where you live, laws such as the EU or UK GDPR or US state privacy laws may give you rights to access, correct, delete, or move your personal information, or to object to its use. Because the app does not collect or keep personal information, we hold no data to which these rights would apply. You can manage everything on your device as described in section 9, and you can contact us at any time.</p>
      </section>
      <section>
        <h2>12. Emailing us</h2>
        <p>If you email us, we receive your email address, your message, and any attachments you choose to send, and we use them only to answer you. Please don’t include passwords, payment details, or other personal information you don’t need to share.</p>
      </section>
      <section>
        <h2>13. Changes to this policy</h2>
        <p>If a future version changes what the app stores or sends, we will update this policy and the App Store privacy information before that version is released, and change the effective date above.</p>
      </section>
      <section>
        <h2>14. Contact</h2>
        <p>Liam Howeth<br />Email: {email}</p>
      </section>
    </ProductInfoPage>
  );
}
