-- Lernweg (Jazz 2026-11-14): Die Themen stehen nach Kernkompetenzen, das zuletzt Geübte zuerst.
-- Dafür nennt schueler_entwicklung je Thema den Zeitpunkt des letzten Versuchs (zuletzt). Sonst unverändert (belohnungen):
-- weiterhin KEINE Punkte, KEINE Stufen.
create or replace function public.schueler_entwicklung(p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_kc text := public.schueler_kc(v_s);
  e public.einstellungen;
  v_eintraege jsonb := '[]'::jsonb;
  v_naechster text;
  v_tiefste numeric;
  r record;
  a jsonb;
  v_kategorie text;
begin
  select * into e from public.einstellungen where owner = v_s.owner;
  if v_kc is null or e.owner is null then
    return jsonb_build_object('kompetenzen', '[]'::jsonb, 'texte', coalesce(e.texte, '{}'::jsonb), 'naechster_schritt', null);
  end if;

  for r in
    select k.id, coalesce(nullif(btrim(k.kurzname), ''), k.bereich) as name, k.bereich, k.sortierung,
      (select count(distinct v.aufgabe_id) from public.versuche v
         join public.aufgabe_kompetenzen ak2 on ak2.aufgabe_id = v.aufgabe_id and ak2.kompetenz_id = k.id
         where v.schueler_id = v_s.id and v.richtig) as geloest,
      (select max(v.gespeichert_am) from public.versuche v
         join public.aufgabe_kompetenzen ak3 on ak3.aufgabe_id = v.aufgabe_id and ak3.kompetenz_id = k.id
         where v.schueler_id = v_s.id) as zuletzt
    from public.kompetenzen k
    where k.owner = v_s.owner and k.kerncurriculum = v_kc and not k.ausgeblendet
      and exists (
        select 1 from public.versuche v
        join public.aufgabe_kompetenzen ak on ak.aufgabe_id = v.aufgabe_id and ak.kompetenz_id = k.id
        where v.schueler_id = v_s.id
      )
    order by k.sortierung
  loop
    a := public.auswertung(v_s.id, r.id, e);
    v_kategorie := public.lern_kategorie(a, e);
    -- Nur Name, Bereich, Kategorie, Anzahl gelöster Aufgaben und wann zuletzt geübt – KEINE Punkte, KEINE Stufen.
    v_eintraege := v_eintraege || jsonb_build_object(
      'name', r.name, 'bereich', r.bereich, 'kategorie', v_kategorie, 'geloest', r.geloest, 'zuletzt', r.zuletzt
    );
    -- Vorschlag für den nächsten Schritt: Kompetenz mit dem niedrigsten Stand (nur unterhalb von "+")
    if (a ->> 'punkte') is not null and (a ->> 'punkte')::numeric < e.grenze_plus
       and (v_tiefste is null or (a ->> 'punkte')::numeric < v_tiefste) then
      v_tiefste := (a ->> 'punkte')::numeric;
      v_naechster := r.name;
    end if;
  end loop;

  return jsonb_build_object('kompetenzen', v_eintraege, 'texte', e.texte, 'naechster_schritt', v_naechster);
end
$$;
