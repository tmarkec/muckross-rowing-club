
-- Lock down search_path on the trigger function
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

-- Revoke broad EXECUTE on security-definer helpers; only authenticated users may call
revoke all on function public.has_role(uuid, public.app_role) from public, anon;
revoke all on function public.is_coach_of_group(uuid, uuid) from public, anon;
revoke all on function public.handle_new_user() from public, anon, authenticated;

grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.is_coach_of_group(uuid, uuid) to authenticated;
