-- Fehlerbehebung (Schritt 8): Zwei gleichzeitige Aufrufe von uebung_starten (Doppeltipp, zwei Tabs, React-Entwicklungsmodus)
-- legten beide einen Durchgang an; der zweite scheiterte an durchgaenge_offen („duplicate key“). Jetzt: anlegen nur, wenn noch
-- keiner offen ist, sonst den offenen nehmen. Sonst unverändert aus 20261113150000_uebungen_runden.sql.
create or replace function public.uebung_starten_um(p_s public.schueler, p_paket_id uuid, p_aufgabe_id uuid, p_jetzt timestamptz) returns jsonb
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
  on conflict (schueler_id, aufgabe_id) where fertig_am is null do nothing
  returning * into v_d;
  -- ein gleichzeitiger Aufruf war schneller: dessen Durchgang nehmen
  if v_d.id is null then
    select * into v_d from public.durchgaenge where schueler_id = p_s.id and aufgabe_id = v_a.id and fertig_am is null;
  end if;
  return public.durchgang_daten(v_d, v_a);
end
$$;
