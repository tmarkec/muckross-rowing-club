import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/lib/supabase-auth";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

export const adminCreateCoach = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string; password: string; fullName: string; role?: "coach" | "admin" }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (error) throw new Error(error.message);
    if (!created.user) throw new Error("User not created");
    const role = data.role ?? "coach";
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role });
    if (roleErr) throw new Error(roleErr.message);
    return { userId: created.user.id };
  });

export const adminDeleteCoach = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    if (data.userId === context.userId) throw new Error("Cannot delete yourself");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListCoaches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data: roles, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role");
    if (error) throw new Error(error.message);
    const ids = [...new Set(roles.map((r) => r.user_id))];
    if (ids.length === 0) return [];
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name")
      .in("id", ids);
    // Fetch auth users for last_sign_in_at. Admin listUsers is paginated; pull
    // enough pages to cover the coach list.
    const authUsers: Array<{ id: string; last_sign_in_at: string | null; created_at: string }> = [];
    let page = 1;
    while (true) {
      const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (listErr) throw new Error(listErr.message);
      for (const u of list.users) {
        authUsers.push({ id: u.id, last_sign_in_at: u.last_sign_in_at ?? null, created_at: u.created_at });
      }
      if (list.users.length < 200) break;
      page += 1;
      if (page > 20) break;
    }
    return ids.map((id) => {
      const p = profiles?.find((x) => x.id === id);
      const userRoles = roles.filter((r) => r.user_id === id).map((r) => r.role);
      const au = authUsers.find((u) => u.id === id);
      return {
        user_id: id,
        email: p?.email ?? null,
        full_name: p?.full_name ?? null,
        roles: userRoles,
        last_sign_in_at: au?.last_sign_in_at ?? null,
        created_at: au?.created_at ?? null,
      };
    });
  });

export const adminResetCoachPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; password: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.password,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });