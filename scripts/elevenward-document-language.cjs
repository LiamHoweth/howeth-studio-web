const fs = require("node:fs");
const path = require("node:path");

// The shared App Router root emits English. Set each localized static document's
// language before it is served, including support, privacy, and deletion pages.
const locales = { es: "es", fr: "fr", "pt-br": "pt-BR" };
let updated = 0;

function updateDirectory(directory, language) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      updateDirectory(file, language);
    } else if (entry.name.endsWith(".html")) {
      const html = fs.readFileSync(file, "utf8");
      const root = html.match(/<html\b[^>]*>/)?.[0];
      if (!root || !/\blang="[^"]*"/.test(root)) {
        throw new Error(`Missing document language: ${file}`);
      }
      const localizedRoot = root.replace(/\blang="[^"]*"/, `lang="${language}"`);
      fs.writeFileSync(file, html.replace(root, localizedRoot));
      updated++;
    }
  }
}

for (const [locale, language] of Object.entries(locales)) {
  updateDirectory(path.join(__dirname, "..", "out", "elevenward", locale), language);
}
if (updated !== 15) throw new Error(`Expected 15 localized Elevenward documents; found ${updated}`);
console.log(`Set document language on ${updated} localized Elevenward pages.`);
