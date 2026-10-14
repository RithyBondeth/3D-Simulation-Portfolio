import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourceRoot = resolve(root, "src");
const files = readdirSync(sourceRoot, { recursive: true })
  .map(String)
  .filter((file) => /\.(ts|tsx)$/.test(file));
const sources = new Map(
  files.map((file) => [file, readFileSync(resolve(sourceRoot, file), "utf8")]),
);

function imports(source: string) {
  return [
    ...source.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)["']([^"']+)["']/g),
  ].map((match) => match[1]);
}

const allowed: Record<string, readonly string[]> = {
  domain: ["domain"],
  application: ["application", "domain"],
  data: ["data", "domain"],
  infrastructure: ["infrastructure", "domain"],
  presentation: ["presentation", "application", "domain", "data"],
  app: ["app", "presentation", "application", "domain", "data"],
};

function resolveImport(file: string, specifier: string) {
  const base = resolve(sourceRoot, dirname(file), specifier);
  return [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.json`,
    `${base}.css`,
  ].find((candidate) => existsSync(candidate));
}

test("source dependencies point inward through the architecture layers", () => {
  for (const [file, source] of sources) {
    const layer = file.split(sep)[0];
    if (!allowed[layer]) continue; // main.tsx is the application bootstrap.
    for (const specifier of imports(source)) {
      if (!specifier.startsWith(".")) {
        if (layer === "domain")
          assert.fail(`${file} imports external package ${specifier}`);
        continue;
      }
      const target = resolveImport(file, specifier);
      assert.ok(target, `${file} imports missing module ${specifier}`);
      const destination = relative(sourceRoot, target).split(sep)[0];
      assert.ok(
        allowed[layer].includes(destination),
        `${file} depends on ${destination}`,
      );
    }
  }
});

test("domain rules remain independent of browser and rendering state", () => {
  for (const [file, source] of sources) {
    if (!file.startsWith(`domain${sep}`)) continue;
    assert.doesNotMatch(
      source,
      /\b(window|document|navigator|localStorage|sessionStorage)\s*[.[]/,
      file,
    );
    assert.ok(!file.endsWith(".tsx"), `${file} contains presentation code`);
  }
});

test("source modules have no circular dependencies", () => {
  const complete = new Set<string>();
  const active = new Set<string>();
  function visit(file: string, trail: string[]) {
    if (complete.has(file)) return;
    assert.ok(
      !active.has(file),
      `circular dependency: ${[...trail, file].join(" → ")}`,
    );
    active.add(file);
    for (const specifier of imports(sources.get(file) ?? "")) {
      if (!specifier.startsWith(".")) continue;
      const target = resolveImport(file, specifier);
      if (target) visit(relative(sourceRoot, target), [...trail, file]);
    }
    active.delete(file);
    complete.add(file);
  }
  for (const file of sources.keys()) visit(file, []);
});

test("public assets are referenced or explicitly retained as source or attribution", () => {
  const publicRoot = resolve(root, "public");
  const references = [
    ...sources.values(),
    ...readdirSync(resolve(root, "src/data/portfolio"))
      .filter((file) => file.endsWith(".json"))
      .map((file) =>
        readFileSync(resolve(root, "src/data/portfolio", file), "utf8"),
      ),
    readFileSync(resolve(root, "index.html"), "utf8"),
    readFileSync(resolve(root, "scripts/generate-social-preview.mjs"), "utf8"),
  ].join("\n");
  const retained = new Map([
    ["robots.txt", "Standard crawler endpoint"],
    ["models/ATTRIBUTION.md", "Required model attribution"],
    [
      "textures/cambodia-plate.svg",
      "Editable source for the rendered plate PNG",
    ],
  ]);
  const assetFiles = readdirSync(publicRoot, { recursive: true })
    .map(String)
    .filter((file) => /\.[^/]+$/.test(file));
  for (const file of assetFiles) {
    const portable = file.split(sep).join("/");
    assert.ok(
      references.includes(portable) || retained.has(portable),
      `unreferenced public asset: ${portable}`,
    );
  }
  for (const file of retained.keys())
    assert.ok(
      existsSync(resolve(publicRoot, file)),
      `missing retained asset: ${file}`,
    );
});
