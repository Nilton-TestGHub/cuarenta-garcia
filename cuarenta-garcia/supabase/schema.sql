create extension if not exists "pgcrypto";

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  player_name text unique not null,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists seasons (
  id uuid primary key default gen_random_uuid(),
  seq int not null,
  is_current boolean not null default false,
  started_at timestamptz default now(),
  ended_at timestamptz
);

create table if not exists partnerships (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade,
  player_a text not null,
  player_b text not null,
  unique(season_id, player_a, player_b)
);

create table if not exists tables (
  id uuid primary key default gen_random_uuid(),
  mode text check (mode in ('solo','parejas')) not null default 'solo',
  status text not null default 'open',
  created_at timestamptz default now()
);

create table if not exists table_players (
  table_id uuid references tables(id) on delete cascade,
  player_name text not null,
  seat int,
  primary key (table_id, player_name)
);

create table if not exists game_states (
  table_id uuid primary key references tables(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  table_id uuid references tables(id) on delete set null,
  season_seq int not null,
  mode text not null,
  side_winner text check (side_winner in ('A','B')),
  points_a int not null,
  points_b int not null,
  created_at timestamptz default now()
);

alter table players enable row level security;
alter table tables enable row level security;
alter table table_players enable row level security;
alter table game_states enable row level security;
alter table seasons enable row level security;
alter table partnerships enable row level security;
alter table games enable row level security;

create policy "read_all" on players for select using (true);
create policy "read_all" on tables for select using (true);
create policy "read_all" on table_players for select using (true);
create policy "read_all" on game_states for select using (true);
create policy "read_all" on seasons for select using (true);
create policy "read_all" on partnerships for select using (true);
create policy "read_all" on games for select using (true);

create policy "write_all" on tables for insert with check (true);
create policy "write_all" on table_players for insert with check (true);
create policy "write_all" on game_states for insert with check (true);
create policy "write_all_upd" on game_states for update using (true) with check (true);
create policy "write_all_upd" on tables for update using (true) with check (true);
create policy "write_all_upd" on table_players for update using (true) with check (true);
create policy "write_all" on games for insert with check (true);

insert into players (player_name) values
  ('Ilona'),('Nilton'),('Maria'),('Emilio'),('Andres'),('Michael'),('Amanda')
on conflict do nothing;

insert into seasons (seq, is_current) values (1, true) on conflict do nothing;

insert into partnerships (season_id, player_a, player_b)
select s.id, 'Andres','Emilio' from seasons s where s.seq=1;
insert into partnerships (season_id, player_a, player_b)
select s.id, 'Nilton','Amanda' from seasons s where s.seq=1;
insert into partnerships (season_id, player_a, player_b)
select s.id, 'Maria','Ilona' from seasons s where s.seq=1;
