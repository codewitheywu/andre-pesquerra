-- =========================================================
-- Local development seed (applied by `supabase db reset`).
-- Mirrors the fallback content in src/data/content.ts.
-- Never run against production.
-- =========================================================

insert into public.technologies (name, sort_order) values
  ('PHP', 1),
  ('PDO', 2),
  ('MySQL', 3),
  ('JavaScript', 4),
  ('HTML', 5),
  ('CSS', 6),
  ('Three.js', 7),
  ('Android', 8),
  ('Next.js', 9),
  ('React', 10),
  ('Tailwind CSS', 11),
  ('Webflow', 12)
on conflict (name) do nothing;

insert into public.projects (title, slug, summary, role, year, featured, published, sort_order) values
  ('Gavina Noble Dental Clinic', 'gavina-noble-dental',
   'Appointment management web application with a Three.js 3D dental chart and an Android companion app.',
   'Full-Stack Developer & Project Leader', 2025, true, true, 1),
  ('Revolution', 'revolution',
   'A persistent browser-based tribal strategy game.',
   'Solo PBBG Developer', null, true, true, 2),
  ('MAC Performance', 'mac-performance',
   'A Next.js website for an automotive shop.',
   'Web Developer', 2026, true, true, 3),
  ('BeBold Recovery', 'bebold-recovery',
   'A website built with Webflow.',
   'Webflow Developer', null, true, true, 4)
on conflict (slug) do nothing;

insert into public.project_technologies (project_id, technology_id)
select p.id, t.id
from (values
  ('gavina-noble-dental', 'PHP'),
  ('gavina-noble-dental', 'PDO'),
  ('gavina-noble-dental', 'MySQL'),
  ('gavina-noble-dental', 'JavaScript'),
  ('gavina-noble-dental', 'Three.js'),
  ('gavina-noble-dental', 'Android'),
  ('revolution', 'PHP'),
  ('revolution', 'MySQL'),
  ('revolution', 'JavaScript'),
  ('revolution', 'HTML'),
  ('revolution', 'CSS'),
  ('mac-performance', 'Next.js'),
  ('mac-performance', 'React'),
  ('mac-performance', 'JavaScript'),
  ('mac-performance', 'Tailwind CSS'),
  ('bebold-recovery', 'Webflow')
) as link(project_slug, technology_name)
join public.projects p on p.slug = link.project_slug
join public.technologies t on t.name = link.technology_name
on conflict do nothing;

-- TODO: experience and education rows need real start/end dates
-- (the UI derives the period label from them). Add them once known.
