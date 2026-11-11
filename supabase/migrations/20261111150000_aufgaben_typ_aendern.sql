-- Fehler aus Haltepunkt 4: Der Editor schickt beim erneuten Speichern auch "typ" mit, das war nicht änderbar
-- („permission denied for table aufgaben“). typ ändern ist ungefährlich: der Trigger erzeugt inhalt neu.
grant update (typ) on public.aufgaben to authenticated;
