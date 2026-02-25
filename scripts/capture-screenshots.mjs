import { spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "docs", "screenshots");
const port = 4174;
const appUrl = `http://127.0.0.1:${port}`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function request(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode || 0);
    });
    req.on("error", reject);
  });
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const status = await request(url);
      if (status >= 200 && status < 500) return;
    } catch {
      // retry
    }
    await sleep(200);
  }
  throw new Error("Server start timeout");
}

async function stopProcess(child) {
  if (!child) return;
  child.kill();
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    sleep(1500)
  ]);
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const server = spawn(process.execPath, ["server.js"], {
    cwd: rootDir,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"]
  });
  server.stdout.on("data", (d) => process.stdout.write(`[server] ${d}`));
  server.stderr.on("data", (d) => process.stderr.write(`[server] ${d}`));

  try {
    await waitForServer(appUrl);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(appUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    await page.screenshot({
      path: path.join(outputDir, "01-home-default.png"),
      fullPage: true
    });

    await page.fill("#protagonist", "Kaia Flux");
    await page.selectOption("#genre", "surreal");
    await page.fill("#setting", "mirror station");
    await page.fill("#object", "opal compass");
    await page.fill("#emotion", "awe");
    await page.$eval("#chaos", (el) => {
      el.value = "8";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.click("button.primary");
    await page.waitForTimeout(700);
    await page.screenshot({
      path: path.join(outputDir, "02-generated-scene.png"),
      fullPage: true
    });

    await page.fill("#variant-label", "Launch Cut");
    await page.click("#save-variant");
    await page.waitForTimeout(400);
    await page.click("#remix");
    await page.waitForTimeout(700);
    await page.fill("#variant-label", "Remix Cut");
    await page.click("#save-variant");
    await page.waitForTimeout(400);
    await page.locator(".saved-item").nth(1).click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(outputDir, "03-creator-vault-compare.png"),
      fullPage: true
    });

    await page.setViewportSize({ width: 430, height: 920 });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(outputDir, "04-mobile-layout.png"),
      fullPage: true
    });

    await browser.close();
    console.log(`Saved screenshots to ${outputDir}`);
  } finally {
    await stopProcess(server);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
