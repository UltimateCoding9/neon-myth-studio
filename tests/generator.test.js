import test from "node:test";
import assert from "node:assert/strict";
import { buildCreatorPack, buildStory, hashSeed, normalizeInput } from "../public/generator.js";

test("hashSeed is deterministic", () => {
  const first = hashSeed("neon|myth|seed");
  const second = hashSeed("neon|myth|seed");
  assert.equal(first, second);
});

test("normalizeInput falls back to safe defaults", () => {
  const input = normalizeInput({});
  assert.equal(input.protagonist, "Rook Vega");
  assert.equal(input.genre, "scifi");
  assert.equal(input.chaos, 5);
});

test("buildStory is deterministic for same input and seed hint", () => {
  const input = normalizeInput({
    protagonist: "Nia",
    genre: "fantasy",
    setting: "hanging gardens",
    object: "silver compass",
    emotion: "hope",
    chaos: 7
  });

  const one = buildStory(input, "fixed-seed");
  const two = buildStory(input, "fixed-seed");

  assert.equal(one.seed, two.seed);
  assert.equal(one.title, two.title);
  assert.deepEqual(one.palette, two.palette);
  assert.equal(one.sigil, two.sigil);
});

test("buildStory returns expected shape", () => {
  const story = buildStory(
    {
      protagonist: "Nia",
      genre: "surreal",
      setting: "desert station",
      object: "glass key",
      emotion: "curiosity",
      chaos: 6
    },
    "shape-seed"
  );

  assert.equal(story.beats.length, 3);
  assert.equal(story.dialogue.length, 6);
  assert.equal(story.palette.length, 5);
  assert.match(story.palette[0], /^#[0-9a-f]{6}$/i);
  assert.ok(story.markdown.includes("## Three-Beat Arc"));
  assert.ok(story.dialogue.join(" ").includes("glass key"));
  assert.ok(story.dialogue.join(" ").includes("curiosity"));
  assert.ok(story.dialogue.join(" ").includes("6/10"));
});

test("buildCreatorPack returns export-ready payload", () => {
  const story = buildStory(
    {
      protagonist: "Nova Vale",
      genre: "scifi",
      setting: "orbital port",
      object: "holo key",
      emotion: "resolve",
      chaos: 4
    },
    "pack-seed"
  );

  const pack = buildCreatorPack(story, "pack-seed");
  assert.equal(pack.seedHint, "pack-seed");
  assert.equal(pack.title, story.title);
  assert.equal(pack.palette.length, 5);
  assert.ok(pack.socialPost.includes("#NeonMythStudio"));
  assert.equal(pack.productionChecklist.length, 4);
});
