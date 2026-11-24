-- A highlight can be just its title, like the name of a prize.
alter table public.highlights
  alter column description_pt drop not null;
