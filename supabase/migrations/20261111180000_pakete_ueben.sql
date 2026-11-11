-- =====================================================================
-- Phase 6: Pakete, Zuweisungen, Üben (Versuche, Lösung ansehen), Sterne-Stufen
-- =====================================================================
-- alt (Übungswiese: kern.sql, paket_tags.sql, stufen_automatik.sql, format_erklaerung.sql), angepasst:
-- * Aufgaben haben schon eine Stufe 1–3 (aufgaben.stufe) statt leicht/mittel/schwer.
-- * Lösungen stehen in aufgaben.loesung, die Schüler-Fassung in aufgaben.inhalt (Trigger).
-- * Der KC (Zweig) einer Schüler:in kommt aus ihrer Klasse.
-- Schüler:innen kommen an keine Tabelle direkt heran, nur über die Funktionen unten (Link-Token).

-- ---------- Tabellen ----------
create table public.pakete (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titel text not null check (length(btrim(titel)) between 1 and 120),
  beschreibung text check (length(beschreibung) <= 300),
  -- Tags nur für die Lehrkraft: Jahrgänge 5–10 und Zweige, mehrere je Paket
  jahrgaenge smallint[] not null default '{}' check (jahrgaenge <@ array[5, 6, 7, 8, 9, 10]::smallint[]),
  zweige text[] not null default '{}' check (zweige <@ array['Hauptschule', 'Realschule', 'Gymnasium']::text[]),
  erstellt_am timestamptz not null default now()
);
create index on public.pakete (owner);

create table public.paket_aufgaben (
  paket_id uuid not null references public.pakete (id) on delete cascade,
  aufgabe_id uuid not null references public.aufgaben (id) on delete cascade,
  position integer not null default 0,
  primary key (paket_id, aufgabe_id)
);
create index on public.paket_aufgaben (aufgabe_id);

-- Ein Paket geht an eine ganze Klasse ODER an eine einzelne Schülerin/einen einzelnen Schüler.
create table public.zuweisungen (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  paket_id uuid not null references public.pakete (id) on delete cascade,
  klasse_id uuid references public.klassen (id) on delete cascade,
  schueler_id uuid references public.schueler (id) on delete cascade,
  erstellt_am timestamptz not null default now(),
  check ((klasse_id is null) <> (schueler_id is null))
);
create unique index on public.zuweisungen (paket_id, klasse_id) where klasse_id is not null;
create unique index on public.zuweisungen (paket_id, schueler_id) where schueler_id is not null;
create index on public.zuweisungen (klasse_id);
create index on public.zuweisungen (schueler_id);

-- Jeder Versuch wird gespeichert. client_id (vom iPad) verhindert doppeltes Speichern,
-- wenn eine Antwort bei wackligem WLAN zweimal ankommt.
create table public.versuche (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique,
  schueler_id uuid not null references public.schueler (id) on delete cascade,
  aufgabe_id uuid not null references public.aufgaben (id) on delete cascade,
  paket_id uuid references public.pakete (id) on delete set null,
  antworten jsonb not null,
  ergebnis jsonb not null,
  anteil_richtig numeric(4, 3) not null,
  richtig boolean not null,
  -- false bei Erklärseiten und nachdem die Lösung angesehen wurde
  zaehlt_fuer_lernstand boolean not null default true,
  bearbeitet_am timestamptz not null default now(),
  gespeichert_am timestamptz not null default now()
);
create index on public.versuche (schueler_id, aufgabe_id);

create table public.loesung_angesehen (
  schueler_id uuid not null references public.schueler (id) on delete cascade,
  aufgabe_id uuid not null references public.aufgaben (id) on delete cascade,
  angesehen_am timestamptz not null default now(),
  primary key (schueler_id, aufgabe_id)
);

-- Automatische Sterne-Stufe je Themenbereich (kompetenzen.bereich). Kein Eintrag = Stufe 1.
create table public.schueler_stufen (
  schueler_id uuid not null references public.schueler (id) on delete cascade,
  owner uuid not null references auth.users (id) on delete cascade,
  bereich text not null,
  stufe smallint not null check (stufe between 1 and 3),
  geaendert_am timestamptz not null default now(),
  primary key (schueler_id, bereich)
);
create index on public.schueler_stufen (owner);

-- ---------- Zugriffsregeln ----------
alter table public.pakete enable row level security;
alter table public.paket_aufgaben enable row level security;
alter table public.zuweisungen enable row level security;
alter table public.versuche enable row level security;
alter table public.loesung_angesehen enable row level security;
alter table public.schueler_stufen enable row level security;
revoke all on public.pakete, public.paket_aufgaben, public.zuweisungen, public.versuche,
  public.loesung_angesehen, public.schueler_stufen from anon;
