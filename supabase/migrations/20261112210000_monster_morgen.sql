-- Lehrkraft 2026-11-12: Nach „Lösung ansehen“ trifft die Aufgabe ab dem nächsten Tag wieder (sonst wäre das Monster
-- nie zu besiegen). Treffer = richtiger Versuch vor dem Ansehen (zaehlt_fuer_lernstand) oder an einem späteren Tag
-- (Serverzeit gespeichert_am, Berlin). 'gesperrt': Aufgaben, die heute nicht mehr treffen (Lösung heute angesehen, noch kein Treffer).
create or replace function public.kampf(p_s public.schueler, p_paket uuid) returns jsonb
language sql stable set search_path = '' as $$
  select case when count(*) > 0 then jsonb_build_object(
    'monster', max(a.stufe),
    'gesamt', count(*),
    'treffer', count(*) filter (where t.treffer),
    'durch', bool_and(t.versucht),
    'gesperrt', coalesce(jsonb_agg(a.id) filter (where not t.treffer and (l.angesehen_am at time zone 'Europe/Berlin')::date = public.heute()), '[]'::jsonb)
  ) end
  from public.aufgaben a
  left join public.loesung_angesehen l on l.schueler_id = p_s.id and l.aufgabe_id = a.id
  cross join lateral (
    select
      exists (select 1 from public.versuche v
              where v.schueler_id = p_s.id and v.aufgabe_id = a.id and v.richtig
                and (v.zaehlt_fuer_lernstand
                     or (v.gespeichert_am at time zone 'Europe/Berlin')::date > (l.angesehen_am at time zone 'Europe/Berlin')::date)) as treffer,
      exists (select 1 from public.versuche v where v.schueler_id = p_s.id and v.aufgabe_id = a.id) as versucht
  ) t
  where a.typ <> 'erklaerung' and a.id in (select public.sichtbare_aufgaben(p_s, p_paket))
$$;
