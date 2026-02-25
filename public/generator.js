const GENRE_PROFILES = {
  fantasy: {
    titleWords: ["Runes", "Moon", "Lantern", "Crown", "Ember", "Whisper"],
    antagonists: ["Archivist", "Wyrm", "Mirror Knight", "Bone Oracle", "Storm Witch"],
    spaces: ["floating citadel", "forgotten valley", "glass forest", "clocktower monastery"]
  },
  scifi: {
    titleWords: ["Signal", "Nebula", "Cipher", "Vector", "Orbit", "Pulse"],
    antagonists: ["Protocol", "Sentinel", "Swarm Mind", "Void Broker", "Memory Taxman"],
    spaces: ["ring station", "abandoned shuttle dock", "quantum farm", "neon megacity"]
  },
  noir: {
    titleWords: ["Smoke", "Velvet", "Static", "Rain", "Shadow", "Midnight"],
    antagonists: ["Fixer", "Collector", "Crooked Judge", "Ghost Accountant", "Silent Choir"],
    spaces: ["rain-soaked district", "late-night diner", "sealed courtroom", "subway labyrinth"]
  },
  cozy: {
    titleWords: ["Tea", "Patchwork", "Sunroom", "Biscuit", "Meadow", "Parlor"],
    antagonists: ["Fussy Inspector", "Grumpy Neighbor", "Clockmaker", "Storm Front", "Mischief Fox"],
    spaces: ["village market", "community greenhouse", "bookshop attic", "seaside kitchen"]
  },
  surreal: {
    titleWords: ["Echo", "Marble", "Paradox", "Velour", "Liminal", "Ink"],
    antagonists: ["Dream Auditor", "Faceless Host", "Reverse Twin", "Choir of Keys", "Paper King"],
    spaces: ["upside-down theater", "infinite hallway", "sleeping museum", "desert of doors"]
  }
};

const OPENERS = [
  "Tonight,",
  "At dawn,",
  "Exactly once each century,",
  "On a normal Tuesday,",
  "Just before the lights fail,",
  "While the city is still asleep,"
];

const ACTIONS = [
  "steals the map nobody can read",
  "finds a machine that remembers feelings",
  "accepts a dare from a stranger",
  "opens a door that should not exist",
  "trades certainty for one impossible clue",
  "hears a song hidden in static"
];

const TWISTS = [
  "The villain is protecting them from a bigger lie.",
  "The artifact only works if shared with the enemy.",
  "Their memory was rented, not lost.",
  "The final clue is written in their own voice.",
  "The city has been rehearsing this night for years.",
  "Winning means letting someone else take the credit."
];

const GENRE_DIALOGUE_STYLE = {
  fantasy: {
    power: "oaths",
    cost: "prophecy debt",
    leverage: "throne room keys",
    route: "moon gate"
  },
  scifi: {
    power: "protocols",
    cost: "telemetry debt",
    leverage: "reactor access",
    route: "jump corridor"
  },
  noir: {
    power: "debts",
    cost: "alibis",
    leverage: "case files",
    route: "back-alley route"
  },
  cozy: {
    power: "favors",
    cost: "village trust",
    leverage: "market schedule",
    route: "garden passage"
  },
  surreal: {
    power: "paradoxes",
    cost: "memory",
    leverage: "real names",
    route: "folded doorway"
  }
};

function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function titleCase(value) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function emotionToNoun(emotion) {
  const raw = (emotion || "").trim().toLowerCase();
  if (!raw) return "resolve";
  const map = {
    sad: "sadness",
    happy: "joy",
    angry: "anger",
    fear: "fear",
    afraid: "fear",
    anxious: "anxiety",
    calm: "calm",
    curious: "curiosity",
    curiosity: "curiosity",
    wonder: "wonder",
    awe: "awe"
  };
  return map[raw] || raw;
}

