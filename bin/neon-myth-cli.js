#!/usr/bin/env node
import { buildStory, normalizeInput } from "../public/generator.js";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function printHelp() {
  console.log(`Neon Myth CLI

Usage:
  npm run cli -- --protagonist "Rook Vega" --genre scifi --setting "neon harbor" --object "clockwork key" --emotion wonder --chaos 7 --seed my-seed

Options:
  --protagonist   Main character name
  --genre         fantasy | scifi | noir | cozy | surreal
  --setting       Story location
  --object        Signature object
  --emotion       Core emotional tone
  --chaos         1..10 intensity (default 5)
  --seed          Deterministic seed hint
  --json          Output JSON instead of markdown
  --help          Show this help
`);
}

const args = parseArgs(process.argv.slice(2));
if (args.help === "true" || args.h === "true") {
  printHelp();
  process.exit(0);
}

const input = normalizeInput({
  protagonist: args.protagonist,
  genre: args.genre,
  setting: args.setting,
  object: args.object,
  emotion: args.emotion,
  chaos: args.chaos
});

const story = buildStory(input, args.seed || Date.now().toString());

if (args.json === "true") {
  console.log(JSON.stringify(story, null, 2));
} else {
  console.log(story.markdown);
}
