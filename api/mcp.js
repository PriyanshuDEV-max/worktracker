import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

const server = new Server({
  name: "momentum-pro-mcp",
  version: "1.0.0"
}, {
  capabilities: { tools: {} }
});

server.setRequestHandler(async (request) => {
  if (request.method !== "tools/list") return { error: "Unknown method" };
  return {
    tools: [
      { name: "get_today_status", description: "Fetch today's tasks and overall completion metric.", inputSchema: { type: "object" } },
      { name: "get_history", description: "Get a timeline of completed habits and notes.", inputSchema: { type: "object" } },
      { name: "get_streaks_and_badges", description: "See current tracking streaks and unlocked achievements.", inputSchema: { type: "object" } }
    ]
  };
});

server.setRequestHandler(async (request) => {
  if (request.method !== "tools/call") return { error: "Unknown method" };
  
  const store = getStore("momentum_pro_state");
  const appState: any = await store.get("user_data", { type: "json" }) || {};
  const { name } = request.params;

  switch (name) {
    case "get_today_status":
      return { content: [{ type: "text", text: JSON.stringify({ tasks: appState.tasks || [], progress: appState.lastActiveDate }) }] };
    case "get_history":
      return { content: [{ type: "text", text: JSON.stringify(appState.history || []) }] };
    case "get_streaks_and_badges":
      return { content: [{ type: "text", text: JSON.stringify({ badges: appState.badges || [], streaks: appState.settings?.streaks || 0 }) }] };
    default:
      throw new Error(`Tool not found: ${name}`);
  }
});

export default async (req: Request, context: Context) => {
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.MOMENTUM_SHARED_SECRET}`) {
    return new Response(JSON.stringify({ error: "Unauthorized MCP access" }), { status: 401 });
  }

  if (req.method === "POST") {
    const jsonRequest = await req.json();
    const jsonResponse = await server.handleRequest(jsonRequest);
    return new Response(JSON.stringify(jsonResponse), {
      headers: { "Content-Type": "application/json" }
    });
  }
  return new Response("MCP Endpoint Live", { status: 200 });
};
