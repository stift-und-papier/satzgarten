-- =====================================================================
-- Phase 4: Aufgaben in 7 Formaten (alt: Übungswiese, Migrationen kern + format_* + reihenfolge_varianten +
-- format_ueberarbeiten + format_erklaerung, zusammengeführt).
-- =====================================================================
-- Neu gegenüber alt: Die Lösungen stehen NUR in aufgaben.loesung (Eingabe der Lehrkraft, vollständig).
-- aufgaben.inhalt (was Schüler:innen bekommen) erzeugt die Datenbank selbst per Trigger aus loesung –
-- die App kann dort also nichts hineinschreiben, auch nicht aus Versehen eine Lösung.
--
-- Aufbau von loesung (wie alt "inhalt"): {"text": "...", "gross_klein_beachten": true, "darstellung": "antippen",
--   "kategorien": [...], "korrigieren": false, "anzahl_zeigen": true, "teile": [...], "erklaerung": {...}}
-- Teile: text {v} · luecke {id, loesungen} · auswahl {id, optionen, richtig} · einheit {id, v, kategorie}
--        · wort {id, v, korrekturen} · reihe {id, satzart, zeichen, varianten, bausteine [{k, v}], loesungen}
--        · versionen {id, kontext, optionen, richtig, hinweise}

-- ---------- Hilfsfunktionen (alt) ----------

