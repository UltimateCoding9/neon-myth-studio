import { spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { copyFile, mkdir, readdir, rm, stat } from "node:fs/promises";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "docs", "demo");
const tempVideoDir = path.join(outputDir, ".raw-video");
const webmOutput = path.join(outputDir, "neon-myth-demo.webm");
const mp4Output = path.join(outputDir, "neon-myth-demo.mp4");
const packOutput = path.join(outputDir, "creator-pack-sample.json");
const port = 4173;
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
      // server not ready yet
    }
    await sleep(250);
  }
  throw new Error(`Server did not become ready within ${timeoutMs}ms`);
}

async function stopProcess(child) {
  if (!child || child.killed) return;
  child.kill();
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    sleep(2000)
  ]);
  if (!child.killed) child.kill("SIGKILL");
}

async function fileIfExists(candidate) {
  try {
    const st = await stat(candidate);
    if (st.isFile()) return candidate;
  } catch {
    // ignore
  }
  return null;
}

async function findWingetFfmpeg() {
  if (!process.env.LOCALAPPDATA) return null;

  const base = path.join(process.env.LOCALAPPDATA, "Microsoft", "WinGet", "Packages");
  let dirs;
  try {
    dirs = await readdir(base, { withFileTypes: true });
  } catch {
    return null;
  }

  const packageDirs = dirs
    .filter((entry) => entry.isDirectory() && entry.name.toLowerCase().includes("ffmpeg"))
    .map((entry) => entry.name);

  for (const dir of packageDirs) {
    const container = path.join(base, dir);
    let inner;
    try {
      inner = await readdir(container, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const item of inner) {
      if (!item.isDirectory()) continue;
      const candidate = path.join(container, item.name, "bin", "ffmpeg.exe");
      const found = await fileIfExists(candidate);
      if (found) return found;
    }
  }

  return null;
}

async function findPlaywrightFfmpeg() {
  if (!process.env.LOCALAPPDATA) return null;
  const base = path.join(process.env.LOCALAPPDATA, "ms-playwright");

  let entries;
  try {
    entries = await readdir(base, { withFileTypes: true });
  } catch {
    return null;
  }

  const ffmpegFolders = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("ffmpeg-"))
    .map((entry) => entry.name)
    .sort()
    .reverse();

  for (const folder of ffmpegFolders) {
    const direct = await fileIfExists(path.join(base, folder, "ffmpeg-win64.exe"));
    if (direct) return direct;

    const nested = await fileIfExists(path.join(base, folder, "ffmpeg-win64", "ffmpeg.exe"));
    if (nested) return nested;
  }

  return null;
}

function runCommand(command, args, cwd = rootDir) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed (${command} ${args.join(" ")}), exit=${code}`));
    });
    child.on("error", reject);
  });
}

async function recordDemo(page) {
  await page.goto(appUrl, { waitUntil: "networkidle" });
  await sleep(1200);

  await page.fill("#protagonist", "Kaia Flux");
  await page.selectOption("#genre", "surreal");
  await page.fill("#setting", "mirror station under moonlight");
  await page.fill("#object", "opal compass");
  await page.fill("#emotion", "awe");
  await page.$eval("#chaos", (el) => {
    el.value = "8";
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await sleep(500);

  await page.click("button.primary");
  await sleep(1600);

  await page.fill("#variant-label", "Launch Cut");
  await page.click("#save-variant");
  await sleep(800);

  await page.click("#remix");
  await sleep(1300);

  await page.fill("#variant-label", "Remix Cut");
  await page.click("#save-variant");
  await sleep(800);

  const items = page.locator(".saved-item");
  const itemCount = await items.count();
  if (itemCount > 1) {
    await items.nth(1).click();
    await sleep(700);
    await page.click("#load-selected");
    await sleep(900);
  }

  const downloadPromise = page.waitForEvent("download");
  await page.click("#export-pack");
  const download = await downloadPromise;
  await download.saveAs(packOutput);
  await sleep(500);

  await page.click("#copy");
  await sleep(500);

  await page.mouse.wheel(0, 850);
  await sleep(900);
  await page.mouse.wheel(0, -850);
  await sleep(900);
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  await rm(tempVideoDir, { recursive: true, force: true });
  await mkdir(tempVideoDir, { recursive: true });

  const server = spawn(process.execPath, ["server.js"], {
    cwd: rootDir,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"]
  });

  server.stdout.on("data", (chunk) => process.stdout.write(`[server] ${chunk}`));
  server.stderr.on("data", (chunk) => process.stderr.write(`[server] ${chunk}`));

  try {
    await waitForServer(appUrl);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1366, height: 768 },
      recordVideo: {
        dir: tempVideoDir,
        size: { width: 1366, height: 768 }
      },
      acceptDownloads: true
    });

    const page = await context.newPage();
    const video = page.video();
    await recordDemo(page);
    await context.close();
    await browser.close();

    const recordedPath = await video.path();
    await copyFile(recordedPath, webmOutput);
    console.log(`Saved demo video: ${webmOutput}`);

    const ffmpegPath = (await findWingetFfmpeg()) || (await findPlaywrightFfmpeg());
    if (ffmpegPath) {
      try {
        await runCommand(ffmpegPath, [
          "-y",
          "-i",
          webmOutput,
          "-c:v",
          "libx264",
          "-pix_fmt",
          "yuv420p",
          "-movflags",
          "+faststart",
          mp4Output
        ]);
        console.log(`Saved demo video: ${mp4Output}`);
      } catch {
        console.log("FFmpeg conversion to mp4 failed; webm output is still available.");
      }
    }
  } finally {
    await stopProcess(server);
    await rm(tempVideoDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
