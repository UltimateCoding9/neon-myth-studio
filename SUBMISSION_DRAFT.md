# Agents League Submission Draft (Current `project.yml`)

Use this when creating the issue:
`https://github.com/microsoft/agentsleague/issues/new?template=project.yml`

Replace all placeholders before submitting.

## Track

Creative Apps (GitHub Copilot)

## Project Name

Neon Myth Studio

## GitHub Username

`@UltimateCoding9`

## Repository URL

`https://github.com/UltimateCoding9/neon-myth-studio`

## Project Description (250 words max)

Neon Myth Studio is a creative storytelling app that turns a small prompt into a complete micro-fiction package. Users choose a protagonist, genre, setting, signature object, emotion, and chaos level. The app generates a story hook, a three-beat narrative arc, a contextual dialogue duel, a cinematic poster prompt, a color palette, and an ASCII sigil.

The generator is seed-based, so results are reproducible and shareable. This supports remix workflows and makes demos deterministic for judges. The project includes a browser UI, a CLI mode, a local MCP server for Copilot integration, a Creator Vault (save/load/delete variants in local storage), compare mode, and creator-pack JSON export for reuse in demos or content workflows.

The app was built with GitHub Copilot-assisted workflows for ideation, refactoring, MCP scaffolding, and tests. Copilot usage is documented in `COPILOT_USAGE.md`. Reliability is covered by deterministic unit tests and no external APIs are required, which reduces secret-handling and runtime failure risk.

## Demo Video or Screenshots

- Demo Video: `https://youtu.be/YOUR_VIDEO_ID`
- Demo Video (GitHub file fallback): `https://github.com/UltimateCoding9/neon-myth-studio/blob/main/docs/demo/neon-myth-demo.mp4`
- Screenshots: `https://github.com/UltimateCoding9/neon-myth-studio/tree/main/docs/screenshots`
- Live Demo (optional): `https://YOUR_DEMO_URL`

## Primary Programming Language

TypeScript/JavaScript

## Key Technologies Used

- Node.js (local server, CLI, tests)
- Vanilla JavaScript (UI + generation engine)
- HTML/CSS (responsive UI)
- Playwright (automated demo recording)
- MCP (Model Context Protocol) local stdio server
- GitHub Copilot (development assistant)

## Submission Type

Individual

## Team Members

N/A

## Submission Requirements (checkboxes in GitHub issue)

- [x] My project meets the track-specific challenge requirements
- [x] My repository includes a comprehensive README.md with setup instructions
- [x] My code does not contain hardcoded API keys or secrets
- [ ] I have included demo materials (video or screenshots) with public links
- [x] My project is my own work with proper attribution for any third-party code
- [x] I agree to the Code of Conduct
- [x] I have read and agree to the Disclaimer
- [x] My submission does NOT contain any confidential, proprietary, or sensitive information
- [x] I confirm I have the rights to submit this content and grant the necessary licenses

## Quick Setup Summary

1. Clone the repo.
2. Install dependencies: `npm install`
3. Start the app: `npm start`
4. Open `http://localhost:3000`
5. (Optional) Run tests: `npm test`
6. (Optional) Run CLI: `npm run cli -- --help`
7. (Optional) Run MCP server: `npm run mcp`

## Technical Highlights

- Deterministic seeded generator for reproducible creative outputs
- Multi-surface experience: Web UI + CLI + MCP server for Copilot
- Creator Vault for local variant save/load/delete/compare workflows
- Creator Pack JSON export for downstream content/demo pipelines
- Automated demo video generation with Playwright (`npm run demo:video`)
- Unit tests covering determinism, normalization, and export payload shape

## Challenges & Learnings

- Balancing creativity with reproducibility led to a seed-first generation design.
- Template-based dialogue initially felt generic, so the dialogue engine was refactored to include genre style, emotion, setting, object, and chaos context.
- MCP integration improved project relevance for this track and required careful tool schema design.

## Contact Information (optional)

`YOUR_EMAIL_OR_LINKEDIN`

## Country/Region (required for prize eligibility verification)

`Switzerland`

## Final Pre-Submit Notes (not part of the issue form)

- Make sure the repo is public before submitting.
- Upload the demo video (`docs/demo/neon-myth-demo.mp4`) and replace `YOUR_VIDEO_ID`.
- Add real screenshots to `docs/screenshots/` and commit them.
- Confirm you registered for Agents League.
