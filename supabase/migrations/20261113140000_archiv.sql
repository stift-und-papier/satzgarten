-- Übungsumbau Schritt 4 (Jazz 2026-11-13): alle bisherigen Übungen und Pakete archivieren.
-- Nur markieren, nichts löschen: Versuche, Münzen, Zuweisungen und Lernstände bleiben. Erklärseiten bleiben sichtbar
-- und sind für alle Schüler:innen über den Menüpunkt „Erklärungen“ erreichbar. Zurückholen nur per Migration.

alter table public.aufgaben add column archiviert boolean not null default false;
alter table public.pakete add column archiviert boolean not null default false;

-- Trigger aus, damit geaendert_am der alten Aufgaben unverändert bleibt
alter table public.aufgaben disable trigger aufgabe_vorbereiten;
update public.aufgaben set archiviert = true where typ <> 'erklaerung';
alter table public.aufgaben enable trigger aufgabe_vorbereiten;
update public.pakete set archiviert = true;

-- Sichtbare Aufgaben eines Pakets: ohne archivierte
create or replace function public.sichtbare_aufgaben(p_s public.schueler, p_paket uuid) returns setof uuid
language sql stable set search_path = '' as $$
  with t as (
    select a.id, a.typ, a.stufe::int as st, public.aufgabe_bereich(a.id, public.schueler_kc(p_s)) as b
    from public.paket_aufgaben pa join public.aufgaben a on a.id = pa.aufgabe_id
    where pa.paket_id = p_paket and not a.archiviert
  ),
  gruppe as (
    select b, coalesce(max(st) filter (where st <= public.stufe_fuer(p_s, b)), min(st)) as gewaehlt
    from t where typ <> 'erklaerung'
    group by b
  )
  select id from t where typ = 'erklaerung'
  union all
  select t.id from t join gruppe g on g.b = t.b where t.typ <> 'erklaerung' and t.st = g.gewaehlt
$$;

-- Aufgabe, die die Person bearbeiten darf: nie archiviert. Erklärseiten der eigenen Lehrkraft immer (auch ohne Paket),
-- alles andere nur aus einem zugewiesenen, nicht archivierten Paket.
create or replace function public.zugewiesene_aufgabe(p_s public.schueler, p_paket_id uuid, p_aufgabe_id uuid) returns public.aufgaben
language plpgsql stable security definer set search_path = '' as $$
declare
  v_a public.aufgaben;
begin
  select a.* into v_a
  from public.aufgaben a
  where a.id = p_aufgabe_id
    and not a.archiviert
    and (
      (a.typ = 'erklaerung' and a.owner = (select k.owner from public.klassen k where k.id = p_s.klasse_id))
      or exists (
        select 1 from public.paket_aufgaben pa join public.pakete p on p.id = pa.paket_id
        where pa.aufgabe_id = a.id and pa.paket_id = p_paket_id and not p.archiviert
          and exists (
            select 1 from public.zuweisungen z
            where z.paket_id = p_paket_id and (z.schueler_id = p_s.id or z.klasse_id = p_s.klasse_id)
          )
      )
    );
  if not found then
    raise exception 'Diese Aufgabe ist dir nicht zugewiesen.' using errcode = 'P0002';
  end if;
  return v_a;
end
$$;

-- Startseite wie bisher (kampf_weg), aber ohne archivierte Pakete
create or replace function public.schueler_start(p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
begin
  return jsonb_build_object(
    'pseudonym', v_s.pseudonym,
    'formate_geuebt', coalesce((
      select jsonb_agg(distinct a.typ) from public.versuche v join public.aufgaben a on a.id = v.aufgabe_id
      where v.schueler_id = v_s.id
    ), '[]'::jsonb),
    'pakete', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'titel', p.titel,
          'beschreibung', p.beschreibung,
          'aufgaben', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', a.id,
                'typ', a.typ,
                'titel', a.titel,
                'anweisung', a.anweisung,
                'farbig', a.farbig,
                'hinweis', a.hinweis,
                'stufe', a.stufe,
                'inhalt', a.inhalt,
                'versuche', (select count(*) from public.versuche v where v.schueler_id = v_s.id and v.aufgabe_id = a.id),
                'geloest', exists (select 1 from public.versuche v where v.schueler_id = v_s.id and v.aufgabe_id = a.id and v.richtig),
                'loesung_angesehen', exists (select 1 from public.loesung_angesehen l where l.schueler_id = v_s.id and l.aufgabe_id = a.id)
              )
              order by pa.position, a.titel
            )
            from public.paket_aufgaben pa
            join public.aufgaben a on a.id = pa.aufgabe_id
            where pa.paket_id = p.id and a.id in (select public.sichtbare_aufgaben(v_s, p.id))
          ), '[]'::jsonb)
        )
        order by z.zugewiesen desc
      )
      from public.pakete p
      join lateral (
        select max(zw.erstellt_am) as zugewiesen
        from public.zuweisungen zw
        where zw.paket_id = p.id and (zw.schueler_id = v_s.id or zw.klasse_id = v_s.klasse_id)
      ) z on z.zugewiesen is not null
      where not p.archiviert
    ), '[]'::jsonb)
  );
end
$$;

-- Menüpunkt „Erklärungen“: alle nicht archivierten Erklärseiten der eigenen Lehrkraft, ohne Lösungen.
-- jahrgaenge aus den (auch archivierten) Paketen, in denen die Seite liegt; bereich nach dem Kerncurriculum der Klasse.
create function public.erklaerungen_liste(p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
begin
  return coalesce((
    select jsonb_agg(e order by e ->> 'jahrgaenge' nulls last, e ->> 'bereich', e ->> 'titel')
    from (
      select jsonb_build_object(
        'id', a.id,
        'typ', a.typ,
        'titel', a.titel,
        'anweisung', a.anweisung,
        'farbig', a.farbig,
        'hinweis', a.hinweis,
        'stufe', a.stufe,
        'inhalt', a.inhalt,
        'versuche', (select count(*) from public.versuche v where v.schueler_id = v_s.id and v.aufgabe_id = a.id),
        'geloest', exists (select 1 from public.versuche v where v.schueler_id = v_s.id and v.aufgabe_id = a.id and v.richtig),
        'loesung_angesehen', false,
        'jahrgaenge', (select min(p.jahrgaenge) from public.paket_aufgaben pa join public.pakete p on p.id = pa.paket_id
                       where pa.aufgabe_id = a.id and p.jahrgaenge <> '{}'),
        'bereich', public.aufgabe_bereich(a.id, public.schueler_kc(v_s))
      ) as e
      from public.aufgaben a
      where a.typ = 'erklaerung' and not a.archiviert
        and a.owner = (select k.owner from public.klassen k where k.id = v_s.klasse_id)
    ) x
  ), '[]'::jsonb);
end
$$;

revoke all on function public.erklaerungen_liste(text) from public;
grant execute on function public.erklaerungen_liste(text) to anon, authenticated;
