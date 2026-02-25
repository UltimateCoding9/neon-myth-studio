import http from "node:http";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon"
};

function getContentType(filePath) {
  return contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

async function sendFile(res, filePath) {
  try {
    const file = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": getContentType(filePath),
      "Cache-Control": "no-store"
    });
    res.end(file);
  } catch (error) {
    if (error.code === "ENOENT") {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Server Error");
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://localhost");
  const incomingPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const safePath = path.normalize(path.join(publicDir, incomingPath));

  if (!safePath.startsWith(publicDir)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  await sendFile(res, safePath);
});

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log(`Neon Myth Studio is running on http://localhost:${port}`);
});
