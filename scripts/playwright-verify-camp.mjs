import { chromium } from "playwright";

const LIVE = "https://camp-swart.vercel.app";
const LOCAL = "http://127.0.0.1:3000";

async function mcpInit(base) {
  const res = await fetch(`${base}/api/mcp`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "camp-playwright-verify", version: "1.0.0" },
      },
    }),
  });
  const text = await res.text();
  return { status: res.status, text: text.slice(0, 400) };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`${LIVE}/`, { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(2500);

const title = await page.title();
const headings = await page.locator("h1, h2").allTextContents();
const body = (await page.locator("body").innerText())
  .slice(0, 900)
  .replace(/\s+/g, " ");

await page.screenshot({ path: "camp-live-playwright.png" });

const api = await fetch(`${LIVE}/api/personas`).then((r) => r.json());
const prodMcp = await mcpInit(LIVE);
let localMcp = { status: "down", text: "" };
try {
  localMcp = await mcpInit(LOCAL);
} catch (e) {
  localMcp = { status: "error", text: String(e) };
}

console.log(
  JSON.stringify(
    {
      title,
      headings: headings.slice(0, 12),
      body,
      apiCount: api.count,
      firstStaff: api.personas?.[0]?.id,
      prodMcp,
      localMcp,
      screenshot: "camp-live-playwright.png",
    },
    null,
    2,
  ),
);

await browser.close();
