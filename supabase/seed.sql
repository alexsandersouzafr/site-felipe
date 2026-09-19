-- Sample content for local/manual testing: biography, highlights, agenda
-- events, blog posts, photos, videos, press photos, and contact messages.
-- Safe to run more than once — every insert is guarded by a `where not
-- exists` check, so re-running never duplicates rows. (The one `update`, for
-- the sample concerts' ticket links, only fills in links that are missing.)
--
-- Each table gets a handful of realistic, hand-written rows plus enough
-- generated filler rows to comfortably exceed 30, so pagination (15/page
-- in the admin) has something to paginate through. Run via the Supabase
-- SQL Editor, or with scripts/seed-content.sh (psql) from the project root.
--
-- Note: this only seeds text content. Photos, videos, and press photos
-- reference placeholder file paths/URLs that don't point to real
-- uploads — a SQL script can't create Storage objects — so their
-- thumbnails will show as broken/missing until replaced with real
-- uploads through the admin panel. That's fine for testing the list,
-- pagination, and reorder UI.

-- ---------------------------------------------------------------------------
-- Biography (singleton)
-- ---------------------------------------------------------------------------
insert into public.biographies (
  status, publish_at, title_pt, title_en, title_fr,
  content_pt, content_en, content_fr,
  summary_pt, summary_en, summary_fr,
  show_on_page
)
select
  'published', null, 'Biografia', null, null,
  '{"type":"doc","content":[
    {"type":"paragraph","content":[{"type":"text","text":"Felipe Magalhães iniciou seus estudos musicais aos sete anos de idade, formando-se em regência orquestral pela Universidade de São Paulo antes de completar seu mestrado na Hochschule für Musik de Viena."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Ao longo de mais de vinte anos de carreira, já regeu orquestras em mais de trinta países, com destaque para colaborações recorrentes com a Orquestra Sinfônica Municipal e a Filarmônica de Viena."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Hoje, divide seu tempo entre concertos internacionais, gravações e a formação de jovens regentes através de masterclasses ao redor do mundo."}]}
  ]}'::jsonb,
  '{"type":"doc","content":[
    {"type":"paragraph","content":[{"type":"text","text":"Felipe Magalhães began his musical studies at the age of seven, graduating in orchestral conducting from the University of São Paulo before completing his master''s degree at the Hochschule für Musik in Vienna."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Over more than twenty years of career, he has conducted orchestras in more than thirty countries, with recurring collaborations with the Municipal Symphony Orchestra and the Vienna Philharmonic."}]}
  ]}'::jsonb,
  null,
  'Maestro brasileiro radicado entre São Paulo e Viena, com mais de vinte anos de carreira em regência orquestral.',
  'Brazilian conductor based between São Paulo and Vienna, with more than twenty years of orchestral conducting experience.',
  null,
  true
where not exists (select 1 from public.biographies);

-- ---------------------------------------------------------------------------
-- Highlights (shown on the Bio page, up to 10, ordered by display_order)
-- ---------------------------------------------------------------------------
insert into public.highlights (status, publish_at, title_pt, title_en, title_fr, description_pt, description_en, description_fr, display_order, show_on_page)
select 'published', null,
  'Regente titular da Orquestra Sinfônica Municipal', 'Principal conductor of the Municipal Symphony Orchestra', null,
  'Conduz a temporada anual da orquestra desde 2018, com destaque para a integral das sinfonias de Beethoven.',
  'Has led the orchestra''s annual season since 2018, notably conducting the complete Beethoven symphony cycle.', null,
  1, true
where not exists (select 1 from public.highlights where title_pt = 'Regente titular da Orquestra Sinfônica Municipal');

insert into public.highlights (status, publish_at, title_pt, title_en, title_fr, description_pt, description_en, description_fr, display_order, show_on_page)
select 'published', null,
  'Convidado recorrente da Filarmônica de Viena', 'Recurring guest of the Vienna Philharmonic', null,
  'Já regeu mais de quinze concertos com a orquestra, incluindo a abertura do Festival de Salzburgo em 2022.',
  'Has conducted more than fifteen concerts with the orchestra, including the opening of the Salzburg Festival in 2022.', null,
  2, true
where not exists (select 1 from public.highlights where title_pt = 'Convidado recorrente da Filarmônica de Viena');

insert into public.highlights (status, publish_at, title_pt, title_en, title_fr, description_pt, description_en, description_fr, display_order, show_on_page)
select 'published', null,
  'Prêmio Jovem Regente Latino-Americano', null, null,
  'Reconhecido em 2015 pela Associação Latino-Americana de Orquestras pela interpretação de repertório contemporâneo.',
  null, null,
  3, true
where not exists (select 1 from public.highlights where title_pt = 'Prêmio Jovem Regente Latino-Americano');

insert into public.highlights (status, publish_at, title_pt, title_en, title_fr, description_pt, description_en, description_fr, display_order, show_on_page)
select 'published', null,
  'Gravações com três selos internacionais', null, null,
  'Discografia inclui gravações com a Deutsche Grammophon, Naxos e Sony Classical.',
  null, null,
  4, true
where not exists (select 1 from public.highlights where title_pt = 'Gravações com três selos internacionais');

insert into public.highlights (status, publish_at, title_pt, title_en, title_fr, description_pt, description_en, description_fr, display_order, show_on_page)
select 'published', null,
  'Masterclasses em quatro continentes', null, null,
  'Forma jovens regentes através de masterclasses anuais na Europa, Américas, Ásia e Oceania.',
  null, null,
  5, true
where not exists (select 1 from public.highlights where title_pt = 'Masterclasses em quatro continentes');

-- Filler rows (hidden from the Bio page) so the admin table has 30+ items to paginate.
insert into public.highlights (status, publish_at, title_pt, description_pt, display_order, show_on_page)
select 'published', null,
  'Destaque de exemplo #' || s,
  'Texto de exemplo gerado para testar a paginação do admin.',
  100 + s,
  false
from generate_series(1, 30) as s
where not exists (
  select 1 from public.highlights where title_pt = 'Destaque de exemplo #' || s
);

-- ---------------------------------------------------------------------------
-- Agenda (events) — a mix of past, upcoming, and featured concerts, most of
-- the upcoming ones with a ticket link
-- ---------------------------------------------------------------------------
insert into public.events (status, publish_at, title_pt, title_en, title_fr, venue, city, country, time_zone, starts_at, ends_at, ticket_url, is_featured)
select 'published', null,
  'Noite de Beethoven', 'An Evening of Beethoven', null,
  'Sala São Paulo', 'São Paulo', 'Brasil', 'America/Sao_Paulo',
  (now() + interval '14 days')::date + time '20:00', (now() + interval '14 days')::date + time '22:00',
  'https://example.com/ingressos/noite-de-beethoven', true
where not exists (select 1 from public.events where title_pt = 'Noite de Beethoven');

insert into public.events (status, publish_at, title_pt, title_en, title_fr, venue, city, country, time_zone, starts_at, ends_at, ticket_url, is_featured)
select 'published', null,
  'Sinfonia Fantástica', 'Symphonie fantastique', 'Symphonie fantastique',
  'Musikverein', 'Viena', 'Áustria', 'Europe/Vienna',
  (now() + interval '29 days')::date + time '19:30', (now() + interval '29 days')::date + time '21:30',
  'https://example.com/tickets/symphonie-fantastique', true
where not exists (select 1 from public.events where title_pt = 'Sinfonia Fantástica');

insert into public.events (status, publish_at, title_pt, title_en, title_fr, venue, city, country, time_zone, starts_at, ends_at, ticket_url, is_featured)
select 'published', null,
  'Concertos para Piano de Rachmaninoff', null, null,
  'Teatro Municipal', 'Rio de Janeiro', 'Brasil', 'America/Sao_Paulo',
  (now() + interval '46 days')::date + time '20:00', (now() + interval '46 days')::date + time '22:15',
  'https://example.com/ingressos/rachmaninoff', false
where not exists (select 1 from public.events where title_pt = 'Concertos para Piano de Rachmaninoff');

insert into public.events (status, publish_at, title_pt, title_en, title_fr, venue, city, country, time_zone, starts_at, ends_at, ticket_url, is_featured)
select 'published', null,
  'Abertura do Festival de Salzburgo', 'Salzburg Festival Opening', 'Ouverture du Festival de Salzbourg',
  'Felsenreitschule', 'Salzburgo', 'Áustria', 'Europe/Vienna',
  (now() + interval '70 days')::date + time '19:00', (now() + interval '70 days')::date + time '21:00',
  'https://example.com/tickets/salzburg-opening', false
where not exists (select 1 from public.events where title_pt = 'Abertura do Festival de Salzburgo');

insert into public.events (status, publish_at, title_pt, title_en, title_fr, venue, city, country, time_zone, starts_at, ends_at, ticket_url, is_featured)
select 'published', null,
  'Réquiem de Verdi', null, null,
  'Sala São Paulo', 'São Paulo', 'Brasil', 'America/Sao_Paulo',
  (now() - interval '20 days')::date + time '20:00', (now() - interval '20 days')::date + time '21:45',
  null, false
where not exists (select 1 from public.events where title_pt = 'Réquiem de Verdi');

insert into public.events (status, publish_at, title_pt, title_en, title_fr, venue, city, country, time_zone, starts_at, ends_at, ticket_url, is_featured)
select 'published', null,
  'Gala de Ano Novo Vienense', 'Vienna New Year''s Gala', 'Gala viennois du Nouvel An',
  'Konzerthaus', 'Viena', 'Áustria', 'Europe/Vienna',
  (now() - interval '60 days')::date + time '18:00', (now() - interval '60 days')::date + time '20:00',
  null, false
where not exists (select 1 from public.events where title_pt = 'Gala de Ano Novo Vienense');

-- Filler rows spread from ~70 days in the past to ~75 days in the future,
-- so both the upcoming schedule and the past-concerts page have enough to
-- paginate. Two out of three get a ticket link, so the ticket button shows
-- up on most upcoming rows (the third stays without one, as some real
-- concerts are).
insert into public.events (status, publish_at, title_pt, venue, city, country, time_zone, starts_at, ends_at, ticket_url, is_featured)
select 'published', null,
  'Concerto de exemplo #' || s,
  'Sala de Concertos ' || s, 'Cidade ' || s, 'Brasil', 'America/Sao_Paulo',
  (now() + ((s - 15) * interval '5 days'))::date + time '20:00',
  (now() + ((s - 15) * interval '5 days'))::date + time '22:00',
  case when s % 3 <> 0 then 'https://example.com/ingressos/concerto-de-exemplo-' || s end,
  false
from generate_series(1, 30) as s
where not exists (select 1 from public.events where title_pt = 'Concerto de exemplo #' || s);

-- Rows seeded before ticket links existed: fill in the missing ones. Only
-- touches the sample concerts above and never overwrites an existing link.
update public.events as e
set ticket_url = 'https://example.com/ingressos/concerto-de-exemplo-' || n.s
from generate_series(1, 30) as n(s)
where e.title_pt = 'Concerto de exemplo #' || n.s
  and e.ticket_url is null
  and n.s % 3 <> 0;

-- ---------------------------------------------------------------------------
-- Blog posts
-- ---------------------------------------------------------------------------
insert into public.news_items (status, publish_at, slug, title_pt, title_en, title_fr, blocks)
select 'published', null, 'bastidores-da-temporada-2026',
  'Bastidores da temporada 2026', 'Behind the scenes of the 2026 season', null,
  jsonb_build_array(jsonb_build_object(
    'id', gen_random_uuid()::text,
    'type', 'paragraph',
    'title', jsonb_build_object('pt', null, 'en', null, 'fr', null),
    'body', jsonb_build_object(
      'pt', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Os preparativos para a temporada 2026 começaram ainda no ano anterior, com a escolha cuidadosa do repertório e os primeiros ensaios de naipe."}]},{"type":"paragraph","content":[{"type":"text","text":"Nesta publicação, compartilho um pouco do processo de montagem do programa e os desafios de equilibrar obras clássicas com encomendas de compositores contemporâneos."}]}]}'::jsonb,
      'en', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Preparations for the 2026 season began the previous year, with careful repertoire selection and the first sectional rehearsals."}]}]}'::jsonb,
      'fr', null
    )
  ))
where not exists (select 1 from public.news_items where slug = 'bastidores-da-temporada-2026');

insert into public.news_items (status, publish_at, slug, title_pt, title_en, title_fr, blocks)
select 'published', null, 'memorias-de-salzburgo',
  'Memórias de Salzburgo', null, null,
  jsonb_build_array(jsonb_build_object(
    'id', gen_random_uuid()::text,
    'type', 'paragraph',
    'title', jsonb_build_object('pt', null, 'en', null, 'fr', null),
    'body', jsonb_build_object(
      'pt', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Voltar ao Festival de Salzburgo é sempre uma mistura de nostalgia e expectativa. Foi lá que regi minha primeira orquestra europeia, ainda no início da carreira."}]},{"type":"paragraph","content":[{"type":"text","text":"Este ano, a experiência ganhou um novo significado com a abertura oficial do festival sob minha batuta."}]}]}'::jsonb,
      'en', null,
      'fr', null
    )
  ))
where not exists (select 1 from public.news_items where slug = 'memorias-de-salzburgo');

insert into public.news_items (status, publish_at, slug, title_pt, title_en, title_fr, blocks)
select 'published', null, 'o-processo-de-ensaio',
  'O processo de ensaio, por dentro', 'Inside the rehearsal process', null,
  jsonb_build_array(jsonb_build_object(
    'id', gen_random_uuid()::text,
    'type', 'paragraph',
    'title', jsonb_build_object('pt', null, 'en', null, 'fr', null),
    'body', jsonb_build_object(
      'pt', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Cada obra exige uma abordagem diferente de ensaio. Sinfonias longas, por exemplo, costumam ser trabalhadas por movimento, enquanto óperas exigem atenção redobrada ao texto e à respiração dos cantores."}]}]}'::jsonb,
      'en', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Every piece demands a different rehearsal approach. Long symphonies, for instance, are usually worked through movement by movement."}]}]}'::jsonb,
      'fr', null
    )
  ))
where not exists (select 1 from public.news_items where slug = 'o-processo-de-ensaio');

insert into public.news_items (status, publish_at, slug, title_pt, title_en, title_fr, blocks)
select 'published', null, 'formando-jovens-regentes',
  'Formando jovens regentes', null, null,
  jsonb_build_array(jsonb_build_object(
    'id', gen_random_uuid()::text,
    'type', 'paragraph',
    'title', jsonb_build_object('pt', null, 'en', null, 'fr', null),
    'body', jsonb_build_object(
      'pt', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"As masterclasses que conduzo pelo mundo nascem de uma convicção simples: regência se aprende muito mais observando e praticando do que lendo sobre técnica."}]},{"type":"paragraph","content":[{"type":"text","text":"Neste texto, conto como organizo os encontros e o que busco transmitir aos participantes."}]}]}'::jsonb,
      'en', null,
      'fr', null
    )
  ))
