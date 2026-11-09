-- =====================================================================
-- Test der Zugriffsregeln (läuft gegen die echte Datenbank, ändert aber nichts:
-- am Ende wird absichtlich ein Fehler ausgelöst, damit ALLES rückgängig gemacht wird).
--
-- Ausführen:  npm run test:datenbank
-- Erfolg:     Fehlermeldung "ALLE TESTS BESTANDEN (n)" – n = Zahl der bestandenen Prüfblöcke.
-- Jede andere Meldung bedeutet: Ein Test ist fehlgeschlagen (die Meldung nennt den Block).
--
-- Aufbau: Testdaten als Verwalter anlegen, dann je Rolle prüfen:
--   anon (ohne Anmeldung) · Lehrkraft A · Lehrkraft B · später Schüler-Token.
-- Neue Prüfblöcke: nummerieren, bei Erfolg  n := n + 1;  bei Fehler  raise exception 'Block x.y: …'.
-- =====================================================================
do $test$
declare
  c_lk_a constant uuid := 'aaaaaaaa-0000-4000-8000-000000000001';
  c_lk_b constant uuid := 'bbbbbbbb-0000-4000-8000-000000000001';
  anzahl bigint;
  n integer := 0;
begin
  -- ---------- Testdaten (als Datenbank-Verwalter, umgeht die Regeln) ----------
  insert into auth.users (id, aud, role, email) values
    (c_lk_a, 'authenticated', 'authenticated', 'test-a@example.invalid'),
    (c_lk_b, 'authenticated', 'authenticated', 'test-b@example.invalid');
  insert into public.einstellungen (owner, guesse_je_stufe) values (c_lk_a, 3), (c_lk_b, 5);

  -- ---------- 1 Ohne Anmeldung (anon) ----------
  set local role anon;
  begin
    perform 1 from public.einstellungen;
    raise exception 'Block 1.1: anon kann einstellungen lesen';
  exception when insufficient_privilege then n := n + 1;
  end;
  reset role;

  -- ---------- 2 Lehrkraft A ----------
  perform set_config('request.jwt.claims', json_build_object('sub', c_lk_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into anzahl from public.einstellungen;
  if anzahl <> 1 then raise exception 'Block 2.1: A sieht % Einstellungen statt 1', anzahl; end if;
  n := n + 1;
  update public.einstellungen set guesse_je_stufe = 9 where owner = c_lk_b;
  reset role;
  if (select guesse_je_stufe from public.einstellungen where owner = c_lk_b) <> 5 then
    raise exception 'Block 2.2: A konnte Einstellungen von B ändern';
  end if;
  n := n + 1;

  -- ---------- 3 Lehrkraft B ----------
  perform set_config('request.jwt.claims', json_build_object('sub', c_lk_b, 'role', 'authenticated')::text, true);
  set local role authenticated;
  begin
    insert into public.einstellungen (owner) values (c_lk_a);
    raise exception 'Block 3.1: B konnte Einstellungen für A anlegen';
  exception when insufficient_privilege then n := n + 1;
  end;
  reset role;

  raise exception 'ALLE TESTS BESTANDEN (%)', n;
end
$test$;
