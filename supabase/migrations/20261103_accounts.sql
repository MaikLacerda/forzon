-- Execute no SQL Editor do SEU projeto Supabase antes de publicar.
create table if not exists public.user_app_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.user_app_data enable row level security;
revoke all on public.user_app_data from anon;
grant select, insert, update, delete on public.user_app_data to authenticated;
drop policy if exists own_account_data on public.user_app_data;
create policy own_account_data on public.user_app_data for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Optimistic locking prevents one device silently overwriting another.
create or replace function public.save_user_app_data(payload jsonb, expected_revision bigint)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare next_revision bigint;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if expected_revision = 0 then
    insert into public.user_app_data(user_id, data, revision)
      values(auth.uid(), payload, 1) on conflict (user_id) do nothing
      returning revision into next_revision;
  else
    update public.user_app_data set data = payload, revision = revision + 1, updated_at = now()
      where user_id = auth.uid() and revision = expected_revision
      returning revision into next_revision;
  end if;
  if next_revision is null then raise exception 'revision conflict'; end if;
  return next_revision;
end;
$$;
revoke all on function public.save_user_app_data(jsonb, bigint) from public, anon;
grant execute on function public.save_user_app_data(jsonb, bigint) to authenticated;
