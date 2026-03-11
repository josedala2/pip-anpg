import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...body } = await req.json();

    if (action === "list") {
      // Get all profiles with their roles
      const { data: profiles, error: pErr } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });

      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await supabaseAdmin
        .from("user_roles")
        .select("*");

      if (rErr) throw rErr;

      // Get auth users for email
      const { data: { users: authUsers }, error: aErr } = await supabaseAdmin.auth.admin.listUsers();
      if (aErr) throw aErr;

      const merged = (profiles || []).map((p: any) => {
        const authUser = authUsers?.find((u: any) => u.id === p.user_id);
        const userRole = roles?.find((r: any) => r.user_id === p.user_id);
        return {
          ...p,
          email: authUser?.email ?? "—",
          role: userRole?.role ?? null,
          role_id: userRole?.id ?? null,
          last_sign_in: authUser?.last_sign_in_at ?? null,
        };
      });

      return new Response(JSON.stringify({ users: merged }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_role") {
      const { user_id, new_role } = body;
      if (!user_id || !new_role) {
        return new Response(JSON.stringify({ error: "user_id and new_role required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Validate role
      const validRoles = ["admin", "tecnico_dpro", "tecnico_dex", "tecnico_dneg", "tecnico_dec", "conselho"];
      if (!validRoles.includes(new_role)) {
        return new Response(JSON.stringify({ error: "Invalid role" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Delete existing role and insert new one
      await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);
      const { error } = await supabaseAdmin.from("user_roles").insert({
        user_id,
        role: new_role,
      });

      if (error) throw error;

      // Update cargo on profiles too
      const cargoMap: Record<string, string> = {
        admin: "Administrador",
        tecnico_dpro: "Técnico DPRO",
        tecnico_dex: "Técnico DEX",
        tecnico_dneg: "Técnico DNEG",
        tecnico_dec: "Técnico DEC",
        conselho: "Conselho de Adm.",
      };
      await supabaseAdmin.from("profiles").update({ cargo: cargoMap[new_role] }).eq("user_id", user_id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete_user") {
      const { user_id } = body;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Prevent self-deletion
      if (user_id === caller.id) {
        return new Response(JSON.stringify({ error: "Cannot delete yourself" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
