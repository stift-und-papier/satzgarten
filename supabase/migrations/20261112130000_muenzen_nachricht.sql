-- Münzen von der Lehrkraft mit Nachricht (Lehrkraft 2026-11-12): Schüler:innen sehen sie einmal als Fenster.
alter table public.muenz_ereignisse add column gesehen_am timestamptz;

-- Kontostand und noch nicht gesehene Münzen der Lehrkraft (mit Nachricht)
drop function public.schueler_muenzen(text);
create function public.schueler_muenzen(p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
begin
  return jsonb_build_object(
    'kontostand', public.kontostand(v_s.id),
    'geschenke', coalesce((
      select jsonb_agg(jsonb_build_object('id', m.id, 'muenzen', m.muenzen, 'nachricht', m.notiz) order by m.erstellt_am)
      from public.muenz_ereignisse m
      where m.schueler_id = v_s.id and m.grund = 'lehrkraft' and m.gesehen_am is null
    ), '[]'::jsonb)
  );
end
$$;

-- Fenster geschlossen: diese Münzen gelten als gesehen (nur die eigenen)
create function public.geschenke_gesehen(p_token text, p_ids uuid[]) returns void
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
begin
  update public.muenz_ereignisse set gesehen_am = now()
  where schueler_id = v_s.id and id = any(p_ids) and grund = 'lehrkraft' and gesehen_am is null;
end
$$;

revoke execute on function public.schueler_muenzen(text), public.geschenke_gesehen(text, uuid[]) from public, anon, authenticated;
grant execute on function public.schueler_muenzen(text), public.geschenke_gesehen(text, uuid[]) to anon, authenticated;

-- Rückmeldetext ohne Gedankenstrich (Lehrkraft 2026-11-12)
alter table public.einstellungen alter column texte set default '{
    "deutlich": "Hier bist du deutlich besser geworden!",
    "besser": "Hier wirst du besser.",
    "dranbleiben": "Hier bleibst du dran. Üben lohnt sich hier besonders.",
    "erste": "Hier sammeln wir noch deine ersten Ergebnisse.",
    "gelungen": "Schon {anzahl} {aufgaben} richtig gelöst.",
    "naechster_schritt": "Übe als Nächstes:"
  }'::jsonb;
update public.einstellungen
set texte = jsonb_set(texte, '{dranbleiben}', '"Hier bleibst du dran. Üben lohnt sich hier besonders."')
where texte ->> 'dranbleiben' = 'Hier bleibst du dran – Üben lohnt sich hier besonders.';
