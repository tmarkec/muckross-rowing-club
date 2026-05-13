
-- Enums
create type public.app_role as enum ('admin', 'coach', 'athlete');
create type public.attendance_status as enum ('present', 'absent', 'late', 'excused');

-- ============== Tables ==============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.groups enable row level security;

create table public.group_coaches (
  group_id uuid not null references public.groups(id) on delete cascade,
  coach_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, coach_user_id)
);
alter table public.group_coaches enable row level security;

create table public.athletes (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  dob date,
  erg_2k_seconds numeric(6,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.athletes enable row level security;
create index athletes_group_id_idx on public.athletes(group_id);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  session_date date not null,
  status public.attendance_status not null,
  notes text,
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (athlete_id, session_date)
);
alter table public.attendance enable row level security;
create index attendance_athlete_idx on public.attendance(athlete_id);
create index attendance_date_idx on public.attendance(session_date);

-- ============== Helper functions ==============
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

create or replace function public.is_coach_of_group(_user_id uuid, _group_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.group_coaches where coach_user_id = _user_id and group_id = _group_id);
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger groups_updated_at before update on public.groups for each row execute function public.set_updated_at();
create trigger athletes_updated_at before update on public.athletes for each row execute function public.set_updated_at();
create trigger attendance_updated_at before update on public.attendance for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============== RLS Policies ==============

-- profiles
create policy "profiles_select_authenticated" on public.profiles for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_admin_update" on public.profiles for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- user_roles
create policy "user_roles_select" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "user_roles_admin_insert" on public.user_roles for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
create policy "user_roles_admin_delete" on public.user_roles for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- groups
create policy "groups_select" on public.groups for select to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.is_coach_of_group(auth.uid(), id));
create policy "groups_admin_insert" on public.groups for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
create policy "groups_admin_update" on public.groups for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "groups_admin_delete" on public.groups for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- group_coaches
create policy "group_coaches_select" on public.group_coaches for select to authenticated
  using (public.has_role(auth.uid(), 'admin') or coach_user_id = auth.uid());
create policy "group_coaches_admin_insert" on public.group_coaches for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
create policy "group_coaches_admin_delete" on public.group_coaches for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- athletes
create policy "athletes_select" on public.athletes for select to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.is_coach_of_group(auth.uid(), group_id));
create policy "athletes_insert" on public.athletes for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin') or public.is_coach_of_group(auth.uid(), group_id));
create policy "athletes_update" on public.athletes for update to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.is_coach_of_group(auth.uid(), group_id))
  with check (public.has_role(auth.uid(), 'admin') or public.is_coach_of_group(auth.uid(), group_id));
create policy "athletes_delete" on public.athletes for delete to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.is_coach_of_group(auth.uid(), group_id));

-- attendance
create policy "attendance_select" on public.attendance for select to authenticated
  using (
    public.has_role(auth.uid(), 'admin') or exists (
      select 1 from public.athletes a where a.id = athlete_id and public.is_coach_of_group(auth.uid(), a.group_id)
    )
  );
create policy "attendance_insert" on public.attendance for insert to authenticated
  with check (
    public.has_role(auth.uid(), 'admin') or exists (
      select 1 from public.athletes a where a.id = athlete_id and public.is_coach_of_group(auth.uid(), a.group_id)
    )
  );
create policy "attendance_update" on public.attendance for update to authenticated
  using (
    public.has_role(auth.uid(), 'admin') or exists (
      select 1 from public.athletes a where a.id = athlete_id and public.is_coach_of_group(auth.uid(), a.group_id)
    )
  )
  with check (
    public.has_role(auth.uid(), 'admin') or exists (
      select 1 from public.athletes a where a.id = athlete_id and public.is_coach_of_group(auth.uid(), a.group_id)
    )
  );
create policy "attendance_delete" on public.attendance for delete to authenticated
  using (
    public.has_role(auth.uid(), 'admin') or exists (
      select 1 from public.athletes a where a.id = athlete_id and public.is_coach_of_group(auth.uid(), a.group_id)
    )
  );
