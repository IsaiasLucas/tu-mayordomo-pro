// Link old user data to the current auth user based on email
// Re-associates public.profiles.user_id (and usuarios.user_id by phone) using service role

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return new Response(
      JSON.stringify({ error: "Missing Supabase environment variables" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  // Client bound to the caller's JWT (to read the current user)
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  // Admin client with service role (to bypass RLS and fix associations)
  const admin = createClient(supabaseUrl, serviceKey);

  try {
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }

    const uid = userRes.user.id;
    const email = userRes.user.email ?? "";

    if (!email) {
      return new Response(JSON.stringify({ error: "User email not found" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // Find an existing profile by email
    const { data: profiles, error: profErr } = await admin
      .from("profiles")
      .select("id, user_id, phone_personal, phone_empresa, email")
      .eq("email", email)
      .limit(1);

    if (profErr) {
      return new Response(JSON.stringify({ error: profErr.message }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    let updated = false;
    let linkedPhones: string[] = [];

    if (profiles && profiles.length > 0) {
      const p = profiles[0];
      linkedPhones = [p.phone_personal, p.phone_empresa].filter(
        (v): v is string => Boolean(v)
      );

      if (p.user_id !== uid) {
        const { error: updErr } = await admin
          .from("profiles")
          .update({ user_id: uid })
          .eq("id", p.id);
        if (updErr) {
          return new Response(JSON.stringify({ error: updErr.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
        updated = true;
      }

      // Link usuarios rows by phone(s)
      if (linkedPhones.length > 0) {
        const { error: userLinkErr } = await admin
          .from("usuarios")
          .update({ user_id: uid })
          .in("telefono", linkedPhones);
        if (userLinkErr) {
          // Not fatal for the whole operation; log and continue
          console.log("usuarios link warning:", userLinkErr.message);
        }
      }
    }

    return new Response(
      JSON.stringify({ status: "ok", updated, phones: linkedPhones }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (e) {
    console.error("link-user-data error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
});
