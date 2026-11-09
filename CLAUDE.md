# CLAUDE.md – Projektregeln Satzgarten

## Für wen und wie
- Nutzerin/Nutzer ist eine Deutschlehrkraft (KGS Niedersachsen) **ohne Programmiererfahrung**.
  Jeden Schritt kurz in einfachem Deutsch erklären, Fachwörter vermeiden oder erklären.
- Git, Installationen, Konfiguration selbst übernehmen. Was im Browser selbst zu tun ist: Schritt für Schritt anleiten.
- Arbeiten nach `tasks/todo.md` (Plan: `tasks/plan.md`, Spec: `docs/SPEC.md`). **Nach jeder Phase (Haltepunkt) stoppen**
  und testen lassen. Erledigte Aufgaben dort abhaken.
- Fachlich-didaktische und Design-Entscheidungen **erfragen**, nicht raten. Entscheidungen unten protokollieren.
- Vorgänger-Projekt: `C:\Users\jrkug\Projekte\deutsch-uebungen` („Übungswiese“) – Quelle für übernommene Dateien
  (in `tasks/todo.md` mit „alt“ markiert). Übergabe: `docs/uebergabe-neustart.md`.

## Feste Regeln
- Alle Texte der Oberfläche auf Deutsch, einfache Sprache (Jg. 5–10). Code-Kommentare auf Deutsch.
  Lehrkraft-Ansicht „Sie“, Schüleransicht „du“.
- **Keine** Tracking-, Analyse- oder Werbedienste, **keine** externen Schriften/CDNs.
- **Keine Klarnamen** von Schüler:innen, nur Pseudonyme (z. B. „Fuchs-07“).
- **Keine Geheimnisse ins Repo** (Repo ist öffentlich). Supabase-`anon`/publishable Key darf in den Code,
  `service_role`-Schlüssel und DB-Passwort **nie**.
- KC-PDFs (`docs/*.pdf`) und Referenzbilder (`refrences/`) nie ins Repo. Grafiken immer **selbst neu zeichnen**.
- Kompetenzen **nicht erfinden** – nur aus `docs/kompetenzen.csv` bzw. durch die Lehrkraft.
- Schüler:innen sehen **nie** absolute Lernstände (kein `--` bis `++`, keine Prozente, Punkte, Noten) und **keine
  Belohnungszahlen** (Samen) – abgesichert in der Datenbank, nicht nur in der Oberfläche.
- Lösungen nur in `aufgaben.loesung`; Schüler-Funktionen geben sie nie heraus (DB-Test je Format).
- Gesichter/Figuren nur beim Maskottchen. Fehler nie rot (Pfirsich). Bedeutung nie nur über Farbe.
  Kontrast ≥ 4,5:1, Tippflächen ≥ 48 px, Fließtext ≥ 17 px.
- Einsatz mit echten Klassen erst nach Datenschutz-Freigabe durch Schulleitung/DSB.

## Technik
- Vite + React + TypeScript, statisch, Bau-Ziel Safari 15. Pfad-Basis `/satzgarten/`.
- GitHub Pages: Repo `stift-und-papier/satzgarten` (öffentlich), Adresse https://stift-und-papier.github.io/satzgarten/,
  Veröffentlichung per GitHub Actions bei Push auf `main`.
- Supabase-Projekt `diwpqkxhmuetdpxxcoar` („satzgarten“, kostenlos, Frankfurt `eu-central-1`), RLS überall. Änderungen nur als Migration in `supabase/migrations/`,
  dann `npm run db:push`. CLI per `npx supabase` (v2), Anmeldung per Token (Lehrkraft trägt ihn selbst ein:
  `npx.cmd --prefix C:/Users/jrkug/Projekte/satzgarten supabase login --token …`, `npx.ps1` ist gesperrt); Befehle aus Claudes Shell
  (im Terminal der Lehrkraft scheitert die CLI, vermutlich Avast).
- Schüler:innen: kein Konto, Link-Token (192 Bit) hinter `#`; Zugriff nur über Datenbankfunktionen mit Token-Prüfung.
- Bibliotheken: supabase-js, @dnd-kit, qrcode. Neue nur nach Rückfrage.

## Befehle
- `npm run dev` · `npm run build` · `npm run lint` · `npm test`
- `npm run test:datenbank` → Erfolg = „ALLE TESTS BESTANDEN“. **Nach jeder Migration ausführen und erweitern.**

## Rechner der Lehrkraft (Windows 11)
- Projektordner `C:\Users\jrkug\Projekte\satzgarten` (nicht in OneDrive).
- Git, Node.js LTS, GitHub CLI (`gh`, angemeldet als `stift-und-papier`); Git-Identität mit GitHub-noreply-Adresse.

## Entscheidungen (Protokoll)
- 2026-11-09: Neustart als neues Projekt „Satzgarten“ (Spec `docs/SPEC.md`, Plan `tasks/plan.md` freigegeben).
  Alle drei Zweige, erst eine Lehrkraft, alle 6 Formate + Erklärseite, Sterne-Stufen manuell + automatisch,
  Garten statt Wiese (Samen je Paket und je verbesserter Kompetenz, wachsen durch Üben, 12 Pflanzen + 6 Deko,
  umsetzen/entfernen erlaubt, keine Zahlen), Sammelbuch, Maskottchen (Gartengeist), neues Design nach Referenzbildern.