-- Eingabe vor dem Vergleich vereinheitlichen: Unicode, Apostrophe, Leerzeichen, ggf. Groß-/Kleinschreibung
create function public.normalisiere(p_text text, p_gross_klein_beachten boolean) returns text
language sql immutable set search_path = '' as $$
  select case when p_gross_klein_beachten then x else lower(x) end
  from (
    select btrim(regexp_replace(translate(normalize(coalesce(p_text, ''), NFC), '’‘`´', ''''''''''), '\s+', ' ', 'g')) as x
  ) s
$$;

-- Gewählte bzw. richtige Möglichkeiten als sortierte Liste ohne Doppelte (Fremdes wird ignoriert)
create function public.indexliste(p jsonb) returns jsonb
language sql immutable set search_path = '' as $$
  select coalesce(jsonb_agg(v order by v), '[]'::jsonb)
  from (
    select distinct x::int as v
    from jsonb_array_elements_text(case when jsonb_typeof(p) = 'array' then p else '[]'::jsonb end) x
    where x ~ '^[0-9]{1,3}$'
  ) s
$$;

-- Baustein für den Vergleich vereinheitlichen (entspricht bausteinNorm in src/lib/lueckentext.ts)
create function public.baustein_norm(p text) returns text
language sql immutable set search_path = '' as $$
  select lower(regexp_replace(public.normalisiere(p, true), '[.,;:!?]+$', ''))
$$;

-- ---------- Tabellen ----------

create table public.aufgaben (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  typ text not null check (typ in ('lueckentext', 'auswahl', 'zuordnen', 'fehler', 'reihenfolge', 'ueberarbeiten', 'erklaerung')),
  titel text not null check (length(btrim(titel)) between 1 and 120),
  anweisung text not null default '',
  -- Fachbegriffe in der Anweisung färben (Aufgabe 19, je Aufgabe abschaltbar)
  farbig boolean not null default true,
  hinweis text,
  rueckmeldung_fehler text,
  stufe smallint not null default 2 check (stufe between 1 and 3),
  loesung jsonb not null check (jsonb_typeof(loesung) = 'object' and length(loesung::text) <= 50000),
  inhalt jsonb not null default '{}'::jsonb,
  erstellt_am timestamptz not null default now(),
  geaendert_am timestamptz not null default now()
);
create index on public.aufgaben (owner);

create table public.aufgabe_kompetenzen (
  aufgabe_id uuid not null references public.aufgaben (id) on delete cascade,
  kompetenz_id uuid not null references public.kompetenzen (id) on delete restrict,
  primary key (aufgabe_id, kompetenz_id)
);
create index on public.aufgabe_kompetenzen (kompetenz_id);

-- ---------- Zugriffsregeln ----------

alter table public.aufgaben enable row level security;
alter table public.aufgabe_kompetenzen enable row level security;
revoke all on public.aufgaben, public.aufgabe_kompetenzen from anon;
-- inhalt entsteht nur per Trigger; Besitzer und Zeitstempel ändert die App nicht
revoke insert, update on public.aufgaben from authenticated;
grant insert (typ, titel, anweisung, farbig, hinweis, rueckmeldung_fehler, stufe, loesung) on public.aufgaben to authenticated;
grant update (titel, anweisung, farbig, hinweis, rueckmeldung_fehler, stufe, loesung) on public.aufgaben to authenticated;

create policy "Lehrkraft: eigene Aufgaben" on public.aufgaben
  for all to authenticated
  using (owner = (select auth.uid()))
  with check (owner = (select auth.uid()));

-- Nur eigene, nicht ausgeblendete Kompetenzen an eigene Aufgaben hängen
create policy "Lehrkraft: Kompetenzen eigener Aufgaben" on public.aufgabe_kompetenzen
  for all to authenticated
  using (exists (select 1 from public.aufgaben a where a.id = aufgabe_id and a.owner = (select auth.uid())))
  with check (
    exists (select 1 from public.aufgaben a where a.id = aufgabe_id and a.owner = (select auth.uid()))
    and exists (select 1 from public.kompetenzen k where k.id = kompetenz_id and k.owner = (select auth.uid()) and not k.ausgeblendet)
  );

-- ---------- Schüler-Fassung ohne Lösungen (alt: inhalt_ohne_loesung, mit Erklärseite zusammengeführt) ----------

create function public.inhalt_ohne_loesung(p_typ text, p_loesung jsonb) returns jsonb
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
          when t ->> 't' = 'luecke' then jsonb_build_object('t', 'luecke', 'id', t -> 'id')
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

-- Trigger: inhalt immer aus loesung erzeugen, Änderungszeit setzen
create function public.aufgabe_vorbereiten() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.inhalt := public.inhalt_ohne_loesung(new.typ, new.loesung);
  new.geaendert_am := now();
  return new;
end
$$;
create trigger aufgabe_vorbereiten before insert or update on public.aufgaben
  for each row execute function public.aufgabe_vorbereiten();

-- ---------- Prüfen (alt, unverändert bis auf den Namen p_loesung) ----------

-- Vergleicht eine gelegte Reihenfolge (Kennungen) mit allen Lösungen; liefert die am besten passende ("index").
create function public.pruefe_reihe(p_teil jsonb, p_antwort jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare
  v_texte text[];
  v_anzahl integer := jsonb_array_length(p_teil -> 'bausteine');
  v_loesung jsonb;
  v_nr bigint;
  v_pos jsonb;
  v_treffer integer;
  v_best jsonb := null;
  v_best_treffer integer := -1;
  v_best_index integer := null;
  i integer;
begin
  select coalesce(array_agg((
           select b ->> 'v' from jsonb_array_elements(p_teil -> 'bausteine') b where b ->> 'k' = a.k limit 1
         ) order by a.nr), '{}')
  into v_texte
  from jsonb_array_elements_text(case when jsonb_typeof(p_antwort) = 'array' then p_antwort else '[]'::jsonb end)
       with ordinality a (k, nr);

  for v_loesung, v_nr in select l, n from jsonb_array_elements(p_teil -> 'loesungen') with ordinality s (l, n) loop
    v_pos := '[]'::jsonb;
    v_treffer := 0;
    for i in 0 .. v_anzahl - 1 loop
      if i < coalesce(array_length(v_texte, 1), 0)
         and public.baustein_norm(v_texte[i + 1]) = public.baustein_norm(v_loesung ->> i) then
        v_treffer := v_treffer + 1;
        v_pos := v_pos || 'true'::jsonb;
      else
        v_pos := v_pos || 'false'::jsonb;
      end if;
    end loop;
    if v_treffer > v_best_treffer then
      v_best_treffer := v_treffer;
      v_best := v_pos;
      v_best_index := v_nr - 1;
    end if;
  end loop;

  return jsonb_build_object('treffer', greatest(v_best_treffer, 0), 'anzahl', v_anzahl,
    'positionen', coalesce(v_best, (select coalesce(jsonb_agg(false), '[]'::jsonb) from generate_series(1, v_anzahl))),
    'index', v_best_index,
    'vollstaendig', coalesce(array_length(v_texte, 1), 0) = v_anzahl);
end
$$;

-- p_antworten: {"<Nummer der Stelle>": Antwort}. Ergebnis: {luecken: [{id, richtig, …}], anteil: 0..1, richtig}
-- Gleiche Logik für Schüler:innen (später antwort_abgeben) und die Vorschau der Lehrkraft.
create function public.pruefe_aufgabe(p_typ text, p_loesung jsonb, p_antworten jsonb) returns jsonb
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

-- ---------- Rechte für Funktionen ----------
-- Nie für anon. Lehrkräfte prüfen in der Vorschau mit ihrer eigenen Lösung; die Funktionen rechnen nur mit dem,
-- was man ihnen gibt (keine Tabellenzugriffe), und laufen mit den Rechten der Aufrufenden – auch im Trigger.
revoke execute on function public.normalisiere(text, boolean), public.indexliste(jsonb), public.baustein_norm(text),
  public.inhalt_ohne_loesung(text, jsonb), public.aufgabe_vorbereiten(), public.pruefe_reihe(jsonb, jsonb),
  public.pruefe_aufgabe(text, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.normalisiere(text, boolean), public.indexliste(jsonb), public.baustein_norm(text),
  public.inhalt_ohne_loesung(text, jsonb), public.pruefe_reihe(jsonb, jsonb),
  public.pruefe_aufgabe(text, jsonb, jsonb) to authenticated;
