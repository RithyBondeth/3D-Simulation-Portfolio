import { test } from "node:test";
import assert from "node:assert/strict";
import { isAIProject } from "../src/lib/studio-navigation.ts";

test("Tailwind is not classified as artificial intelligence", () => {
  assert.equal(
    isAIProject({
      tags: ["React", "Tailwind CSS"],
      domains: ["Developer Tools"],
      description: "A README builder.",
    }),
    false,
  );
});

test("AI projects can be identified by actual technologies or capabilities", () => {
  assert.equal(
    isAIProject({
      tags: ["Python", "LiteLLM"],
      domains: [],
      description: "A coding agent.",
    }),
    true,
  );
  assert.equal(
    isAIProject({
      tags: ["NestJS"],
      domains: ["Recruitment"],
      description: "An AI resume builder.",
    }),
    true,
  );
});
