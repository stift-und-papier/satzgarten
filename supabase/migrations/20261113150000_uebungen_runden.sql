-- Übungsumbau Schritt 5 (Konzept docs/umbau/konzept.md, freigegeben von Jazz am 2026-11-13):
-- Übung = Zeile in aufgaben mit loesung = { runden: [R1, R2, …] } (jede Runde im bisherigen Format des Typs).
-- Gespielt wird in Durchgängen (einer pro Übung und Kalendertag Europe/Berlin), jede Runde wird einzeln auf dem Server
-- geprüft. Ist der Durchgang fertig, schreibt der Server EINEN Eintrag in versuche → Lernstand und Sterne laufen weiter.
-- Erklärseiten bleiben, wie sie sind (keine Runden, antwort_abgeben, einmalig 5 Münzen). Alte Funktionen bleiben.

-- ---------- Spalten ----------
alter table public.aufgaben drop constraint aufgaben_typ_check;
alter table public.aufgaben add constraint aufgaben_typ_check
  check (typ in ('lueckentext', 'auswahl', 'zuordnen', 'fehler', 'reihenfolge', 'ueberarbeiten', 'erklaerung', 'diktat', 'fallende_woerter'));
alter table public.aufgaben
  -- Schlüssel des Monsters (Bilder kommen in Schritt 7/8), Standard Rübchen
  add column monster text not null default 'ruebchen' check (monster ~ '^[a-z0-9_]{1,30}$'),
  -- wie viele Runden ein Durchgang zieht; leer = alle (Pool, Konzept Abschnitt 8)
  add column runden_je_durchgang smallint default 6 check (runden_je_durchgang between 1 and 50),
  -- Einstellungen je Typ (Diktat, Fallende Wörter; Schritt 10/11)
  add column spiel jsonb not null default '{}' check (jsonb_typeof(spiel) = 'object' and length(spiel::text) <= 2000);
grant insert (monster, runden_je_durchgang, spiel) on public.aufgaben to authenticated;
grant update (monster, runden_je_durchgang, spiel) on public.aufgaben to authenticated;

-- Leseschrift je Schüler:in (Entscheidung Schritt 1): die Lehrkraft schaltet ein, am Gerät bleibt sie umschaltbar
alter table public.schueler add column leseschrift boolean not null default false;

alter table public.muenz_ereignisse drop constraint muenz_ereignisse_grund_check;
alter table public.muenz_ereignisse add constraint muenz_ereignisse_grund_check
  check (grund in ('aufgabe', 'erklaerung', 'diktat', 'diktat_besser', 'diktat_fehlerfrei', 'lehrkraft', 'verkauf',
                   'uebung', 'freundschaft', 'diktat_voll'));

-- ---------- Inhalt ohne Lösung: je Runde ----------
create or replace function public.aufgabe_vorbereiten() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.loesung ? 'runden' then
    if jsonb_typeof(new.loesung -> 'runden') <> 'array' or jsonb_array_length(new.loesung -> 'runden') not between 1 and 100 then
      raise exception 'Eine Übung braucht 1 bis 100 Runden.' using errcode = '22023';
    end if;
    new.inhalt := jsonb_build_object('runden', (
      select jsonb_agg(public.inhalt_ohne_loesung(new.typ, r) order by n)
      from jsonb_array_elements(new.loesung -> 'runden') with ordinality x (r, n)
    ));
  else
    new.inhalt := public.inhalt_ohne_loesung(new.typ, new.loesung);
  end if;
  new.geaendert_am := now();
  return new;
end
$$;

-- ---------- Durchgänge ----------
create table public.durchgaenge (
  id uuid primary key default gen_random_uuid(),
  schueler_id uuid not null references public.schueler (id) on delete cascade,
  aufgabe_id uuid not null references public.aufgaben (id) on delete cascade,
  paket_id uuid references public.pakete (id) on delete set null,
  tag date not null,                       -- Kalendertag (Berlin) des Starts
  runden smallint[] not null,              -- gezogene Runden (Nummer in loesung.runden, ab 0) in Spielreihenfolge
  fassung timestamptz not null,            -- aufgaben.geaendert_am beim Start; ändert die Lehrkraft die Übung, beginnt er neu
  ergebnisse jsonb not null default '[]',  -- je geprüfter Runde { nr, richtig, anteil, antworten, ergebnis }
  begonnen_am timestamptz not null default now(),
  fertig_am timestamptz,
  anteil numeric(4, 3),                    -- Anteil richtiger Runden (Diktat: Genauigkeit), nur für Lehrkraft/Lernstand
  befreundet boolean,
  frei_ab date,                            -- ab diesem Tag ist der nächste Durchgang erlaubt (Tag nach dem Ende)
  versuch_id uuid references public.versuche (id) on delete set null
);
create index on public.durchgaenge (schueler_id, aufgabe_id);
-- höchstens ein offener Durchgang je Schüler:in und Übung
create unique index durchgaenge_offen on public.durchgaenge (schueler_id, aufgabe_id) where fertig_am is null;

