import { test } from "node:test";
import assert from "node:assert/strict";
import {
  chooseGraphicsQuality,
  shouldReduceQuality,
} from "../src/lib/graphics-quality.ts";

test("automatic graphics use device capabilities while explicit preferences always win", () => {
  assert.equal(chooseGraphicsQuality("auto", { compact: true }), "low");
  assert.equal(
    chooseGraphicsQuality("auto", { compact: false, cores: 4 }),
    "low",
  );
  assert.equal(
    chooseGraphicsQuality("auto", { compact: false, memory: 4 }),
    "low",
  );
  assert.equal(
    chooseGraphicsQuality("auto", { compact: false, saveData: true }),
    "low",
  );
  assert.equal(
    chooseGraphicsQuality("auto", { compact: false, cores: 8, memory: 8 }),
    "high",
  );
  assert.equal(
    chooseGraphicsQuality("high", { compact: true, saveData: true }),
    "high",
  );
  assert.equal(
    chooseGraphicsQuality("low", { compact: false, cores: 16 }),
    "low",
  );
});

test("adaptive quality requires sustained slow frames and ignores a lone stall", () => {
  assert.equal(shouldReduceQuality(Array(90).fill(1 / 30)), false);
  assert.equal(shouldReduceQuality([0.25, ...Array(89).fill(1 / 30)]), false);
  assert.equal(shouldReduceQuality(Array(30).fill(0.1)), false);
  assert.equal(
    shouldReduceQuality([...Array(60).fill(0.08), ...Array(30).fill(1 / 30)]),
    true,
  );
});
