import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { request } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import test from "node:test";
import { createSiteServer } from "./serve-site.mjs";

async function withServer(env, run) {
  const directory = await mkdtemp(join(tmpdir(), "beopity-server-"));
  await mkdir(join(directory, "about"));
  await writeFile(join(directory, "index.html"), "Beopity home");
  await writeFile(join(directory, "about/index.html"), "Beopity about");
  await writeFile(join(directory, "404.html"), "Beopity missing");
  await writeFile(join(directory, "asset.js"), "/* Beopity static asset */\n".repeat(1000));
  const server = createSiteServer({ env, directory });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const get = (host, path = "/", method = "GET", headers = {}) => new Promise((resolve, reject) => {
    const req = request({ hostname: "127.0.0.1", port: server.address().port, path, method, headers: { host, ...headers } }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => { chunks.push(chunk); });
      res.on("end", () => {
        const raw = Buffer.concat(chunks);
        resolve({ status: res.statusCode, headers: res.headers, body: raw.toString(), raw });
      });
    });
    req.on("error", reject);
    req.end();
  });
  try { await run(get); }
  finally { await new Promise((resolve) => server.close(resolve)); await rm(directory, { recursive: true }); }
}

test("migration stays reachable before DNS cutover", async () => {
  await withServer({ NEXT_PUBLIC_SITE_URL: "https://howethstudio.com", SITE_REDIRECTS_ENABLED: "false" }, async (get) => {
    const response = await get("howethstudio.com");
    assert.equal(response.status, 200);
    assert.equal(response.body, "Beopity home");
    assert.equal(response.headers.location, undefined);
  });
});

test("static assets retain negotiated gzip compression", async () => {
  await withServer({ NEXT_PUBLIC_SITE_URL: "https://beopity.com" }, async (get) => {
    const asset = await get("beopity.com", "/asset.js", "GET", { "accept-encoding": "gzip" });
    assert.equal(asset.status, 200);
    assert.equal(asset.headers["content-encoding"], "gzip");
    assert.equal(gunzipSync(asset.raw).toString(), "/* Beopity static asset */\n".repeat(1000));
  });
});

test("cutover preserves paths and query strings without an open redirect", async () => {
  await withServer({ NEXT_PUBLIC_SITE_URL: "https://beopity.com", SITE_REDIRECTS_ENABLED: "true" }, async (get) => {
    for (const host of ["howethstudio.com", "www.howethstudio.com", "www.beopity.com", "HOWETHSTUDIO.COM:8080"]) {
      const response = await get(host, "/elevenward/es/privacy/?source=old&next=https://example.com");
      assert.equal(response.status, 308);
      assert.equal(response.headers.location, "https://beopity.com/elevenward/es/privacy/?source=old&next=https://example.com");
    }
    for (const host of ["beopity.com", "howethstudio.com.attacker.example", "health.railway.internal"]) {
      const response = await get(host);
      assert.equal(response.status, 200);
      assert.equal(response.headers.location, undefined);
    }
    assert.equal((await get("howethstudio.com", "/football-era/privacy/", "HEAD")).status, 308);
    assert.equal((await get("howethstudio.com", "http://[")).status, 400);
    assert.equal((await get("beopity.com")).status, 200);
  });
});

test("static trailing slash routes and custom 404 continue to work", async () => {
  await withServer({ NEXT_PUBLIC_SITE_URL: "https://beopity.com" }, async (get) => {
    const about = await get("beopity.com", "/about/");
    assert.equal(about.status, 200);
    assert.equal(about.body, "Beopity about");
    const missing = await get("beopity.com", "/missing/");
    assert.equal(missing.status, 404);
    assert.equal(missing.body, "Beopity missing");
  });
});
