import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

test("the gallery renders all projects by default, matching district collections and every case study", async () => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
    appType: "custom",
    logLevel: "error",
  });
  try {
    const { PortfolioContent } = await server.ssrLoadModule(
      "/src/components/PortfolioContent.tsx",
    );
    const { default: DistrictBrowser } = await server.ssrLoadModule(
      "/src/components/DistrictBrowser.tsx",
    );
    const { districts, islandProjects } = await server.ssrLoadModule(
      "/src/project-catalog.ts",
    );
    const { default: SelectedWork } = await server.ssrLoadModule(
      "/src/components/SelectedWork.tsx",
    );
    const highlights = renderToStaticMarkup(
      createElement(SelectedWork, { onProject: () => {} }),
    );
    const highlightLinks = [
      ...highlights.matchAll(/href="\/projects\/([^/]+)\/"/g),
    ].map((match) => match[1]);
    assert.equal(highlightLinks.length, 3);
    assert.ok(
      highlightLinks.every((id) =>
        islandProjects.some((project: { id: string }) => project.id === id),
      ),
    );
    const base = { section: "projects", onNavigate: () => {} };
    const cards = (markup: string) =>
      (markup.match(/class="project-card"/g) ?? []).length;
    assert.equal(
      cards(renderToStaticMarkup(createElement(PortfolioContent, base))),
      islandProjects.length,
    );
    for (const district of districts) {
      const gallery = renderToStaticMarkup(
        createElement(PortfolioContent, {
          ...base,
          initialProjectFilter: district.filter,
        }),
      );
      assert.equal(cards(gallery), district.projects.length);
    }
    for (const project of islandProjects) {
      const detail = renderToStaticMarkup(
        createElement(PortfolioContent, {
          ...base,
          initialProjectId: project.id,
        }),
      );
      assert.ok(detail.includes('class="project-detail"'));
      assert.ok(detail.includes(project.title));
    }
    const navigation = renderToStaticMarkup(
      createElement(DistrictBrowser, {
        active: "macos",
        following: true,
        onFollow: () => {},
        onChoose: () => {},
        onAll: () => {},
      }),
    );
    assert.ok(
      navigation.includes(`Explore all ${islandProjects.length} projects`),
    );
    for (const district of districts)
      assert.ok(
        navigation.includes(
          `Visit ${district.title} district, ${district.projects.length} projects`,
        ),
      );
  } finally {
    await server.close();
  }
});
