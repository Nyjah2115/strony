/* =========================================================
   Serwis Sobowiec — skrypty (czysty JS, bez bibliotek)
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 1. Rok w stopce ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- 2. Menu mobilne ---------- */
  var menu = document.getElementById("mobileMenu");
  var backdrop = document.getElementById("menuBackdrop");
  var openBtn = document.getElementById("menuOpen");
  var closeBtn = document.getElementById("menuClose");

  function openMenu() {
    menu.hidden = false;
    backdrop.hidden = false;
    openBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }
  function closeMenu(returnFocus) {
    menu.hidden = true;
    backdrop.hidden = true;
    openBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (returnFocus) openBtn.focus();
  }
  if (menu && openBtn && closeBtn && backdrop) {
    openBtn.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", function () { closeMenu(true); });
    backdrop.addEventListener("click", function () { closeMenu(false); });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { closeMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) closeMenu(true);
    });
  }

  /* ---------- 3. Godziny otwarcia + status „otwarte / zamknięte" ----------
     Indeks jak Date.prototype.getDay(): 0 = niedziela.
     UWAGA: godziny do potwierdzenia z właścicielem. */
  var HOURS = [
    { day: "Niedziela",    open: null,    close: null },
    { day: "Poniedziałek", open: "09:00", close: "17:00" },
    { day: "Wtorek",       open: "09:00", close: "17:00" },
    { day: "Środa",        open: "09:00", close: "17:00" },
    { day: "Czwartek",     open: "09:00", close: "17:00" },
    { day: "Piątek",       open: "09:00", close: "17:00" },
    { day: "Sobota",       open: "09:00", close: "13:00" }
  ];

  function toMinutes(t) {
    var p = t.split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function describeNextOpening(now) {
    for (var off = 1; off <= 7; off++) {
      var e = HOURS[(now.getDay() + off) % 7];
      if (e.open) {
        return off === 1
          ? "otwieramy jutro o " + e.open
          : "otwieramy w " + e.day.toLowerCase() + " o " + e.open;
      }
    }
    return "sprawdź godziny otwarcia";
  }

  function computeState(now) {
    var e = HOURS[now.getDay()];
    var mins = now.getHours() * 60 + now.getMinutes();
    if (e.open && e.close) {
      var o = toMinutes(e.open), c = toMinutes(e.close);
      if (mins >= o && mins < c) {
        return { open: true, msg: "Teraz otwarte · dziś do " + e.close };
      }
      if (mins < o) {
        return { open: false, msg: "Zamknięte · otwieramy dziś o " + e.open };
      }
    }
    return { open: false, msg: "Zamknięte · " + describeNextOpening(now) };
  }

  function renderStatus() {
    var now = new Date();
    var state = computeState(now);
    document.querySelectorAll("[data-status-badge]").forEach(function (el) {
      el.textContent = state.msg;
      el.classList.toggle("is-open", state.open);
      el.classList.toggle("is-closed", !state.open);
    });

    // podświetl dzisiejszy dzień w tabeli godzin
    var table = document.getElementById("hoursTable");
    if (table) {
      table.querySelectorAll("li").forEach(function (li) {
        var isToday = Number(li.dataset.day) === now.getDay();
        li.classList.toggle("is-today", isToday);
        var dayCell = li.querySelector(".day");
        var tag = dayCell.querySelector(".today-tag");
        if (isToday && !tag) {
          var s = document.createElement("span");
          s.className = "today-tag";
          s.textContent = "Dziś";
          dayCell.appendChild(s);
        } else if (!isToday && tag) {
          tag.remove();
        }
      });
    }
  }
  renderStatus();
  setInterval(renderStatus, 60000);

  /* ---------- 4. Pływający przycisk „Zadzwoń" ---------- */
  var fab = document.getElementById("callFab");
  if (fab) {
    var onScroll = function () {
      fab.classList.toggle("is-visible", window.scrollY > 520);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- 5. Animacje przy scrollu ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  // delikatny stagger w siatkach
  document.querySelectorAll(".grid-3, .contact-col").forEach(function (group) {
    Array.prototype.slice.call(group.children).forEach(function (child, i) {
      if (child.classList.contains("reveal")) {
        child.style.transitionDelay = i * 70 + "ms";
      }
    });
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -80px 0px", threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- 6. Pasek marek: nieskończona pętla ----------
     Nie używamy natywnego przewijania (ma twarde końce, o które pasek się zacinał).
     Taśmę przesuwamy przez `transform`, a pozycję zawijamy modulo szerokość jednej
     kopii listy — dzięki temu marki lecą w kółko bez początku i końca, w obie strony.
     Kopie listy dokłada JS, więc w HTML zostaje jedna, czytelna lista. */
  var scroller = document.getElementById("brandsScroller");
  if (scroller) {
    var track = scroller.querySelector(".marquee-track");
    var prevBtn = document.querySelector("[data-brands-prev]");
    var nextBtn = document.querySelector("[data-brands-next]");
    var brandsRow = scroller.parentElement;

    var originals = Array.prototype.slice.call(track.children);
    var COPY = originals.length;
    var period = 0;      // szerokość jednej kopii listy
    var offset = 0;      // aktualne przesunięcie taśmy
    var dragging = false;
    var gliding = false;
    var paused = false;
    var tweenRaf = 0;

    var appendCopy = function () {
      originals.forEach(function (el) {
        var c = el.cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        track.appendChild(c);
      });
    };

    var wrap = function (v) {
      if (period <= 0) return v;
      v = v % period;
      return v < 0 ? v + period : v;
    };

    var render = function () {
      track.style.transform = "translateX(" + -offset + "px)";
    };

    var measure = function () {
      if (track.children.length > COPY) {
        period = track.children[COPY].offsetLeft - track.children[0].offsetLeft;
      }
      // dokładaj kopie, aż taśma pokryje okno nawet przy maksymalnym przesunięciu
      var guard = 0;
      while (period > 0 && track.scrollWidth < scroller.clientWidth + period + 100 && guard++ < 20) {
        appendCopy();
      }
      offset = wrap(offset);
      render();
    };

    appendCopy(); // druga kopia — pozwala zmierzyć szerokość jednej listy
    measure();
    window.addEventListener("resize", measure);
    // szerokości chipów zależą od czcionek — przelicz po ich doładowaniu
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

    var stepPx = function () { return Math.max(180, scroller.clientWidth * 0.7); };

    var glide = function (dist) {
      var from = offset;
      var t0 = performance.now();
      var dur = 450;
      cancelAnimationFrame(tweenRaf);
      gliding = true;
      var stepFn = function (now) {
        var k = Math.min(1, (now - t0) / dur);
        var e = 1 - Math.pow(1 - k, 3); // easeOutCubic
        offset = wrap(from + dist * e);
        render();
        if (k < 1) tweenRaf = requestAnimationFrame(stepFn);
        else gliding = false;
      };
      tweenRaf = requestAnimationFrame(stepFn);
    };

    if (prevBtn) prevBtn.addEventListener("click", function () { glide(-stepPx()); });
    if (nextBtn) nextBtn.addEventListener("click", function () { glide(stepPx()); });

    // klawiatura (pasek jest fokusowalny)
    scroller.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); glide(-stepPx()); }
      if (e.key === "ArrowRight") { e.preventDefault(); glide(stepPx()); }
    });

    // przeciąganie myszką / palcem
    var startX = 0, startOffset = 0;
    scroller.addEventListener("pointerdown", function (e) {
      dragging = true;
      startX = e.clientX;
      startOffset = offset;
      cancelAnimationFrame(tweenRaf);
      gliding = false;
      scroller.classList.add("is-dragging");
      try { scroller.setPointerCapture(e.pointerId); } catch (err) {}
    });
    scroller.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      offset = wrap(startOffset - (e.clientX - startX));
      render();
    });
    var endDrag = function (e) {
      if (!dragging) return;
      dragging = false;
      scroller.classList.remove("is-dragging");
      try { scroller.releasePointerCapture(e.pointerId); } catch (err) {}
    };
    scroller.addEventListener("pointerup", endDrag);
    scroller.addEventListener("pointercancel", endDrag);

    // auto-przewijanie — tylko dla osób bez włączonej redukcji animacji
    if (brandsRow) {
      ["pointerenter", "focusin"].forEach(function (ev) {
        brandsRow.addEventListener(ev, function () { paused = true; });
      });
      ["pointerleave", "focusout"].forEach(function (ev) {
        brandsRow.addEventListener(ev, function () { paused = false; });
      });
    }
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var lastT = 0;
      var autoLoop = function (t) {
        if (!lastT) lastT = t;
        var dt = (t - lastT) / 1000;
        lastT = t;
        if (!paused && !dragging && !gliding && period > 0) {
          offset = wrap(offset + dt * 38); // px na sekundę
          render();
        }
        requestAnimationFrame(autoLoop);
      };
      requestAnimationFrame(autoLoop);
    }

    // udostępnij do weryfikacji
    scroller.__brands = { getOffset: function () { return offset; }, getPeriod: function () { return period; } };
  }

  /* ---------- 7. Modele 3D — poprawka materiału + komunikat awaryjny ----------
     Przeglądarki blokują wczytanie pliku .glb, gdy stronę otwiera się wprost
     z dysku (file://). Zamiast pustej dziury pokazujemy, co zrobić. */
  Array.prototype.forEach.call(
    document.querySelectorAll("model-viewer"),
    function (mv) {
      /* Poprawka materiału: modele .glb mają materiały z alphaMode "BLEND"
         (czyli „przezroczyste"), mimo że ich krycie wynosi 1. W trybie BLEND
         renderer wyłącza zapis głębi (depth write), więc ścianki rysują się
         w złej kolejności — widać tył modelu przez przód. Wymuszamy OPAQUE. */
      var fixMaterials = function () {
        try {
          if (!mv.model || !mv.model.materials || !mv.model.materials.length) return false;
          mv.model.materials.forEach(function (m) {
            if (m.getAlphaMode() === "BLEND") m.setAlphaMode("OPAQUE");
          });
          return true;
        } catch (e) {
          return false;
        }
      };
      mv.addEventListener("load", fixMaterials);
      fixMaterials();
      // Zabezpieczenie: zdarzenie "load" bywa odraczane (np. gdy karta jest
      // nieaktywna w tle), więc dodatkowo odpytujemy, aż model będzie gotowy.
      var tries = 0;
      var poll = setInterval(function () {
        if (fixMaterials() || ++tries > 60) clearInterval(poll);
      }, 250);

      var showFallback = function (title, hint) {
        if (!mv.isConnected) return;
        clearInterval(poll);
        var box = document.createElement("div");
        box.className = "model-fallback";
        var t = document.createElement("strong");
        t.textContent = title;
        var h = document.createElement("span");
        h.textContent = hint;
        box.appendChild(t);
        box.appendChild(h);
        mv.replaceWith(box);
      };

      if (location.protocol === "file:") {
        showFallback(
          "Model 3D wymaga serwera",
          "Uruchom start.bat obok tego pliku (albo wrzuć stronę na hosting). Przeglądarka blokuje wczytywanie plików .glb otwartych bezpośrednio z dysku."
        );
      }

      mv.addEventListener("error", function () {
        showFallback(
          "Nie udało się wczytać modelu 3D",
          "Sprawdź, czy plik " + (mv.getAttribute("src") || ".glb") +
            " znajduje się w tym samym folderze co index.html."
        );
      });
    }
  );

  /* ---------- 8. Zgoda na cookies + warunkowa mapa Google ----------
     Mapa Google zapisuje pliki cookies i wysyła dane (m.in. IP) do Google,
     więc ładujemy ją DOPIERO po zgodzie — tego wymaga art. 173 Prawa
     telekomunikacyjnego w zw. z RODO. Sam wybór zapisujemy w localStorage
     (to element niezbędny — bez niego nie dałoby się zapamiętać decyzji). */
  var CONSENT_KEY = "serwis-cookie-consent"; // "all" | "necessary"

  var readConsent = function () {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  };
  var saveConsent = function (v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
  };

  var bar = document.getElementById("cookieBar");
  var mapHolder = document.getElementById("mapHolder");

  var loadMap = function () {
    if (!mapHolder || mapHolder.querySelector("iframe")) return;
    var src = mapHolder.getAttribute("data-map-src");
    if (!src) return;
    var f = document.createElement("iframe");
    f.src = src;
    f.title = mapHolder.getAttribute("data-map-title") || "Mapa dojazdu";
    f.loading = "lazy";
    f.referrerPolicy = "no-referrer-when-downgrade";
    mapHolder.innerHTML = "";
    mapHolder.appendChild(f);
  };

  // Na stronie polityki okno nie blokuje — inaczej nie dałoby się jej przeczytać
  // przed podjęciem decyzji (a to byłoby sprzeczne z sensem świadomej zgody).
  var softMode = document.body.getAttribute("data-cookie-mode") === "soft";

  var showBar = function () {
    if (!bar) return;
    bar.hidden = false;
    if (softMode) {
      bar.classList.add("is-soft");
      return;
    }
    // tryb blokujący: wymagamy aktywnego wyboru — strony nie da się przewinąć
    document.body.style.overflow = "hidden";
    var firstBtn = document.getElementById("cookieReject");
    if (firstBtn) firstBtn.focus();
  };

  var hideBar = function () {
    if (!bar) return;
    bar.hidden = true;
    document.body.style.overflow = "";
  };

  var saved = readConsent();
  if (saved === "all") loadMap();
  else if (!saved) showBar(); // brak decyzji — pytamy

  var acceptBtn = document.getElementById("cookieAccept");
  var rejectBtn = document.getElementById("cookieReject");
  var settingsBtn = document.getElementById("cookieSettings");
  var mapLoadBtn = document.getElementById("mapLoad");

  if (acceptBtn) acceptBtn.addEventListener("click", function () {
    saveConsent("all"); hideBar(); loadMap();
  });
  if (rejectBtn) rejectBtn.addEventListener("click", function () {
    saveConsent("necessary"); hideBar(); // mapa zostaje zablokowana
  });
  if (settingsBtn) settingsBtn.addEventListener("click", function () {
    showBar();
  });
  // „Pokaż mapę" = zgoda udzielona świadomie, w miejscu użycia
  if (mapLoadBtn) mapLoadBtn.addEventListener("click", function () {
    saveConsent("all"); hideBar(); loadMap();
  });
})();
