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
  -- Einstellungen legt die Datenbank beim Anlegen des Kontos selbst an (Trigger, Phase 7)
  if (select count(*) from public.einstellungen where owner in (c_lk_a, c_lk_b)) <> 2 then
    raise exception 'Block 1.0: neue Lehrkräfte bekommen keine Einstellungen';
  end if;
  update public.einstellungen set guesse_je_stufe = 3 where owner = c_lk_a;
  update public.einstellungen set guesse_je_stufe = 5 where owner = c_lk_b;
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
      {"t":"text","v":"Ich weiß, "},{"t":"luecke","id":0,"loesungen":["dass"],"hinweis":"Konjunktion"},{"t":"text","v":" du kommst."}]}'),
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
  -- erneutes Speichern wie im Editor (alle Felder, auch typ)
  update public.aufgaben set typ = 'lueckentext', titel = 'T-lueckentext', anweisung = 'Ergänze.', farbig = true, hinweis = null,
    rueckmeldung_fehler = null, stufe = 1, loesung = loesung where titel = 'T-lueckentext';
  if (select stufe from public.aufgaben where titel = 'T-lueckentext') <> 1 then
    raise exception 'Block 4.12: A kann die eigene Aufgabe nicht erneut speichern';
  end if;
  n := n + 1;
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
     or (select inhalt -> 'teile' -> 1 ->> 'hinweis' from public.aufgaben where titel = 'T-lueckentext') is distinct from 'Konjunktion'
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

  -- ---------- 5 Diktat (Phase 5) ----------
  insert into public.aufgaben (owner, typ, titel, loesung) values
    (c_lk_a, 'diktat', 'D-ab', '{"modus":"abschreiben","text":"„Hallo“, sagte er. Wir gehen.","saetze":["„Hallo“, sagte er.","Wir gehen."]}'),
    (c_lk_a, 'diktat', 'D-merk', '{"modus":"merken","text":"„Hallo“, sagte er. Wir gehen.","saetze":["„Hallo“, sagte er.","Wir gehen."]}');
  if (select inhalt ? 'text' or inhalt -> 'saetze' ->> 1 <> 'Wir gehen.' or inhalt ->> 'modus' <> 'merken'
      from public.aufgaben where titel = 'D-merk') then
    raise exception 'Block 5.1: Schüler-Fassung des Diktats falsch';
  end if;
  n := n + 1;
  declare
    l_ab jsonb := (select loesung from public.aufgaben where titel = 'D-ab');
    l_merk jsonb := (select loesung from public.aufgaben where titel = 'D-merk');
    e jsonb;
  begin
    e := public.pruefe_aufgabe('diktat', l_ab, '{"fehler":[]}');
    if not ((e ->> 'fehlerfrei')::boolean and (e ->> 'richtig')::boolean) then raise exception 'Block 5.2: Abschreiben ohne Fehler: %', e; end if;
    e := public.pruefe_aufgabe('diktat', l_ab, '{"fehler":[0, 0, 999]}');
    if (e ->> 'fehlerfrei')::boolean or not (e ->> 'richtig')::boolean then raise exception 'Block 5.3: ein Fehler = geschafft, nicht fehlerfrei: %', e; end if;
    e := public.pruefe_aufgabe('diktat', l_ab, '{"fehler":[0,1,2,3,4,5,6,7,8,9]}');
    if (e ->> 'richtig')::boolean then raise exception 'Block 5.4: viele Fehler gelten als geschafft: %', e; end if;
    e := public.pruefe_aufgabe('diktat', l_merk, '{"0":"\"Hallo\",  sagte er. ","1":"Wir gehen."}');
    if not (e ->> 'fehlerfrei')::boolean then raise exception 'Block 5.5: Typografie/Leerzeichen zählen als Fehler: %', e; end if;
    e := public.pruefe_aufgabe('diktat', l_merk, '{"0":"\"Hallo\", sagte er.","1":"wir gehen."}');
    if (e -> 'luecken' -> 1 ->> 'richtig')::boolean or not (e ->> 'richtig')::boolean or (e ->> 'fehlerfrei')::boolean then
      raise exception 'Block 5.6: Merkdiktat mit einem Fehler falsch bewertet: %', e;
    end if;
    n := n + 5;
  end;

  -- ---------- 6 Pakete und Üben (Phase 6) ----------
  declare
    t_fuchs text := (select token from public.schueler where pseudonym = 'Fuchs-01');
    t_eule text := (select token from public.schueler where pseudonym = 'Eule-02');
    t_dachs text := (select token from public.schueler where pseudonym = 'Dachs-03');
    v_paket uuid;
    v_lt uuid := (select id from public.aufgaben where titel = 'T-lueckentext');
    v_er uuid := (select id from public.aufgaben where titel = 'T-erklaerung');
    v_b_aufgabe uuid := (select id from public.aufgaben where titel = 'B-Aufgabe');
    v_start jsonb;
    v_erg jsonb;
    v_cid uuid := gen_random_uuid();
    i integer;
    v_s_ids uuid[];
  begin
    set local role anon;
    begin
      perform 1 from public.pakete;
      raise exception 'Block 6.1: anon kann pakete lesen';
    exception when insufficient_privilege then n := n + 1;
    end;
    begin
      perform 1 from public.versuche;
      raise exception 'Block 6.2: anon kann versuche lesen';
    exception when insufficient_privilege then n := n + 1;
    end;
    reset role;

    perform set_config('request.jwt.claims', json_build_object('sub', c_lk_a, 'role', 'authenticated')::text, true);
    set local role authenticated;
    insert into public.pakete (titel, jahrgaenge, zweige) values ('P-Test', '{7}', '{Realschule}') returning id into v_paket;
    insert into public.paket_aufgaben (paket_id, aufgabe_id, position)
    select v_paket, id, row_number() over (order by titel) from public.aufgaben
    where titel in ('T-lueckentext', 'T-zuordnen', 'T-auswahl', 'T-erklaerung');
    insert into public.zuweisungen (paket_id, klasse_id) values (v_paket, c_kl_a);
    begin
      insert into public.zuweisungen (paket_id, klasse_id) values (v_paket, c_kl_b);
      raise exception 'Block 6.3: A konnte ein Paket der Klasse von B zuweisen';
    exception when insufficient_privilege then n := n + 1;
    end;
    begin
      insert into public.paket_aufgaben (paket_id, aufgabe_id) values (v_paket, v_b_aufgabe);
      raise exception 'Block 6.4: A konnte eine Aufgabe von B ins Paket legen';
    exception when insufficient_privilege or not_null_violation then n := n + 1;
    end;
    begin
      insert into public.versuche (client_id, schueler_id, aufgabe_id, antworten, ergebnis, anteil_richtig, richtig)
      select gen_random_uuid(), s.id, v_lt, '{}', '{}', 1, true from public.schueler s where s.pseudonym = 'Fuchs-01';
      raise exception 'Block 6.5: Lehrkraft kann Versuche selbst schreiben';
    exception when insufficient_privilege then n := n + 1;
    end;
    reset role;

    set local role anon;
    begin
      perform public.schueler_start('falscher-token-falscher-token-xx');
      raise exception 'Block 6.6: falscher Token wird angenommen';
    exception when no_data_found then n := n + 1;
    end;
    -- Stufe 1 (Start): ohne Bereich nur T-lueckentext (★), im Bereich „Test“ gibt es nur ★★ → T-auswahl; Erklärseite immer
    v_start := public.schueler_start(t_fuchs);
    if jsonb_array_length(v_start -> 'pakete' -> 0 -> 'aufgaben') <> 3
       or v_start::text ~ 'T-zuordnen' or v_start::text !~ 'T-auswahl' then
      raise exception 'Block 6.7: Fuchs sieht die falschen Aufgaben: %', v_start;
    end if;
    if v_start::text ~ '"(loesung|loesungen|richtig|korrekturen|kategorie|gross_klein_beachten)"' then
      raise exception 'Block 6.8: schueler_start verrät eine Lösung: %', v_start;
    end if;
    if jsonb_array_length(public.schueler_start(t_dachs) -> 'pakete') <> 0 then
      raise exception 'Block 6.9: Dachs (Klasse von B) sieht das Paket von A';
    end if;
    n := n + 3;
    begin
      perform public.antwort_abgeben(t_dachs, v_paket, v_lt, '{"0":"dass"}', gen_random_uuid());
      raise exception 'Block 6.10: Dachs konnte eine nicht zugewiesene Aufgabe abgeben';
    exception when no_data_found then n := n + 1;
    end;
    -- falsch, doppelt gesendet → ein Versuch
    v_erg := public.antwort_abgeben(t_fuchs, v_paket, v_lt, '{"0":"das"}', v_cid);
    v_erg := public.antwort_abgeben(t_fuchs, v_paket, v_lt, '{"0":"das"}', v_cid);
    if (v_erg -> 'ergebnis' ->> 'richtig')::boolean or (v_erg ->> 'versuche')::int <> 1 then
      raise exception 'Block 6.11: doppelt gesendete Antwort zählt doppelt oder falsch bewertet: %', v_erg;
    end if;
    n := n + 1;
    begin
      perform public.loesung_anzeigen(t_fuchs, v_paket, v_lt);
      raise exception 'Block 6.12: Lösung schon nach einem Versuch';
    exception when raise_exception then n := n + 1;
    end;
    perform public.antwort_abgeben(t_fuchs, v_paket, v_lt, '{"0":"das"}', gen_random_uuid());
    v_erg := public.loesung_anzeigen(t_fuchs, v_paket, v_lt);
    if v_erg <> '{"luecken":[{"id":0,"loesungen":["dass"]}]}'::jsonb then
      raise exception 'Block 6.13: Lösung nach zwei Versuchen falsch: %', v_erg;
    end if;
    n := n + 1;
    v_erg := public.antwort_abgeben(t_fuchs, v_paket, v_lt, '{"0":"dass"}', gen_random_uuid());
    v_erg := public.antwort_abgeben(t_fuchs, v_paket, v_er, '{}', gen_random_uuid());
    if not (v_erg -> 'ergebnis' ->> 'richtig')::boolean then raise exception 'Block 6.14: Erklärseite nicht erledigt'; end if;
    n := n + 1;
    reset role;
    -- Nach „Lösung ansehen“ und bei Erklärseiten zählt nichts für den Lernstand (Aufgabe 17/25)
    if exists (select 1 from public.versuche v where v.aufgabe_id in (v_lt, v_er) and v.richtig and v.zaehlt_fuer_lernstand) then
      raise exception 'Block 6.15: Versuch nach Lösung oder Erklärseite zählt für den Lernstand';
    end if;
    n := n + 1;

    -- Stufen: Regel, Vorrang der Lehrkraft, Aufstieg
    if not public.stufe_aufstieg(5, 4) or public.stufe_aufstieg(4, 4) or public.stufe_aufstieg(5, 3) then
      raise exception 'Block 6.16: Regel für den Aufstieg falsch';
    end if;
    n := n + 1;
    update public.schueler set stufe_manuell = 2 where pseudonym = 'Eule-02';
    v_start := public.schueler_start(t_eule);
    if v_start::text !~ 'T-zuordnen' or v_start::text ~ 'T-lueckentext' then
      raise exception 'Block 6.17: manuelle Stufe ★★ wirkt nicht: %', v_start;
    end if;
    n := n + 1;
    for i in 1..5 loop
      insert into public.aufgaben (owner, typ, titel, stufe, loesung)
      values (c_lk_a, 'lueckentext', 'S-' || i, 1, '{"teile":[{"t":"luecke","id":0,"loesungen":["x"]}]}');
      insert into public.paket_aufgaben (paket_id, aufgabe_id) select v_paket, id from public.aufgaben where titel = 'S-' || i;
    end loop;
    v_s_ids := array(select id from public.aufgaben where titel like 'S-_' order by titel);
    set local role anon;
    for i in 1..5 loop
      perform public.antwort_abgeben(t_fuchs, v_paket, v_s_ids[i], '{"0":"x"}', gen_random_uuid());
    end loop;
    v_start := public.schueler_start(t_fuchs);
    reset role;
    if (select stufe from public.schueler_stufen st join public.schueler s on s.id = st.schueler_id
        where s.pseudonym = 'Fuchs-01' and st.bereich = '') is distinct from 2::smallint
       or v_start::text !~ 'T-zuordnen' or v_start::text ~ 'S-1' then
      raise exception 'Block 6.18: automatischer Aufstieg auf ★★ fehlt: %', v_start;
    end if;
    n := n + 1;
  end;

  -- ---------- 7 Lernstand (Phase 7) ----------
  -- Eule-02 bearbeitet 8 Aufgaben (★★★, Kompetenz T-2): vor 20–17 Tagen alles falsch, vor 4–1 Tagen alles richtig.
  -- Rechenbeispiel: Startstand 0 (--); jetzt 100 · (1+0,85+0,85²+0,85³) / (Summe 0,85⁰…0,85⁷) = 65,7 (o); Trend +2 Stufen.
  declare
    t_eule text := (select token from public.schueler where pseudonym = 'Eule-02');
    v_eule uuid := (select id from public.schueler where pseudonym = 'Eule-02');
    v_dachs uuid := (select id from public.schueler where pseudonym = 'Dachs-03');
    v_t2 uuid := (select id from public.kompetenzen where owner = c_lk_a and code = 'T-2');
    v_aufg uuid;
    v jsonb;
    i integer;
    k integer;
  begin
    for i in 1..8 loop
      insert into public.aufgaben (owner, typ, titel, stufe, loesung)
      values (c_lk_a, 'lueckentext', 'L-' || i, 3, '{"teile":[{"t":"luecke","id":0,"loesungen":["x"]}]}')
      returning id into v_aufg;
      insert into public.aufgabe_kompetenzen (aufgabe_id, kompetenz_id) values (v_aufg, v_t2);
      insert into public.versuche (client_id, schueler_id, aufgabe_id, antworten, ergebnis, anteil_richtig, richtig, bearbeitet_am)
      values (gen_random_uuid(), v_eule, v_aufg, '{}', '{}', case when i > 4 then 1 else 0 end, i > 4,
              now() - make_interval(days => case when i > 4 then 9 - i else 25 - i end));
    end loop;
    -- zweiter Versuch am selben Tag zählt nicht
    insert into public.versuche (client_id, schueler_id, aufgabe_id, antworten, ergebnis, anteil_richtig, richtig, bearbeitet_am)
    values (gen_random_uuid(), v_eule, v_aufg, '{}', '{}', 0, false, now() - interval '1 day' + interval '1 minute');

    perform set_config('request.jwt.claims', json_build_object('sub', c_lk_a, 'role', 'authenticated')::text, true);
    set local role authenticated;
    select l.daten into v from public.lernstand_schueler(v_eule) l where l.kompetenz_id = v_t2;
    if abs((v ->> 'punkte')::numeric - 65.7) > 0.05 or (v ->> 'stufe')::int <> 2 or (v ->> 'anzahl')::int <> 8
       or (v ->> 'start_stufe')::int <> 0 or (v ->> 'trend_stufen')::int <> 2 or not (v ->> 'trend_gueltig')::boolean then
      raise exception 'Block 7.1: Rechenbeispiel stimmt nicht: %', v;
    end if;
    n := n + 1;
    select count(*) into k from public.lernstand_klasse(c_kl_a);
    if k <> 1 then raise exception 'Block 7.2: Klassen-Lernstand liefert % Zeilen statt 1', k; end if;
    n := n + 1;
    select count(*) into k from public.lernstand_klasse(c_kl_b);
    if k <> 0 then raise exception 'Block 7.3: A sieht den Lernstand der Klasse von B'; end if;
    select count(*) into k from public.lernstand_schueler(v_dachs);
    if k <> 0 then raise exception 'Block 7.3: A sieht den Lernstand einer Person von B'; end if;
    n := n + 1;
    reset role;
    perform set_config('request.jwt.claims', json_build_object('sub', c_lk_b, 'role', 'authenticated')::text, true);
    set local role authenticated;
    select count(*) into k from public.lernstand_schueler(v_eule);
    if k <> 0 then raise exception 'Block 7.4: B sieht den Lernstand von Eule (Klasse von A)'; end if;
    n := n + 1;
    reset role;

    set local role anon;
    declare f text;
    begin
      foreach f in array array[
        format('select * from public.lernstand_klasse(%L)', c_kl_a),
        format('select * from public.lernstand_schueler(%L)', v_eule),
        format('select public.auswertung(%L, %L, null::public.einstellungen)', v_eule, v_t2),
        format('select public.ergebnisse_zuruecksetzen(array[%L]::uuid[])', v_eule)
      ] loop
        begin
          execute f;
          raise exception 'Block 7.5: anon darf ausführen: %', f;
        exception when insufficient_privilege then null;
        end;
      end loop;
    end;
    n := n + 1;
    -- Schüler:innen: Kategorie ja, absolute Werte NIE
    v := public.schueler_entwicklung(t_eule);
    if v -> 'kompetenzen' -> 0 ->> 'kategorie' <> 'deutlich' or v ->> 'naechster_schritt' is null
       or (v -> 'kompetenzen' -> 0 ->> 'geloest')::int <> 4 then
      raise exception 'Block 7.6: Entwicklung von Eule falsch: %', v;
    end if;
    if v::text ~ '"(punkte|stufe|start_|vergleich_|trend_|verlauf|anzahl|prozent)"' or v::text ~ '65[.,]7' then
      raise exception 'Block 7.7: absolute Werte in schueler_entwicklung: %', v;
    end if;
    n := n + 2;
    begin
      perform public.schueler_entwicklung('falscher-token-falscher-token-xx');
      raise exception 'Block 7.8: Entwicklung mit falschem Token';
    exception when no_data_found then n := n + 1;
    end;
    reset role;

    -- Zurücksetzen: nur eigene Schüler:innen; alles auf Anfang außer Pseudonym und fester Stufe
    insert into public.loesung_angesehen (schueler_id, aufgabe_id) values (v_eule, v_aufg);
    insert into public.schueler_stufen (owner, schueler_id, bereich, stufe) values (c_lk_a, v_eule, 'Test', 3);
    perform set_config('request.jwt.claims', json_build_object('sub', c_lk_b, 'role', 'authenticated')::text, true);
    set local role authenticated;
    if public.ergebnisse_zuruecksetzen(array[v_eule]) <> 0 then raise exception 'Block 7.9: B setzt Eule zurück'; end if;
    reset role;
    if not exists (select 1 from public.versuche where schueler_id = v_eule) then
      raise exception 'Block 7.9: Versuche von Eule nach Aufruf durch B weg';
    end if;
    n := n + 1;
    perform set_config('request.jwt.claims', json_build_object('sub', c_lk_a, 'role', 'authenticated')::text, true);
    set local role authenticated;
    if public.ergebnisse_zuruecksetzen(array[v_eule]) <> 1 then raise exception 'Block 7.10: A kann nicht zurücksetzen'; end if;
    reset role;
    if exists (select 1 from public.versuche where schueler_id = v_eule)
       or exists (select 1 from public.loesung_angesehen where schueler_id = v_eule)
       or exists (select 1 from public.schueler_stufen where schueler_id = v_eule)
       or (select stufe_manuell from public.schueler where id = v_eule) is distinct from 2::smallint
       or (select pseudonym from public.schueler where id = v_eule) <> 'Eule-02' then
      raise exception 'Block 7.10: Zurücksetzen unvollständig oder zu viel gelöscht';
    end if;
    n := n + 1;
  end;

  -- ---------- 8 Münzen (Phase 8, docs/SPEC-muenzen.md) ----------
  -- Stand nach Block 6 (Fuchs): T-lueckentext erst nach „Lösung ansehen“ richtig = 0, Erklärseite = 5, S-1..5 (★, 1. Versuch) = 5 × 10.
  declare
    t_fuchs text := (select token from public.schueler where pseudonym = 'Fuchs-01');
    v_fuchs uuid := (select id from public.schueler where pseudonym = 'Fuchs-01');
    v_eule uuid := (select id from public.schueler where pseudonym = 'Eule-02');
    t_eule text := (select token from public.schueler where pseudonym = 'Eule-02');
    v_paket uuid := (select id from public.pakete where titel = 'P-Test');
    v_er uuid := (select id from public.aufgaben where titel = 'T-erklaerung');
    v_s1 uuid := (select id from public.aufgaben where titel = 'S-1');
    v_d uuid := (select id from public.aufgaben where titel = 'D-ab');
    v_m uuid[];
    v_cid uuid := gen_random_uuid();
    v_v public.versuche;
    v jsonb;
    k integer;
  begin
    for k in 1..2 loop
      insert into public.aufgaben (owner, typ, titel, stufe, loesung)
      values (c_lk_a, 'lueckentext', 'M-' || k, 2, '{"teile":[{"t":"luecke","id":0,"loesungen":["x"]}]}');
      insert into public.paket_aufgaben (paket_id, aufgabe_id) select v_paket, id from public.aufgaben where titel = 'M-' || k;
    end loop;
    v_m := array(select id from public.aufgaben where titel like 'M-_' order by titel);

    set local role anon;
    if (public.schueler_muenzen(t_fuchs) ->> 'kontostand')::int <> 55 then
      raise exception 'Block 8.1: Kontostand nach Block 6: %', public.schueler_muenzen(t_fuchs);
    end if;
    n := n + 1;
    -- Erklärseite nur einmal; dieselbe Aufgabe am selben Tag nur einmal; doppelt gesendet = keine neuen Münzen
    v := public.antwort_abgeben(t_fuchs, v_paket, v_er, '{}', gen_random_uuid());
    if (v ->> 'muenzen')::int <> 0 then raise exception 'Block 8.2: Erklärseite zahlt zweimal: %', v; end if;
    v := public.antwort_abgeben(t_fuchs, v_paket, v_s1, '{"0":"x"}', gen_random_uuid());
    if (v ->> 'muenzen')::int <> 0 then raise exception 'Block 8.2: Aufgabe zahlt zweimal am Tag: %', v; end if;
    n := n + 1;
    -- ★★ im 2. Versuch: halb (8); doppelt gesendet: gleiche Antwort, Kontostand bleibt
    perform public.antwort_abgeben(t_fuchs, v_paket, v_m[1], '{"0":"y"}', gen_random_uuid());
    v := public.antwort_abgeben(t_fuchs, v_paket, v_m[1], '{"0":"x"}', v_cid);
    if (v ->> 'muenzen')::int <> 8 or (v ->> 'kontostand')::int <> 63 then
      raise exception 'Block 8.3: 2. Versuch bringt nicht die Hälfte: %', v;
    end if;
    v := public.antwort_abgeben(t_fuchs, v_paket, v_m[1], '{"0":"x"}', v_cid);
    if (v ->> 'kontostand')::int <> 63 then raise exception 'Block 8.4: doppelt gesendet zahlt doppelt: %', v; end if;
    n := n + 2;
    -- 3. Versuch des Tages: nichts
    perform public.antwort_abgeben(t_fuchs, v_paket, v_m[2], '{"0":"y"}', gen_random_uuid());
    perform public.antwort_abgeben(t_fuchs, v_paket, v_m[2], '{"0":"y"}', gen_random_uuid());
    v := public.antwort_abgeben(t_fuchs, v_paket, v_m[2], '{"0":"x"}', gen_random_uuid());
    if (v ->> 'muenzen')::int <> 0 then raise exception 'Block 8.5: 3. Versuch zahlt: %', v; end if;
    n := n + 1;
    -- anon darf keine Münzen schreiben, nicht schenken, nichts lesen, Vergabe nicht direkt aufrufen
    begin
      insert into public.muenz_ereignisse (schueler_id, grund, schluessel, muenzen) values (v_fuchs, 'lehrkraft', 'x', 999);
      raise exception 'Block 8.6: anon schreibt Münzen';
    exception when insufficient_privilege then null;
    end;
    begin
      perform public.muenzen_schenken(array[v_fuchs], 100);
      raise exception 'Block 8.6: anon schenkt Münzen';
    exception when insufficient_privilege then null;
    end;
    begin
      perform public.muenzen_fuer_versuch(null::public.versuche);
      raise exception 'Block 8.6: anon ruft die Münzvergabe direkt auf';
    exception when insufficient_privilege then null;
    end;
    begin
      perform 1 from public.muenz_ereignisse;
      raise exception 'Block 8.6: anon liest Münzen';
    exception when insufficient_privilege then null;
    end;
    n := n + 1;
    begin
      perform public.schueler_muenzen('falscher-token-falscher-token-xx');
      raise exception 'Block 8.7: Kontostand mit falschem Token';
    exception when no_data_found then n := n + 1;
    end;
    reset role;

    -- An einem anderen Tag zahlt dieselbe Aufgabe wieder (★★ = 15)
    insert into public.versuche (client_id, schueler_id, aufgabe_id, antworten, ergebnis, anteil_richtig, richtig, bearbeitet_am)
    values (gen_random_uuid(), v_fuchs, v_m[1], '{}', '{}', 1, true, now() - interval '2 days') returning * into v_v;
    if public.muenzen_fuer_versuch(v_v) <> 15 then raise exception 'Block 8.8: anderer Tag zahlt nicht'; end if;
    n := n + 1;
    -- Diktat: unter 90 % nichts; erstes Geschafft 30; Verbesserung 10; gleich gut nichts; fehlerfrei 10 + 20 extra (einmal)
    insert into public.versuche (client_id, schueler_id, aufgabe_id, antworten, ergebnis, anteil_richtig, richtig)
    values (gen_random_uuid(), v_eule, v_d, '{}', '{}', 0.85, false) returning * into v_v;
    if public.muenzen_fuer_versuch(v_v) <> 0 then raise exception 'Block 8.9: Diktat unter 90 %% zahlt'; end if;
    insert into public.versuche (client_id, schueler_id, aufgabe_id, antworten, ergebnis, anteil_richtig, richtig)
    values (gen_random_uuid(), v_eule, v_d, '{}', '{}', 0.92, true) returning * into v_v;
    if public.muenzen_fuer_versuch(v_v) <> 30 then raise exception 'Block 8.9: erstes Geschafft zahlt nicht 30'; end if;
    insert into public.versuche (client_id, schueler_id, aufgabe_id, antworten, ergebnis, anteil_richtig, richtig)
    values (gen_random_uuid(), v_eule, v_d, '{}', '{}', 0.92, true) returning * into v_v;
    if public.muenzen_fuer_versuch(v_v) <> 0 then raise exception 'Block 8.9: gleich gutes Diktat zahlt'; end if;
    insert into public.versuche (client_id, schueler_id, aufgabe_id, antworten, ergebnis, anteil_richtig, richtig)
    values (gen_random_uuid(), v_eule, v_d, '{}', '{}', 1, true) returning * into v_v;
    if public.muenzen_fuer_versuch(v_v) <> 30 then raise exception 'Block 8.9: fehlerfrei zahlt nicht 10 + 20'; end if;
    insert into public.versuche (client_id, schueler_id, aufgabe_id, antworten, ergebnis, anteil_richtig, richtig)
    values (gen_random_uuid(), v_eule, v_d, '{}', '{}', 1, true) returning * into v_v;
    if public.muenzen_fuer_versuch(v_v) <> 0 then raise exception 'Block 8.9: fehlerfrei zahlt zweimal'; end if;
    n := n + 1;

    -- Lehrkraft schenkt: nur eigenen Schüler:innen, 1–1000; liest nur eigene
    perform set_config('request.jwt.claims', json_build_object('sub', c_lk_b, 'role', 'authenticated')::text, true);
    set local role authenticated;
    if public.muenzen_schenken(array[v_fuchs], 50) <> 0 then raise exception 'Block 8.10: B schenkt Fuchs (Klasse von A) Münzen'; end if;
    if exists (select 1 from public.muenz_ereignisse where schueler_id = v_fuchs) then
      raise exception 'Block 8.10: B liest Münzen von Fuchs';
    end if;
    reset role;
    n := n + 1;
    perform set_config('request.jwt.claims', json_build_object('sub', c_lk_a, 'role', 'authenticated')::text, true);
    set local role authenticated;
    begin
      perform public.muenzen_schenken(array[v_fuchs], 0);
      raise exception 'Block 8.11: 0 Münzen geschenkt';
    exception when invalid_parameter_value then null;
    end;
    k := public.muenzen_schenken(array[v_fuchs, v_eule], 50, 'Mitarbeit');
    if k <> 2
       or (select sum(muenzen) from public.muenz_ereignisse where schueler_id = v_fuchs) <> 128 then
      raise exception 'Block 8.11: A kann nicht schenken (%)', k;
    end if;
    reset role;
    -- Eule sieht die Nachricht einmal; nach „gesehen“ ist sie weg; fremde Ids ändern nichts
    set local role anon;
    v := public.schueler_muenzen(t_eule);
    if jsonb_array_length(v -> 'geschenke') <> 1 or v -> 'geschenke' -> 0 ->> 'nachricht' <> 'Mitarbeit'
       or (v -> 'geschenke' -> 0 ->> 'muenzen')::int <> 50 then
      raise exception 'Block 8.13: Nachricht der Lehrkraft fehlt: %', v;
    end if;
    perform public.geschenke_gesehen(t_fuchs, array[(v -> 'geschenke' -> 0 ->> 'id')::uuid]);
    if jsonb_array_length(public.schueler_muenzen(t_eule) -> 'geschenke') <> 1 then
      raise exception 'Block 8.13: Fuchs kann die Nachricht von Eule als gesehen markieren';
    end if;
    perform public.geschenke_gesehen(t_eule, array[(v -> 'geschenke' -> 0 ->> 'id')::uuid]);
    if jsonb_array_length(public.schueler_muenzen(t_eule) -> 'geschenke') <> 0 then
      raise exception 'Block 8.13: Nachricht nach „gesehen“ noch da';
    end if;
    reset role;
    n := n + 1;
    -- Zurücksetzen löscht die Münzen
    perform set_config('request.jwt.claims', json_build_object('sub', c_lk_a, 'role', 'authenticated')::text, true);
    set local role authenticated;
    perform public.ergebnisse_zuruecksetzen(array[v_fuchs]);
    reset role;
    if public.kontostand(v_fuchs) <> 0 then raise exception 'Block 8.12: Münzen nach Zurücksetzen noch da'; end if;
    n := n + 2;
  end;

  -- ---------- 9 Shop (Phase 8) ----------
  -- Eule nach Block 8: Diktat 30 + 30, Geschenk 50 = 110 verdient
  declare
    t_eule text := (select token from public.schueler where pseudonym = 'Eule-02');
    v_eule uuid := (select id from public.schueler where pseudonym = 'Eule-02');
    v jsonb;
  begin
    set local role anon;
    v := public.schueler_shop(t_eule);
    if (v ->> 'kontostand')::int <> 110 or v -> 'angebot' @> '[{"id":"tomate"}]' or not (v -> 'angebot' @> '[{"id":"karotte"}]')
       or v -> 'angebot' @> '[{"id":"tulpe"}]' or (v -> 'gesperrt')::text ~ '"(name|preis|id|ab_verdient)"' then
      raise exception 'Block 9.1: Shop-Angebot falsch: %', v;
    end if;
    n := n + 1;
    begin
      perform public.kaufen(t_eule, 'tomate');
      raise exception 'Block 9.2: gesperrter Artikel gekauft';
    exception when raise_exception then
      if sqlerrm !~ 'noch nicht' then raise; end if;
    end;
    begin
      perform public.kaufen(t_eule, 'tulpe');
      raise exception 'Block 9.2: Belohnungs-Samen gekauft';
    exception when raise_exception then
      if sqlerrm !~ 'noch nicht' then raise; end if;
    end;
    n := n + 1;
    if (public.kaufen(t_eule, 'karotte') ->> 'kontostand')::int <> 95 then raise exception 'Block 9.3: Kauf zieht falsch ab'; end if;
    perform public.kaufen(t_eule, 'feld');
    if (public.kaufen(t_eule, 'feld') ->> 'kontostand')::int <> 15 then raise exception 'Block 9.3: Felder falsch abgezogen'; end if;
    begin
      perform public.kaufen(t_eule, 'feld');
      raise exception 'Block 9.4: Kauf ohne genug Münzen';
    exception when raise_exception then
      if sqlerrm !~ 'reichen' then raise; end if;
    end;
    -- Kauf ändert nichts am Freischalten (verdient bleibt 110)
    if (public.schueler_shop(t_eule) -> 'angebot') @> '[{"id":"tomate"}]' then raise exception 'Block 9.4: Freischalten falsch'; end if;
    n := n + 2;
    begin
      insert into public.besitz (schueler_id, artikel_id, preis) values (v_eule, 'kuh', 0);
      raise exception 'Block 9.5: anon schreibt Besitz';
    exception when insufficient_privilege then n := n + 1;
    end;
    reset role;
    -- Höchstens 8 gekaufte Felder
    insert into public.besitz (schueler_id, artikel_id, preis) select v_eule, 'feld', 0 from generate_series(1, 6);
    insert into public.muenz_ereignisse (schueler_id, grund, schluessel, muenzen) values (v_eule, 'lehrkraft', 'test-viel', 1000);
    set local role anon;
    begin
      perform public.kaufen(t_eule, 'feld');
      raise exception 'Block 9.6: mehr als 8 Felder gekauft';
    exception when raise_exception then
      if sqlerrm !~ 'Mehr Felder' then raise; end if;
    end;
    -- mit 1110 verdient: Tomate (ab 200) jetzt im Angebot
    if not (public.schueler_shop(t_eule) -> 'angebot') @> '[{"id":"tomate"}]' then raise exception 'Block 9.6: Freischalten wirkt nicht'; end if;
    reset role;
    n := n + 1;
    perform set_config('request.jwt.claims', json_build_object('sub', c_lk_a, 'role', 'authenticated')::text, true);
    set local role authenticated;
    perform public.ergebnisse_zuruecksetzen(array[v_eule]);
    reset role;
    if exists (select 1 from public.besitz where schueler_id = v_eule) then raise exception 'Block 9.7: Besitz nach Zurücksetzen noch da'; end if;
    n := n + 1;
  end;

  raise exception 'ALLE TESTS BESTANDEN (%)', n;
end
$test$;