where not exists (select 1 from public.news_items where slug = 'formando-jovens-regentes');

-- Filler rows so the blog list has 30+ posts to paginate.
insert into public.news_items (status, publish_at, slug, title_pt, blocks)
select 'published', null,
  'post-de-exemplo-' || s,
  'Post de exemplo #' || s,
  jsonb_build_array(jsonb_build_object(
    'id', gen_random_uuid()::text,
    'type', 'paragraph',
    'title', jsonb_build_object('pt', null, 'en', null, 'fr', null),
    'body', jsonb_build_object(
      'pt', ('{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Texto de exemplo gerado para testar a paginação do blog #' || s || '."}]}]}')::jsonb,
      'en', null,
      'fr', null
    )
  ))
from generate_series(1, 30) as s
where not exists (select 1 from public.news_items where slug = 'post-de-exemplo-' || s);

-- ---------------------------------------------------------------------------
-- Photos (gallery) — placeholder files; upload real images to replace them.
-- ---------------------------------------------------------------------------
insert into public.photos (status, publish_at, storage_path, alt_pt, display_order)
select 'published', null,
  'photos/seed-' || lpad(s::text, 3, '0') || '.jpg',
  'Foto de exemplo #' || s,
  100 + s
from generate_series(1, 32) as s
where not exists (
  select 1 from public.photos where storage_path = 'photos/seed-' || lpad(s::text, 3, '0') || '.jpg'
);