-- Versuche, angesehene Lösungen und Stufen schreibt nur die Datenbank selbst (Schüler-Funktionen).
revoke insert, update on public.versuche, public.loesung_angesehen from authenticated;
revoke insert, update, delete on public.schueler_stufen from authenticated;

create policy "Lehrkraft: eigene Pakete" on public.pakete
  for all to authenticated
  using (owner = (select auth.uid()))
  with check (owner = (select auth.uid()));

create policy "Lehrkraft: Aufgaben in eigenen Paketen" on public.paket_aufgaben
  for all to authenticated
  using (exists (select 1 from public.pakete p where p.id = paket_id and p.owner = (select auth.uid())))
  with check (
    exists (select 1 from public.pakete p where p.id = paket_id and p.owner = (select auth.uid()))
    and exists (select 1 from public.aufgaben a where a.id = aufgabe_id and a.owner = (select auth.uid()))
  );

create policy "Lehrkraft: eigene Zuweisungen" on public.zuweisungen
  for all to authenticated
  using (owner = (select auth.uid()))
  with check (
    owner = (select auth.uid())
    and exists (select 1 from public.pakete p where p.id = paket_id and p.owner = (select auth.uid()))
    and (
      exists (select 1 from public.klassen k where k.id = klasse_id and k.owner = (select auth.uid()))
      or exists (select 1 from public.schueler s where s.id = schueler_id and s.owner = (select auth.uid()))
    )
  );

create policy "Lehrkraft: Versuche eigener Schüler:innen lesen" on public.versuche
  for select to authenticated
  using (exists (select 1 from public.schueler s where s.id = schueler_id and s.owner = (select auth.uid())));

create policy "Lehrkraft: Versuche eigener Schüler:innen löschen" on public.versuche
  for delete to authenticated
  using (exists (select 1 from public.schueler s where s.id = schueler_id and s.owner = (select auth.uid())));

create policy "Lehrkraft: angesehene Lösungen lesen" on public.loesung_angesehen
  for select to authenticated
  using (exists (select 1 from public.schueler s where s.id = schueler_id and s.owner = (select auth.uid())));

create policy "Lehrkraft: angesehene Lösungen löschen" on public.loesung_angesehen
  for delete to authenticated
  using (exists (select 1 from public.schueler s where s.id = schueler_id and s.owner = (select auth.uid())));

create policy "Lehrkraft: Stufen eigener Schüler:innen lesen" on public.schueler_stufen
  for select to authenticated using (owner = (select auth.uid()));

-- ---------- Lösung für „Lösung ansehen“ (alt: nur_loesung_formate + nur_loesung) ----------
-- Liefert je Stelle die richtigen Antworten als Text: { luecken: [{ id, loesungen: [..] }] }.
create function public.nur_loesung(p_typ text, p_loesung jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
begin
  -- Erklärseite: nichts zu lösen; Diktat: der Text war ohnehin zu sehen (eigene Anzeige)
  if p_typ in ('erklaerung', 'diktat') then
    return jsonb_build_object('luecken', '[]'::jsonb);
  end if;
  return jsonb_build_object(
    'luecken', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', t -> 'id',
        'loesungen', case
          when t ->> 't' in ('auswahl', 'versionen') then
            (select coalesce(jsonb_agg(t -> 'optionen' -> (i::int) order by i::int), '[]'::jsonb)
             from jsonb_array_elements_text(public.indexliste(t -> 'richtig')) i)
          when t ->> 't' = 'einheit' then jsonb_build_array(t -> 'kategorie')
          when t ->> 't' = 'wort' then t -> 'korrekturen'
          when t ->> 't' = 'reihe' then
            (select coalesce(jsonb_agg((select string_agg(x, ' ' order by n) from jsonb_array_elements_text(l) with ordinality s (x, n))), '[]'::jsonb)
             from jsonb_array_elements(t -> 'loesungen') l)
          else t -> 'loesungen'
        end))
      from jsonb_array_elements(p_loesung -> 'teile') t
      where t ->> 't' in ('luecke', 'auswahl', 'reihe', 'versionen')
         or (t ->> 't' = 'einheit' and t ->> 'kategorie' is not null)
         or (t ->> 't' = 'wort' and jsonb_typeof(t -> 'korrekturen') = 'array')
    ), '[]'::jsonb)
  );
end
$$;

-- ---------- Sterne-Stufen (alt: stufen_automatik.sql) ----------
-- REGEL FÜR DEN AUFSTIEG: hier und nur hier ändern.
-- Aufstieg, wenn in einem Bereich mindestens PROZENT der bearbeiteten Aufgaben dieser Stufe im ERSTEN Versuch
-- richtig waren – bei mindestens MINDESTENS bearbeiteten Aufgaben.
create function public.stufen_regel(out prozent integer, out mindestens integer)
language sql immutable set search_path = '' as $$
  select 80, 5
$$;

