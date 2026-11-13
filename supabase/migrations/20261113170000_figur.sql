-- Übungsumbau (Jazz, 2026-11-13): Spielfigur je Schüler:in wählbar (Reiter „Einstellungen“): Grün, Blau oder Katze.
-- Die gewählte Figur läuft auf der Farm und kämpft in den Übungen. Gespeichert in der Datenbank, damit sie auf jedem iPad gilt.
alter table public.schueler add column figur text not null default 'gruen' check (figur in ('gruen', 'blau', 'katze'));

-- Schüler:in wählt ihre Figur (nur über den eigenen Token)
create function public.figur_waehlen(p_token text, p_figur text) returns void
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
begin
  if p_figur is null or p_figur not in ('gruen', 'blau', 'katze') then
    raise exception 'Diese Figur gibt es nicht.' using errcode = '22023';
  end if;
  update public.schueler set figur = p_figur where id = v_s.id;
end
$$;
revoke execute on function public.figur_waehlen(text, text) from public, anon, authenticated;
grant execute on function public.figur_waehlen(text, text) to anon, authenticated;

-- schueler_start liefert zusätzlich die Figur (sonst unverändert aus 20261113150000_uebungen_runden.sql)
create or replace function public.schueler_start(p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_heute date := public.berlin_tag(now());
begin
  return jsonb_build_object(
    'pseudonym', v_s.pseudonym,
    'leseschrift', v_s.leseschrift,
    'figur', v_s.figur,
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
