// Isolated client harness: the production auth checks and database are never bypassed.
import { build, stop } from "esbuild";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

await build({
  entryPoints: ["tests/browser/entry.tsx"],
  bundle: true,
  outdir: ".qa",
  platform: "browser",
  jsx: "automatic",
  alias: {
    "@clerk/nextjs": resolve("tests/browser/clerk.tsx"),
    "next/dynamic": resolve("tests/browser/dynamic.tsx"),
  },
  define: { "process.env.NODE_ENV": '"development"' },
});
stop();
const html =
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/entry.css"><style>@font-face{font-family:Display;src:url(/fonts/bricolage-grotesque.woff2);font-weight:200 800}@font-face{font-family:Body;src:url(/fonts/instrument-sans.woff2);font-weight:400 700}:root{--font-display:Display;--font-body:Body}</style><title>DSA workspace test harness</title></head><body><div id="root"></div><script src="/entry.js"></script></body></html>';
const server = createServer(async (request, response) => {
  if (request.url === "/__shutdown") {
    response.end("Test server stopped");
    server.close(() => process.exit(0));
    server.closeAllConnections();
    return;
  }
  if (
    [
      "/fonts/bricolage-grotesque.woff2",
      "/fonts/instrument-sans.woff2",
    ].includes(request.url)
  ) {
    response.setHeader("Content-Type", "font/woff2");
    response.end(await readFile(resolve("public", request.url.slice(1))));
    return;
  }
  const file =
    request.url === "/entry.js"
      ? "entry.js"
      : request.url === "/entry.css"
        ? "entry.css"
        : null;
  response.setHeader(
    "Content-Type",
    file?.endsWith("css")
      ? "text/css"
      : file
        ? "application/javascript"
        : "text/html",
  );
  response.end(file ? await readFile(resolve(".qa", file)) : html);
}).listen(4173, "127.0.0.1", () =>
  console.log("Test workspace ready on http://127.0.0.1:4173"),
);
