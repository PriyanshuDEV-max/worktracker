import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  const store = getStore("momentum_pro_state");
  const authHeader = req.headers.get("Authorization");
  const token = process.env.MOMENTUM_SHARED_SECRET;

  if (!token || authHeader !== `Bearer ${token}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  if (req.method === "GET") {
    try {
      const data = await store.get("user_data", { type: "json" });
      return new Response(JSON.stringify(data || {}), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Failed to load state" }), { status: 500 });
    }
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      await store.setJSON("user_data", body);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Failed to save state" }), { status: 500 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
};
