create table if not exists public.training_presets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'General',
  body text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.training_presets to authenticated;
grant all on public.training_presets to service_role;

alter table public.training_presets enable row level security;

create policy "Authenticated can read presets" on public.training_presets for select to authenticated using (true);
create policy "Admins can insert presets" on public.training_presets for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update presets" on public.training_presets for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete presets" on public.training_presets for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create trigger training_presets_set_updated_at before update on public.training_presets for each row execute function public.set_updated_at();

insert into public.training_presets (title, category, body, sort_order) values
  ('UT2 Steady State 60', 'Endurance', E'60 min UT2 @ r18-20\nFocus: relaxed catch, long drive', 10),
  ('UT1 Aerobic 4x12', 'Endurance', E'4 x 12'' UT1 @ r22 / 3'' rest\nMaintain rhythm and connection', 20),
  ('AT Threshold 3x10', 'Threshold', E'3 x 10'' AT @ r24 / 4'' rest\nControlled, even splits', 30),
  ('TR Race Pace 6x500m', 'Race Prep', E'6 x 500m TR @ r28-30 / 3'' rest\nStart calm, build through piece', 40),
  ('AN Power 8x250m', 'Power', E'8 x 250m AN @ r32+ / 2'' rest\nMax power, clean technique', 50),
  ('Technical Row 75', 'Technique', E'75 min technique row @ r18\nDrills: pause, square blades, ratio', 60),
  ('Erg 5k Test', 'Testing', E'2k WU + 5k test + 2k CD\nLog split, HR, rate', 70),
  ('Strength & Core 45', 'Land', E'45 min gym: squats, deadlift, pull-ups, core circuit', 80),
  ('Day Off', 'Recovery', 'Rest day — sleep, hydrate, mobilise', 90);