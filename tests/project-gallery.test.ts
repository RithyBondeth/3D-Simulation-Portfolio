import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

test("the gallery and highlights link to canonical case studies and all portfolio destinations are covered", async () => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
    appType: "custom",
    logLevel: "error",
  });
  try {
    const { PortfolioContent } = await server.ssrLoadModule(
      "/src/presentation/portfolio/PortfolioContent.tsx",
    );
    const { districts, islandProjects } = await server.ssrLoadModule(
      "/src/data/portfolio/project-catalog.ts",
    );
    const { default: SelectedWork } = await server.ssrLoadModule(
      "/src/presentation/portfolio/SelectedWork.tsx",
    );
    const highlights = renderToStaticMarkup(createElement(SelectedWork));
    const highlightLinks = [
      ...highlights.matchAll(
        /href="https:\/\/www.bondeth.dev\/en\/projects\/([^"/]+)"/g,
      ),
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
    const gallery = renderToStaticMarkup(createElement(PortfolioContent, base));
    assert.ok(!gallery.includes('class="project-detail"'));
    for (const project of islandProjects)
      assert.ok(
        gallery.includes(
          `href="https://www.bondeth.dev/en/projects/${project.id}"`,
        ),
      );
    const about = renderToStaticMarkup(
      createElement(PortfolioContent, { ...base, section: "about" }),
    );
    assert.ok(about.includes("Phnom Penh"));
    assert.ok(about.includes("https://www.bondeth.dev/en#about"));
    const skills = renderToStaticMarkup(
      createElement(PortfolioContent, { ...base, section: "skills" }),
    );
    for (const title of [
      "Web development",
      "Mobile development",
      "AI integration",
      "Custom software",
    ])
      assert.ok(skills.includes(title));
    assert.ok(skills.includes("https://www.bondeth.dev/en#services"));
    const journey = renderToStaticMarkup(
      createElement(PortfolioContent, { ...base, section: "experience" }),
    );
    assert.ok(journey.includes("Bachelor of Computer Science"));
    assert.ok(journey.includes("Techo Scholar"));
    assert.ok(journey.includes("https://www.bondeth.dev/en#education"));
    const labs = renderToStaticMarkup(
      createElement(PortfolioContent, { ...base, section: "labs" }),
    );
    assert.ok(labs.includes("/en/labs/rag-retrieval"));
    assert.ok(labs.includes("/en/blog/background-jobs-idempotency-retries"));
    assert.ok(labs.includes("Technical videos"));
    assert.ok(labs.includes("youtube.com"));
    const { default: PortfolioDestinations } = await server.ssrLoadModule(
      "/src/presentation/portfolio/PortfolioDestinations.tsx",
    );
    const destinations = renderToStaticMarkup(
      createElement(PortfolioDestinations, {
        active: "about",
        onSelect: () => {},
      }),
    );
    for (const name of [
      "About",
      "Skills",
      "Journey",
      "Work",
      "Explore",
      "Contact",
    ])
      assert.ok(destinations.includes(`<strong>${name}</strong>`));
  } finally {
    await server.close();
  }
});
