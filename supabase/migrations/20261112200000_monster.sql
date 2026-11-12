-- Aufgabe 41b (docs/SPEC-monster.md): Monster über der Aufgabe. Treffer und „besiegt“ rechnet nur der Server aus den Versuchen.
-- Treffer = sichtbare Aufgabe (keine Erklärseite) mit einem richtigen Versuch vor „Lösung ansehen“
-- (zaehlt_fuer_lernstand ist danach false), auch im zweiten Versuch. Monster nach der höchsten Sterne-Stufe:
-- 1 Rübchen, 2 Schleim, 3 Ork. besiegt = alle getroffen; durch = alles schon versucht (dann „nochmal versuchen“).
-- Kein Kampf (null), wenn das Paket nur Erklärseiten hat.
create function public.kampf(p_s public.schueler, p_paket uuid) returns jsonb
language sql stable set search_path = '' as $$
  select case when count(*) > 0 then jsonb_build_object(
    'monster', max(a.stufe),
    'gesamt', count(*),
    'treffer', count(*) filter (where t.treffer),
    'durch', bool_and(t.versucht)
  ) end
  from public.aufgaben a
  cross join lateral (
    select
      exists (select 1 from public.versuche v
              where v.schueler_id = p_s.id and v.aufgabe_id = a.id and v.richtig and v.zaehlt_fuer_lernstand) as treffer,
      exists (select 1 from public.versuche v where v.schueler_id = p_s.id and v.aufgabe_id = a.id) as versucht
  ) t
  where a.typ <> 'erklaerung' and a.id in (select public.sichtbare_aufgaben(p_s, p_paket))
$$;
revoke execute on function public.kampf(public.schueler, uuid) from public, anon, authenticated;

-- Startseite wie bisher, je Paket zusätzlich 'kampf'
create or replace function public.schueler_start(p_token text) returns jsonb
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
          ), '[]'::jsonb),
          'kampf', public.kampf(v_s, p.id)
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
