-- Phase 8, Aufgabe 35: Münzen (docs/SPEC-muenzen.md)
-- Jede Gutschrift ist ein Ereignis mit eindeutigem Schlüssel → doppelte Abgabe bringt keine doppelten Münzen.
-- Nur muenzen_fuer_versuch() vergibt Münzen für Aufgaben; die Lehrkraft kann zusätzlich Münzen schenken.
-- Kontostand = Summe der Ereignisse (Käufe kommen in Aufgabe 37 als eigene Liste dazu).

create table public.muenz_ereignisse (
  id uuid primary key default gen_random_uuid(),
  schueler_id uuid not null references public.schueler (id) on delete cascade,
  grund text not null check (grund in ('aufgabe', 'erklaerung', 'diktat', 'diktat_besser', 'diktat_fehlerfrei', 'lehrkraft')),
  -- z. B. 'aufgabe:<id>:2026-11-12' – je Schüler:in eindeutig
  schluessel text not null,
  versuch_id uuid references public.versuche (id) on delete set null,
  muenzen integer not null check (muenzen between 1 and 1000),
  notiz text check (length(notiz) <= 100),
  erstellt_am timestamptz not null default now(),
  unique (schueler_id, schluessel)
);
create index on public.muenz_ereignisse (versuch_id);

alter table public.muenz_ereignisse enable row level security;
-- Lehrkraft liest die Münzen eigener Schüler:innen; schreiben nur über Funktionen.
create policy "Lehrkraft: Münzen eigener Schüler:innen lesen" on public.muenz_ereignisse
  for select to authenticated
  using (exists (select 1 from public.schueler s where s.id = schueler_id and s.owner = (select auth.uid())));
grant select on public.muenz_ereignisse to authenticated;

create function public.kontostand(p_schueler uuid) returns integer
language sql stable set search_path = '' as $$
  select coalesce(sum(muenzen), 0)::integer from public.muenz_ereignisse where schueler_id = p_schueler
$$;

-- Münzen für einen gespeicherten Versuch. Gibt die neu vergebenen Münzen zurück.
create function public.muenzen_fuer_versuch(p_v public.versuche) returns integer
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_a public.aufgaben;
  v_tag date := (p_v.bearbeitet_am at time zone 'Europe/Berlin')::date;
  v_nr integer;
  v_bestes numeric;
  v_summe integer := 0;
  v_neu integer;
begin
  select * into v_a from public.aufgaben where id = p_v.aufgabe_id;
  -- nach „Lösung ansehen“ gibt es keine Münzen
  if exists (select 1 from public.loesung_angesehen l where l.schueler_id = p_v.schueler_id and l.aufgabe_id = v_a.id) then
    return 0;
  end if;

  if v_a.typ = 'erklaerung' then
    insert into public.muenz_ereignisse (schueler_id, grund, schluessel, versuch_id, muenzen)
    values (p_v.schueler_id, 'erklaerung', 'erklaerung:' || v_a.id, p_v.id, 5)
    on conflict do nothing;
    get diagnostics v_summe = row_count;
    return v_summe * 5;
  end if;

  if v_a.typ = 'diktat' then
    if p_v.anteil_richtig < 0.9 then return 0; end if;
    select max(v.anteil_richtig) into v_bestes from public.versuche v
    where v.schueler_id = p_v.schueler_id and v.aufgabe_id = v_a.id and v.id <> p_v.id;
    if coalesce(v_bestes, 0) < 0.9 then
      insert into public.muenz_ereignisse (schueler_id, grund, schluessel, versuch_id, muenzen)
      values (p_v.schueler_id, 'diktat', 'diktat:' || v_a.id, p_v.id, 30)
      on conflict do nothing;
      get diagnostics v_neu = row_count;
      v_summe := v_summe + v_neu * 30;
    elsif p_v.anteil_richtig > v_bestes then
      insert into public.muenz_ereignisse (schueler_id, grund, schluessel, versuch_id, muenzen)
      values (p_v.schueler_id, 'diktat_besser', 'diktat_besser:' || p_v.id, p_v.id, 10)
      on conflict do nothing;
      get diagnostics v_neu = row_count;
      v_summe := v_summe + v_neu * 10;
    end if;
    if p_v.anteil_richtig >= 1 then
      insert into public.muenz_ereignisse (schueler_id, grund, schluessel, versuch_id, muenzen)
      values (p_v.schueler_id, 'diktat_fehlerfrei', 'diktat_fehlerfrei:' || v_a.id, p_v.id, 20)
      on conflict do nothing;
      get diagnostics v_neu = row_count;
      v_summe := v_summe + v_neu * 20;
    end if;
    return v_summe;
  end if;

  -- Übrige Formate: einmal pro Tag; 1. Versuch des Tages voll, 2. Versuch halb (aufgerundet), danach nichts
  if not p_v.richtig then return 0; end if;
  select count(*) into v_nr from public.versuche v
  where v.schueler_id = p_v.schueler_id and v.aufgabe_id = v_a.id
    and (v.bearbeitet_am at time zone 'Europe/Berlin')::date = v_tag
    and (v.bearbeitet_am, v.gespeichert_am) <= (p_v.bearbeitet_am, p_v.gespeichert_am);
  if v_nr > 2 then return 0; end if;
  v_neu := (array[10, 15, 20])[v_a.stufe];
  if v_nr = 2 then v_neu := ceil(v_neu / 2.0); end if;
  insert into public.muenz_ereignisse (schueler_id, grund, schluessel, versuch_id, muenzen)
  values (p_v.schueler_id, 'aufgabe', 'aufgabe:' || v_a.id || ':' || v_tag, p_v.id, v_neu)
  on conflict do nothing;
  get diagnostics v_summe = row_count;
  return v_summe * v_neu;
