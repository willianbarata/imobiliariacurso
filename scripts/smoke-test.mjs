const baseUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
const paths = ["/api/health", "/robots.txt", "/sitemap.xml", "/imoveis"];
let failed = false;
for (const path of paths) {
  try {
    const response = await fetch(baseUrl + path);
    console.log(path + " " + response.status);
    if (!response.ok) failed = true;
  } catch (error) {
    console.error(path + " failed: " + (error instanceof Error ? error.message : "unknown error"));
    failed = true;
  }
}
if (failed) process.exit(1);