create function public.stufe_aufstieg(p_bearbeitet integer, p_richtig integer) returns boolean
language sql immutable set search_path = '' as $$
  select p_bearbeitet >= r.mindestens and p_richtig * 100 >= r.prozent * p_bearbeitet
  from public.stufen_regel() r
$$;

-- Themenbereich einer Aufgabe: Bereich der zugeordneten Kompetenz im KC der Schüler:in
-- (sonst irgendeine zugeordnete Kompetenz; ohne Kompetenz '' = Gruppe „ohne Bereich“).
-- shortcut: bei Kompetenzen aus mehreren Bereichen zählt der alphabetisch erste; reicht, solange Aufgaben einem Thema dienen
create function public.aufgabe_bereich(p_aufgabe uuid, p_kc text) returns text
language sql stable set search_path = '' as $$
  select coalesce(
    (select min(k.bereich) from public.aufgabe_kompetenzen ak join public.kompetenzen k on k.id = ak.kompetenz_id
     where ak.aufgabe_id = p_aufgabe and k.kerncurriculum = p_kc),
    (select min(k.bereich) from public.aufgabe_kompetenzen ak join public.kompetenzen k on k.id = ak.kompetenz_id
     where ak.aufgabe_id = p_aufgabe),
    '')
$$;

create function public.schueler_kc(p_s public.schueler) returns text
language sql stable set search_path = '' as $$
  select kerncurriculum from public.klassen where id = p_s.klasse_id
$$;

-- Stufe in einem Bereich: von der Lehrkraft gesetzt (Vorrang) vor automatisch, Start = 1
create function public.stufe_fuer(p_s public.schueler, p_bereich text) returns integer
language sql stable set search_path = '' as $$
  select coalesce(p_s.stufe_manuell::int,
    (select st.stufe::int from public.schueler_stufen st where st.schueler_id = p_s.id and st.bereich = p_bereich),
    1)
$$;

-- Automatik: je Bereich so lange aufsteigen, wie die Regel erfüllt ist. Nie zurück.
create function public.stufen_aktualisieren(p_s public.schueler) returns void
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_kc text := public.schueler_kc(p_s);
  v_bereich text;
  v_stufe integer;
  v_bearbeitet integer;
  v_richtig integer;
begin
  for v_bereich in
    select distinct public.aufgabe_bereich(v.aufgabe_id, v_kc) from public.versuche v where v.schueler_id = p_s.id
  loop
    v_stufe := coalesce((select stufe from public.schueler_stufen where schueler_id = p_s.id and bereich = v_bereich), 1);
    while v_stufe < 3 loop
      select count(*), count(*) filter (where erster_richtig)
      into v_bearbeitet, v_richtig
      from (
        select (array_agg(v.richtig order by v.bearbeitet_am, v.gespeichert_am))[1] as erster_richtig
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

-- Aufgaben eines Pakets, die eine Schüler:in sieht: je Bereich die Aufgaben ihrer Stufe. Gibt es keine auf ihrer
-- Stufe, die nächst niedrigere vorhandene, sonst die niedrigste vorhandene (Paket nie leer). Erklärseiten immer.
create function public.sichtbare_aufgaben(p_s public.schueler, p_paket uuid) returns setof uuid
language sql stable set search_path = '' as $$
  with t as (
    select a.id, a.typ, a.stufe::int as st, public.aufgabe_bereich(a.id, public.schueler_kc(p_s)) as b
    from public.paket_aufgaben pa join public.aufgaben a on a.id = pa.aufgabe_id
    where pa.paket_id = p_paket
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

-- ---------- Funktionen für Schüler:innen (alt: kern.sql) ----------
create function public.schueler_zum_token(p_token text) returns public.schueler
language plpgsql stable security definer set search_path = '' as $$
declare
  v_s public.schueler;
begin
  select * into v_s from public.schueler where token = p_token;
  if not found or p_token is null then
    raise exception 'Dieser Link ist nicht (mehr) gültig.' using errcode = 'P0002';
  end if;
  return v_s;
end
$$;

-- Die Aufgabe, wenn sie im Paket liegt und das Paket der Person zugewiesen ist.
create function public.zugewiesene_aufgabe(p_s public.schueler, p_paket_id uuid, p_aufgabe_id uuid) returns public.aufgaben
language plpgsql stable security definer set search_path = '' as $$
declare
  v_a public.aufgaben;
begin
  select a.* into v_a
  from public.aufgaben a
  join public.paket_aufgaben pa on pa.aufgabe_id = a.id
  where a.id = p_aufgabe_id
    and pa.paket_id = p_paket_id
    and exists (
      select 1 from public.zuweisungen z
      where z.paket_id = p_paket_id and (z.schueler_id = p_s.id or z.klasse_id = p_s.klasse_id)
    );
  if not found then
    raise exception 'Diese Aufgabe ist dir nicht zugewiesen.' using errcode = 'P0002';
  end if;
  return v_a;
end
$$;

-- Startseite: Pseudonym, zugewiesene Pakete (neueste zuerst) mit den sichtbaren Aufgaben (ohne Lösungen)
-- und dem eigenen Stand. formate_geuebt: Formate, die schon einmal abgegeben wurden (Einstein erklärt neue).
create function public.schueler_start(p_token text) returns jsonb
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
    ), '[]'::jsonb)
  );
