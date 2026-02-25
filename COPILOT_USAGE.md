# Copilot Usage Log

This file is included to satisfy the **GitHub Copilot usage documentation** requirement.

## Session Log (Concrete Examples)

Date reference: February 21, 2026

1. Prompt: `Create a deterministic JavaScript seeded random generator suitable for creative text generation.`
   - Copilot help: proposed compact RNG pattern and deterministic hashing approach.
   - Human decision: selected reproducible seed behavior and integrated with genre templates.

2. Prompt: `Draft multiple narrative templates for a three-beat story arc in five genres.`
   - Copilot help: generated starter wording variants for hooks, twists, and dialogue punches.
   - Human decision: curated tone and removed weak/generic lines.

3. Prompt: `Build a browser UX for generate/remix/save/compare/export without frameworks.`
   - Copilot help: scaffolded event handlers and localStorage persistence patterns.
   - Human decision: designed final Creator Vault interactions and compare semantics.

4. Prompt: `Create a local MCP server with tools/list and tools/call for story generation.`
   - Copilot help: provided JSON-RPC structure and tool schema scaffolding.
   - Human decision: finalized tool contracts (`generate_story`, `remix_story`, `build_creator_pack`, `list_pack_fields`).

5. Prompt: `Write node:test coverage for deterministic generation and creator pack output shape.`
   - Copilot help: test case skeletons and assertions.
   - Human decision: selected final test inputs and acceptance checks.

## What Copilot accelerates

- Rapid exploration of narrative templates.
- UI wiring and event handling boilerplate.
- MCP server scaffolding and schema drafting.
- Test scaffolding and edge-case suggestions.
- Refactoring repetitive helper logic.

## Human decisions

- Final product concept and scope.
- Visual direction (palette, typography, structure).
- Prompt and UX strategy (generate/remix/save/compare/export flow).
- MCP tool boundaries and creator-pack format.
- Safety and submission framing for the challenge.
