import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  districtForProject,
  matchesProjectFilter,
  nearbyDistrict,
  projectDistricts,
  routeDistrict,
} from "../src/lib/project-districts.ts";
import type { Project } from "../src/types.ts";

const projects = JSON.parse(
  readFileSync(new URL("../src/content.json", import.meta.url), "utf8"),
).projects as Project[];

test("every portfolio project has one island home and the matching gallery filter", () => {
  const seen = new Set<string>();
  for (const district of projectDistricts) {
    const members = projects.filter(
      (p) => districtForProject(p) === district.id,
    );
    const gallery = projects.filter((p) =>
      matchesProjectFilter(p, district.filter, []),
    );
    assert.ok(members.length > 0, `${district.title} is empty`);
    assert.deepEqual(
      gallery.map((p) => p.id),
      members.map((p) => p.id),
    );
    for (const project of members) {
      assert.equal(seen.has(project.id), false);
      seen.add(project.id);
    }
  }
  assert.equal(seen.size, projects.length);
  assert.equal(
    projects.filter((p) => matchesProjectFilter(p, "All", [])).length,
    projects.length,
  );
  assert.equal(
    districtForProject(projects.find((p) => p.id === "romlerk")!),
    "mobile",
    "AI-powered phone apps keep their mobile home",
  );
  assert.equal(
    districtForProject(projects.find((p) => p.id === "reahu-generator")!),
    "web",
    "Tailwind does not make a project AI",
  );
});

test("scrolling the complete route reveals every district project", () => {
  const seen = new Set<string>();
  for (let step = 0; step <= 2000; step++) {
    const route = routeDistrict(step / 2000);
    const members = projects.filter((p) => districtForProject(p) === route.id);
    const index = Math.min(
      members.length - 1,
      Math.floor(route.progress * members.length),
    );
    assert.ok(members[index]);
    seen.add(members[index].id);
  }
  assert.equal(seen.size, projects.length);
  assert.deepEqual(routeDistrict(-1), routeDistrict(0));
  assert.deepEqual(routeDistrict(2), routeDistrict(1));
});

test("district visit stops and manual driving agree with the district selection", () => {
  for (const district of projectDistricts)
    assert.equal(routeDistrict(district.stop).id, district.id);
  assert.equal(nearbyDistrict(-20, 30.5), "macos");
  assert.equal(nearbyDistrict(44.5, 0), "mobile");
  assert.equal(nearbyDistrict(0, -38.5), "web");
  assert.equal(nearbyDistrict(-44.5, 0), "ai");
});
