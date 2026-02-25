import { buildCreatorPack, buildStory, normalizeInput } from "./generator.js";

const VAULT_KEY = "neon-myth-vault-v1";
const MAX_VAULT_ENTRIES = 40;

const form = document.querySelector("#story-form");
const remixButton = document.querySelector("#remix");
const copyButton = document.querySelector("#copy");
const saveVariantButton = document.querySelector("#save-variant");
const exportPackButton = document.querySelector("#export-pack");
const loadSelectedButton = document.querySelector("#load-selected");
const deleteSelectedButton = document.querySelector("#delete-selected");
const variantLabelInput = document.querySelector("#variant-label");
const chaosInput = document.querySelector("#chaos");
const chaosValueNode = document.querySelector("#chaos-value");
const savedListNode = document.querySelector("#saved-list");
const compareSummaryNode = document.querySelector("#compare-summary");
const compareDetailsNode = document.querySelector("#compare-details");
const statusNode = document.querySelector("#status");

const outputNodes = {
  title: document.querySelector("#title"),
  hook: document.querySelector("#hook"),
  beats: document.querySelector("#beats"),
  dialogue: document.querySelector("#dialogue"),
  poster: document.querySelector("#poster"),
  palette: document.querySelector("#palette"),
  sigil: document.querySelector("#sigil")
};

const state = {
  input: null,
  seedHint: Date.now().toString(),
  story: null,
  selectedVariantId: null,
  vault: []
};