end
$$;

-- Antwort abgeben (aus pakete_ueben), jetzt mit Münzen: 'muenzen' = für diesen Versuch, 'kontostand' = gesamt.
create or replace function public.antwort_abgeben(
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

  -- Schon gespeichert (doppelt gesendet)? Dann das alte Ergebnis zurückgeben, keine neuen Münzen.
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
    perform public.muenzen_fuer_versuch(v_v);
  end if;

  return jsonb_build_object(
    'ergebnis', v_v.ergebnis,
    'rueckmeldung', case when v_v.richtig then null else v_a.rueckmeldung_fehler end,
    'versuche', (select count(*) from public.versuche v where v.schueler_id = v_s.id and v.aufgabe_id = v_a.id),
    'muenzen', (select coalesce(sum(m.muenzen), 0) from public.muenz_ereignisse m where m.versuch_id = v_v.id),
    'kontostand', public.kontostand(v_s.id)
  );
end
$$;

-- Kontostand für die Schüler-Startseite (nur die eigene Zahl, keine Ranglisten)
create function public.schueler_muenzen(p_token text) returns integer
language plpgsql stable security definer set search_path = '' as $$
begin
  return public.kontostand((public.schueler_zum_token(p_token)).id);
end
$$;

-- Lehrkraft schenkt eigenen Schüler:innen Münzen (z. B. für Mitarbeit). Gibt die Zahl der Beschenkten zurück.
create function public.muenzen_schenken(p_schueler uuid[], p_muenzen integer, p_notiz text default null) returns integer
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_anzahl integer;
begin
  if p_muenzen is null or p_muenzen not between 1 and 1000 then
    raise exception 'Bitte zwischen 1 und 1000 Münzen angeben.' using errcode = '22023';
  end if;
  insert into public.muenz_ereignisse (schueler_id, grund, schluessel, muenzen, notiz)
  select s.id, 'lehrkraft', 'lehrkraft:' || gen_random_uuid(), p_muenzen, nullif(btrim(left(p_notiz, 100)), '')
  from public.schueler s
  where s.id = any(p_schueler) and s.owner = (select auth.uid());
  get diagnostics v_anzahl = row_count;
  return v_anzahl;
end
$$;

-- Zurücksetzen setzt auch die Münzen zurück
create or replace function public.ergebnisse_zuruecksetzen(p_schueler uuid[]) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_ids uuid[];
begin
  select coalesce(array_agg(id), '{}') into v_ids
  from public.schueler where id = any(p_schueler) and owner = (select auth.uid());
  delete from public.muenz_ereignisse where schueler_id = any(v_ids);
  delete from public.versuche where schueler_id = any(v_ids);
  delete from public.loesung_angesehen where schueler_id = any(v_ids);
  delete from public.schueler_stufen where schueler_id = any(v_ids);
  return cardinality(v_ids);
end
$$;

revoke execute on function public.kontostand(uuid), public.muenzen_fuer_versuch(public.versuche),
  public.schueler_muenzen(text), public.muenzen_schenken(uuid[], integer, text)
  from public, anon, authenticated;
grant execute on function public.schueler_muenzen(text) to anon, authenticated;
grant execute on function public.muenzen_schenken(uuid[], integer, text) to authenticated;
