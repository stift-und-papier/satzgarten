-- Usability-Test 2026-11-13: Lücken, bei denen nur Groß- und Kleinschreibung nicht stimmt, melden gross_klein = true.
-- Sonst unverändert (Kopie aus 20261111170000_diktat.sql).
create or replace function public.pruefe_aufgabe(p_typ text, p_loesung jsonb, p_antworten jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare
  v_teil jsonb;
  v_eingabe text;
  v_ok boolean;
  v_luecken jsonb := '[]'::jsonb;
  v_anzahl integer := 0;
  v_richtig integer := 0;
  v_gk boolean := coalesce((p_loesung ->> 'gross_klein_beachten')::boolean, true);
  v_korrigieren boolean := coalesce((p_loesung ->> 'korrigieren')::boolean, false);
  v_wahl jsonb;
  v_soll text;
  v_markiert boolean;
  v_id jsonb;
  v_reihe jsonb;
  v_varianten integer;
  v_antwort jsonb;
  v_liste jsonb;
  v_rest jsonb;
  v_reihe_ok boolean;
  j integer;
begin
  -- Erklärseite: „Verstanden“ ist immer richtig (zählt nie für den Lernstand, regelt später antwort_abgeben)
  if p_typ = 'erklaerung' then
    return jsonb_build_object('luecken', '[]'::jsonb, 'anteil', 1, 'richtig', true);
  end if;
  -- Diktat: eigene Prüfung (docs/SPEC-diktat.md)
  if p_typ = 'diktat' then
    return public.pruefe_diktat(p_loesung, p_antworten);
  end if;
  if p_typ not in ('lueckentext', 'auswahl', 'zuordnen', 'fehler', 'reihenfolge', 'ueberarbeiten') then
    raise exception 'Unbekannter Aufgabentyp: %', p_typ;
  end if;
  if jsonb_typeof(p_antworten) is distinct from 'object' then
    p_antworten := '{}'::jsonb;
  end if;

  for v_teil in select t from jsonb_array_elements(p_loesung -> 'teile') t loop
    v_id := v_teil -> 'id';
    if v_teil ->> 't' = 'reihe' then
      -- Reihenfolge: jede geforderte Variante, jeder Baustein zählt einzeln
      v_varianten := greatest(1, least(10, coalesce((v_teil ->> 'varianten')::int, 1)));
      v_antwort := p_antworten -> (v_teil ->> 'id');
      if jsonb_typeof(v_antwort) = 'array' and jsonb_typeof(v_antwort -> 0) = 'array' then
        v_liste := v_antwort;
      elsif jsonb_typeof(v_antwort) = 'array' then
        v_liste := jsonb_build_array(v_antwort);
      else
        v_liste := '[]'::jsonb;
      end if;
      v_rest := v_teil -> 'loesungen';
      for j in 0 .. v_varianten - 1 loop
        v_reihe := public.pruefe_reihe(jsonb_set(v_teil, '{loesungen}', v_rest), v_liste -> j);
        v_reihe_ok := (v_reihe ->> 'treffer')::int = (v_reihe ->> 'anzahl')::int and (v_reihe ->> 'vollstaendig')::boolean;
        v_anzahl := v_anzahl + (v_reihe ->> 'anzahl')::int;
        v_richtig := v_richtig + (v_reihe ->> 'treffer')::int;
        if v_reihe_ok then
          -- eine schon richtig gelegte Reihenfolge zählt nicht noch einmal
          v_rest := v_rest - (v_reihe ->> 'index')::int;
        end if;
        v_luecken := v_luecken || jsonb_build_object(
          'id', v_id, 'variante', j, 'richtig', v_reihe_ok, 'positionen', v_reihe -> 'positionen');
      end loop;
      continue;
    elsif v_teil ->> 't' = 'versionen' then
      -- Sätze verbessern: wie Auswahl, dazu die Begründungshinweise aller Versionen (erst nach dem Prüfen)
      v_wahl := public.indexliste(p_antworten -> (v_teil ->> 'id'));
      v_ok := jsonb_array_length(v_wahl) > 0 and v_wahl = public.indexliste(v_teil -> 'richtig');
      v_anzahl := v_anzahl + 1;
      if v_ok then
        v_richtig := v_richtig + 1;
      end if;
      v_luecken := v_luecken || jsonb_build_object('id', v_id, 'richtig', v_ok,
        'hinweise', coalesce(v_teil -> 'hinweise', '[]'::jsonb));
      continue;
    elsif v_teil ->> 't' = 'luecke' then
      v_eingabe := public.normalisiere(p_antworten ->> (v_teil ->> 'id'), v_gk);
      select v_eingabe <> '' and exists (
        select 1 from jsonb_array_elements_text(v_teil -> 'loesungen') l
        where public.normalisiere(l, v_gk) = v_eingabe
      ) into v_ok;
    elsif v_teil ->> 't' = 'auswahl' then
      -- Mehrfachauswahl zählt nur, wenn genau die richtigen gewählt sind
      v_wahl := public.indexliste(p_antworten -> (v_teil ->> 'id'));
      v_ok := jsonb_array_length(v_wahl) > 0 and v_wahl = public.indexliste(v_teil -> 'richtig');
    elsif v_teil ->> 't' = 'einheit' then
      v_eingabe := nullif(btrim(case when jsonb_typeof(p_antworten -> (v_teil ->> 'id')) = 'string'
                                     then p_antworten ->> (v_teil ->> 'id') end), '');
      v_soll := v_teil ->> 'kategorie';
      continue when v_soll is null and v_eingabe is null;
      v_ok := v_eingabe is not distinct from v_soll;
    elsif v_teil ->> 't' = 'wort' then
      v_markiert := coalesce(jsonb_typeof(p_antworten -> (v_teil ->> 'id')) = 'string'
                             or (p_antworten -> (v_teil ->> 'id')) = 'true'::jsonb, false);
      if jsonb_typeof(v_teil -> 'korrekturen') is distinct from 'array' then
        continue when not v_markiert;
        v_ok := false;
      elsif not v_markiert then
        v_ok := false;
        v_id := 'null'::jsonb; -- nicht gefunden: Stelle nicht verraten
      elsif v_korrigieren then
        v_eingabe := public.normalisiere(case when jsonb_typeof(p_antworten -> (v_teil ->> 'id')) = 'string'
                                              then p_antworten ->> (v_teil ->> 'id') end, v_gk);
        select v_eingabe <> '' and exists (
          select 1 from jsonb_array_elements_text(v_teil -> 'korrekturen') l
          where public.normalisiere(l, v_gk) = v_eingabe
        ) into v_ok;
      else
        v_ok := true;
      end if;
    else
      continue;
    end if;
    v_anzahl := v_anzahl + 1;
    if v_ok then
      v_richtig := v_richtig + 1;
    end if;
    -- Usability-Test 2026-11-13: nur Groß/klein falsch? Dann bekommt die Lücke den Hinweis gross_klein (verrät keine Lösung)
    v_luecken := v_luecken || jsonb_build_object('id', v_id, 'richtig', v_ok) || case
      when not v_ok and v_gk and v_teil ->> 't' = 'luecke' and v_eingabe <> '' and exists (
        select 1 from jsonb_array_elements_text(v_teil -> 'loesungen') l
        where public.normalisiere(l, false) = public.normalisiere(p_antworten ->> (v_teil ->> 'id'), false))
      then jsonb_build_object('gross_klein', true) else '{}'::jsonb end;
  end loop;

  return jsonb_build_object(
    'luecken', v_luecken,
    'anteil', case when v_anzahl = 0 then 0 else round(v_richtig::numeric / v_anzahl, 3) end,
    'richtig', v_anzahl > 0 and v_richtig = v_anzahl
      and not exists (select 1 from jsonb_array_elements(v_luecken) l where not (l ->> 'richtig')::boolean)
  );
end
$$;
