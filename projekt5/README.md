# Elegancki Facet Classic Barbershop — strona

Statyczna strona jednostronicowa (HTML + CSS + vanilla JS, bez zależności i bez build-stepu).
Wystarczy wrzucić cały folder na hosting — działa od razu.

```
index.html      — strona główna (wszystkie sekcje)
witajcie.html   — podstrona „Witajcie w świecie Eleganckich Facetów"
galeria.html    — podstrona galerii z interaktywnym hero
css/style.css   — style, paleta, animacje
js/main.js      — nawigacja, hero, galeria, slider opinii, status godzin, liczniki
img/            — zdjęcia
```

## Zdjęcia

W `img/` leżą prawdziwe zdjęcia z Booksy (640×640, 45–80 KB):

| plik | gdzie się pojawia |
|---|---|
| `hero.jpg` | tło sekcji powitalnej — zabieg z parownicą |
| `barber.jpg` | sekcja „O nas" — Sławomir przed salonem |
| `logo.jpg` | logo w stopce |
| `galeria-1…4.jpg` | galeria: efekt strzyżenia, wnętrze, witryna, parownica |

**Jak dodać kolejne zdjęcie do galerii:** wrzuć plik jako `img/galeria-5.jpg` i skopiuj w `index.html`
jeden blok `<button class="gallery__item reveal">…</button>`, podmieniając `src`, `alt` oraz numer
w `aria-label`. Siatka i lightbox dopasują się same. Zdjęcia warto trzymać w okolicach 640–1200 px
i do ~300 KB (np. [squoosh.app](https://squoosh.app)) — strona ma zostać lekka.

## Co jeszcze trzeba uzupełnić

1. **Media społecznościowe** — w stopce `index.html` trzy linki mają `href="#"` (Facebook, Instagram, TikTok).

2. **Polityka prywatności** — link w stopce prowadzi do `#`; podepnij podstronę, jeśli zaczniesz zbierać dane.

   Kontakt idzie teraz wyłącznie przez telefon, e-mail i Booksy — formularz został usunięty.

3. **Po każdej zmianie CSS/JS** podbij numer w `index.html`: `css/style.css?v=19`, `js/main.js?v=18` → kolejny numer (w OBU plikach HTML).
   Bez tego przeglądarki (Twoja i klientów) mogą trzymać starą wersję pliku z pamięci podręcznej.

Link do Booksy jest już wpisany — profil `218504_elegancki-facet-classic-barbershop`. Gdyby się kiedyś
zmienił, poprawiasz go w jednym miejscu: `CONFIG.booksyUrl` na górze `js/main.js` (JS nadpisuje wszystkie
5 przycisków przy starcie strony).

## Podstrona „Witajcie"

`witajcie.html` przejęła w całości sekcję powitalną — na stronie głównej już jej nie ma
(zaraz po hero zaczyna się „O nas"). Podstrona zawiera pełny tekst o filozofii salonu,
cytat o rytuale, czterostopniowy przebieg wizyty (rozmowa → strzyżenie → broda → pielęgnacja),
zdjęcie Sławomira z trzema filarami i zaproszenie do rezerwacji.

Prowadzą do niej dwa wejścia: pozycja **Witajcie** w nawigacji oraz link „Poznaj naszą filozofię →"
na końcu sekcji „O nas".

Podstrona korzysta z tego samego `css/style.css` i `js/main.js`. Moduły JS (galeria, slider,
formularz, menu) mają zabezpieczenia — brak danego elementu na stronie nie wywala skryptu,
więc kolejne podstrony można robić przez skopiowanie `witajcie.html` i podmianę treści.

## Rzeczy już zrobione

- responsywność mobile-first, menu pełnoekranowe na telefonie
- hero: pierwsza linia napisu litera po literze z rozmycia, druga odsłaniana przesuwającą się maską,
  rysująca się złota kreska, kaskadowe wejście podpisu, przycisków i oceny,
  powolny najazd kadru w tle, parallax i wygaszanie treści przy scrollu
- złota poświata podążająca za kursorem na całej stronie (na dotyku wyłączona)
- animacje wejścia sekcji (IntersectionObserver) z zapasowym odsłanianiem przy scrollu
- galeria z lightboxem (klawisze ←/→ i Esc)
- cennik: dwie karty (strzyżenie/broda i golenie/pielęgnacja) w tej samej oprawie,
  pozycja COMBO wyróżniona złotym paskiem i poświatą
- kontakt: karta godzin z żywym statusem „Otwarte / Zamknięte" liczonym z zegara odwiedzającego
  (godziny siedzą w stałej `HOURS` w `js/main.js` — zmiana grafiku to jedna linia)
- opinie: karta oceny (gwiazdki wjeżdżające kaskadą, liczby doliczające się przy wejściu w widok),
  panel z cytatem w ramce z narożnikami, slider z autoplay, strzałkami, rombami i przesuwaniem palcem
- SEO: `title`, `meta description`, Open Graph, dane strukturalne `HairSalon` (godziny, adres, ocena 5.0)
- dostępność: `skip-link`, `aria-label` przy ikonach, widoczny focus, kontrast tekstu

## Podstrona galerii

`galeria.html` otwiera się sceną, która stoi w miejscu (`position: sticky`) na wysokości dwóch
i pół ekranu. Na środku jest jedno zdjęcie; w miarę przewijania z lewej i prawej krawędzi wsuwają
się kolejne cztery kadry, każdy z własnym progiem startu. Poniżej jest zwykła siatka sześciu zdjęć
z lightboxem.

Sterowanie siedzi w `js/main.js` (blok „GALERIA: interaktywne hero") i nie wymaga żadnej biblioteki:
postęp przewijania trafia do zmiennej `--p`, a każdy boczny kadr dostaje swoje `--e` (0→1).
Reszta — przesunięcie, obrót, krycie — dzieje się w CSS.

| chcesz | zmień |
|---|---|
| dłuższą / krótszą scenę | `height:230vh` przy `.gal-hero` w `css/style.css` |
| kolejność wjeżdżania kadrów | `data-gp` przy `<figure>` w `galeria.html` (próg 0–1) |
| kierunek i dystans wjazdu | `--from` przy tych samych `<figure>` (np. `-70vw`) |
| przechył kadru | `--r` (np. `-5deg`) |

## Animacje a ustawienia systemu

Animacje działają u wszystkich. Jeśli ktoś ma w systemie wyłączone efekty animacji
(Windows: Ustawienia → Dostępność → Efekty wizualne), przeglądarka zgłasza
`prefers-reduced-motion: reduce` i strona nie wyłącza efektów, tylko je łagodzi:

- napis hero pojawia się litera po literze, ale bez wysuwania od dołu i bez rozmycia,
- sekcje pojawiają się samym przenikaniem (bez przesuwania w pionie), szybciej — 0,5 s zamiast 0,8 s,
- wyłączony zostaje najazd kadru w tle, parallax i pulsujący wskaźnik scrolla,
- poświata za kursorem i slider opinii działają normalnie.

Odpowiada za to jeden blok `@media (prefers-reduced-motion:reduce)` na końcu `css/style.css`.

## Strojenie animacji hero

| chcesz | zmień w `css/style.css` |
|---|---|
| szybsze / wolniejsze wejście napisu | odstęp `0.3 + i * 0.05` w `js/main.js` (opóźnienie kolejnych liter) |
| inny moment odsłonięcia złotej linii | `animation:wipeIn 1.3s var(--ease) .95s` przy `.hero__line--accent` |
| kolejność i tempo pozostałych elementów | zmienne `--d` przy `.hero__eyebrow`, `.hero__rule`, `.hero__sub`… |
| siłę parallaxu | mnożniki `0.28` (tło) i `-0.12` (treść) w `js/main.js` |
| ocenę i liczbę opinii | atrybuty `data-count-to` w `index.html` (wartości docelowe są też wpisane jako tekst, żeby działały bez JS) |