alter table public.durchgaenge enable row level security;
revoke all on public.durchgaenge from anon, authenticated;
grant select on public.durchgaenge to authenticated;
create policy "Lehrkraft: Durchgänge eigener Schüler:innen lesen" on public.durchgaenge
  for select to authenticated
  using (exists (select 1 from public.schueler s where s.id = schueler_id and s.owner = (select auth.uid())));

-- ---------- Hilfen ----------
create function public.berlin_tag(p_zeit timestamptz) returns date
language sql immutable set search_path = '' as $$ select (p_zeit at time zone 'Europe/Berlin')::date $$;

-- Übung = hat Runden (Erklärseiten und alte Aufgaben nicht)
create function public.ist_uebung(p_a public.aufgaben) returns boolean
language sql immutable set search_path = '' as $$
  select p_a.typ <> 'erklaerung' and p_a.loesung ? 'runden'
$$;

-- Runden für einen neuen Durchgang: bevorzugt nie gespielte, dann zuletzt falsche, dann richtige; innerhalb zufällig.
-- Diktate: immer alle Runden in ihrer Reihenfolge (kein Pool).
create function public.runden_ziehen(p_s public.schueler, p_a public.aufgaben) returns smallint[]
language sql volatile set search_path = '' as $$
  with alle as (
    select (n - 1)::smallint as nr from generate_series(1, jsonb_array_length(p_a.loesung -> 'runden')) n
  ),
  zuletzt as (
    select distinct on ((e ->> 'nr')::int) (e ->> 'nr')::int as nr, (e ->> 'richtig')::boolean as richtig
    from public.durchgaenge d, jsonb_array_elements(d.ergebnisse) e
    where d.schueler_id = p_s.id and d.aufgabe_id = p_a.id and d.fertig_am is not null
    order by (e ->> 'nr')::int, d.fertig_am desc
  ),
  gewaehlt as (
    select a.nr, random() as zufall
    from alle a left join zuletzt z on z.nr = a.nr
    order by case when z.nr is null then 0 when not z.richtig then 1 else 2 end, random()
    limit case when p_a.typ = 'diktat' then null else p_a.runden_je_durchgang end
  )
  select array_agg(nr order by case when p_a.typ = 'diktat' then nr end, zufall) from gewaehlt
$$;

-- Hat die Schüler:in die Übung schon einmal befreundet? (bleibt so, Konzept Abschnitt 2)
create function public.befreundet(p_schueler uuid, p_aufgabe uuid) returns boolean
language sql stable set search_path = '' as $$
  select exists (select 1 from public.durchgaenge where schueler_id = p_schueler and aufgabe_id = p_aufgabe and befreundet)
$$;

-- Was die App für einen Durchgang bekommt: Runden ohne Lösung; schon geprüfte Runden mit Ergebnis und ihrer Lösung.
create function public.durchgang_daten(p_d public.durchgaenge, p_a public.aufgaben) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'status', 'offen',
    'durchgang', p_d.id,
    'typ', p_a.typ,
    'monster', p_a.monster,
    'spiel', p_a.spiel,
    'befreundet', public.befreundet(p_d.schueler_id, p_a.id),
    'runden', (select jsonb_agg(jsonb_build_object('nr', r, 'inhalt', p_a.inhalt -> 'runden' -> r::int) order by i)
               from unnest(p_d.runden) with ordinality u (r, i)),
    'gespielt', coalesce((select jsonb_agg(jsonb_build_object(
                  'nr', e -> 'nr', 'richtig', e -> 'richtig', 'ergebnis', e -> 'ergebnis',
                  'loesung', public.nur_loesung(p_a.typ, p_a.loesung -> 'runden' -> (e ->> 'nr')::int)))
                from jsonb_array_elements(p_d.ergebnisse) e), '[]'::jsonb)
  )
$$;

