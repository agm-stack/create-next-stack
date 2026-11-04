-- ============================================================================
-- User preferences
-- ============================================================================

-- Generic per-user key/value settings (for example, the preferred theme).
-- Keys and value shapes are validated by the server's preference registry
-- (src/features/account/types.ts); writes are performed by trusted server
-- code only.
create table public.user_preferences (
  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  key text not null
    check (key ~ '^[a-z][A-Za-z0-9]{0,63}$'),

  value jsonb not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (user_id, key)
);

comment on table public.user_preferences is
  'Per-user key/value preferences written by trusted server code.';


create or replace function public.handle_user_preferences_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


create trigger user_preferences_updated_at
before update on public.user_preferences
for each row
execute function public.handle_user_preferences_updated_at();


-- This function exists only for the trigger and should not be callable through
-- the Data API by application roles.
revoke execute
on function public.handle_user_preferences_updated_at()
from public, anon, authenticated;


alter table public.user_preferences enable row level security;

-- Do not expose write access to browser roles. The service role used by the
-- server-side preference repository bypasses RLS.
revoke all
on table public.user_preferences
from anon, authenticated;

grant select
on table public.user_preferences
to authenticated;

create policy "Users can read their preferences"
on public.user_preferences
for select
to authenticated
using (
  user_id = (select auth.uid())
);