-- ---------------------------------------------------------------------------
-- Videos — placeholder YouTube IDs; edit to point at real videos.
-- ---------------------------------------------------------------------------
insert into public.videos (status, publish_at, youtube_url, title_pt, display_order)
select 'published', null,
  'https://www.youtube.com/watch?v=seed' || lpad(s::text, 6, '0'),
  'Vídeo de exemplo #' || s,
  100 + s
from generate_series(1, 32) as s
where not exists (
  select 1 from public.videos where youtube_url = 'https://www.youtube.com/watch?v=seed' || lpad(s::text, 6, '0')
);

-- ---------------------------------------------------------------------------
-- Press photos — placeholder files, half of them in each section; upload
-- real HD images to replace them.
-- ---------------------------------------------------------------------------
-- Odd numbers are photos of the conductor, even numbers are on-stage photos.
insert into public.press_photos (status, publish_at, storage_path, alt_pt, credit, category, display_order)
select 'published', null,
  'press/seed-' || lpad(s::text, 3, '0') || '.jpg',
  'Foto de imprensa de exemplo #' || s,
  'Crédito de exemplo',
  (case when s % 2 = 0 then 'stage' else 'conductor' end)::public.press_photo_category,
  100 + s
from generate_series(1, 32) as s
where not exists (
  select 1 from public.press_photos where storage_path = 'press/seed-' || lpad(s::text, 3, '0') || '.jpg'
);

-- Rows seeded before categories existed all defaulted to "conductor": give
-- the even ones to the stage section. Only sample rows still at the default.
update public.press_photos
set category = 'stage'
where category = 'conductor'
  and storage_path ~ '^press/seed-[0-9]+\.jpg$'
  and substring(storage_path from '[0-9]+')::int % 2 = 0;

-- ---------------------------------------------------------------------------
-- Contact messages — a third come in pre-marked as read, to test the
-- read/unread indicator alongside pagination.
-- ---------------------------------------------------------------------------
insert into public.contact_messages (name, email, subject, message, is_read, created_at)
select
  'Remetente de exemplo ' || s,
  'contato-exemplo-' || s || '@example.com',
  'Assunto de exemplo #' || s,
  'Mensagem de exemplo gerada para testar a paginação da caixa de entrada.',
  (s % 3 = 0),
  now() - (s * interval '3 hours')
from generate_series(1, 32) as s
where not exists (
  select 1 from public.contact_messages where email = 'contato-exemplo-' || s || '@example.com'
);