end
$$;

-- Antwort abgeben: auf dem Server prüfen, als Versuch speichern, Stufen aktualisieren.
create function public.antwort_abgeben(
  p_token text,
  p_paket_id uuid,
  p_aufgabe_id uuid,
  p_antworten jsonb,
  p_client_id uuid,
  p_bearbeitet_am timestamptz default null
) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_a public.aufgaben := public.zugewiesene_aufgabe(v_s, p_paket_id, p_aufgabe_id);
  v_v public.versuche;
  v_erg jsonb;
begin
  if p_client_id is null or p_antworten is null or jsonb_typeof(p_antworten) <> 'object'
     or length(p_antworten::text) > 20000 then
    raise exception 'Ungültige Antwort.' using errcode = '22023';
  end if;

  -- Schon gespeichert (doppelt gesendet)? Dann das alte Ergebnis zurückgeben.
  select * into v_v from public.versuche where client_id = p_client_id and schueler_id = v_s.id;

  if not found then
    v_erg := public.pruefe_aufgabe(v_a.typ, v_a.loesung, p_antworten);
    insert into public.versuche (
      client_id, schueler_id, aufgabe_id, paket_id, antworten, ergebnis,
      anteil_richtig, richtig, zaehlt_fuer_lernstand, bearbeitet_am
    ) values (
      p_client_id, v_s.id, v_a.id, p_paket_id, p_antworten, v_erg,
      (v_erg ->> 'anteil')::numeric, (v_erg ->> 'richtig')::boolean,
      v_a.typ <> 'erklaerung'
        and not exists (select 1 from public.loesung_angesehen l where l.schueler_id = v_s.id and l.aufgabe_id = v_a.id),
      -- Zeitpunkt vom iPad (falls offline bearbeitet), aber nie in der Zukunft und höchstens 14 Tage zurück
      greatest(least(coalesce(p_bearbeitet_am, now()), now()), now() - interval '14 days')
    )
    returning * into v_v;
    perform public.stufen_aktualisieren(v_s);
  end if;

  return jsonb_build_object(
    'ergebnis', v_v.ergebnis,
    'rueckmeldung', case when v_v.richtig then null else v_a.rueckmeldung_fehler end,
    'versuche', (select count(*) from public.versuche v where v.schueler_id = v_s.id and v.aufgabe_id = v_a.id)
  );
end
$$;

-- Lösung ansehen: erst nach mindestens 2 Versuchen. Danach zählen weitere Versuche nicht für den Lernstand.
create function public.loesung_anzeigen(p_token text, p_paket_id uuid, p_aufgabe_id uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_a public.aufgaben := public.zugewiesene_aufgabe(v_s, p_paket_id, p_aufgabe_id);
begin
  if (select count(*) from public.versuche v where v.schueler_id = v_s.id and v.aufgabe_id = v_a.id) < 2 then
    raise exception 'Die Lösung gibt es erst nach zwei Versuchen.' using errcode = 'P0001';
  end if;
  insert into public.loesung_angesehen (schueler_id, aufgabe_id) values (v_s.id, v_a.id) on conflict do nothing;
  return public.nur_loesung(v_a.typ, v_a.loesung);
end
$$;

-- ---------- Rechte für Funktionen ----------
revoke execute on function public.nur_loesung(text, jsonb), public.stufen_regel(), public.stufe_aufstieg(integer, integer),
  public.aufgabe_bereich(uuid, text), public.schueler_kc(public.schueler), public.stufe_fuer(public.schueler, text),
  public.stufen_aktualisieren(public.schueler), public.sichtbare_aufgaben(public.schueler, uuid),
  public.schueler_zum_token(text), public.zugewiesene_aufgabe(public.schueler, uuid, uuid),
  public.schueler_start(text), public.antwort_abgeben(text, uuid, uuid, jsonb, uuid, timestamptz),
  public.loesung_anzeigen(text, uuid, uuid)
  from public, anon, authenticated;
-- Schüler:innen (nicht angemeldet) dürfen nur diese drei Funktionen aufrufen; sie prüfen den Token selbst.
grant execute on function public.schueler_start(text) to anon, authenticated;
grant execute on function public.antwort_abgeben(text, uuid, uuid, jsonb, uuid, timestamptz) to anon, authenticated;
grant execute on function public.loesung_anzeigen(text, uuid, uuid) to anon, authenticated;