-- ---------- Münzen für einen fertigen Durchgang (Konzept Abschnitt 5) ----------
-- Grund ★ 20 / ★★ 30 / ★★★ 40 × Anteil (abgerundet); beim Wiederholen nur die Differenz zum besten bisherigen Wert.
-- Freundschaft einmalig +10/15/20. Diktat: 100 % in einem Wiederholungsversuch einmalig +10/15/20.
create function public.muenzen_fuer_durchgang(p_d public.durchgaenge, p_a public.aufgaben) returns integer
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_wert integer := floor((array[20, 30, 40])[p_a.stufe] * p_d.anteil);
  v_extra integer := (array[10, 15, 20])[p_a.stufe];
  v_bisher integer;
  v_summe integer := 0;
  v_neu integer;
begin
  select coalesce(sum(muenzen), 0) into v_bisher from public.muenz_ereignisse
  where schueler_id = p_d.schueler_id and grund = 'uebung' and schluessel like 'uebung:' || p_a.id || ':%';
  if v_wert > v_bisher then
    insert into public.muenz_ereignisse (schueler_id, grund, schluessel, versuch_id, muenzen)
    values (p_d.schueler_id, 'uebung', 'uebung:' || p_a.id || ':' || p_d.id, p_d.versuch_id, v_wert - v_bisher)
    on conflict do nothing;
    get diagnostics v_neu = row_count;
    v_summe := v_summe + v_neu * (v_wert - v_bisher);
  end if;
  if p_d.befreundet then
    insert into public.muenz_ereignisse (schueler_id, grund, schluessel, versuch_id, muenzen)
    values (p_d.schueler_id, 'freundschaft', 'freundschaft:' || p_a.id, p_d.versuch_id, v_extra)
    on conflict do nothing;
    get diagnostics v_neu = row_count;
    v_summe := v_summe + v_neu * v_extra;
  end if;
  if p_a.typ = 'diktat' and p_d.anteil >= 1 and exists (
    select 1 from public.durchgaenge d
    where d.schueler_id = p_d.schueler_id and d.aufgabe_id = p_a.id and d.id <> p_d.id and d.fertig_am < p_d.fertig_am
  ) then
    insert into public.muenz_ereignisse (schueler_id, grund, schluessel, versuch_id, muenzen)
    values (p_d.schueler_id, 'diktat_voll', 'diktat_voll:' || p_a.id, p_d.versuch_id, v_extra)
    on conflict do nothing;
    get diagnostics v_neu = row_count;
    v_summe := v_summe + v_neu * v_extra;
  end if;
  return v_summe;
end
$$;

-- ---------- Durchgang beenden (intern, ruft runde_pruefen nach der letzten Runde) ----------
create function public.durchgang_beenden(p_d public.durchgaenge, p_a public.aufgaben, p_jetzt timestamptz) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_d public.durchgaenge := p_d;
  v_s public.schueler;
  v_vorher boolean := public.befreundet(p_d.schueler_id, p_a.id);
  v_v public.versuche;
  v_muenzen integer;
begin
  select * into v_s from public.schueler where id = p_d.schueler_id;
  v_d.anteil := case when p_a.typ = 'diktat'
    then (select avg((e ->> 'anteil')::numeric) from jsonb_array_elements(p_d.ergebnisse) e)
    else (select count(*) filter (where (e ->> 'richtig')::boolean)::numeric / count(*) from jsonb_array_elements(p_d.ergebnisse) e)
  end;
  v_d.anteil := round(v_d.anteil, 3);
  v_d.befreundet := v_d.anteil >= case when p_a.typ = 'diktat' then 0.95 else 1 end;
  v_d.fertig_am := p_jetzt;
  v_d.frei_ab := public.berlin_tag(p_jetzt) + 1;

  -- ein Versuch je Durchgang (client_id = Durchgang → nie doppelt) für Lernstand und Sterne
  insert into public.versuche (client_id, schueler_id, aufgabe_id, paket_id, antworten, ergebnis,
                               anteil_richtig, richtig, zaehlt_fuer_lernstand, bearbeitet_am, gespeichert_am)
  values (p_d.id, p_d.schueler_id, p_a.id, p_d.paket_id,
          jsonb_build_object('durchgang', p_d.id),
          jsonb_build_object('runden', (select jsonb_agg(jsonb_build_object('nr', e -> 'nr', 'richtig', e -> 'richtig', 'anteil', e -> 'anteil'))
                                         from jsonb_array_elements(p_d.ergebnisse) e)),
          v_d.anteil, v_d.befreundet, true, p_jetzt, p_jetzt)
  returning * into v_v;
  v_d.versuch_id := v_v.id;

  update public.durchgaenge
  set anteil = v_d.anteil, befreundet = v_d.befreundet, fertig_am = v_d.fertig_am, frei_ab = v_d.frei_ab, versuch_id = v_d.versuch_id
  where id = p_d.id;

  perform public.stufen_aktualisieren(v_s);
  v_muenzen := public.muenzen_fuer_durchgang(v_d, p_a);
  -- Schüler:innen sehen keine Prozente: nur befreundet und Münzen
  return jsonb_build_object(
    'befreundet', v_d.befreundet or v_vorher,
    'neu_befreundet', v_d.befreundet and not v_vorher,
    'muenzen', v_muenzen,
    'kontostand', public.kontostand(p_d.schueler_id)
  );
