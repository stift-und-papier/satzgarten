-- Münzen „einmal pro Tag“ zählen nach dem Tag, an dem die Antwort beim Server ankommt (gespeichert_am),
-- nicht nach dem Zeitpunkt vom iPad (bearbeitet_am). Sonst ließe sich dieselbe Aufgabe mit 14 verschiedenen
-- Tagen 14-mal abrechnen. Der Lernstand nutzt weiter bearbeitet_am (Offline-Antworten bleiben richtig einsortiert).
create or replace function public.muenzen_fuer_versuch(p_v public.versuche) returns integer
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_a public.aufgaben;
  v_tag date := (p_v.gespeichert_am at time zone 'Europe/Berlin')::date;
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
    and (v.gespeichert_am at time zone 'Europe/Berlin')::date = v_tag
    and v.gespeichert_am <= p_v.gespeichert_am;
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
