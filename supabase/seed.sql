-- Categories
insert into public.categories (name, slug, description)
values
  ('KI-Erkennung', 'ki-erkennung', 'Erkennt Muster, Inhalte oder Risiken in Daten'),
  ('Automatisierung & Agenten', 'automatisierung-agenten', 'Automatisierte Abläufe und KI-Agenten'),
  ('Content-Erstellung', 'content-erstellung', 'Text- und Medienproduktion'),
  ('Bildgenerierung', 'bildgenerierung', 'Bild- und Grafikgenerierung'),
  ('Videogenerierung', 'videogenerierung', 'Video- und Motion-Tools'),
  ('Code-Generierung', 'code-generierung', 'Coding- und Dev-Assistenz'),
  ('Forschung & Analyse', 'forschung-analyse', 'Recherche, Analyse, Insights'),
  ('Marketing & SEO', 'marketing-seo', 'SEO, Kampagnen & Performance'),
  ('Produktivität', 'produktivitaet', 'Produktivitäts- und Office-Tools'),
  ('Chatbots & Assistenten', 'chatbots-assistenten', 'Assistenten & Support'),
  ('Design & Kreativität', 'design-kreativitaet', 'Design- und Kreativ-Tools'),
  ('Datenanalyse', 'datenanalyse', 'BI, Datenaufbereitung, Dashboards'),
  ('E-Mail & Kommunikation', 'email-kommunikation', 'Kommunikation & Kollaboration'),
  ('Übersetzung', 'uebersetzung', 'Sprach- und Übersetzungstools')
on conflict (slug) do update set name = excluded.name, description = excluded.description;

-- Tags
insert into public.tags (name, slug, scope)
values
  ('DSGVO-Konform', 'dsgvo-konform', 'tool'),
  ('Freemium', 'freemium', 'tool'),
  ('Bezahlversion', 'paid', 'tool'),
  ('Open Source', 'open-source', 'tool'),
  ('Trending', 'trending', 'tool'),
  ('Neu', 'neu', 'tool'),
  ('Empfohlen', 'empfohlen', 'tool'),
  ('Partner-Angebot', 'partner', 'tool'),
  ('API', 'api', 'tool'),
  ('Deutsch', 'deutsch', 'tool'),
  ('KI-News', 'ki-news', 'news'),
  ('Produkt-Update', 'produkt-update', 'news'),
  ('Datenschutz', 'datenschutz', 'news')
on conflict (slug) do update set name = excluded.name, scope = excluded.scope;