export function hashSeed(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createRng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hslToHex(h, s, l) {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function generatePalette(seed, chaos) {
  const rng = createRng(seed ^ 0xa5a5a5);
  const baseHue = seed % 360;
  const sat = clamp(52 + chaos * 4, 45, 90);
  const lightBase = clamp(28 + chaos * 2, 25, 62);
  const offsets = [0, 24, 160, 204, 332];

  return offsets.map((offset, index) => {
    const hue = (baseHue + offset + Math.floor(rng() * 14)) % 360;
    const light = clamp(lightBase + (index % 2 === 0 ? 8 : -6) + Math.floor(rng() * 10), 20, 76);
    return hslToHex(hue, sat, light);
  });
}

function generateSigil(seed, chaos) {
  const rng = createRng(seed ^ 0x9e3779b9);
  const size = 11;
  const symbols = [".", ":", "+", "x", "#"];
  const density = clamp(0.8 - chaos * 0.05, 0.26, 0.82);
  const rows = [];

  for (let y = 0; y < size; y += 1) {
    const row = new Array(size).fill(" ");
    for (let x = 0; x <= Math.floor(size / 2); x += 1) {
      const v = rng();
      const cell = v > density ? pick(rng, symbols) : " ";
      row[x] = cell;
      row[size - 1 - x] = cell;
    }
    rows.push(row.join(""));
  }

  const center = Math.floor(size / 2);
  const centerRow = rows[center].split("");
  centerRow[center] = "#";
  rows[center] = centerRow.join("");

  return rows.join("\n");
}

function buildDialogue(rng, input, villain) {
  const hero = input.protagonist;
  const style = GENRE_DIALOGUE_STYLE[input.genre];
  const emotionNoun = emotionToNoun(input.emotion);
  const line2Options = [
    `${villain}: In ${input.setting}, ${style.power} decide who survives. ${emotionNoun} only buys ${style.cost}.`,
    `${villain}: You brought ${emotionNoun} into ${input.setting}. Around here, that is how people lose ${style.power}.`
  ];
  const line4Options = [
    `${villain}: At chaos ${input.chaos}/10, the ${input.object} opens the ${style.route}. It will charge us ${style.cost}.`,
    `${villain}: When chaos hits ${input.chaos}/10, the ${input.object} rewrites the ${style.power} order in ${input.setting}.`
  ];
  const line6Options = [
    `${villain}: Keep your ${emotionNoun}, ${hero}. If it breaks, I take the ${input.object} and end this myself.`,
    `${villain}: Fine, one pact. You keep ${emotionNoun}, I keep the ${style.leverage}. We move now.`
  ];

  return [
    `${hero}: I crossed ${input.setting} for the ${input.object}. ${emotionNoun} is why I am still standing.`,
    pick(rng, line2Options),
    `${hero}: Then explain why the ${input.object} answers when I choose ${emotionNoun} over fear.`,
    pick(rng, line4Options),
    `${hero}: We split the stakes. I guard the ${input.object}; you secure the ${style.leverage}. Nobody else burns.`,
    pick(rng, line6Options)
  ];
}

export function normalizeInput(rawInput = {}) {
  const protagonist = (rawInput.protagonist || "Rook Vega").trim().slice(0, 40);
  const setting = (rawInput.setting || "neon harbor").trim().slice(0, 60);
  const object = (rawInput.object || "clockwork key").trim().slice(0, 40);
  const emotion = (rawInput.emotion || "wonder").trim().slice(0, 25);
  const genre = (rawInput.genre || "scifi").trim().toLowerCase();
  const chaos = clamp(Number.parseInt(rawInput.chaos, 10) || 5, 1, 10);
  const safeGenre = GENRE_PROFILES[genre] ? genre : "scifi";

  return {
    protagonist: protagonist || "Rook Vega",
    setting: setting || "neon harbor",
    object: object || "clockwork key",
    emotion: emotion || "wonder",
    genre: safeGenre,
    chaos
  };
}

function renderMarkdown(story) {
  const beatLines = story.beats.map((line, idx) => `${idx + 1}. ${line}`).join("\n");
  const dialogueLines = story.dialogue.map((line) => `- ${line}`).join("\n");
  const colorLines = story.palette.map((hex) => `- ${hex}`).join("\n");

  return [
    `# ${story.title}`,
    "",
    `**Hook:** ${story.hook}`,
    "",
    "## Three-Beat Arc",
    beatLines,
    "",
    "## Dialogue Duel",
    dialogueLines,
    "",
    "## Poster Prompt",
    story.posterPrompt,
    "",
    "## Palette",
    colorLines,
    "",
    "## Sigil",
    "```txt",
    story.sigil,
    "```"
  ].join("\n");
}

function socialHashtagForGenre(genre) {
  if (genre === "scifi") return "SciFiWriting";
  if (genre === "fantasy") return "FantasyWriting";
  if (genre === "noir") return "NoirFiction";
  if (genre === "cozy") return "CozyFiction";
  return "CreativeWriting";
}

export function buildCreatorPack(story, seedHint = Date.now().toString()) {
  const socialPost = [
    `New drop: ${story.title}`,
    story.hook,
    `Mood colors: ${story.palette.join(" ")}`,
    `#NeonMythStudio #AgentsLeague #${socialHashtagForGenre(story.input.genre)}`
  ].join("\n");

  return {
    id: `${story.seed}`,
    seedHint,
    generatedAt: new Date().toISOString(),
    input: story.input,
    title: story.title,
    hook: story.hook,
    beats: story.beats,
    dialogue: story.dialogue,
    posterPrompt: story.posterPrompt,
    palette: story.palette,
    sigil: story.sigil,
    markdown: story.markdown,
    socialPost,
    productionChecklist: [
      "Create one hero image with the poster prompt and palette.",
      "Record a 30-60 second narration of the hook and beat arc.",
      "Publish markdown as devlog snippet.",
      "Share one remix variant for audience vote."
    ]
  };
}

export function buildStory(rawInput, seedHint = Date.now().toString()) {
  const input = normalizeInput(rawInput);
  const profile = GENRE_PROFILES[input.genre];
  const seed = hashSeed(
    [
      input.protagonist,
      input.setting,
      input.object,
      input.emotion,
      input.genre,
      input.chaos,
      seedHint
    ].join("|")
  );

  const rng = createRng(seed);
  const villain = pick(rng, profile.antagonists);
  const title = `${pick(rng, profile.titleWords)} of ${titleCase(input.object)}`;

  const hook = `${pick(rng, OPENERS)} ${input.protagonist} enters the ${pick(
    rng,
    profile.spaces
  )} in ${input.setting}, ${pick(rng, ACTIONS)} while chasing ${input.emotion}.`;

  const beats = [
    `${input.protagonist} discovers that the ${input.object} answers only to those who admit fear.`,
    `A tense alliance forms with ${villain}, and the plan goes loud when chaos reaches ${input.chaos}/10.`,
    `${pick(rng, TWISTS)}`
  ];

  const dialogue = buildDialogue(rng, input, villain);
  const palette = generatePalette(seed, input.chaos);
  const sigil = generateSigil(seed, input.chaos);
  const posterPrompt = `Cinematic ${input.genre} poster of ${input.protagonist} and ${villain} in ${input.setting}, featuring ${input.object}, color palette ${palette.join(
    ", "
  )}, emotional tone: ${input.emotion}.`;

  const story = {
    seed,
    input,
    title,
    hook,
    beats,
    dialogue,
    palette,
    sigil,
    posterPrompt
  };

  return {
    ...story,
    markdown: renderMarkdown(story)
  };
}
