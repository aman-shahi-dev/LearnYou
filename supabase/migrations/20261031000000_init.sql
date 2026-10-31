-- LearnYou initial schema. Every user-owned table is protected by RLS: user_id = auth.uid().

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------- helpers
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url  text,
  preferences jsonb not null default '{"theme":"dark"}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create a profile when someone signs up via GitHub/Google.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'user_name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- folders
create table public.folders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users on delete cascade,
  parent_id  uuid references public.folders on delete cascade,
  name       text not null check (char_length(name) between 1 and 120),
  color      text not null default '#7C5CFF' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  icon       text,
  position   int  not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (parent_id is distinct from id)
);
create index folders_user_parent_idx on public.folders (user_id, parent_id, position);

-- ---------------------------------------------------------------- items
create type public.item_type as enum ('pdf','doc','file','link','youtube_video','note','video');

create table public.items (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users on delete cascade,
  folder_id        uuid references public.folders on delete set null,
  type             public.item_type not null,
  title            text not null check (char_length(title) between 1 and 500),
  description      text,
  source_url       text,
  storage_key      text,            -- R2 object key for uploaded files
  mime             text,
  size_bytes       bigint check (size_bytes >= 0),
  thumbnail_url    text,
  duration_seconds int check (duration_seconds >= 0),
  metadata         jsonb not null default '{}'::jsonb, -- e.g. {"youtube_id": "...", "channel": "..."}
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  last_opened_at   timestamptz,
  search           tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'B')
  ) stored
);
create index items_user_folder_idx  on public.items (user_id, folder_id, created_at desc);
create index items_user_created_idx on public.items (user_id, created_at desc);
create index items_user_type_idx    on public.items (user_id, type);
create index items_search_idx       on public.items using gin (search);
create index items_title_trgm_idx   on public.items using gin (title gin_trgm_ops);
-- Prevent saving the same YouTube video twice per user.
create unique index items_user_youtube_uniq on public.items (user_id, (metadata->>'youtube_id'))
  where type = 'youtube_video';

-- ---------------------------------------------------------------- tags
create table public.tags (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name    text not null check (char_length(name) between 1 and 40),
  color   text not null default '#5B8CFF',
  unique (user_id, name)
);

create table public.item_tags (
  item_id uuid not null references public.items on delete cascade,
  tag_id  uuid not null references public.tags on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  primary key (item_id, tag_id)
);

-- ---------------------------------------------------------------- YouTube playlists
create table public.playlists (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users on delete cascade,
  yt_playlist_id text not null,
  folder_id      uuid references public.folders on delete set null,
  title          text not null,
  thumbnail_url  text,
  channel_title  text,
  imported_at    timestamptz not null default now(),
  unique (user_id, yt_playlist_id)
);

create table public.playlist_items (
  playlist_id uuid not null references public.playlists on delete cascade,
  item_id     uuid not null references public.items on delete cascade,
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  position    int  not null,
  primary key (playlist_id, item_id)
);

-- ---------------------------------------------------------------- YouTube channels
create table public.channels (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null default auth.uid() references auth.users on delete cascade,
  yt_channel_id       text not null,
  title               text not null,
  handle              text,
  avatar_url          text,
  uploads_playlist_id text not null,
  last_synced_at      timestamptz,
  created_at          timestamptz not null default now(),
  unique (user_id, yt_channel_id)
);

create table public.channel_videos (
  id               uuid primary key default gen_random_uuid(),
  channel_id       uuid not null references public.channels on delete cascade,
  user_id          uuid not null references auth.users on delete cascade,
  yt_video_id      text not null,
  title            text not null,
  thumbnail_url    text,
  duration_seconds int,
  published_at     timestamptz not null,
  unique (channel_id, yt_video_id)
);
create index channel_videos_feed_idx on public.channel_videos (user_id, published_at desc);

-- ---------------------------------------------------------------- progress (resume across devices)
create table public.progress (
  item_id          uuid not null references public.items on delete cascade,
  user_id          uuid not null default auth.uid() references auth.users on delete cascade,
  position_seconds int,
  page             int,
  completed        boolean not null default false,
  updated_at       timestamptz not null default now(),
  primary key (user_id, item_id)
);

-- ---------------------------------------------------------------- YouTube API cache + quota (server-only)
create table public.yt_search_cache (
  query_hash text primary key,
  response   jsonb not null,
  created_at timestamptz not null default now()
);

create table public.yt_quota (
  day        date primary key default current_date,
  units_used int  not null default 0
);

-- ---------------------------------------------------------------- triggers
create trigger folders_updated_at  before update on public.folders  for each row execute function public.set_updated_at();
create trigger items_updated_at    before update on public.items    for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger progress_updated_at before update on public.progress for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- RLS
alter table public.profiles        enable row level security;
alter table public.folders         enable row level security;
alter table public.items           enable row level security;
alter table public.tags            enable row level security;
alter table public.item_tags       enable row level security;
alter table public.playlists       enable row level security;
alter table public.playlist_items  enable row level security;
alter table public.channels        enable row level security;
alter table public.channel_videos  enable row level security;
alter table public.progress        enable row level security;
alter table public.yt_search_cache enable row level security; -- no policies: service role only
alter table public.yt_quota        enable row level security; -- no policies: service role only

create policy "own profile" on public.profiles
  for all to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

do $$
declare t text;
begin
  foreach t in array array['folders','items','tags','item_tags','playlists','playlist_items','channels','progress'] loop
    execute format(
      'create policy "own rows" on public.%I for all to authenticated
         using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
  end loop;
end $$;

-- Channel feed is written by the sync Edge Function (service role); users can read/delete their own.
create policy "read own feed" on public.channel_videos
  for select to authenticated using (user_id = (select auth.uid()));
create policy "delete own feed" on public.channel_videos
  for delete to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------- search RPC
create or replace function public.search_items(q text, max_results int default 50)
returns setof public.items
language sql stable security invoker set search_path = '' as $$
  select i.*
  from public.items i
  where i.user_id = (select auth.uid())
    and (
      i.search @@ websearch_to_tsquery('simple', q)
      or i.title operator(public.%) q
    )
  order by
    ts_rank(i.search, websearch_to_tsquery('simple', q)) desc,
    public.similarity(i.title, q) desc
  limit least(max_results, 200);
$$;

-- Storage usage for the quota meter.
create or replace function public.storage_used_bytes()
returns bigint language sql stable security invoker set search_path = '' as $$
  select coalesce(sum(size_bytes), 0)::bigint from public.items
  where user_id = (select auth.uid()) and storage_key is not null;
$$;
