-- Übungsumbau (Jazz 2026-11-13): Gießen passend zu den neuen Übungen.
-- Jede fertige Übung gießt alle Felder: +1 je richtiger Runde, mindestens +1, auch beim Wiederholen ohne neue Münzen.
-- Münzen aus Übungen, Freundschaft, Diktat-100-%-Zusatz, Lehrkraft und Verkauf gießen nicht (sonst doppelt gezählt).
-- Alte Ergebnisse (Aufgaben, Erklärseiten, alte Diktate) gießen wie bisher +1 je Münz-Ereignis. Wachsen von selbst unverändert.
create or replace function public.wachstum(p public.pflanzungen) returns integer
language sql stable set search_path = '' as $$
  select (
    select count(*) from public.muenz_ereignisse m
    where m.schueler_id = p.schueler_id and m.erstellt_am > p.gepflanzt_am
      and m.grund not in ('lehrkraft', 'verkauf', 'uebung', 'freundschaft', 'diktat_voll')
  )::integer + (
    select coalesce(sum(greatest(1, (select count(*) from jsonb_array_elements(d.ergebnisse) e where (e ->> 'richtig')::boolean))), 0)
    from public.durchgaenge d
    where d.schueler_id = p.schueler_id and d.fertig_am > p.gepflanzt_am
  )::integer + least(
    (now() at time zone 'Europe/Berlin')::date - (p.gepflanzt_am at time zone 'Europe/Berlin')::date,
    (select a.bedarf / 2 from public.shop_artikel a where a.id = p.sorte)
  )
$$;
