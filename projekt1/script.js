/* =====================================================
   Fizjoterapia K. Świerkula-Stępień — interakcje
   ===================================================== */

(function () {
  'use strict';

  // ?motion=1 wymusza animacje (do testów) mimo systemowego prefers-reduced-motion
  var forceMotion = new URLSearchParams(window.location.search).has('motion');
  var prefersReducedMotion = !forceMotion &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (forceMotion) document.body.classList.add('force-motion');

  /* ---------------------------------------------------
     1. HERO — scroll expand
     Odpowiednik komponentu ScrollExpandMedia: podczas
     przewijania sekcji hero centralne zdjęcie rośnie od
     300×400 px do niemal pełnego ekranu, tytuł rozjeżdża
     się na boki, a tło i przyciemnienie zanikają.
     Zamiast przechwytywania zdarzeń wheel/touch użyto
     position: sticky + postęp scrolla, co działa płynnie
     także na urządzeniach dotykowych.
     --------------------------------------------------- */

  var heroSpacer = document.getElementById('heroSpacer');
  var heroSticky = document.querySelector('.hero__sticky');
  var heroMedia = document.getElementById('heroMedia');
  var heroBg = document.getElementById('heroBg');
  var heroVeil = document.getElementById('heroVeil');
  var titleLeft = document.getElementById('titleLeft');
  var titleRight = document.getElementById('titleRight');
  var heroHint = document.getElementById('heroHint');
  var heroEyebrow = document.getElementById('heroEyebrow');

  function clamp01(v) {
    return Math.min(Math.max(v, 0), 1);
  }

  function updateHero() {
    var vh = window.innerHeight;
    var range = heroSpacer.offsetHeight - vh;
    var progress = range > 0 ? clamp01(window.scrollY / range) : 1;

    // Po zakończeniu animacji warstwa przechodzi z fixed na absolute
    // (dół spacera), aby odjechać ze scrollem razem z resztą strony
    heroSticky.classList.toggle('is-done', progress >= 1);

    var isMobile = window.innerWidth < 768;

    // Wymiary mediów: 300×400 px → niemal pełny ekran
    var w = 300 + progress * (isMobile ? 650 : 1250);
    var h = 400 + progress * (isMobile ? 200 : 400);

    heroMedia.style.width = w + 'px';
    heroMedia.style.height = h + 'px';

    // Tytuł rozjeżdża się na boki
    var shift = progress * (isMobile ? 180 : 150);
    titleLeft.style.transform = 'translateX(-' + shift + 'vw)';
    titleRight.style.transform = 'translateX(' + shift + 'vw)';

    // Tło i przyciemnienie zanikają
    heroBg.style.opacity = String(1 - progress);
    heroVeil.style.opacity = String(0.7 - progress * 0.55);

    // Podpowiedź i nagłówek gasną szybciej
    var fadeFast = String(clamp01(1 - progress * 2.4));
    heroHint.style.opacity = fadeFast;
    heroEyebrow.style.opacity = fadeFast;
  }

  // Efekt jest sterowany scrollem użytkownika (nie odtwarza się sam),
  // dlatego działa również przy systemowym ograniczeniu animacji.
  if (heroSpacer) {
    window.addEventListener('scroll', updateHero, { passive: true });
    window.addEventListener('resize', updateHero);
    updateHero();
  }

  /* ---------------------------------------------------
     2. Nawigacja — tło po przewinięciu + menu mobilne
     --------------------------------------------------- */

  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function updateNav() {
    var threshold = heroSpacer
      ? heroSpacer.offsetHeight - window.innerHeight * 1.15
      : 40;
    nav.classList.toggle('is-solid', window.scrollY > Math.max(threshold, 40));
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  navToggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
  });

  navLinks.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------------------------------------------------
     3. Animacje wejścia sekcji
     --------------------------------------------------- */

  var revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------------------------------------------
     4. Liczniki statystyk
     --------------------------------------------------- */

  var counters = document.querySelectorAll('[data-count]');

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var duration = 1400;
    var start = null;

    function frame(ts) {
      if (!start) start = ts;
      var p = clamp01((ts - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(eased * target));
      if (p < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute('data-count');
    });
  }

  /* ---------------------------------------------------
     5. Slider opinii
     --------------------------------------------------- */

  var track = document.getElementById('sliderTrack');
  var dotsWrap = document.getElementById('sliderDots');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var slides = track ? track.children : [];
  var current = 0;
  var autoTimer = null;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + current * 100 + '%)';
    var dots = dotsWrap.querySelectorAll('button');
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
      dot.setAttribute('aria-selected', String(i === current));
    });
  }

  function restartAuto() {
    if (prefersReducedMotion) return;
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(function () { goTo(current + 1); }, 6500);
  }

  if (track && slides.length) {
    for (var i = 0; i < slides.length; i++) {
      (function (idx) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Opinia ' + (idx + 1));
        dot.addEventListener('click', function () {
          goTo(idx);
          restartAuto();
        });
        dotsWrap.appendChild(dot);
      })(i);
    }

    prevBtn.addEventListener('click', function () { goTo(current - 1); restartAuto(); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); restartAuto(); });

    // Obsługa gestów dotykowych
    var touchX = null;
    track.addEventListener('touchstart', function (e) {
      touchX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 45) goTo(dx < 0 ? current + 1 : current - 1);
      touchX = null;
      restartAuto();
    }, { passive: true });

    var sliderEl = document.getElementById('slider');
    sliderEl.addEventListener('mouseenter', function () {
      if (autoTimer) clearInterval(autoTimer);
    });
    sliderEl.addEventListener('mouseleave', restartAuto);

    goTo(0);
    restartAuto();
  }

  /* ---------------------------------------------------
     6. Rok w stopce
     --------------------------------------------------- */

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
