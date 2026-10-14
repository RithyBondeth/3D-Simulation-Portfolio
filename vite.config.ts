import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import data from "./src/data/portfolio/content.json" with { type: "json" };
import { projectDocument } from "./src/infrastructure/build/project-document.ts";

function projectPages() {
  let output = "";
  return {
    name: "portfolio-project-pages",
    apply: "build" as const,
    configResolved(config: { root: string; build: { outDir: string } }) {
      output = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const html = await readFile(resolve(output, "index.html"), "utf8");
      await Promise.all(
        data.projects.map(async (project) => {
          const directory = resolve(output, "projects", project.id);
          await mkdir(directory, { recursive: true });
          await writeFile(
            resolve(directory, "index.html"),
            projectDocument(html, project),
          );
        }),
      );
      const urls = ["https://3d.bondeth.dev/"];
      await writeFile(
        resolve(output, "sitemap.xml"),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}\n</urlset>\n`,
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), projectPages()],
  server: { port: 5173 },
});
