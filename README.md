# Neon Myth Studio

A complete submission-ready creative app for the Agents League **Creative Apps** track.

Neon Myth Studio generates:
- a story hook
- a three-beat arc
- a dialogue duel
- a poster prompt
- a color palette
- an ASCII sigil
- a creator pack (JSON export with social copy + checklist)
- local vault storage for saved variants
- compare mode between current and saved variants
- MCP tools for Copilot integration

All outputs are seeded, so users can share and reproduce results.

Project tag line:
- **"Forge a story. Render its mood. Ship the myth."**

## Why this fits the challenge

- **Creative application**: blends narrative generation, visual identity, and remix mechanics.
- **AI-assisted workflow fit**: includes a concrete `COPILOT_USAGE.md` log to document Copilot involvement.
- **Demo-friendly UX**: one-page app with direct controls and instant output.
- **Reliability**: deterministic generator + unit tests.

## Quick Start

Requirements:
- Node.js 18+

Run:

```bash
npm install
npm start
```

Open:

`http://localhost:3000`

## Scripts

- `npm start` - run local static server
- `npm run dev` - run server in watch mode
- `npm test` - run generator tests
- `npm run cli -- --help` - run CLI version for terminal demos
- `npm run mcp` - run local MCP server (stdio)
- `npm run demo:video` - auto-record a demo video to `docs/demo`

## Project Structure

- `server.js` - local HTTP server for static files
- `bin/neon-myth-cli.js` - CLI generator for terminal-first demos
- `mcp/server.js` - MCP server with story and creator-pack tools
- `.vscode/mcp.json` - MCP config for VS Code workspace
- `scripts/record-demo.mjs` - automated demo recorder (Playwright)
- `public/index.html` - UI layout
- `public/styles.css` - visual design and animation
- `public/app.js` - browser interactions (generate/remix/save/compare/export)
- `public/generator.js` - seeded creative generation engine + creator pack builder
- `tests/generator.test.js` - deterministic tests for core logic
- `COPILOT_USAGE.md` - documentation of Copilot usage process
- `SUBMISSION_DRAFT.md` - draft text for GitHub issue submission
- `docs/demo/` - generated demo video + export sample

## Demo Flow

1. Enter protagonist, genre, setting, object, and emotion.
2. Set chaos level.
3. Click **Generate Scene**.
4. Click **Remix** for a fresh seeded variant.
5. Click **Copy Markdown** to export the result.
6. Click **Save Variant** to store a version in Creator Vault.
7. Select any saved version and use **Load Selected** or **Delete Selected**.
8. Use **Export Pack JSON** to produce a creator-ready package.

## CLI Demo Flow

```bash
npm run cli -- --protagonist "Kaia Flux" --genre surreal --setting "mirror station" --object "opal compass" --emotion awe --chaos 8 --seed demo-night
```

This prints a complete markdown story package directly in terminal.

## MCP Demo Flow

1. Start MCP server:

```bash
npm run mcp
```

2. Configure VS Code/Copilot to use `.vscode/mcp.json` or copy the same config into your global MCP setup.
3. In Copilot chat, call Neon Myth tools such as `generate_story` or `build_creator_pack`.

Available MCP tools:
- `generate_story`
- `remix_story`
- `build_creator_pack`
- `list_pack_fields`

## Demo Video

Generate a ready-to-upload demo video:

```bash
npm run demo:video
```

This produces:
- `docs/demo/neon-myth-demo.webm`
- `docs/demo/neon-myth-demo.mp4`
- `docs/demo/creator-pack-sample.json`

## Rubric Mapping

- **Accuracy & Relevance (20%)**: fulfills creative-app requirement with web, CLI, and MCP surfaces.
- **Reasoning & Multi-step Thinking (20%)**: generation pipeline combines normalization, seeded RNG, narrative structuring, visual style synthesis, and creator-pack export.
- **Creativity & Originality (15%)**: blends story engine, dialogue duel, poster prompting, palette synthesis, sigil generation, and remix comparison.
- **User Experience & Presentation (15%)**: strong visual style with responsive UX, Creator Vault, and compare tools.
- **Reliability & Safety (20%)**: deterministic tests, no external API requirement, no credentials in source.

## Submission Checklist

- Add a short demo video (60-120 seconds).
- Open a submission issue with content from `SUBMISSION_DRAFT.md`.
- Keep `COPILOT_USAGE.md` in repo.
- Confirm no credentials in git history.
- Add 3-5 screenshots in a `docs/` folder.

## Security Notes

- No secrets are required.
- Keep `.env` and other sensitive files out of commits (already in `.gitignore`).
- Use only demo/sample data.
