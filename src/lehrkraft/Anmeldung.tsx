import { useState } from 'react'
import { fehlerText } from '../lib/fehler'
import { supabase } from '../lib/supabase'

// Anmeldung für Lehrkräfte (E-Mail + Passwort). Konten legt nur die Lehrkraft selbst im Supabase-Dashboard an;
// Selbst-Registrierung ist dort abgeschaltet, deshalb gibt es hier keinen „Konto anlegen“-Knopf.
export function Anmeldung() {
  const [email, setEmail] = useState('')
  const [passwort, setPasswort] = useState('')
  const [fehler, setFehler] = useState<string | null>(null)
  const [beschaeftigt, setBeschaeftigt] = useState(false)

  return (
    <div className="lehrkraft lk-mitte">
      <main className="lk-karte lk-schmal">
        <h1>Anmeldung für Lehrkräfte</h1>
        <form
          className="lk-formular"
          onSubmit={async (e) => {
            e.preventDefault()
            setBeschaeftigt(true)
            setFehler(null)
            const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: passwort })
            setBeschaeftigt(false)
            if (error) setFehler(fehlerText(error))
          }}
        >
          <label>
            E-Mail-Adresse
            <input className="lk-feld" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Passwort
            <input
              className="lk-feld"
              type="password"
              autoComplete="current-password"
              value={passwort}
              onChange={(e) => setPasswort(e.target.value)}
              required
            />
          </label>
          {fehler && (
            <p className="lk-hinweis" role="alert">
              {fehler}
            </p>
          )}
          <button className="lk-knopf lk-knopf--haupt" disabled={beschaeftigt}>
            {beschaeftigt ? 'Anmelden …' : 'Anmelden'}
          </button>
        </form>
        <p className="lk-leise">Schüler:innen brauchen keine Anmeldung. Sie öffnen ihren persönlichen Link.</p>
      </main>
    </div>
  )
}
