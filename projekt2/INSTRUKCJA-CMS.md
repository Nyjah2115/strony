# Panel edycji floty (CMS) — instrukcja

Strona ma wbudowany darmowy panel **Decap CMS**. Właściciel edytuje flotę pod adresem
`https://TWOJA-DOMENA.pl/admin/` — przez formularz, bez dotykania kodu.
Flota wyświetlana na stronie pochodzi z pliku **`data/flota.json`**, który panel edytuje automatycznie.

---

## A. Jak to działa (w skrócie)

- Właściciel loguje się na `/admin/`, dodaje/edytuje/usuwa pojazd i klika **Zapisz → Opublikuj**.
- Panel zapisuje zmianę w pliku `data/flota.json` (przez Twoje repozytorium na GitHub).
- Hosting (Netlify) automatycznie odświeża stronę — nowy pojazd pojawia się w sekcji „Flota".

Do działania panelu online potrzebne są **dwa darmowe konta**: GitHub (przechowuje pliki)
i Netlify (hosting + logowanie do panelu). Konfigurujesz to raz, przy sprzedaży.

---

## B. Publikacja krok po kroku (robisz Ty, jednorazowo)

1. **GitHub** — załóż konto na github.com, utwórz nowe repozytorium (np. `pectruck`)
   i wgraj do niego całą zawartość folderu `tir`
   (może być przez stronę GitHub: „Add file → Upload files", przeciągnij pliki).

2. **Netlify** — załóż konto na netlify.com → „Add new site → Import an existing project"
   → wybierz repozytorium `pectruck`. Ustawienia budowania zostaw puste (to zwykła strona
   statyczna), kliknij **Deploy**. Dostaniesz adres typu `https://pectruck.netlify.app`.

3. **Podmień adres domeny** w plikach (Ctrl+H „zamień wszędzie") — `https://TWOJA-DOMENA.pl`
   na swój prawdziwy adres — w: `index.html`, `admin/config.yml`, `sitemap.xml`, `robots.txt`.
   (Jeśli podpinasz własną domenę, np. `pectruck.pl` — zrób to w Netlify: „Domain settings".)

4. **Włącz logowanie do panelu** w Netlify:
   - `Site configuration → Identity` → **Enable Identity**.
   - W sekcji **Registration** ustaw **Invite only** (żeby nikt obcy się nie zarejestrował).
   - Niżej **Services → Git Gateway** → **Enable Git Gateway**.

5. **Zaproś właściciela**: `Identity → Invite users` → wpisz jego e-mail. Dostanie maila
   z linkiem „Accept the invite", ustawi hasło i będzie mógł wejść na `/admin/`.

Gotowe. Od teraz właściciel zarządza flotą sam.

---

## C. Jak właściciel dodaje pojazd (przekaż mu to)

1. Wejdź na `https://TWOJA-DOMENA.pl/admin/` i zaloguj się (e-mail + hasło z zaproszenia).
2. Kliknij **Flota — pojazdy → Lista pojazdów**.
3. Kliknij **„Add Pojazd"** (dodaj) i wypełnij pola: marka i model, typ, rok, przebieg,
   moc, cena, status (Dostępny / Rezerwacja / Nowość / Sprzedany) oraz sylwetkę.
   - Pojazdy można przeciągać, żeby zmienić kolejność.
   - Żeby usunąć pojazd — kliknij kosz przy pozycji.
4. Kliknij **Save**, a potem **Publish → Publish now**.
5. Po chwili (do ~1 min) zmiana pojawia się na stronie.

---

## D. Test lokalny na Twoim komputerze (opcjonalnie, przed publikacją)

Panel można sprawdzić lokalnie bez GitHub/Netlify:
1. Uruchom stronę: kliknij `start.bat`.
2. W drugim oknie (wiersz poleceń w folderze `tir`) uruchom: `npx decap-server`
3. Wejdź na `http://localhost:4173/admin/` — zobaczysz panel działający na lokalnych plikach.
   (Zmiany zapisują się bezpośrednio w `data/flota.json`.)

---

## Pliki związane z CMS
- `admin/index.html` — panel
- `admin/config.yml` — konfiguracja pól formularza
- `data/flota.json` — dane floty (to edytuje panel)
- `media/` — folder na wgrywane zdjęcia (tworzy się automatycznie)
