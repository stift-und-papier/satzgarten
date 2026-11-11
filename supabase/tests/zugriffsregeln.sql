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

  -- ---------- 4 Aufgaben (Phase 4) ----------
  insert into public.kompetenzen (owner, code, kerncurriculum, bereich, stufe, kompetenz) values
    (c_lk_a, 'T-2', 'Realschule', 'Test', '6', 'Testkompetenz A2');
  insert into public.aufgaben (owner, typ, titel, loesung) values
    (c_lk_b, 'lueckentext', 'B-Aufgabe', '{"teile":[{"t":"luecke","id":0,"loesungen":["x"]}]}');

  set local role anon;
  begin
    perform 1 from public.aufgaben;
    raise exception 'Block 4.1: anon kann aufgaben lesen';
  exception when insufficient_privilege then n := n + 1;
  end;
  begin
    perform public.pruefe_aufgabe('lueckentext', '{}'::jsonb, '{}'::jsonb);
    raise exception 'Block 4.2: anon darf pruefe_aufgabe aufrufen';
  exception when insufficient_privilege then n := n + 1;
  end;
  reset role;

  perform set_config('request.jwt.claims', json_build_object('sub', c_lk_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  -- je Format eine Aufgabe, so wie der Editor sie speichert (nur loesung, inhalt macht die Datenbank)
  insert into public.aufgaben (typ, titel, loesung) values
    ('lueckentext', 'T-lueckentext', '{"gross_klein_beachten":true,"text":"Ich weiß, [dass] du kommst.","teile":[
      {"t":"text","v":"Ich weiß, "},{"t":"luecke","id":0,"loesungen":["dass"]},{"t":"text","v":" du kommst."}]}'),
    ('auswahl', 'T-auswahl', '{"teile":[{"t":"auswahl","id":0,"optionen":["das","dass"],"richtig":[1]},
      {"t":"auswahl","id":1,"optionen":["Hund","laufen","Baum"],"richtig":[0,2]}]}'),
    ('zuordnen', 'T-zuordnen', '{"kategorien":["Subjekt","Prädikat"],"teile":[
      {"t":"einheit","id":0,"v":"Der Hund","kategorie":"Subjekt"},{"t":"text","v":" "},
      {"t":"einheit","id":1,"v":"bellt","kategorie":"Prädikat"},{"t":"einheit","id":2,"v":"laut","kategorie":null}]}'),
    ('fehler', 'T-fehler', '{"korrigieren":true,"anzahl_zeigen":true,"teile":[
      {"t":"wort","id":0,"v":"Ich","korrekturen":null},{"t":"text","v":" "},{"t":"wort","id":1,"v":"weis","korrekturen":["weiß"]},
      {"t":"text","v":" "},{"t":"wort","id":2,"v":"es.","korrekturen":null}]}'),
    ('reihenfolge', 'T-reihenfolge', '{"teile":[{"t":"reihe","id":0,"satzart":"Aussagesatz","zeichen":".","varianten":2,
      "bausteine":[{"k":"zzz","v":"gestern"},{"k":"aaa","v":"bin ich"},{"k":"mmm","v":"ins Kino"},{"k":"bbb","v":"gegangen"}],
      "loesungen":[["Gestern","bin ich","ins Kino","gegangen."],["Ins Kino","bin ich","gestern","gegangen."]]}]}'),
    ('ueberarbeiten', 'T-ueberarbeiten', '{"teile":[{"t":"versionen","id":0,"kontext":"Im Zoo.","optionen":["A","B"],
      "richtig":[1],"hinweise":["Hinweis A","Hinweis B"]}]}'),
    ('erklaerung', 'T-erklaerung', '{"teile":[],"erklaerung":{"text":"Text","merke":"Merke","beispiele":["Beispiel"]}}');
  if (select count(*) from public.aufgaben) <> 7 then
    raise exception 'Block 4.3: A sieht % Aufgaben statt der eigenen 7', (select count(*) from public.aufgaben);
  end if;
  n := n + 1;
  begin
    insert into public.aufgaben (typ, titel, loesung, inhalt) values ('lueckentext', 'Trick', '{}', '{"teile":[]}');
    raise exception 'Block 4.4: A kann inhalt selbst schreiben (muss aus loesung entstehen)';
  exception when insufficient_privilege then n := n + 1;
  end;
  begin
    insert into public.aufgabe_kompetenzen (aufgabe_id, kompetenz_id)
    select a.id, k.id from public.aufgaben a, public.kompetenzen k where a.titel = 'T-auswahl' and k.code = 'T-1';
    raise exception 'Block 4.5: A konnte eine ausgeblendete Kompetenz zuordnen';
  exception when insufficient_privilege then n := n + 1;
  end;
  insert into public.aufgabe_kompetenzen (aufgabe_id, kompetenz_id)
  select a.id, k.id from public.aufgaben a, public.kompetenzen k where a.titel = 'T-auswahl' and k.code = 'T-2';
  reset role;
  begin
    perform set_config('request.jwt.claims', json_build_object('sub', c_lk_a, 'role', 'authenticated')::text, true);
    set local role authenticated;
    insert into public.aufgabe_kompetenzen (aufgabe_id, kompetenz_id)
    select a.id, (select id from public.kompetenzen where owner = c_lk_b and code = 'T-1')
    from public.aufgaben a where a.titel = 'T-auswahl';
    raise exception 'Block 4.6: A konnte eine Kompetenz von B zuordnen';
  exception when insufficient_privilege or not_null_violation then n := n + 1;
  end;
  reset role;
  if (select count(*) from public.aufgabe_kompetenzen ak join public.aufgaben a on a.id = ak.aufgabe_id where a.owner = c_lk_a) <> 1 then
    raise exception 'Block 4.7: A kann eine eigene Kompetenz nicht zuordnen';
  end if;
  n := n + 1;

  -- Keine Lösung in der Schüler-Fassung (je Format ein Block)
  declare
    v_typ text;
    v_inhalt jsonb;
  begin
    for v_typ, v_inhalt in select typ, inhalt from public.aufgaben where owner = c_lk_a loop
      if v_inhalt::text ~ '"(loesungen|richtig|korrekturen|kategorie|hinweise|gross_klein_beachten)"'
         or v_inhalt ? 'text' then
        raise exception 'Block 4.8: Schüler-Fassung (%) enthält eine Lösung: %', v_typ, v_inhalt;
      end if;
      n := n + 1;
    end loop;
  end;
  if (select inhalt::text ~ 'dass' from public.aufgaben where titel = 'T-lueckentext')
     or (select inhalt::text ~ 'weiß' from public.aufgaben where titel = 'T-fehler')
     or (select (inhalt ->> 'anzahl_fehler')::int from public.aufgaben where titel = 'T-fehler') <> 1
     or (select inhalt -> 'teile' -> 0 -> 'bausteine' -> 0 ->> 'k' from public.aufgaben where titel = 'T-reihenfolge') <> 'aaa'
     or (select (inhalt -> 'teile' -> 1 ->> 'mehrfach')::boolean from public.aufgaben where titel = 'T-auswahl') is not true
     or (select inhalt -> 'erklaerung' ->> 'merke' from public.aufgaben where titel = 'T-erklaerung') <> 'Merke' then
    raise exception 'Block 4.9: Schüler-Fassung ist unvollständig oder verrät etwas';
  end if;
  n := n + 1;

  -- Prüfen (wie alt): je Format richtig und nicht richtig
  declare
    function_ok boolean;
    l jsonb;
  begin
    for function_ok, l in
      select (public.pruefe_aufgabe(a.typ, a.loesung, t.antwort) ->> 'richtig')::boolean = t.soll, a.loesung
      from public.aufgaben a
      join (values
        ('T-lueckentext', '{"0":"dass"}'::jsonb, true), ('T-lueckentext', '{"0":"Dass"}', false),
        ('T-auswahl', '{"0":[1],"1":[2,0]}', true), ('T-auswahl', '{"0":[1],"1":[0]}', false),
        ('T-zuordnen', '{"0":"Subjekt","1":"Prädikat"}', true), ('T-zuordnen', '{"0":"Subjekt","1":"Prädikat","2":"Subjekt"}', false),
        ('T-fehler', '{"1":"weiß"}', true), ('T-fehler', '{"1":true}', false), ('T-fehler', '{}', false),
        ('T-reihenfolge', '{"0":[["zzz","aaa","mmm","bbb"],["mmm","aaa","zzz","bbb"]]}', true),
        ('T-reihenfolge', '{"0":[["zzz","aaa","mmm","bbb"],["zzz","aaa","mmm","bbb"]]}', false),
        ('T-ueberarbeiten', '{"0":[1]}', true), ('T-ueberarbeiten', '{"0":[0]}', false),
        ('T-erklaerung', '{}', true)
      ) t (titel, antwort, soll) on t.titel = a.titel
      where a.owner = c_lk_a
    loop
      if not function_ok then raise exception 'Block 4.10: pruefe_aufgabe bewertet falsch: %', l; end if;
    end loop;
    n := n + 1;
  end;
  if (select public.pruefe_aufgabe('fehler', loesung, '{}') -> 'luecken' -> 0 -> 'id' from public.aufgaben where titel = 'T-fehler') <> 'null'::jsonb
     or (select public.pruefe_aufgabe('ueberarbeiten', loesung, '{"0":[0]}') -> 'luecken' -> 0 -> 'hinweise'
         from public.aufgaben where titel = 'T-ueberarbeiten') <> '["Hinweis A","Hinweis B"]'::jsonb then
    raise exception 'Block 4.11: nicht gefundener Fehler wird verraten oder Hinweise fehlen nach dem Prüfen';
  end if;
  n := n + 1;

  raise exception 'ALLE TESTS BESTANDEN (%)', n;
end
$test$;
