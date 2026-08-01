#!/bin/bash
# ============================================================================
#  Thaicooking — przygotowanie własnych zdjęć
#
#  Jak używać:
#    1. Wrzuć swoje zdjęcia do katalogu  assets/img/zrodlo/
#       nazywając je dokładnie tak, jak sloty z listy poniżej (np. hero-padthai.jpg).
#       Rozszerzenie może być .jpg, .jpeg, .png lub .heic — skrypt sobie poradzi.
#    2. Uruchom:  bash narzedzia/przygotuj-zdjecia.sh
#
#  Skrypt przeskaluje i przytnie każde zdjęcie do proporcji wymaganych przez
#  układ strony, skompresuje je i zapisze w assets/img/ pod właściwą nazwą.
#  Pliki, których nie wrzucisz, zostaną nietknięte — możesz podmieniać po kolei.
# ============================================================================

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/assets/img/zrodlo"
OUT="$ROOT/assets/img"
JAKOSC=72

mkdir -p "$SRC"

# slot:szerokość:wysokość — gdzie zdjęcie się pojawia
SLOTY=(
  "hero-padthai:1200:900"      # karuzela na stronie głównej
  "hero-curry:1200:900"        # karuzela + pas na stronie Menu
  "hero-wok:1200:900"          # karuzela
  "hero-tomyum:1200:900"       # karuzela
  "kat-pad-thai:900:600"       # kafelek kategorii
  "kat-curry:900:600"
  "kat-miesne:900:600"
  "kat-makaron:900:600"
  "kat-com-chien:900:600"
  "kat-zupy:900:600"
  "kat-przystawki:900:600"
  "kat-snack-box:900:600"
  "galeria-1:800:800"          # galeria — kwadraty
  "galeria-2:800:800"
  "galeria-3:800:800"
  "galeria-4:800:800"
  "galeria-5:800:800"
  "galeria-6:800:800"
  "galeria-7:800:800"
  "galeria-8:800:800"
  "galeria-9:1600:800"         # galeria — szeroki kafelek
  "wnetrze:1000:750"           # O nas
  "zespol:1000:750"            # O nas
  "rezerwacja:1000:750"        # Rezerwacja
  "promo-zestaw:900:600"       # Promocje
  "promo-rodzinny:900:600"
  "promo-weekend:900:600"
)

echo "Szukam zdjęć w: $SRC"
echo

zrobione=0
pominiete=0

for wpis in "${SLOTY[@]}"; do
  IFS=':' read -r nazwa szer wys <<< "$wpis"

  zrodlo=""
  for rozsz in jpg jpeg JPG JPEG png PNG heic HEIC; do
    if [ -f "$SRC/$nazwa.$rozsz" ]; then zrodlo="$SRC/$nazwa.$rozsz"; break; fi
  done

  if [ -z "$zrodlo" ]; then
    pominiete=$((pominiete + 1))
    continue
  fi

  cel="$OUT/$nazwa.jpg"
  cp "$zrodlo" "$cel"

  # Skalujemy po krótszym boku tak, by pokryć kadr, potem przycinamy od środka.
  sw=$(sips -g pixelWidth  "$cel" | awk '/pixelWidth/{print $2}')
  sh=$(sips -g pixelHeight "$cel" | awk '/pixelHeight/{print $2}')

  skala_w=$(echo "$szer $sw" | awk '{printf "%.6f", $1/$2}')
  skala_h=$(echo "$wys  $sh" | awk '{printf "%.6f", $1/$2}')
  skala=$(echo "$skala_w $skala_h" | awk '{print ($1>$2)?$1:$2}')

  nw=$(echo "$sw $skala $szer" | awk '{n=int($1*$2+0.5); print (n<$3)?$3:n}')
  nh=$(echo "$sh $skala $wys"  | awk '{n=int($1*$2+0.5); print (n<$3)?$3:n}')

  sips -z "$nh" "$nw" "$cel" >/dev/null
  sips -c "$wys" "$szer" "$cel" >/dev/null
  sips -s format jpeg -s formatOptions "$JAKOSC" "$cel" >/dev/null

  waga=$(( $(stat -f%z "$cel") / 1024 ))
  printf "  ✓ %-18s %sx%s  %s kB\n" "$nazwa.jpg" "$szer" "$wys" "$waga"
  zrobione=$((zrobione + 1))
done

echo
echo "Gotowe: $zrobione podmienionych, $pominiete slotów bez zdjęcia w katalogu źródłowym."

if [ "$zrobione" -gt 0 ]; then
  echo
  echo "Zostały jeszcze dwie rzeczy do zrobienia ręcznie:"
  echo "  1. Popraw teksty alternatywne (alt) przy podmienionych zdjęciach w plikach HTML."
  echo "  2. Jeśli podmieniłeś WSZYSTKIE zdjęcia — usuń stronę zdjecia.html"
  echo "     oraz odnośnik „źródła zdjęć\" w stopce każdej podstrony."
fi
