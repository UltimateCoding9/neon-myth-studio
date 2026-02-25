# Neon Myth MCP Server

This MCP server exposes Neon Myth Studio tools to GitHub Copilot-compatible MCP clients.

## Run

```bash
npm run mcp
```

## Tools

- `generate_story`
- `remix_story`
- `build_creator_pack`
- `list_pack_fields`

## VS Code MCP Config Example

Add this to your MCP configuration file:

```json
{
  "servers": {
    "neon-myth": {
      "type": "stdio",
      "command": "node",
      "args": ["./mcp/server.js"]
    }
  }
}
```
