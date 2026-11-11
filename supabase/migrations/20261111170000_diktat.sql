-- =====================================================================
-- Phase 5: Format „Diktat“ (docs/SPEC-diktat.md) – Abschreiben und Merkdiktat
-- =====================================================================
-- loesung: {"modus": "abschreiben" | "merken", "text": "<Eingabe mit |>", "saetze": ["…", …]}
-- inhalt (Trigger): {"modus", "saetze"} – der Text ist ohnehin sichtbar, nur die Eingabe der Lehrkraft fällt weg.
-- Antworten: Abschreiben {"fehler": [Zeichenstellen mit Fehler]} (das Gerät wartet auf das richtige Zeichen),
--            Merkdiktat {"0": "<erster Versuch Satz 1>", "1": …}.
-- Ergebnis: anteil = richtige Zeichen, richtig = anteil >= 0.9 (geschafft), fehlerfrei = anteil = 1.

alter table public.aufgaben drop constraint aufgaben_typ_check;
alter table public.aufgaben add constraint aufgaben_typ_check
  check (typ in ('lueckentext', 'auswahl', 'zuordnen', 'fehler', 'reihenfolge', 'ueberarbeiten', 'erklaerung', 'diktat'));

-- Wie vereinheitliche() in src/lib/diktat.ts: NFC, typografische Zeichen → Tastatur, Leerraum zusammenfassen
create function public.diktat_norm(p text) returns text
language sql immutable set search_path = '' as $$
  select btrim(regexp_replace(
    replace(translate(normalize(coalesce(p, ''), NFC), '„“”»«‚‘’›‹´`–—' || chr(160),
                      '"""""' || repeat(chr(39), 7) || '--' || ' '), '…', '...'),
    '\s+', ' ', 'g'))
$$;

-- Wie abstand() in src/lib/diktat.ts: Levenshtein-Abstand (einfügen, löschen, ersetzen)
create function public.diktat_abstand(a text, b text) returns integer
language plpgsql immutable set search_path = '' as $$
declare
  x text[] := coalesce(regexp_split_to_array(a, ''), '{}');
  y text[] := coalesce(regexp_split_to_array(b, ''), '{}');
  n integer := coalesce(array_length(x, 1), 0);
  m integer := coalesce(array_length(y, 1), 0);
  zeile integer[];
  neu integer[];
  i integer;
  j integer;
begin
  if a = '' then return m; end if;
  if b = '' then return n; end if;
  zeile := array(select generate_series(0, m));
  for i in 1 .. n loop
    neu := array[i];
    for j in 1 .. m loop
      neu := neu || least(zeile[j + 1] + 1, neu[j] + 1, zeile[j] + case when x[i] = y[j] then 0 else 1 end);
    end loop;
    zeile := neu;
  end loop;
  return zeile[m + 1];
end
$$;

create function public.pruefe_diktat(p_loesung jsonb, p_antworten jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare
  v_saetze jsonb := coalesce(p_loesung -> 'saetze', '[]'::jsonb);
  v_gesamt integer;
  v_richtig numeric := 0;
  v_luecken jsonb := '[]'::jsonb;
  v_soll text;
  v_ist text;
  v_abstand integer;
  v_laenge integer;
  v_nr bigint;
  v_anteil numeric;
begin
  if jsonb_typeof(p_antworten) is distinct from 'object' then
    p_antworten := '{}'::jsonb;
  end if;
  if coalesce(p_loesung ->> 'modus', 'abschreiben') = 'abschreiben' then
    -- Zeichen des ganzen Texts; jede gemeldete Fehlerstelle zählt einmal
    v_gesamt := length(public.diktat_norm((select string_agg(s, ' ' order by n) from jsonb_array_elements_text(v_saetze) with ordinality e (s, n))));
    v_richtig := v_gesamt - (
      select count(distinct x::int) from jsonb_array_elements_text(
        case when jsonb_typeof(p_antworten -> 'fehler') = 'array' then p_antworten -> 'fehler' else '[]'::jsonb end) x
      where x ~ '^[0-9]{1,6}$' and x::int < v_gesamt);
  else
    -- Merkdiktat: erster Versuch je Satz, richtige Zeichen = Länge − Abstand
    v_gesamt := 0;
    for v_soll, v_nr in select s, n - 1 from jsonb_array_elements_text(v_saetze) with ordinality e (s, n) loop
      v_soll := public.diktat_norm(v_soll);
      v_ist := public.diktat_norm(case when jsonb_typeof(p_antworten -> v_nr::text) = 'string' then p_antworten ->> v_nr::text end);
      v_laenge := length(v_soll);
      v_abstand := public.diktat_abstand(v_soll, v_ist);
      v_gesamt := v_gesamt + v_laenge;
      v_richtig := v_richtig + greatest(0, v_laenge - v_abstand);
      v_luecken := v_luecken || jsonb_build_object('id', v_nr, 'richtig', v_abstand = 0);
    end loop;
  end if;
  v_anteil := case when coalesce(v_gesamt, 0) = 0 then 0 else round(v_richtig / v_gesamt, 3) end;
  return jsonb_build_object('luecken', v_luecken, 'anteil', v_anteil,
    'richtig', v_anteil >= 0.9, 'fehlerfrei', v_gesamt > 0 and v_richtig = v_gesamt);
end
$$;

revoke execute on function public.diktat_norm(text), public.diktat_abstand(text, text), public.pruefe_diktat(jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.diktat_norm(text), public.diktat_abstand(text, text), public.pruefe_diktat(jsonb, jsonb)
  to authenticated;

-- ---------- Verteiler und Schüler-Fassung um Diktat erweitert ----------

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
    v_luecken := v_luecken || jsonb_build_object('id', v_id, 'richtig', v_ok);
  end loop;

  return jsonb_build_object(
    'luecken', v_luecken,
    'anteil', case when v_anzahl = 0 then 0 else round(v_richtig::numeric / v_anzahl, 3) end,
    'richtig', v_anzahl > 0 and v_richtig = v_anzahl
      and not exists (select 1 from jsonb_array_elements(v_luecken) l where not (l ->> 'richtig')::boolean)
  );
end
$$;

create or replace function public.inhalt_ohne_loesung(p_typ text, p_loesung jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
begin
  -- Diktat: nur der Text, der ohnehin zu sehen ist (Sätze ohne die | der Lehrkraft)
  if p_typ = 'diktat' then
    return jsonb_build_object('modus', coalesce(p_loesung ->> 'modus', 'abschreiben'),
      'saetze', coalesce(p_loesung -> 'saetze', '[]'::jsonb), 'teile', '[]'::jsonb);
  end if;
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

-- vorhandene Aufgaben neu berechnen
update public.aufgaben set loesung = loesung;