function setStatus(text, isError = false) {
  statusNode.textContent = text;
  statusNode.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function saveVault() {
  localStorage.setItem(VAULT_KEY, JSON.stringify(state.vault));
}

function loadVault() {
  const raw = localStorage.getItem(VAULT_KEY);
  const parsed = raw ? safeJsonParse(raw, []) : [];
  state.vault = Array.isArray(parsed) ? parsed : [];
}

function readInput() {
  const data = new FormData(form);
  return normalizeInput({
    protagonist: data.get("protagonist"),
    genre: data.get("genre"),
    setting: data.get("setting"),
    object: data.get("object"),
    emotion: data.get("emotion"),
    chaos: data.get("chaos")
  });
}

function syncChaosValue() {
  const numeric = Number.parseInt(chaosInput.value, 10) || 5;
  chaosValueNode.textContent = `${numeric}/10`;
}

function updateHash(input, seedHint) {
  const params = new URLSearchParams({
    protagonist: input.protagonist,
    genre: input.genre,
    setting: input.setting,
    object: input.object,
    emotion: input.emotion,
    chaos: String(input.chaos),
    seed: seedHint
  });
  window.location.hash = params.toString();
}

function hydrateFormFromHash() {
  const hash = window.location.hash.replace(/^#/, "").trim();
  if (!hash) return false;

  const params = new URLSearchParams(hash);
  const seededInput = normalizeInput({
    protagonist: params.get("protagonist"),
    genre: params.get("genre"),
    setting: params.get("setting"),
    object: params.get("object"),
    emotion: params.get("emotion"),
    chaos: params.get("chaos")
  });

  form.protagonist.value = seededInput.protagonist;
  form.genre.value = seededInput.genre;
  form.setting.value = seededInput.setting;
  form.object.value = seededInput.object;
  form.emotion.value = seededInput.emotion;
  form.chaos.value = String(seededInput.chaos);

  state.seedHint = params.get("seed") || Date.now().toString();
  state.input = seededInput;
  return true;
}

function renderList(node, values) {
  node.innerHTML = "";
  for (const line of values) {
    const item = document.createElement("li");
    item.textContent = line;
    node.appendChild(item);
  }
}

function renderPalette(colors) {
  outputNodes.palette.innerHTML = "";
  for (const hex of colors) {
    const chip = document.createElement("div");
    chip.className = "swatch";
    chip.style.background = hex;
    chip.textContent = hex;
    outputNodes.palette.appendChild(chip);
  }
}

function renderStory(story) {
  outputNodes.title.textContent = story.title;
  outputNodes.hook.textContent = story.hook;
  renderList(outputNodes.beats, story.beats);
  renderList(outputNodes.dialogue, story.dialogue);
  outputNodes.poster.textContent = story.posterPrompt;
  renderPalette(story.palette);
  outputNodes.sigil.textContent = story.sigil;
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString();
}

function currentSelectedVariant() {
  return state.vault.find((entry) => entry.id === state.selectedVariantId) || null;
}

function compareStories(currentStory, selectedStory) {
  const overlapCount = currentStory.palette.filter((hex) => selectedStory.palette.includes(hex)).length;
  const sameHook = currentStory.hook === selectedStory.hook;
  const sameTitle = currentStory.title === selectedStory.title;
  const dialogueDelta = Math.abs(currentStory.dialogue.length - selectedStory.dialogue.length);

  return [
    `Current title: ${currentStory.title}`,
    `Saved title: ${selectedStory.title}`,
    `Title match: ${sameTitle ? "yes" : "no"}`,
    `Hook match: ${sameHook ? "yes" : "no"}`,
    `Palette overlap: ${overlapCount}/5`,
    `Dialogue length delta: ${dialogueDelta}`,
    `Current seed: ${currentStory.seed}`,
    `Saved seed: ${selectedStory.seed}`
  ].join("\n");
}

function renderCompare() {
  const selected = currentSelectedVariant();
  if (!selected) {
    compareSummaryNode.textContent = "No saved variant selected.";
    compareDetailsNode.textContent = "Select a saved variant to compare.";
    return;
  }

  if (!state.story) {
    compareSummaryNode.textContent = "Generate a scene to compare.";
    compareDetailsNode.textContent = "Current scene is missing.";
    return;
  }

  compareSummaryNode.textContent = `Comparing current scene with "${selected.label}".`;
  compareDetailsNode.textContent = compareStories(state.story, selected.story);
}

function renderSavedList() {
  savedListNode.innerHTML = "";

  if (state.vault.length === 0) {
    const empty = document.createElement("li");
    empty.className = "saved-item";
    empty.textContent = "No saved variants yet.";
    savedListNode.appendChild(empty);
    return;
  }

  for (const entry of state.vault) {
    const item = document.createElement("li");
    item.className = `saved-item ${entry.id === state.selectedVariantId ? "active" : ""}`;
    item.dataset.id = entry.id;

    const title = document.createElement("div");
    title.textContent = entry.label;

    const meta = document.createElement("div");
    meta.className = "saved-meta";
    meta.textContent = `Seed ${entry.story.seed} | ${formatDate(entry.savedAt)}`;

    item.appendChild(title);
    item.appendChild(meta);

    item.addEventListener("click", () => {
      state.selectedVariantId = entry.id;
      renderSavedList();
      renderCompare();
    });

    savedListNode.appendChild(item);
  }
}

function sanitizeFileName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function downloadTextFile(fileName, content, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function generate(seedHint) {
  state.input = readInput();
  state.seedHint = seedHint;
  state.story = buildStory(state.input, state.seedHint);
  renderStory(state.story);
  updateHash(state.input, state.seedHint);
  renderCompare();
  setStatus(`Generated seed ${state.story.seed} (chaos ${state.input.chaos}/10).`);
}

function saveCurrentVariant() {
  if (!state.story || !state.input) {
    setStatus("Generate a scene first.", true);
    return;
  }

  const label = variantLabelInput.value.trim() || state.story.title;
  const entry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
    label,
    savedAt: new Date().toISOString(),
    seedHint: state.seedHint,
    input: state.input,
    story: state.story
  };

  state.vault = [entry, ...state.vault].slice(0, MAX_VAULT_ENTRIES);
  state.selectedVariantId = entry.id;
  saveVault();
  renderSavedList();
  renderCompare();
  setStatus(`Saved variant "${label}".`);
}

function loadSelectedVariant() {
  const selected = currentSelectedVariant();
  if (!selected) {
    setStatus("Select a saved variant first.", true);
    return;
  }

  form.protagonist.value = selected.input.protagonist;
  form.genre.value = selected.input.genre;
  form.setting.value = selected.input.setting;
  form.object.value = selected.input.object;
  form.emotion.value = selected.input.emotion;
  form.chaos.value = String(selected.input.chaos);
  generate(selected.seedHint);
  setStatus(`Loaded variant "${selected.label}".`);
}

function deleteSelectedVariant() {
  const selected = currentSelectedVariant();
  if (!selected) {
    setStatus("Select a saved variant first.", true);
    return;
  }

  state.vault = state.vault.filter((entry) => entry.id !== selected.id);
  state.selectedVariantId = state.vault[0]?.id || null;
  saveVault();
  renderSavedList();
  renderCompare();
  setStatus(`Deleted variant "${selected.label}".`);
}

function exportPackJson() {
  if (!state.story) {
    setStatus("Generate a scene first.", true);
    return;
  }

  const pack = buildCreatorPack(state.story, state.seedHint);
  const projectName = sanitizeFileName(state.story.title) || "neon-myth-pack";
  const payload = JSON.stringify(pack, null, 2);
  downloadTextFile(`${projectName}.creator-pack.json`, payload, "application/json");
  setStatus(`Exported creator pack for "${state.story.title}".`);
}

function copyMarkdown() {
  if (!state.story) {
    setStatus("Nothing to copy yet.", true);
    return;
  }

  navigator.clipboard
    .writeText(state.story.markdown)
    .then(() => setStatus("Markdown copied."))
    .catch(() => setStatus("Clipboard is blocked in this browser.", true));
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generate(Date.now().toString());
});

remixButton.addEventListener("click", () => {
  if (!state.input) {
    setStatus("Generate once before remix.", true);
    return;
  }
  generate(`${Date.now()}-${Math.random().toString(16).slice(2, 7)}`);
});

copyButton.addEventListener("click", copyMarkdown);
saveVariantButton.addEventListener("click", saveCurrentVariant);
exportPackButton.addEventListener("click", exportPackJson);
loadSelectedButton.addEventListener("click", loadSelectedVariant);
deleteSelectedButton.addEventListener("click", deleteSelectedVariant);
chaosInput.addEventListener("input", syncChaosValue);

loadVault();
if (state.vault.length > 0) state.selectedVariantId = state.vault[0].id;
renderSavedList();
syncChaosValue();

if (hydrateFormFromHash()) {
  generate(state.seedHint);
} else {
  generate(Date.now().toString());
}