-- Tools
with inserted_tools as (
  insert into public.tools (slug, name, kurzbeschreibung, beschreibung, zusammenfassung, logo_url, thumbnail_url, preismodell, plattform, use_case, affiliate_url, avv_dpa, hosting_region, subprocessors, data_types, data_type_notes, security_measures, security_notes, risk_level, gdpr_score, community_rating, sources, is_featured, is_trending, is_new, partner_offer, last_checked_at)
  values
    (
      'chatgpt',
      'ChatGPT',
      'Multimodaler KI-Assistent für Text, Analyse und Automatisierung.',
      'ChatGPT hilft Teams beim Entwerfen, Zusammenfassen und Automatisieren von Aufgaben mit natürlicher Sprache.',
      'Beliebt für schnelle Texte, Ideation und Recherche. Plugins/Actions integrieren bestehende Tools.',
      'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=320&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526378722484-cc5c7100dbeb?w=960&auto=format&fit=crop&q=80',
      'Freemium',
      'Web, iOS, Android',
      'Assistenz, Content, Recherche',
      'https://openai.com',
      'unknown',
      'usa',
      'yes',
      '{"inputs":["Text","Bilder"],"processing":"Cloud"}',
      'Verläufe optional speicherbar; Unternehmens-Workspaces mit Kontrolle.',
      '{"encryption":"TLS at transit; AES-256 at rest","sso":"SAML/SSO","audit":"Enterprise Audit Logs"}',
      'Advanced Sicherheit in Unternehmensplänen.',
      'medium',
      6.5,
      4.8,
      '{"privacy_policy":"https://openai.com/policies/privacy-policy","security":"https://openai.com/security"}'::jsonb,
      true,
      true,
      false,
      false,
      now()
    ),
    (
      'midjourney',
      'Midjourney',
      'KI-Bildgenerierung mit starkem künstlerischen Stil.',
      'Erzeugt hochqualitative Bilder per Prompt, Variationen und Stilvorgaben.',
      'Ideal für Moodboards, Kampagnen und Kreativ-Konzepte.',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=320&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1529429617124-aee1f1650a5a?w=960&auto=format&fit=crop&q=80',
      'Bezahlversion',
      'Web',
      'Bildgenerierung',
      'https://www.midjourney.com',
      'unknown',
      'usa',
      'unknown',
      '{"inputs":["Bilder","Prompts"],"processing":"Cloud"}',
      null,
      '{"encryption":"TLS","hosting":"US-based"}',
      null,
      'medium',
      6.0,
      4.4,
      '{"privacy_policy":"https://midjourney.com/privacy"}'::jsonb,
      true,
      true,
      false,
      false,
      now()
    ),
    (
      'deepl',
      'DeepL',
      'Übersetzung und KI-Schreibassistent mit Fokus auf Datenschutz.',
      'DeepL liefert hochwertige Übersetzungen und bietet KI-Schreibstil-Korrektur.',
      'Stark für professionelle Übersetzungen, Glossare und Terminologie.',
      'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=320&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=960&auto=format&fit=crop&q=80',
      'Freemium',
      'Web, Desktop, API',
      'Übersetzung, Writing Assist',
      'https://www.deepl.com',
      'yes',
      'eu',
      'unknown',
      '{"inputs":["Text","Dokumente"],"processing":"EU Cloud"}',
      'Datensparsamkeit; kein Training auf Kundendaten in Pro.',
      '{"encryption":"TLS","hosting":"EU","compliance":"ISO 27001"}',
      'Für Business-Tarife mit AVV.',
      'low',
      8.5,
      4.7,
      '{"privacy_policy":"https://www.deepl.com/privacy","dpa":"https://www.deepl.com/pro-license"}'::jsonb,
      true,
      false,
      false,
      false,
      now()
    ),
    (
      'zapier-ai',
      'Zapier AI',
      'Automatisierung & KI-Agenten für SaaS-Workflows.',
      'Verbinde Apps, baue KI-Agenten und automatisiere Abläufe ohne Code.',
      'Gut für Marketing-, Ops- und Support-Automatisierung.',
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=320&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=960&auto=format&fit=crop&q=80',
      'Freemium',
      'Web',
      'Automatisierung',
      'https://zapier.com',
      'unknown',
      'usa',
      'yes',
      '{"inputs":["Text","API"],"processing":"US Cloud"}',
      'Ab Enterprise mit SOC 2 und SSO.',
      '{"encryption":"TLS","compliance":"SOC 2"}',
      null,
      'medium',
      6.8,
      4.5,
      '{"privacy_policy":"https://zapier.com/privacy"}'::jsonb,
      false,
      true,
      true,
      true,
      now()
    )
  on conflict (slug) do update set
    name = excluded.name,
    kurzbeschreibung = excluded.kurzbeschreibung,
    beschreibung = excluded.beschreibung,
    zusammenfassung = excluded.zusammenfassung,
    logo_url = excluded.logo_url,
    thumbnail_url = excluded.thumbnail_url,
    preismodell = excluded.preismodell,
    plattform = excluded.plattform,
    use_case = excluded.use_case,
    affiliate_url = excluded.affiliate_url,
    avv_dpa = excluded.avv_dpa,
    hosting_region = excluded.hosting_region,
    subprocessors = excluded.subprocessors,
    data_types = excluded.data_types,
    data_type_notes = excluded.data_type_notes,
    security_measures = excluded.security_measures,
    security_notes = excluded.security_notes,
    risk_level = excluded.risk_level,
    gdpr_score = excluded.gdpr_score,
    community_rating = excluded.community_rating,
    sources = excluded.sources,
    is_featured = excluded.is_featured,
    is_trending = excluded.is_trending,
    is_new = excluded.is_new,
    partner_offer = excluded.partner_offer,
    last_checked_at = excluded.last_checked_at,
    updated_at = now()
  returning id, slug
)
select 1;

