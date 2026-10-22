// Creates an Action Tracker user with an initial password.
// Any signed-in member may call it; the service role key never leaves the server.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const EMAIL_DOMAIN = "action-tracker.local"; // usernames sign in as <username>@action-tracker.local
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "Method not allowed" });

  const url = Deno.env.get("SUPABASE_URL")!;
  // Check the caller as themselves, so RLS and is_member() apply
  const caller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: { user } } = await caller.auth.getUser();
  if (!user) return reply(401, { error: "Please sign in again." });
  const { data: member } = await caller.rpc("is_member");
  if (!member) return reply(403, { error: "Only signed-in members can add users." });

  let body: { username?: string; password?: string };
  try { body = await req.json(); } catch { return reply(400, { error: "Invalid request." }); }
  const username = String(body.username ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!/^[a-z0-9._-]{2,30}$/.test(username)) {
    return reply(400, { error: "Username must be 2–30 characters: letters, numbers, dot, dash or underscore." });
  }
  if (password.length < 6) return reply(400, { error: "Initial password must be at least 6 characters." });

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data, error } = await admin.auth.admin.createUser({
    email: `${username}@${EMAIL_DOMAIN}`,
    password,
    email_confirm: true,
    user_metadata: { username },
    // "invited" makes the on_auth_user_created trigger create the profile
    app_metadata: { invited: true, created_by: user.id },
  });
  if (error) {
    const taken = /already|registered|exists/i.test(error.message);
    return reply(taken ? 409 : 400, { error: taken ? `The username "${username}" is already taken.` : error.message });
  }
  return reply(200, { id: data.user.id, username });
});
