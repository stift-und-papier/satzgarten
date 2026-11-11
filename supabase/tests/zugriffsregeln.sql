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
  c_kl_a constant uuid := 'aaaaaaaa-0000-4000-8000-0000000000c1';
  c_kl_b constant uuid := 'bbbbbbbb-0000-4000-8000-0000000000c1';
  anzahl bigint;
  n integer := 0;
begin
  -- ---------- Testdaten (als Datenbank-Verwalter, umgeht die Regeln) ----------
  insert into auth.users (id, aud, role, email) values
    (c_lk_a, 'authenticated', 'authenticated', 'test-a@example.invalid'),
    (c_lk_b, 'authenticated', 'authenticated', 'test-b@example.invalid');
  insert into public.einstellungen (owner, guesse_je_stufe) values (c_lk_a, 3), (c_lk_b, 5);
  insert into public.klassen (id, owner, name, kerncurriculum) values
    (c_kl_a, c_lk_a, 'Test 7a', 'Realschule'), (c_kl_b, c_lk_b, 'Test 7b', 'Gymnasium');
  insert into public.schueler (owner, klasse_id, pseudonym) values
    (c_lk_a, c_kl_a, 'Fuchs-01'), (c_lk_a, c_kl_a, 'Eule-02'), (c_lk_b, c_kl_b, 'Dachs-03');
  insert into public.kompetenzen (owner, code, kerncurriculum, bereich, stufe, kompetenz) values
    (c_lk_a, 'T-1', 'Realschule', 'Test', '6', 'Testkompetenz A'),
    (c_lk_b, 'T-1', 'Gymnasium', 'Test', '6', 'Testkompetenz B');
  if exists (select 1 from public.schueler where owner in (c_lk_a, c_lk_b) and length(token) <> 32) then
    raise exception 'Block 0.1: Token ist nicht 32 Zeichen (192 Bit) lang';
  end if;
  n := n + 1;

  -- ---------- 1 Ohne Anmeldung (anon) ----------
  set local role anon;
  begin
    perform 1 from public.einstellungen;
    raise exception 'Block 1.1: anon kann einstellungen lesen';
  exception when insufficient_privilege then n := n + 1;
  end;
  begin
    perform 1 from public.klassen;
    raise exception 'Block 1.2: anon kann klassen lesen';
  exception when insufficient_privilege then n := n + 1;
  end;
  begin
    perform 1 from public.schueler;
    raise exception 'Block 1.3: anon kann schueler (mit Token) lesen';
  exception when insufficient_privilege then n := n + 1;
  end;
  begin
    perform 1 from public.kompetenzen;
    raise exception 'Block 1.4: anon kann kompetenzen lesen';
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
  -- echte Kompetenzen der Lehrkraft (Import) mitzählen: nur die eigene Test-Kompetenz T-1 und keine von B
  if (select count(*) from public.klassen) <> 1 or (select count(*) from public.schueler) <> 2
     or (select count(*) from public.kompetenzen where code = 'T-1') <> 1
     or exists (select 1 from public.kompetenzen where owner <> c_lk_a) then
    raise exception 'Block 2.3: A sieht Klassen, Schüler:innen oder Kompetenzen von B';
  end if;
  n := n + 1;
  begin
    insert into public.schueler (klasse_id, pseudonym) values (c_kl_b, 'Spion-99');
    raise exception 'Block 2.4: A konnte jemanden in die Klasse von B setzen';
  exception when insufficient_privilege then n := n + 1;
  end;
  begin
    insert into public.kompetenzen (code, kerncurriculum, bereich, stufe, kompetenz) values ('X', 'Realschule', 'X', '6', 'X');
    raise exception 'Block 2.5: A konnte eine Kompetenz erfinden';
  exception when insufficient_privilege then n := n + 1;
  end;
  begin
    update public.kompetenzen set kompetenz = 'geändert' where code = 'T-1';
    raise exception 'Block 2.6: A konnte den Text einer Kompetenz ändern';
  exception when insufficient_privilege then n := n + 1;
  end;
  begin
    update public.kompetenzen set kurzname = 'Test' where code = 'T-1';
    raise exception 'Block 2.10: A konnte einen Kurznamen ändern (legt nur Claude fest)';
  exception when insufficient_privilege then n := n + 1;
  end;
  update public.kompetenzen set ausgeblendet = true where code = 'T-1';
  insert into public.klassen (name, kerncurriculum) values ('Neu 5c', 'Hauptschule');
  delete from public.klassen where id = c_kl_b;
  update public.schueler set pseudonym = 'Gekapert' where klasse_id = c_kl_b;
  update public.kompetenzen set ausgeblendet = true where owner = c_lk_b;
  reset role;
  if not (select ausgeblendet from public.kompetenzen where owner = c_lk_a and code = 'T-1') then
    raise exception 'Block 2.7: A kann eine Kompetenz nicht ausblenden';
  end if;
  n := n + 1;
  if not exists (select 1 from public.klassen where owner = c_lk_a and name = 'Neu 5c') then
    raise exception 'Block 2.8: A kann keine Klasse anlegen';
  end if;
  n := n + 1;
  if not exists (select 1 from public.klassen where id = c_kl_b)
     or exists (select 1 from public.schueler where pseudonym = 'Gekapert')
     or exists (select 1 from public.kompetenzen where owner = c_lk_b and ausgeblendet) then
    raise exception 'Block 2.9: A konnte Daten von B ändern oder löschen';
  end if;
  n := n + 1;
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
