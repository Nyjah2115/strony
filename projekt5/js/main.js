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
     Liczony z zegara odwiedzającego. Dopóki JS nie wypełni treści, plakietka
     jest ukryta — sama tabela godzin wystarcza i bez skryptu.              */
  const statusBox = document.getElementById('openStatus');
  if (statusBox) {
    const HOURS = { 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: [9, 15], 0: null };
    const DAY_NAMES = ['w niedzielę', 'w poniedziałek', 'we wtorek', 'w środę', 'w czwartek', 'w piątek', 'w sobotę'];
    const stateEl = document.getElementById('openState');
    const untilEl = document.getElementById('openUntil');
    const hhmm = h => h + ':00';

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

      statusBox.hidden = false;

      document.querySelectorAll('.hours tr[data-days]').forEach(tr => {
        const days = tr.dataset.days.split(',').map(Number);
        tr.classList.toggle('is-today', days.indexOf(day) !== -1);
      });
    };

    updateStatus();
    setInterval(updateStatus, 60000);   // status ma się zmienić bez przeładowania strony
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

  /* ---------- SLIDER OPINII ---------- */
  const track = document.getElementById('track');
  const dotsBox = document.getElementById('dots');
  if (track && dotsBox) {
    const slides = [...track.children];
    let index = 0;
    let timer = null;

    const goTo = i => {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dotsBox.querySelectorAll('.slider__dot').forEach((d, n) => {
        d.classList.toggle('is-active', n === index);
        d.setAttribute('aria-selected', String(n === index));
      });
    };

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider__dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Opinia ${i + 1}`);
      dot.addEventListener('click', () => { goTo(i); restart(); });
      dotsBox.appendChild(dot);
    });

    const restart = () => {
      clearInterval(timer);
      timer = setInterval(() => goTo(index + 1), 7000);
    };

    document.getElementById('prev').addEventListener('click', () => { goTo(index - 1); restart(); });
    document.getElementById('next').addEventListener('click', () => { goTo(index + 1); restart(); });

    const slider = document.getElementById('slider');
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', restart);

    // przesuwanie palcem
    let startX = 0;
    slider.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) { goTo(index + (dx < 0 ? 1 : -1)); restart(); }
    }, { passive: true });

    goTo(0);
    restart();
  }

});
