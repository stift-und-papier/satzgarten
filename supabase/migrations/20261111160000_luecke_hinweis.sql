-- Lücke mit Hinweis: [Rad fahren : Rad + fahren] → Schüler:innen sehen „(Rad + fahren)“ hinter der Lücke (Lehrkraft 2026-11-11).
-- Der Hinweis ist keine Lösung und darf deshalb in die Schüler-Fassung.

create or replace function public.inhalt_ohne_loesung(p_typ text, p_loesung jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
begin
  if p_typ = 'erklaerung' then
    -- Erklärseiten enthalten keine Lösungen
    return jsonb_build_object('teile', '[]'::jsonb, 'erklaerung', jsonb_build_object(
      'text', coalesce(p_loesung -> 'erklaerung' -> 'text', '""'::jsonb),
      'merke', coalesce(p_loesung -> 'erklaerung' -> 'merke', '""'::jsonb),
      'beispiele', coalesce(p_loesung -> 'erklaerung' -> 'beispiele', '[]'::jsonb)));
  end if;
  -- Achtung: "text" (Eingabetext der Lehrkraft) enthält die Lösungen und wird bewusst weggelassen.
  return jsonb_build_object(
    'darstellung', coalesce(p_loesung ->> 'darstellung', 'antippen'),
    'kategorien', coalesce(p_loesung -> 'kategorien', '[]'::jsonb),
    'korrigieren', coalesce((p_loesung ->> 'korrigieren')::boolean, false),
    'anzahl_fehler', case when coalesce((p_loesung ->> 'anzahl_zeigen')::boolean, false) then (
      select count(*) from jsonb_array_elements(p_loesung -> 'teile') t
      where t ->> 't' = 'wort' and jsonb_typeof(t -> 'korrekturen') = 'array'
    ) end,
    'teile', coalesce((
      select jsonb_agg(
        case
          when t ->> 't' = 'text' then jsonb_build_object('t', 'text', 'v', t -> 'v')
          when t ->> 't' = 'luecke' then jsonb_strip_nulls(jsonb_build_object('t', 'luecke', 'id', t -> 'id', 'hinweis', t -> 'hinweis'))
          when t ->> 't' = 'auswahl' then
            jsonb_build_object('t', 'auswahl', 'id', t -> 'id', 'optionen', t -> 'optionen',
              'mehrfach', jsonb_array_length(public.indexliste(t -> 'richtig')) > 1)
          when t ->> 't' in ('einheit', 'wort') then jsonb_build_object('t', t -> 't', 'id', t -> 'id', 'v', t -> 'v')
          when t ->> 't' = 'versionen' then
            -- nur Kontext und Versionen; welche besser ist und die Hinweise bleiben in der Datenbank
            jsonb_build_object('t', 'versionen', 'id', t -> 'id', 'kontext', coalesce(t -> 'kontext', '""'::jsonb),
              'optionen', t -> 'optionen')
          when t ->> 't' = 'reihe' then
            -- Bausteine nach zufälliger Kennung sortiert = gemischt
            jsonb_build_object('t', 'reihe', 'id', t -> 'id',
              'satzart', t -> 'satzart', 'zeichen', t -> 'zeichen',
              'varianten', coalesce((t ->> 'varianten')::int, 1),
              'bausteine', (
                select coalesce(jsonb_agg(jsonb_build_object('k', b -> 'k', 'v', b -> 'v') order by b ->> 'k'), '[]'::jsonb)
                from jsonb_array_elements(t -> 'bausteine') b))
        end
        order by nr)
      from jsonb_array_elements(p_loesung -> 'teile') with ordinality e (t, nr)
      -- Unbekanntes fällt weg (statt null)
      where t ->> 't' in ('text', 'luecke', 'auswahl', 'einheit', 'wort', 'versionen', 'reihe')
    ), '[]'::jsonb)
  );
end
$$;

-- vorhandene Aufgaben neu berechnen (Trigger erzeugt inhalt)
update public.aufgaben set loesung = loesung;
