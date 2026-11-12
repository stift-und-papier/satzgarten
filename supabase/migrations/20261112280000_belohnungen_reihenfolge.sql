-- Reihenfolge der Belohnungen: laufende Nummer (in einer Abfrage haben alle dieselbe Zeit)
alter table public.belohnungen add column nr bigint generated always as identity;

create or replace function public.belohnungen_holen(p_token text) returns jsonb
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
    ) order by b.nr)
    from public.belohnungen b
    join public.kompetenzen k on k.id = b.kompetenz_id
    join public.shop_artikel a on a.id = b.artikel_id
    where b.schueler_id = v_s.id and b.gesehen_am is null
  ), '[]'::jsonb);
end
$$;
