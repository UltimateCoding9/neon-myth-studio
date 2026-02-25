import { buildCreatorPack, buildStory, normalizeInput } from "../public/generator.js";

const SERVER_INFO = {
  name: "neon-myth-mcp",
  version: "1.0.0"
};

const TOOL_DEFS = [
  {
    name: "generate_story",
    description:
      "Generate a deterministic Neon Myth story package with hook, beats, dialogue, palette, sigil, and markdown.",
    inputSchema: {
      type: "object",
      properties: {
        protagonist: { type: "string", description: "Main character name" },
        genre: {
          type: "string",
          enum: ["fantasy", "scifi", "noir", "cozy", "surreal"],
          description: "Story genre"
        },
        setting: { type: "string", description: "Story location" },
        object: { type: "string", description: "Signature object" },
        emotion: { type: "string", description: "Core emotional tone" },
        chaos: { type: "integer", minimum: 1, maximum: 10, description: "Chaos level 1..10" },
        seed: { type: "string", description: "Optional deterministic seed hint" }
      }
    }
  },
  {
    name: "remix_story",
    description:
      "Create a remix variant from the same input and a base seed, producing a new variant seed and output.",
    inputSchema: {
      type: "object",
      properties: {
        protagonist: { type: "string" },
        genre: { type: "string", enum: ["fantasy", "scifi", "noir", "cozy", "surreal"] },
        setting: { type: "string" },
        object: { type: "string" },
        emotion: { type: "string" },
        chaos: { type: "integer", minimum: 1, maximum: 10 },
        baseSeed: { type: "string", description: "Existing seed hint from a prior generation" },
        remixTag: { type: "string", description: "Optional remix label" }
      }
    }
  },
  {
    name: "build_creator_pack",
    description:
      "Build an export-ready creator pack with markdown, social post copy, and a production checklist.",
    inputSchema: {
      type: "object",
      properties: {
        protagonist: { type: "string" },
        genre: { type: "string", enum: ["fantasy", "scifi", "noir", "cozy", "surreal"] },
        setting: { type: "string" },
        object: { type: "string" },
        emotion: { type: "string" },
        chaos: { type: "integer", minimum: 1, maximum: 10 },
        seed: { type: "string" }
      }
    }
  },
  {
    name: "list_pack_fields",
    description: "List and describe all fields included in a Neon Myth creator pack.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];

function json(value) {
  return JSON.stringify(value, null, 2);
}

function nowSeed() {
  return Date.now().toString();
}

function withDefaults(input) {
  return normalizeInput(input || {});
}

function runTool(name, args = {}) {
  const input = withDefaults(args);

  if (name === "generate_story") {
    const seedHint = String(args.seed || nowSeed());
    const story = buildStory(input, seedHint);
    return {
      story,
      seedHint
    };
  }

  if (name === "remix_story") {
    const baseSeed = String(args.baseSeed || nowSeed());
    const remixTag = String(args.remixTag || Math.random().toString(16).slice(2, 8));
    const seedHint = `${baseSeed}|${remixTag}`;
    const story = buildStory(input, seedHint);
    return {
      story,
      seedHint,
      baseSeed,
      remixTag
    };
  }

  if (name === "build_creator_pack") {
    const seedHint = String(args.seed || nowSeed());
    const story = buildStory(input, seedHint);
    return {
      pack: buildCreatorPack(story, seedHint)
    };
  }

  if (name === "list_pack_fields") {
    return {
      fields: [
        "id",
        "seedHint",
        "generatedAt",
        "input",
        "title",
        "hook",
        "beats",
        "dialogue",
        "posterPrompt",
        "palette",
        "sigil",
        "markdown",
        "socialPost",
        "productionChecklist"
      ]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}

function toToolResponse(payload, heading) {
  return {
    content: [
      {
        type: "text",
        text: `${heading}\n\n${json(payload)}`
      }
    ],
    structuredContent: payload
  };
}

function ok(id, result) {
  writeMessage({
    jsonrpc: "2.0",
    id,
    result
  });
}

function fail(id, code, message) {
  writeMessage({
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message
    }
  });
}

function handleRpc(msg) {
  const { id, method, params } = msg;

  if (method === "initialize") {
    ok(id, {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {}
      },
      serverInfo: SERVER_INFO
    });
    return;
  }

  if (method === "notifications/initialized") {
    return;
  }

  if (method === "tools/list") {
    ok(id, {
      tools: TOOL_DEFS
    });
    return;
  }

  if (method === "tools/call") {
    try {
      const toolName = params?.name;
      const args = params?.arguments || {};
      const result = runTool(toolName, args);
      ok(id, toToolResponse(result, `Tool: ${toolName}`));
    } catch (error) {
      fail(id, -32602, error.message || "Tool execution failed");
    }
    return;
  }

  fail(id, -32601, `Method not found: ${method}`);
}

let buffered = Buffer.alloc(0);

function writeMessage(payload) {
  const body = Buffer.from(JSON.stringify(payload), "utf8");
  const header = Buffer.from(`Content-Length: ${body.length}\r\n\r\n`, "utf8");
  process.stdout.write(Buffer.concat([header, body]));
}

function readMessages(chunk) {
  buffered = Buffer.concat([buffered, chunk]);

  while (true) {
    const headerEnd = buffered.indexOf("\r\n\r\n");
    if (headerEnd === -1) return;

    const header = buffered.slice(0, headerEnd).toString("utf8");
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match) {
      buffered = Buffer.alloc(0);
      return;
    }

    const contentLength = Number.parseInt(match[1], 10);
    const bodyStart = headerEnd + 4;
    const bodyEnd = bodyStart + contentLength;
    if (buffered.length < bodyEnd) return;

    const body = buffered.slice(bodyStart, bodyEnd).toString("utf8");
    buffered = buffered.slice(bodyEnd);

    try {
      const parsed = JSON.parse(body);
      handleRpc(parsed);
    } catch (error) {
      fail(null, -32700, error.message || "Parse error");
    }
  }
}

process.stdin.on("data", readMessages);
process.stdin.on("error", (err) => {
  process.stderr.write(`stdin error: ${err.message}\n`);
});
process.on("uncaughtException", (err) => {
  process.stderr.write(`uncaught exception: ${err.message}\n`);
});
