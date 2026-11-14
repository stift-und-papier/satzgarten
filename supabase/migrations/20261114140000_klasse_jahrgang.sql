-- Erklärungen nur passend zum Jahrgang (Jazz 2026-11-14).
-- Klassen bekommen einen Jahrgang (5–10, darf leer sein). Vorbelegt aus dem Klassennamen, wenn er mit einer Zahl beginnt („7b“ → 7).
alter table public.klassen add column jahrgang smallint check (jahrgang between 5 and 10);
update public.klassen
set jahrgang = (substring(name from '^\s*(\d{1,2})'))::smallint
where (substring(name from '^\s*(\d{1,2})'))::int between 5 and 10;

-- Liste der Erklärseiten: nur die des eigenen Jahrgangs (über die Jahrgänge der Pakete, in denen die Erklärseite steckt).
-- Ohne Jahrgang der Klasse wie bisher alle; Erklärseiten ohne Paket mit Jahrgang sehen ebenfalls alle.
-- Sortiert nach Thema (Bereich) und Titel. Sonst unverändert (archiv).
create or replace function public.erklaerungen_liste(p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_jg smallint := (select k.jahrgang from public.klassen k where k.id = v_s.klasse_id);
begin
  return coalesce((
    select jsonb_agg(e order by e ->> 'bereich', e ->> 'titel')
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
        and (
          v_jg is null
          or not exists (select 1 from public.paket_aufgaben pa join public.pakete p on p.id = pa.paket_id
                         where pa.aufgabe_id = a.id and p.jahrgaenge <> '{}')
          or exists (select 1 from public.paket_aufgaben pa join public.pakete p on p.id = pa.paket_id
                     where pa.aufgabe_id = a.id and v_jg = any (p.jahrgaenge))
        )
    ) x
  ), '[]'::jsonb);
end
$$;
