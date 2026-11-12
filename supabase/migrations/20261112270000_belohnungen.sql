-- Belohnung für Lernfortschritt (docs/SPEC-felder.md, Lehrkraft 2026-11-12):
-- Wird eine Kompetenz im Lernweg „besser“, gibt es einmalig einen besonderen Samen (abwechselnd Tulpe, Rose),
-- bei „deutlich besser“ einmalig eine besondere Deko (abwechselnd Katzenblume rosa, blau). Springt eine Kompetenz
-- gleich auf „deutlich“, gibt es beides. Je Kompetenz und Stufe nur einmal. Nur der Server entscheidet.

create table public.belohnungen (
  id uuid primary key default gen_random_uuid(),
  schueler_id uuid not null references public.schueler (id) on delete cascade,
  kompetenz_id uuid not null references public.kompetenzen (id) on delete cascade,
  stufe text not null check (stufe in ('besser', 'deutlich')),
  artikel_id text not null references public.shop_artikel (id),
  erstellt_am timestamptz not null default now(),
  gesehen_am timestamptz,
  unique (schueler_id, kompetenz_id, stufe)
);
create index on public.belohnungen (kompetenz_id);
alter table public.belohnungen enable row level security;
create policy "Lehrkraft: Belohnungen eigener Schüler:innen lesen" on public.belohnungen
  for select to authenticated
  using (exists (select 1 from public.schueler s where s.id = schueler_id and s.owner = (select auth.uid())));
grant select on public.belohnungen to authenticated;

-- Kategorie im Lernweg (eine Stelle für Lernweg und Belohnung)
create function public.lern_kategorie(a jsonb, e public.einstellungen) returns text
language sql immutable set search_path = '' as $$
  select case
    when a is null or (a ->> 'punkte') is null or not (a ->> 'trend_gueltig')::boolean
         and coalesce((a ->> 'neue_seit_vergleich')::int, 0) < e.trend_min_neue then 'erste'
    when (a ->> 'trend_gueltig')::boolean and (a ->> 'trend_punkte')::numeric > 0
         and (a ->> 'trend_stufen')::int >= 2 then 'deutlich'
    when (a ->> 'trend_gueltig')::boolean and (a ->> 'trend_punkte')::numeric > 0 then 'besser'
    else 'dranbleiben'
  end
$$;

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
         where v.schueler_id = v_s.id and v.richtig) as geloest
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
    -- Nur Name, Bereich, Kategorie und Anzahl gelöster Aufgaben – KEINE Punkte, KEINE Stufen.
    v_eintraege := v_eintraege || jsonb_build_object(
      'name', r.name, 'bereich', r.bereich, 'kategorie', v_kategorie, 'geloest', r.geloest
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

-- Neue Belohnungen vergeben und alle noch nicht gezeigten zurückgeben (ohne Punkte oder Stufen)
create function public.belohnungen_holen(p_token text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_kc text := public.schueler_kc(v_s);
  e public.einstellungen;
  r record;
  v_kat text;
  v_id uuid;
  v_artikel text;
begin
  select * into e from public.einstellungen where owner = v_s.owner;
  if v_kc is not null and e.owner is not null then
    for r in
      select k.id from public.kompetenzen k
      where k.owner = v_s.owner and k.kerncurriculum = v_kc and not k.ausgeblendet
        and (select count(*) from public.belohnungen b where b.schueler_id = v_s.id and b.kompetenz_id = k.id) < 2
        and exists (
          select 1 from public.versuche v
          join public.aufgabe_kompetenzen ak on ak.aufgabe_id = v.aufgabe_id and ak.kompetenz_id = k.id
          where v.schueler_id = v_s.id
        )
      order by k.sortierung
    loop
      v_kat := public.lern_kategorie(public.auswertung(v_s.id, r.id, e), e);
      if v_kat in ('besser', 'deutlich') then
        v_artikel := case when (select count(*) from public.belohnungen b where b.schueler_id = v_s.id and b.stufe = 'besser') % 2 = 0
                          then 'tulpe' else 'rose' end;
        v_id := null;
        insert into public.belohnungen (schueler_id, kompetenz_id, stufe, artikel_id) values (v_s.id, r.id, 'besser', v_artikel)
        on conflict do nothing returning id into v_id;
        if v_id is not null then insert into public.besitz (schueler_id, artikel_id, preis) values (v_s.id, v_artikel, 0); end if;
      end if;
      if v_kat = 'deutlich' then
        v_artikel := case when (select count(*) from public.belohnungen b where b.schueler_id = v_s.id and b.stufe = 'deutlich') % 2 = 0
                          then 'katze_rosa' else 'katze_blau' end;
        v_id := null;
        insert into public.belohnungen (schueler_id, kompetenz_id, stufe, artikel_id) values (v_s.id, r.id, 'deutlich', v_artikel)
        on conflict do nothing returning id into v_id;
        if v_id is not null then insert into public.besitz (schueler_id, artikel_id, preis) values (v_s.id, v_artikel, 0); end if;
      end if;
    end loop;
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', b.id, 'kompetenz', coalesce(nullif(btrim(k.kurzname), ''), k.bereich), 'stufe', b.stufe, 'artikel', b.artikel_id, 'name', a.name
    ) order by b.erstellt_am, b.stufe)
    from public.belohnungen b
    join public.kompetenzen k on k.id = b.kompetenz_id
    join public.shop_artikel a on a.id = b.artikel_id
    where b.schueler_id = v_s.id and b.gesehen_am is null
  ), '[]'::jsonb);
end
$$;

-- Fenster geschlossen: diese Belohnungen gelten als gesehen (nur die eigenen)
create function public.belohnungen_gesehen(p_token text, p_ids uuid[]) returns void
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
begin
  update public.belohnungen set gesehen_am = now() where schueler_id = v_s.id and id = any(p_ids) and gesehen_am is null;
end
$$;

-- Zurücksetzen löscht auch die Belohnungen (sonst gäbe es sie nach dem Zurücksetzen nie wieder)
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
  delete from public.versuche where schueler_id = any(v_ids);
  delete from public.loesung_angesehen where schueler_id = any(v_ids);
  delete from public.schueler_stufen where schueler_id = any(v_ids);
  return cardinality(v_ids);
end
$$;

revoke execute on function public.lern_kategorie(jsonb, public.einstellungen) from public, anon, authenticated;
revoke execute on function public.belohnungen_holen(text), public.belohnungen_gesehen(text, uuid[]) from public, anon, authenticated;
grant execute on function public.belohnungen_holen(text), public.belohnungen_gesehen(text, uuid[]) to anon, authenticated;