-- Tool relations
insert into public.tool_categories (tool_id, category_id)
select t.id, c.id
from (
  values
    ('chatgpt', 'chatbots-assistenten'),
    ('midjourney', 'bildgenerierung'),
    ('deepl', 'uebersetzung'),
    ('zapier-ai', 'automatisierung-agenten')
) as mapping(tool_slug, category_slug)
join public.tools t on t.slug = mapping.tool_slug
join public.categories c on c.slug = mapping.category_slug
on conflict do nothing;

insert into public.tool_categories (tool_id, category_id)
select t.id, c.id
from (
  values
    ('chatgpt', 'content-erstellung'),
    ('zapier-ai', 'produktivitaet'),
    ('midjourney', 'design-kreativitaet')
) as mapping(tool_slug, category_slug)
join public.tools t on t.slug = mapping.tool_slug
join public.categories c on c.slug = mapping.category_slug
on conflict do nothing;

insert into public.tool_tags (tool_id, tag_id)
select t.id, tg.id
from public.tools t
join public.tags tg on
  (t.slug = 'chatgpt' and tg.slug in ('freemium','trending','api'))
  or (t.slug = 'midjourney' and tg.slug in ('paid','trending'))
  or (t.slug = 'deepl' and tg.slug in ('freemium','dsgvo-konform','deutsch'))
  or (t.slug = 'zapier-ai' and tg.slug in ('freemium','partner','trending'))
on conflict do nothing;

-- News
insert into public.news (slug, title, excerpt, content, image_url, published_at, sources)
values
  (
    'openai-stellt-neue-modelle-vor',
    'OpenAI stellt neue Modelle für Enterprise vor',
    'Mehr Kontrolle, höhere Privacy und verbesserte Qualität für Unternehmen.',
    'OpenAI kündigt neue Enterprise-Funktionen, Granularität bei Datenkontrolle und bessere Audit-Logs an.',
    'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=1200&auto=format&fit=crop&q=80',
    now() - interval '2 day',
    '{"source":"https://openai.com/blog"}'::jsonb
  ),
  (
    'deepl-startet-ki-schreibassistent',
    'DeepL startet KI-Schreibassistent für Teams',
    'Team-Features, Terminologie-Management und Datenschutz im Fokus.',
    'DeepL erweitert sein Portfolio um einen Schreibassistenten mit Glossar-Integration und AVV.',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&auto=format&fit=crop&q=80',
    now() - interval '5 day',
    '{"source":"https://www.deepl.com/blog"}'::jsonb
  ),
  (
    'eu-verabschiedet-ki-gesetz',
    'EU verabschiedet KI-Gesetz',
    'EU AI Act bringt neue Pflichten für Anbieter und Nutzer von KI-Systemen.',
    'Die EU einigt sich auf ein KI-Gesetz mit Risikoklassen, Transparenz- und Dokumentationspflichten.',
    'https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?w=1200&auto=format&fit=crop&q=80',
    now() - interval '10 day',
    '{"source":"https://europa.eu"}'::jsonb
  )
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  image_url = excluded.image_url,
  published_at = excluded.published_at,
  sources = excluded.sources,
  updated_at = now();

insert into public.news_tags (news_id, tag_id)
select n.id, tg.id
from public.news n
join public.tags tg on
  (n.slug = 'openai-stellt-neue-modelle-vor' and tg.slug in ('ki-news','produkt-update'))
  or (n.slug = 'deepl-startet-ki-schreibassistent' and tg.slug in ('produkt-update','datenschutz'))
  or (n.slug = 'eu-verabschiedet-ki-gesetz' and tg.slug in ('ki-news','datenschutz'))
on conflict do nothing;