end
$$;

-- ---------- Übung starten oder fortsetzen ----------
create function public.uebung_starten_um(p_s public.schueler, p_paket_id uuid, p_aufgabe_id uuid, p_jetzt timestamptz) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_a public.aufgaben := public.zugewiesene_aufgabe(p_s, p_paket_id, p_aufgabe_id);
  v_d public.durchgaenge;
  v_frei date;
begin
  if not public.ist_uebung(v_a) then
    raise exception 'Das ist keine Übung.' using errcode = '22023';
  end if;
  select * into v_d from public.durchgaenge
  where schueler_id = p_s.id and aufgabe_id = v_a.id and fertig_am is null
  for update;
  -- Lehrkraft hat die Übung geändert: angefangener Durchgang beginnt neu (Jazz, Schritt 5, Frage 5)
  if found and v_d.fassung <> v_a.geaendert_am then
    delete from public.durchgaenge where id = v_d.id;
    v_d := null;
  end if;
  if v_d.id is not null then
    return public.durchgang_daten(v_d, v_a);
  end if;

  select max(frei_ab) into v_frei from public.durchgaenge
  where schueler_id = p_s.id and aufgabe_id = v_a.id and fertig_am is not null;
  if v_frei > public.berlin_tag(p_jetzt) then
    return jsonb_build_object('status', 'morgen', 'monster', v_a.monster, 'befreundet', public.befreundet(p_s.id, v_a.id));
  end if;

  insert into public.durchgaenge (schueler_id, aufgabe_id, paket_id, tag, runden, fassung, begonnen_am)
  values (p_s.id, v_a.id, p_paket_id, public.berlin_tag(p_jetzt), public.runden_ziehen(p_s, v_a), v_a.geaendert_am, p_jetzt)
  returning * into v_d;
  return public.durchgang_daten(v_d, v_a);
end
$$;

