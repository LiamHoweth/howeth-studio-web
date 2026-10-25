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
      description="Effective October 25, 2026. Math Wars for iPhone and iPad is published by Liam Howeth (“we”, “us”). This policy explains local saves, optional online play, hosting logs, and support messages."
    >
      <section>
        <h2>The short version</h2>
        <p><strong>Your game stays on your device.</strong> Your player name, coins, badges, stars, and settings are saved on your iPhone or iPad only. We can’t see them.</p>
        <p><strong>Online play sends match data.</strong> Other players see a nickname the server makes up, your avatar, your rating, and your shots. The relay keeps gameplay data in memory for the live session or match.</p>
        <p><strong>Hosting logs last longer.</strong> Our hosting provider, Railway, records technical connection information, including IP addresses, for up to 90 days. We use operational logs to run, secure, and troubleshoot online play.</p>
        <p><strong>No ads, accounts, chat, or tracking.</strong> Nobody in the game can message you.</p>
        <p><strong>You control your local save.</strong> Deleting the app removes its game data from that device. Hosting logs and any email you send us have separate retention periods, explained below.</p>
        <p><strong>Questions?</strong> Ask a parent or guardian to email us at {email}.</p>
      </section>
      <section>
        <h2>1. Summary</h2>
        <p>Math Wars has no accounts, advertising, analytics SDKs, or cross-app tracking. Your saved profile and progress stay on your device. Optional Online versus uses our relay server, hosted by Railway, to pass match data between players. Railway retains operational logs, and we receive information you choose to email to support.</p>
      </section>
      <section>
        <h2>2. Information we collect</h2>
        <p>We do not receive your saved profile, progress, or the player name you type. Online play processes the match information described in section 4. Our hosting provider records technical connection and service logs, and support email contains the contact details and content you choose to send. These uses support game operation, security, troubleshooting, and answering your requests. We do not sell this information, use it for advertising, or combine it with activity in other companies’ apps or websites.</p>
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
        <p>Online versus is optional. Bots, Pass &amp; Play, challenges, and the tutorial work without an internet connection. When you choose to find a match or create or join a friend room, the app connects to our relay server over an encrypted connection and exchanges:</p>
        <p><strong>A generated nickname.</strong> The server makes up a nickname for each connection, such as “Swift Comet 42”. Your typed player name is never sent.</p>
        <p><strong>Your avatar and rating.</strong> A short catalogue id for your avatar, and your versus rating from your device, used to pair players and choose the map.</p>
        <p><strong>Turn data.</strong> The functions you fire (only characters the math keypad can type, up to 160 of them), your chosen direction, the path and result of each shot, and where you move. The server passes these to the other player so both games stay in step.</p>
        <p><strong>Match codes and resume tokens.</strong> A five-character friend code lasts up to 10 minutes. A random resume token lets you rejoin after a dropped connection and lasts only for that match.</p>
        <p>The other player sees your nickname, avatar, rating, and shots. There is no chat or free text. The relay has no gameplay database. Connection details stay in memory for the session; match history and resume tokens are removed when the match ends. Friend rooms expire after 10 minutes, and disconnected players have a 30-second reconnect window.</p>
        <p><strong>Operational logs are separate from match data.</strong> Our server logs service events, timestamps, and random match ids. It does not deliberately log player names, functions, resume tokens, or IP addresses. Railway’s infrastructure separately records HTTP connection metadata, including IP address, User-Agent, request id, timestamp, response status, and duration. We use operational logs for service operation, security, and troubleshooting, not advertising or profiling.</p>
        <p>Railway states that logs are retained for up to 90 days before automatic deletion. Its shorter plan-dependent viewing window does not shorten the underlying retention period. These infrastructure logs cannot be selectively deleted or redacted by us. See <a href="https://docs.railway.com/observability/logs">Railway’s logging documentation</a> and its <a href="https://station.railway.com/questions/can-http-request-logging-be-disabled-or-30c1f581">request-log retention guidance</a>.</p>
      </section>
      <section>
        <h2>5. Things the app does not do</h2>
        <p>The app does not ask for or use your location, contacts, photos, camera, microphone, health data, or advertising identifier. It does not show ads or link to advertisers, and it does not include analytics, crash-reporting, or other third-party software development kits.</p>
        <p>It has no accounts, no chat or messaging, and no in-app purchases. Coins and cosmetic items are earned by playing and have no real-money value. Math Wars does not use Game Center.</p>
      </section>
      <section>
        <h2>6. Sharing a shot</h2>
        <p>If you tap Share my shot on a results screen, the app creates a picture containing the arena, in-match player names, your function, and shot statistics, then opens Apple’s standard share sheet so that you choose where it goes, for example Messages or Photos. Review the picture before sharing it. The app does not send it anywhere by itself, and we do not receive it unless you send it to us. The destination app or service handles it under its own privacy policy.</p>
      </section>
      <section>
        <h2>7. Information Apple may provide to us</h2>
        <p>Apple runs the App Store and may collect information under <a href="https://www.apple.com/legal/privacy/">Apple’s privacy policy</a>. Depending on your Apple settings, Apple may provide app usage statistics and crash reports to help us fix bugs and improve the game. You can manage this sharing in Settings → Privacy &amp; Security → Analytics &amp; Improvements.</p>
      </section>
      <section>
        <h2>8. Children’s privacy</h2>
        <p>Math Wars does not ask players for their age, real name, email address, or other contact details. Online players receive generated nicknames, and there is no chat. Offline modes can be used without sending gameplay information to our server. Online connections still create the technical logs described in section 4.</p>
        <p>If you are under 13 and need support, ask a parent or guardian to contact us. Parents and guardians can email {email} about information their child may have sent. We will investigate and respond to access or deletion requests, including explaining any hosting-log deletion limits.</p>
      </section>
      <section>
        <h2>9. How to see, change, or delete your data</h2>
        <p><strong>See or change it:</strong> your name, avatar, and settings are on the Profile and Settings screens.</p>
        <p><strong>Delete all of it:</strong> delete the app from your device. Touch and hold the app icon, then choose Remove App → Delete App. This permanently removes the save file and its backups from the device.</p>
        <p><strong>Remove it from backups:</strong> on iPhone or iPad, go to Settings → your name → iCloud → Manage Storage (or Manage Account Storage) → Backups. Older device backups may still contain the data until they are deleted or replaced.</p>
        <p>Deleting the app does not delete hosting logs or messages you emailed to support. Logs expire as described in section 4. Contact {email} to request access, correction, or deletion of support information. We will explain any information we cannot locate or delete and why.</p>
      </section>
      <section>
        <h2>10. Security</h2>
        <p>Your saved progress is stored in the app’s private container and protected by iOS security, including device encryption when your device has a passcode. Online versus uses an encrypted connection. Railway processes connection information to host the service, and our email provider processes support correspondence. We do not keep a server-side copy of your saved progress.</p>
      </section>
      <section>
        <h2>11. Your rights</h2>
        <p>Depending on where you live, you may have rights to access, correct, delete, or receive a copy of personal information, or to object to its use. Contact {email} to make a request. We will respond under applicable requirements and explain any limits, including Railway’s automatic log-retention period. You can manage your local save as described in section 9.</p>
      </section>
      <section>
        <h2>12. Emailing us</h2>
        <p>If you email us, we receive your email address, your message, and any attachments you choose to send. We use them to answer your request and handle related follow-up, and retain them for as long as needed for that purpose or any applicable legal obligation. You can request deletion by emailing {email}. Please don’t include passwords, payment details, or personal information you don’t need to share.</p>
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
