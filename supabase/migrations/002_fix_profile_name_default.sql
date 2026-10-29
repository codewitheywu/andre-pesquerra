-- =========================================================
-- Correct the misspelled default profile name from 001.
-- =========================================================

alter table public.profile
  alter column full_name set default 'Andre V. Pesquerra';

update public.profile
set full_name = 'Andre V. Pesquerra',
    updated_at = now()
where full_name = 'Andre Pequerra';
