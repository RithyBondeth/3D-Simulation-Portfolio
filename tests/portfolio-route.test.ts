import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  readPortfolioRoute,
  portfolioURL,
  projectHref,
} from "../src/lib/portfolio-route.ts";
import { projectDocument } from "../src/lib/project-document.ts";

const ids = ["bondex-notch", "apsara-agentic"];
test("legacy island links remain recognisable and project links point to the main portfolio", () => {
  for (const id of ids) {
    const href = `https://3d.bondeth.dev/projects/${id}/`;
    assert.equal(projectHref(id), `https://www.bondeth.dev/en/projects/${id}`);
    assert.deepEqual(readPortfolioRoute(href, ids), {
      section: "projects",
      projectId: id,
    });
    assert.deepEqual(readPortfolioRoute(`${href}#about`, ids), {
      section: "projects",
      projectId: id,
    });
  }
  assert.deepEqual(
    readPortfolioRoute(
      "https://3d.bondeth.dev/?project=bondex-notch#projects",
      ids,
    ),
    { section: "projects", projectId: "bondex-notch" },
  );
});

test("invalid projects and malformed path escapes don't select an unrelated case study", () => {
  for (const path of [
    "/projects/missing/",
    "/projects/%E0%A4%A/",
    "/?project=missing#projects",
  ]) {
    const route = readPortfolioRoute(`https://3d.bondeth.dev${path}`, ids);
    assert.equal(route.projectId, undefined);
    assert.equal(route.section, "projects");
  }
});

test("gallery and section navigation clear the project path and preserve unrelated parameters", () => {
  const source =
    "https://3d.bondeth.dev/projects/bondex-notch/?utm_source=portfolio";
  assert.equal(
    portfolioURL(source, { section: "projects" }),
    "https://3d.bondeth.dev/?utm_source=portfolio#projects",
  );
  assert.equal(
    portfolioURL(source, { section: "contact" }),
    "https://3d.bondeth.dev/?utm_source=portfolio#contact",
  );
  assert.equal(
    portfolioURL(source, { section: null }),
    "https://3d.bondeth.dev/?utm_source=portfolio",
  );
  assert.equal(
    portfolioURL(source, { section: "projects", projectId: "apsara-agentic" }),
    "https://3d.bondeth.dev/projects/apsara-agentic/?utm_source=portfolio",
  );
});

test("legacy project documents safely forward to canonical case studies without JavaScript", async () => {
  const template = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8",
  );
  const html = projectDocument(template, {
    id: "bondex-notch",
    title: 'Bondex <Notch> & "Mac" $&',
    description: 'Useful <software> & "care" $&',
  });
  assert.ok(
    html.includes(
      "<title>Bondex &lt;Notch&gt; &amp; &quot;Mac&quot; $&amp; | Rithy Bondeth</title>",
    ),
  );
  for (const key of [
    'name="description"',
    'property="og:description"',
    'name="twitter:description"',
  ]) {
    assert.ok(
      html.includes(
        `${key} content="Useful &lt;software&gt; &amp; &quot;care&quot; $&amp;"`,
      ),
    );
  }
  assert.ok(
    html.includes(
      'rel="canonical" href="https://www.bondeth.dev/en/projects/bondex-notch"',
    ),
  );
  assert.ok(
    html.includes(
      'property="og:url" content="https://www.bondeth.dev/en/projects/bondex-notch"',
    ),
  );
  assert.ok(html.includes("https://3d.bondeth.dev/social-preview.png"));
  assert.ok(
    html.includes(
      'http-equiv="refresh" content="0;url=https://www.bondeth.dev/en/projects/bondex-notch"',
    ),
  );
  assert.ok(
    html.includes('href="https://www.bondeth.dev/en/projects/bondex-notch"'),
  );
  assert.ok(!html.includes("<script"));
});