create function public.uebung_starten(p_token text, p_paket_id uuid, p_aufgabe_id uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
begin
  return public.uebung_starten_um(public.schueler_zum_token(p_token), p_paket_id, p_aufgabe_id, now());
end
$$;

-- ---------- Eine Runde prüfen (ein „Prüfen“, danach fest) ----------
-- Schon geprüfte Runde (doppelt gesendet): gespeichertes Ergebnis zurück, nichts neu werten.
create function public.runde_pruefen_um(p_s public.schueler, p_durchgang uuid, p_nr integer, p_antworten jsonb, p_jetzt timestamptz)
returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_d public.durchgaenge;
  v_a public.aufgaben;
  v_runde jsonb;
  v_erg jsonb;
  v_alt jsonb;
  v_abschluss jsonb := null;
begin
  if p_antworten is null or jsonb_typeof(p_antworten) <> 'object' or length(p_antworten::text) > 20000 then
    raise exception 'Ungültige Antwort.' using errcode = '22023';
  end if;
  select * into v_d from public.durchgaenge where id = p_durchgang and schueler_id = p_s.id for update;
  if not found then
    raise exception 'Diese Übung ist dir nicht zugewiesen.' using errcode = 'P0002';
  end if;
  select * into v_a from public.aufgaben where id = v_d.aufgabe_id;

  select e into v_alt from jsonb_array_elements(v_d.ergebnisse) e where (e ->> 'nr')::int = p_nr;
  if v_alt is not null then
    return jsonb_build_object('ergebnis', v_alt -> 'ergebnis', 'richtig', v_alt -> 'richtig',
      'loesung', public.nur_loesung(v_a.typ, v_a.loesung -> 'runden' -> p_nr), 'fertig', v_d.fertig_am is not null);
  end if;
  if v_d.fertig_am is not null or not (p_nr = any (v_d.runden)) then
    raise exception 'Diese Runde gehört nicht zu deiner Übung.' using errcode = '22023';
  end if;
  if v_a.archiviert or v_d.fassung <> v_a.geaendert_am then
    raise exception 'Deine Lehrkraft hat die Übung geändert. Starte sie bitte neu.' using errcode = 'P0002';
  end if;
  if v_a.typ = 'fallende_woerter' then
    -- Prüfung kommt in Schritt 11
    raise exception 'Diese Übung gibt es noch nicht.' using errcode = '0A000';
  end if;

  v_runde := v_a.loesung -> 'runden' -> p_nr;
  v_erg := public.pruefe_aufgabe(v_a.typ, v_runde, p_antworten);
  v_d.ergebnisse := v_d.ergebnisse || jsonb_build_array(jsonb_build_object(
    'nr', p_nr, 'richtig', (v_erg ->> 'richtig')::boolean, 'anteil', (v_erg ->> 'anteil')::numeric,
    'antworten', p_antworten, 'ergebnis', v_erg));
  update public.durchgaenge set ergebnisse = v_d.ergebnisse where id = v_d.id;

  if jsonb_array_length(v_d.ergebnisse) = cardinality(v_d.runden) then
    v_abschluss := public.durchgang_beenden(v_d, v_a, p_jetzt);
  end if;
  return jsonb_build_object('ergebnis', v_erg, 'richtig', (v_erg ->> 'richtig')::boolean,
    'loesung', public.nur_loesung(v_a.typ, v_runde), 'fertig', v_abschluss is not null, 'abschluss', v_abschluss);
end
$$;

create function public.runde_pruefen(p_token text, p_durchgang uuid, p_nr integer, p_antworten jsonb) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
begin
  return public.runde_pruefen_um(public.schueler_zum_token(p_token), p_durchgang, p_nr, p_antworten, now());
end
$$;

-- ---------- Lehrkraft: Versuch früher freigeben (löscht nichts) ----------
-- Für eine oder mehrere Schüler:innen (ganze Klasse = alle ihre ids), eine Übung oder alle (p_aufgabe null).
create function public.versuch_freigeben(p_schueler uuid[], p_aufgabe uuid default null) returns integer
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_anzahl integer;
begin
  update public.durchgaenge d set frei_ab = public.berlin_tag(now())
  where d.schueler_id = any (p_schueler)
    and exists (select 1 from public.schueler s where s.id = d.schueler_id and s.owner = (select auth.uid()))
    and (p_aufgabe is null or d.aufgabe_id = p_aufgabe)
    and d.fertig_am is not null and d.frei_ab > public.berlin_tag(now());
  get diagnostics v_anzahl = row_count;
  return v_anzahl;
end
$$;

-- ---------- Sterne-Aufstieg (Jazz, Schritt 5): mindestens 2 Übungen, 80 % im ERSTEN Versuch (Anteil) ----------
drop function public.stufe_aufstieg(integer, integer);
create or replace function public.stufen_regel(out prozent integer, out mindestens integer)
language sql immutable set search_path = '' as $$
  select 80, 2
$$;
create function public.stufe_aufstieg(p_bearbeitet integer, p_richtig numeric) returns boolean
language sql immutable set search_path = '' as $$
  select p_bearbeitet >= r.mindestens and p_richtig * 100 >= r.prozent * p_bearbeitet
  from public.stufen_regel() r
$$;

-- wie bisher, aber der erste Versuch zählt mit seinem Anteil (eine Übung hat mehrere Runden)
create or replace function public.stufen_aktualisieren(p_s public.schueler) returns void
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_kc text := public.schueler_kc(p_s);
  v_bereich text;
  v_stufe integer;
  v_bearbeitet integer;
  v_richtig numeric;
begin
  for v_bereich in
    select distinct public.aufgabe_bereich(v.aufgabe_id, v_kc) from public.versuche v where v.schueler_id = p_s.id
  loop
    v_stufe := coalesce((select stufe from public.schueler_stufen where schueler_id = p_s.id and bereich = v_bereich), 1);
    while v_stufe < 3 loop
      select count(*), coalesce(sum(erster_anteil), 0)
      into v_bearbeitet, v_richtig
      from (
        select (array_agg(v.anteil_richtig order by v.bearbeitet_am, v.gespeichert_am))[1] as erster_anteil
        from public.versuche v
        join public.aufgaben a on a.id = v.aufgabe_id
        where v.schueler_id = p_s.id and v.zaehlt_fuer_lernstand and a.typ <> 'erklaerung'
          and a.stufe = v_stufe
          and public.aufgabe_bereich(a.id, v_kc) = v_bereich
        group by v.aufgabe_id
      ) je_aufgabe;
      exit when not public.stufe_aufstieg(v_bearbeitet, v_richtig);
      v_stufe := v_stufe + 1;
    end loop;
    if v_stufe > 1 then
      insert into public.schueler_stufen (schueler_id, owner, bereich, stufe)
      values (p_s.id, p_s.owner, v_bereich, v_stufe)
      on conflict (schueler_id, bereich) do update
        set stufe = excluded.stufe, geaendert_am = now()
        where excluded.stufe > public.schueler_stufen.stufe;
    end if;
  end loop;
end
$$;

-- ---------- Zurücksetzen löscht auch die Durchgänge (Jazz, Schritt 5, Frage 6) ----------
create or replace function public.ergebnisse_zuruecksetzen(p_schueler uuid[]) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_ids uuid[];
begin
  select coalesce(array_agg(id), '{}') into v_ids
  from public.schueler where id = any(p_schueler) and owner = (select auth.uid());
  delete from public.pflanzungen where schueler_id = any(v_ids);
  delete from public.vorrat where schueler_id = any(v_ids);
  delete from public.belohnungen where schueler_id = any(v_ids);
  delete from public.besitz where schueler_id = any(v_ids);
  delete from public.muenz_ereignisse where schueler_id = any(v_ids);
  delete from public.durchgaenge where schueler_id = any(v_ids);
  delete from public.versuche where schueler_id = any(v_ids);
  delete from public.loesung_angesehen where schueler_id = any(v_ids);
  delete from public.schueler_stufen where schueler_id = any(v_ids);
  return cardinality(v_ids);
end
$$;

-- ---------- Startseite: je Übung Monster, befreundet, angefangen, morgen; Leseschrift ----------
create or replace function public.schueler_start(p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_heute date := public.berlin_tag(now());
begin
  return jsonb_build_object(
    'pseudonym', v_s.pseudonym,
    'leseschrift', v_s.leseschrift,
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
                -- Übungen holen ihre Runden über uebung_starten
                'inhalt', case when public.ist_uebung(a) then null else a.inhalt end,
                'uebung', public.ist_uebung(a),
                'monster', a.monster,
                'versuche', (select count(*) from public.versuche v where v.schueler_id = v_s.id and v.aufgabe_id = a.id),
                'geloest', exists (select 1 from public.versuche v where v.schueler_id = v_s.id and v.aufgabe_id = a.id and v.richtig),
                'loesung_angesehen', exists (select 1 from public.loesung_angesehen l where l.schueler_id = v_s.id and l.aufgabe_id = a.id),
                'befreundet', public.befreundet(v_s.id, a.id),
                'angefangen', exists (select 1 from public.durchgaenge d where d.schueler_id = v_s.id and d.aufgabe_id = a.id and d.fertig_am is null),
                'morgen', not exists (select 1 from public.durchgaenge d where d.schueler_id = v_s.id and d.aufgabe_id = a.id and d.fertig_am is null)
                          and coalesce((select max(d.frei_ab) from public.durchgaenge d
                                        where d.schueler_id = v_s.id and d.aufgabe_id = a.id and d.fertig_am is not null) > v_heute, false)
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

-- ---------- Rechte ----------
revoke execute on function public.berlin_tag(timestamptz), public.ist_uebung(public.aufgaben),
  public.runden_ziehen(public.schueler, public.aufgaben), public.befreundet(uuid, uuid),
  public.durchgang_daten(public.durchgaenge, public.aufgaben), public.muenzen_fuer_durchgang(public.durchgaenge, public.aufgaben),
  public.durchgang_beenden(public.durchgaenge, public.aufgaben, timestamptz),
  public.uebung_starten_um(public.schueler, uuid, uuid, timestamptz),
  public.runde_pruefen_um(public.schueler, uuid, integer, jsonb, timestamptz),
  public.stufe_aufstieg(integer, numeric),
  public.uebung_starten(text, uuid, uuid), public.runde_pruefen(text, uuid, integer, jsonb),
  public.versuch_freigeben(uuid[], uuid)
  from public, anon, authenticated;
-- Schüler:innen (Token) und Lehrkraft
grant execute on function public.uebung_starten(text, uuid, uuid), public.runde_pruefen(text, uuid, integer, jsonb) to anon, authenticated;
grant execute on function public.versuch_freigeben(uuid[], uuid) to authenticated;
