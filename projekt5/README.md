# Elegancki Facet Classic Barbershop — strona

Statyczna strona jednostronicowa (HTML + CSS + vanilla JS, bez zależności i bez build-stepu).
Wystarczy wrzucić cały folder na hosting — działa od razu.

```
index.html      — cała treść i struktura sekcji
css/style.css   — style, paleta, animacje
js/main.js      — nawigacja, hero, galeria, slider opinii, formularz
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

2. **Polityka prywatności** — link w stopce prowadzi do `#`; podepnij podstronę, jeśli będzie formularz zbierający dane.

3. **Po każdej zmianie CSS/JS** podbij numer w `index.html`: `css/style.css?v=11`, `js/main.js?v=11` → `?v=12`.
   Bez tego przeglądarki (Twoja i klientów) mogą trzymać starą wersję pliku z pamięci podręcznej.

Link do Booksy jest już wpisany — profil `218504_elegancki-facet-classic-barbershop`. Gdyby się kiedyś
zmienił, poprawiasz go w jednym miejscu: `CONFIG.booksyUrl` na górze `js/main.js` (JS nadpisuje wszystkie
5 przycisków przy starcie strony).

## Formularz kontaktowy

Strona nie ma backendu, więc formularz waliduje pola i otwiera program pocztowy klienta z gotową
wiadomością na `slawomir.rurak@onet.pl`. Jeśli ma wysyłać e-mail „po cichu", najprościej podpiąć
darmowy [Formspree](https://formspree.io) lub [Web3Forms](https://web3forms.com) — komentarz
w `js/main.js` pokazuje, który blok podmienić.

## Rzeczy już zrobione

- responsywność mobile-first, menu pełnoekranowe na telefonie
- hero: pierwsza linia napisu litera po literze z rozmycia, druga odsłaniana przesuwającą się maską,
  rysująca się złota kreska, kaskadowe wejście podpisu, przycisków i oceny,
  powolny najazd kadru w tle, parallax i wygaszanie treści przy scrollu
- złota poświata podążająca za kursorem na całej stronie (na dotyku wyłączona)
- animacje wejścia sekcji (IntersectionObserver) z zapasowym odsłanianiem przy scrollu
- galeria z lightboxem (klawisze ←/→ i Esc)
- slider opinii: autoplay, strzałki, kropki, przesuwanie palcem
- SEO: `title`, `meta description`, Open Graph, dane strukturalne `HairSalon` (godziny, adres, ocena 5.0)
- dostępność: `skip-link`, `aria-label` przy ikonach, widoczny focus, kontrast tekstu

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
