-- ============================================================================
-- Terms acceptances
-- ============================================================================

-- Keep a server-side, versioned record of the Terms version shown at
-- authentication. Inserts are performed by trusted server code so clients
-- cannot choose or rewrite the accepted version.
create table public.terms_acceptances (
  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  terms_version text not null
    check (btrim(terms_version) <> ''),

  accepted_at timestamptz not null default now(),
  acceptance_source text not null default 'auth-callback',

  primary key (user_id, terms_version)
);

comment on table public.terms_acceptances is
  'Versioned Terms acceptance records written by trusted server code.';

alter table public.terms_acceptances enable row level security;

-- Do not expose write access to browser roles. The service role used by the
-- server-side acceptance recorder bypasses RLS.
revoke all
on table public.terms_acceptances
from anon, authenticated;

-- Users may inspect their own acceptance history if the product needs to
-- expose it later, but cannot create, update, or delete records from a client.
grant select
on table public.terms_acceptances
to authenticated;

create policy "Users can read their terms acceptances"
on public.terms_acceptances
for select
to authenticated
using (
  user_id = (select auth.uid())
);
