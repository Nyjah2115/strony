/* =====================================================
   Elegancki Facet Classic Barbershop — main.js
   Vanilla JS, bez zależności.
   ===================================================== */

/* ---------------------------------------------------------------
   KONFIGURACJA — jedyne miejsce, które trzeba podmienić na produkcji
   --------------------------------------------------------------- */
const CONFIG = {
  booksyUrl: 'https://booksy.com/pl-pl/218504_elegancki-facet-classic-barbershop_barber-shop_11115_stalowa-wola'
};

/* JS działa — dopiero teraz ukrywamy elementy animowane przy scrollu.
   Bez tej klasy (np. gdy JS się nie wczyta) strona jest w pełni widoczna. */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  /* Animacje działają u wszystkich. Systemowe „ogranicz ruch" nie wyłącza ich
     w JS — łagodzi je CSS (patrz blok @media prefers-reduced-motion w style.css). */

  /* ---------- linki do Booksy ---------- */
  document.querySelectorAll('[data-booking]').forEach(a => {
    a.href = CONFIG.booksyUrl;
  });

  /* ---------- rok w stopce ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- navbar: przyciemnienie przy scrollu ---------- */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- menu mobilne ---------- */
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  if (burger && menu) {
    const closeMenu = () => {
      menu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Otwórz menu');
      document.body.classList.remove('no-scroll');
    };

    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
      document.body.classList.toggle('no-scroll', open);
    });

    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu();
        burger.focus();
      }
    });
  }

  /* ---------- HERO: napis litera po literze ----------
     Litery pierwszej linii wchodzą kolejno z rozmycia; druga linia (złota)
     odsłania się przesuwającą maską — patrz .hero__line--accent w CSS.   */
  document.querySelectorAll('.hero__line').forEach(line => {
    const text = line.dataset.text || '';
    const frag = document.createDocumentFragment();
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch === ' ' ? ' ' : ch;
      span.style.animationDelay = (0.3 + i * 0.05) + 's';
      frag.appendChild(span);
    });
    line.appendChild(frag);
  });

  /* ---------- HERO: parallax i wygaszanie przy scrollu ----------
     Tło płynie wolniej niż strona, treść odjeżdża lekko w górę i gaśnie —
     dzięki temu przejście do kolejnej sekcji ma głębię.                  */
  const heroBg = document.querySelector('.hero__bg');
  const heroContent = document.querySelector('.hero__content');
  if (heroBg && heroContent) {
    const gentle = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ticking = false;

    const onHeroScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const h = window.innerHeight;
        const y = Math.min(window.scrollY, h);
        if (!gentle) {
          heroBg.style.transform = `translate3d(0, ${(y * 0.28).toFixed(1)}px, 0)`;
          heroContent.style.transform = `translate3d(0, ${(y * -0.12).toFixed(1)}px, 0)`;
        }
        heroContent.style.opacity = String(Math.max(0, 1 - (y / h) * 1.15));
        ticking = false;
      });
    };

    onHeroScroll();
    window.addEventListener('scroll', onHeroScroll, { passive: true });
  }

  /* ---------- KURSOR: NOŻYCZKI ----------
     Systemowy kursor chowamy dopiero tutaj (klasa na <html>), więc bez JS-u
     albo na dotyku zostaje normalny. Nożyczki płyną za myszką z interpolacją,
     przy kliknięciu ostrza się schodzą, a nad elementem klikalnym rosną —
     to zastępuje łapkę, której użytkownik już nie zobaczy.                  */
  const kursor = document.getElementById('kursor');
  if (kursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.documentElement.classList.add('kursor-nozyczki');

    const KLIKALNE = 'a, button, summary, label, [role="button"], .btn, .gallery__item, .burger';
    let celX = window.innerWidth / 2, celY = window.innerHeight / 2;
    let x = celX, y = celY, klatka = null, ruszony = false, snipTimer = null;

    const rysuj = () => {
      x += (celX - x) * 0.35;
      y += (celY - y) * 0.35;
      kursor.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
      // pętla zatrzymuje się, gdy nożyczki dogonią wskaźnik — bez mielenia procesora
      klatka = (Math.abs(celX - x) > 0.3 || Math.abs(celY - y) > 0.3)
        ? requestAnimationFrame(rysuj)
        : null;
    };

    window.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      celX = e.clientX;
      celY = e.clientY;

      if (!ruszony) {                       // pierwszy ruch — pojaw się na miejscu
        ruszony = true;
        x = celX; y = celY;
        kursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        kursor.classList.add('is-on');
      }

      kursor.classList.toggle('nad-klikalnym', !!(e.target.closest && e.target.closest(KLIKALNE)));
      if (!klatka) klatka = requestAnimationFrame(rysuj);
    }, { passive: true });

    window.addEventListener('mousedown', () => {
      kursor.classList.add('snip');
      clearTimeout(snipTimer);
      snipTimer = setTimeout(() => kursor.classList.remove('snip'), 110);
    });

    document.addEventListener('mouseleave', () => kursor.classList.remove('is-on'));
    document.addEventListener('mouseenter', () => { if (ruszony) kursor.classList.add('is-on'); });
  }

  /* ---------- złota poświata podążająca za kursorem ----------
     Płynie za myszką z opóźnieniem (interpolacja), przez co ciągnie się
     za kursorem jak miękki cień. Tylko dla wskaźnika typu myszka.        */
  const glow = document.getElementById('glow');
  if (glow && window.matchMedia('(hover: hover)').matches) {
    let targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
    let x = targetX, y = targetY, raf = null, started = false;

    const loop = () => {
      x += (targetX - x) * 0.14;
      y += (targetY - y) * 0.14;
      glow.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = (Math.abs(targetX - x) > 0.4 || Math.abs(targetY - y) > 0.4)
        ? requestAnimationFrame(loop)
        : null;
    };

    window.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      targetX = e.clientX;
      targetY = e.clientY;
      if (!started) {                       // pierwszy ruch — pojaw się na miejscu
        started = true;
        x = targetX; y = targetY;
        glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        glow.classList.add('is-on');
        return;
      }
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    document.addEventListener('mouseleave', () => glow.classList.remove('is-on'));
    document.addEventListener('mouseenter', () => { if (started) glow.classList.add('is-on'); });
  }

  /* ---------- animacje przy scrollu (fade + slide-up) ---------- */
  const revealables = [...document.querySelectorAll('.reveal')];

  const reveal = el => {
    const siblings = [...el.parentElement.querySelectorAll(':scope > .reveal')];
    const i = Math.max(0, siblings.indexOf(el));
    el.style.transitionDelay = Math.min(i * 90, 450) + 'ms';
    el.classList.add('is-visible');
  };

  if ('IntersectionObserver' in window) {
    let fired = false;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        fired = true;
        reveal(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(el => io.observe(el));

    // Zabezpieczenie: gdyby observer nigdy nie zadziałał, przełącz się na
    // zwykłe sprawdzanie pozycji przy scrollu — treść nigdy nie zostaje ukryta.
    setTimeout(() => {
      if (fired) return;
      io.disconnect();
      const check = () => {
        let left = false;
        revealables.forEach(el => {
          if (el.classList.contains('is-visible')) return;
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight * 0.92 && r.bottom > 0) reveal(el);
          else left = true;
        });
        if (!left) window.removeEventListener('scroll', check);
      };
      window.addEventListener('scroll', check, { passive: true });
      check();
    }, 1200);
  } else {
    revealables.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- LICZNIKI W KARCIE OCENY ----------
     W HTML-u wpisane są docelowe wartości (5,0 i 53), więc bez JS-u albo przy
     wyłączonych animacjach karta i tak pokazuje prawdę. Zerujemy dopiero
     w chwili startu animacji, gdy karta wjeżdża w widok.                    */
  const counters = [...document.querySelectorAll('[data-count-to]')];
  if (counters.length) {
    const gentle = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const format = (v, dec) => dec ? v.toFixed(dec).replace('.', ',') : String(Math.round(v));

    const run = el => {
      if (el.dataset.counted) return;
      el.dataset.counted = '1';
      const to = parseFloat(el.dataset.countTo);
      const dec = parseInt(el.dataset.countDecimals || '0', 10);
      if (gentle || !isFinite(to)) return;

      const duration = 1500;
      const started = performance.now();
      el.textContent = format(0, dec);

      const step = now => {
        const p = Math.min(1, (now - started) / duration);
        el.textContent = format(to * (1 - Math.pow(1 - p, 3)), dec);   // easeOut
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = format(to, dec);
      };
      requestAnimationFrame(step);

      // gdyby klatki animacji nie ruszyły, liczba i tak trafi na właściwą wartość
      setTimeout(() => { el.textContent = format(to, dec); }, duration + 300);
    };

    const target = counters[0].closest('.review-card') || counters[0];
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          counters.forEach(run);
          obs.disconnect();
        });
      }, { threshold: 0.4 });
      io.observe(target);
    } else {
      counters.forEach(run);
    }
  }

  /* ---------- STATUS „OTWARTE / ZAMKNIĘTE" ----------
     Liczony z zegara odwiedzającego. Plakietkę buduje w całości ten skrypt —
     w HTML-u nie ma po niej pustego miejsca. Bez JS-u zostaje sama tabela
     godzin, która jest kompletną informacją.                                */
  const hoursCard = document.querySelector('.hours-card');
  if (hoursCard) {
    const HOURS = { 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: [9, 15], 0: null };
    const DAY_NAMES = ['w niedzielę', 'w poniedziałek', 'we wtorek', 'w środę', 'w czwartek', 'w piątek', 'w sobotę'];
    const hhmm = h => h + ':00';

    const zrobSpan = klasa => {
      const el = document.createElement('span');
      el.className = klasa;
      return el;
    };

    const statusBox = document.createElement('p');
    statusBox.className = 'hours-card__status';
    const dot = zrobSpan('hours-card__dot');
    dot.setAttribute('aria-hidden', 'true');
    const stateEl = zrobSpan('hours-card__state');
    const untilEl = zrobSpan('hours-card__until');
    // spacja między stanem a dopiskiem — w układzie flex jest pomijana wizualnie,
    // ale dzięki niej zaznaczony/odczytany tekst nie sklei się w „Zamknięteotwieramy"
    statusBox.append(dot, stateEl, ' ', untilEl);
    hoursCard.prepend(statusBox);

    const updateStatus = () => {
      const now = new Date();
      const day = now.getDay();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const today = HOURS[day];
      const isOpen = !!today && minutes >= today[0] * 60 && minutes < today[1] * 60;

      statusBox.classList.toggle('is-open', isOpen);

      if (isOpen) {
        stateEl.textContent = 'Otwarte';
        untilEl.textContent = 'czynne do ' + hhmm(today[1]);
      } else {
        stateEl.textContent = 'Zamknięte';
        if (today && minutes < today[0] * 60) {
          untilEl.textContent = 'otwieramy dziś o ' + hhmm(today[0]);
        } else {
          for (let i = 1; i <= 7; i++) {
            const d = (day + i) % 7;
            if (!HOURS[d]) continue;
            untilEl.textContent = (i === 1 ? 'otwieramy jutro o ' : 'otwieramy ' + DAY_NAMES[d] + ' o ') + hhmm(HOURS[d][0]);
            break;
          }
        }
      }

      document.querySelectorAll('.hours tr[data-days]').forEach(tr => {
        const days = tr.dataset.days.split(',').map(Number);
        tr.classList.toggle('is-today', days.indexOf(day) !== -1);
      });
    };

    updateStatus();
    setInterval(updateStatus, 60000);   // status ma się zmienić bez przeładowania strony
  }

  /* ---------- MAPA NA ŻĄDANIE ----------
     Mapa Google zapisuje własne pliki cookies, więc wczytujemy ją dopiero
     po kliknięciu. Wybór zapamiętujemy w localStorage, żeby przy kolejnej
     wizycie mapa pojawiła się od razu — to jedyny wpis, jaki strona zapisuje.  */
  const mapBox = document.getElementById('mapConsent');
  if (mapBox) {
    const ZGODA = 'ef-mapa-zgoda';

    const wczytajMape = () => {
      const iframe = document.createElement('iframe');
      iframe.src = mapBox.dataset.mapSrc;
      iframe.title = 'Mapa — ul. Komisji Edukacji Narodowej 13/4, Stalowa Wola';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;
      iframe.setAttribute('width', '600');
      iframe.setAttribute('height', '450');
      mapBox.replaceWith(iframe);
    };

    let zapamietana = null;
    try { zapamietana = localStorage.getItem(ZGODA); } catch (e) { /* tryb prywatny */ }
    if (zapamietana === '1') {
      wczytajMape();
    } else {
      document.getElementById('mapLoad').addEventListener('click', () => {
        try { localStorage.setItem(ZGODA, '1'); } catch (e) { /* tryb prywatny */ }
        wczytajMape();
      });
    }
  }

  /* ---------- GALERIA: interaktywne hero ----------
     Postęp przewijania sekcji (0→1) trafia do --p, a każdy boczny kadr dostaje
     własne --e liczone od progu w data-gp. CSS zamienia to na przesunięcie,
     obrót i krycie. Bez JS-u zmienne pozostają puste, a wartości domyślne
     w CSS ustawiają zdjęcia od razu na docelowych miejscach.               */
  const galHero = document.getElementById('galHero');
  if (galHero) {
    const sides = [...galHero.querySelectorAll('[data-gp]')];
    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    let ticking = false;

    const updateStage = () => {
      const total = galHero.offsetHeight - window.innerHeight;
      const p = total > 0 ? clamp(-galHero.getBoundingClientRect().top / total, 0, 1) : 1;
      galHero.style.setProperty('--p', p.toFixed(3));

      sides.forEach(el => {
        const start = parseFloat(el.dataset.gp) || 0;
        const span = Math.max(0.05, 0.78 - start);          // każdy kadr dojeżdża do 78% scrolla
        el.style.setProperty('--e', clamp((p - start) / span, 0, 1).toFixed(3));
      });
    };

    const onStageScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { updateStage(); ticking = false; });
    };

    updateStage();
    window.addEventListener('scroll', onStageScroll, { passive: true });
    window.addEventListener('resize', onStageScroll, { passive: true });
  }

  /* ---------- GALERIA + LIGHTBOX ---------- */
  const items = [...document.querySelectorAll('.gallery__item')];
  const lb = document.getElementById('lightbox');
  if (lb && items.length) {
    const lbImg = document.getElementById('lbImg');
    const lbCap = document.getElementById('lbCaption');
    let current = 0;
    let lastFocused = null;

    const show = i => {
      current = (i + items.length) % items.length;
      const img = items[current].querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = `${img.alt} — ${current + 1} / ${items.length}`;
    };

    const openLb = i => {
      lastFocused = document.activeElement;
      show(i);
      lb.hidden = false;
      requestAnimationFrame(() => lb.classList.add('is-open'));
      document.body.classList.add('no-scroll');
      document.getElementById('lbClose').focus();
    };

    const closeLb = () => {
      lb.classList.remove('is-open');
      document.body.classList.remove('no-scroll');
      setTimeout(() => { lb.hidden = true; }, 300);
      if (lastFocused) lastFocused.focus();
    };

    items.forEach((item, i) => item.addEventListener('click', () => openLb(i)));
    document.getElementById('lbClose').addEventListener('click', closeLb);
    document.getElementById('lbPrev').addEventListener('click', () => show(current - 1));
    document.getElementById('lbNext').addEventListener('click', () => show(current + 1));
    lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });

    document.addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ---------- TAŚMA OPINII ----------
     Karty przewijają się ze stałą prędkością (px/s), a nie w stałym czasie —
     dzięki temu tempo jest takie samo niezależnie od liczby opinii i szerokości
     ekranu. Kopie dokleja skrypt, żeby pętla nie miała szwu.                  */
  const tasma = document.getElementById('ef-tasma');
  const pas = document.getElementById('ef-pas');
  if (tasma && pas) {
    const grupa = pas.querySelector('[data-ef-grupa]');
    const oryginal = grupa ? [...grupa.children] : [];

    if (oryginal.length) {
      const zbuduj = () => {
        tasma.classList.remove('is-gotowa');

        // 1. usuń poprzednie kopie (przy zmianie rozmiaru okna)
        [...pas.children].forEach((g, i) => { if (i > 0) g.remove(); });
        [...grupa.children].forEach((el, i) => { if (i >= oryginal.length) el.remove(); });

        // 2. grupa musi być szersza od ekranu, inaczej po prawej zrobi się dziura
        let bezpiecznik = 0;
        while (grupa.scrollWidth < tasma.clientWidth + 200 && bezpiecznik < 12) {
          oryginal.forEach(el => grupa.appendChild(el.cloneNode(true)));
          bezpiecznik++;
        }

        // 3. druga, identyczna grupa domyka pętlę
        const kopia = grupa.cloneNode(true);
        kopia.setAttribute('aria-hidden', 'true');
        kopia.removeAttribute('data-ef-grupa');
        pas.appendChild(kopia);

        // 4. czas przejazdu liczony ze stałej prędkości
        const predkosc = parseFloat(getComputedStyle(tasma).getPropertyValue('--ef-predkosc')) || 26;
        tasma.style.setProperty('--ef-czas', (grupa.scrollWidth / predkosc).toFixed(1) + 's');

        tasma.classList.add('is-gotowa');
      };

      zbuduj();

      // poza ekranem taśma staje — mniej pracy procesora i baterii
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(wpisy => {
          wpisy.forEach(w => tasma.classList.toggle('poza-ekranem', !w.isIntersecting));
        }, { rootMargin: '150px 0px' }).observe(tasma);
      }

      let przeliczanie = null;
      window.addEventListener('resize', () => {
        clearTimeout(przeliczanie);
        przeliczanie = setTimeout(zbuduj, 250);
      });
    }
  }
});
