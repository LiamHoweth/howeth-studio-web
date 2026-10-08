import { createServer } from "node:http";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import handler from "serve-handler";
import compression from "compression";

const legacyHosts = new Set(["howethstudio.com", "www.howethstudio.com", "www.beopity.com"]);

export function createSiteServer({ env = process.env, directory = "out" } = {}) {
  const compress = compression();
  const canonical = new URL(env.NEXT_PUBLIC_SITE_URL || "https://beopity.com");
  if (canonical.protocol !== "https:" || canonical.username || canonical.password) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a public HTTPS origin.");
  }
  return createServer(async (request, response) => {
    const host = (request.headers.host || "").toLowerCase().replace(/:\d+$/, "");
    if (env.SITE_REDIRECTS_ENABLED === "true" && legacyHosts.has(host) && host !== canonical.hostname) {
      let source;
      try {
        source = new URL(request.url || "/", "http://localhost");
      } catch {
        response.writeHead(400);
        response.end();
        return;
      }
      const destination = new URL(canonical.origin);
      destination.pathname = source.pathname;
      destination.search = source.search;
      response.writeHead(308, { Location: destination.href });
      response.end();
      return;
    }
    try {
      await new Promise((resolve, reject) => compress(request, response, (error) => error ? reject(error) : resolve()));
      await handler(request, response, {
        public: directory,
        directoryListing: false,
        symlinks: false,
        trailingSlash: true,
      });
    } catch (error) {
      console.error("Static request failed", error.message);
      if (!response.headersSent) response.writeHead(500);
      response.end();
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  createSiteServer().listen(port, "0.0.0.0", () => console.log(`Studio site listening on ${port}`));
}
