/* ==========================================================================
   Thaicooking Stalowa Wola — skrypty strony
   Czysty JavaScript, bez zależności. Ładowany z atrybutem `defer`.
   ========================================================================== */

(function () {
  "use strict";

  /* --- Dane godzin (0 = niedziela, zgodnie z Date.getDay()) --------------- */

  var HOURS = {
    0: { open: "11:00", close: "21:00", delivery: "11:00–20:30" },
    1: { open: "11:00", close: "21:00", delivery: "11:00–20:30" },
    2: { open: "11:00", close: "20:00", delivery: "11:00–19:30" },
    3: { open: "11:00", close: "21:00", delivery: "11:00–20:30" },
    4: { open: "11:00", close: "21:00", delivery: "11:00–20:30" },
    5: { open: "11:00", close: "21:00", delivery: "11:00–20:30" },
    6: { open: "11:00", close: "21:00", delivery: "11:00–20:30" }
  };

  var DELIVERY_MIN = 40; // minimalna wartość zamówienia z dostawą (zł)

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  var money = function (value) {
    return value.toFixed(2).replace(".", ",") + " zł";
  };

  var toMinutes = function (hhmm) {
    var parts = hhmm.split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  };

  /* --- 1. Menu mobilne ---------------------------------------------------- */

  function initNav() {
    var toggle = $(".nav-toggle");
    var nav = $("#main-nav");
    if (!toggle || !nav) return;

    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.setAttribute("data-open", String(open));
    };

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    document.addEventListener("click", function (e) {
      if (nav.getAttribute("data-open") !== "true") return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      setOpen(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024) setOpen(false);
    });
  }

  /* --- 2. Status "otwarte / zamknięte" ------------------------------------ */

  function initHours() {
    var now = new Date();
    var day = now.getDay();
    var today = HOURS[day];
    var minutes = now.getHours() * 60 + now.getMinutes();
    var isOpen = minutes >= toMinutes(today.open) && minutes < toMinutes(today.close);

    $$("[data-hours-row]").forEach(function (row) {
      if (parseInt(row.getAttribute("data-hours-row"), 10) === day) {
        row.setAttribute("data-today", "");
      }
    });

    $$("[data-status]").forEach(function (el) {
      el.classList.add(isOpen ? "status--open" : "status--closed");
      el.textContent = isOpen
        ? "Otwarte teraz · do " + today.close
        : "Zamknięte · otwieramy o " + today.open;
    });

    $$("[data-delivery-today]").forEach(function (el) {
      el.textContent = today.delivery;
    });
  }

  /* --- 3. Pojawianie się elementów przy przewijaniu ----------------------- */
  /* Świadomie bez IntersectionObserver: skok do kotwicy (np. z menu kategorii)
     przenosi nad sekcjami bez zmiany stanu przecięcia, więc IO nigdy by ich nie
     odsłonił i zostałyby niewidoczne. Ten przegląd bierze pod uwagę wszystko,
     co znalazło się powyżej dolnej krawędzi okna. */

  function watchOnScroll(items, activate) {
    if (!items.length) return;

    var pending = items.slice();
    var ticking = false;

    var sweep = function () {
      ticking = false;
      var limit = window.innerHeight * 0.92;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top > limit) return true;
        activate(el);
        return false;
      });
      if (!pending.length) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    };

    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(sweep);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("load", onScroll);
    sweep();
  }

  function initReveal() {
    watchOnScroll($$(".reveal"), function (el) { el.classList.add("is-in"); });
  }

  /* --- 4. Paski postępu (opinie) ----------------------------------------- */

  function initMeters() {
    watchOnScroll($$("[data-meter]"), function (el) {
      el.style.width = el.getAttribute("data-meter") + "%";
    });
  }

  /* --- 5. Koszyk ---------------------------------------------------------- */

  var STORAGE_KEY = "thaicooking-koszyk";
  var cart = [];

  function loadCart() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      cart = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(cart)) cart = [];
    } catch (err) {
      cart = [];
    }
  }

  function saveCart() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (err) { /* np. tryb prywatny — koszyk działa tylko w tej sesji */ }
  }

  function cartTotal() {
    return cart.reduce(function (sum, line) { return sum + line.price * line.qty; }, 0);
  }

  function cartCount() {
    return cart.reduce(function (sum, line) { return sum + line.qty; }, 0);
  }

  function addToCart(name, price) {
    var line = cart.filter(function (l) { return l.name === name; })[0];
    if (line) {
      line.qty += 1;
    } else {
      cart.push({ name: name, price: price, qty: 1 });
    }
    saveCart();
    renderCart();
  }

  function setQty(name, delta) {
    var line = cart.filter(function (l) { return l.name === name; })[0];
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) {
      cart = cart.filter(function (l) { return l.name !== name; });
    }
    saveCart();
    renderCart();
  }

  function renderCart() {
    var count = cartCount();
    var total = cartTotal();

    $$("[data-cart-count]").forEach(function (el) {
      var changed = el.textContent !== String(count);
      el.textContent = String(count);
      el.hidden = count === 0;
      if (changed && count > 0) bump(el);
    });

    $$("[data-cart-total]").forEach(function (el) { el.textContent = money(total); });

    var body = $("[data-cart-body]");
    if (body) {
      if (!cart.length) {
        body.innerHTML =
          '<div class="cart-empty">' +
          '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
          '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>' +
          '<path d="M2 3h3l2.5 12h11L21 7H6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          "<p>Twój koszyk jest pusty.</p>" +
          '<a class="btn btn--sm" href="menu.html">Przejdź do menu</a>' +
          "</div>";
      } else {
        body.innerHTML = cart.map(function (line) {
          return (
            '<div class="cart-line">' +
            '<div class="cart-line__body">' +
            '<div class="cart-line__name">' + escapeHtml(line.name) + "</div>" +
            '<div class="cart-line__price">' + money(line.price) + " × " + line.qty +
            " = <strong>" + money(line.price * line.qty) + "</strong></div>" +
            "</div>" +
            '<div class="qty">' +
            '<button type="button" data-qty="-1" data-name="' + escapeHtml(line.name) +
            '" aria-label="Zmniejsz liczbę: ' + escapeHtml(line.name) + '">−</button>' +
            "<output>" + line.qty + "</output>" +
            '<button type="button" data-qty="1" data-name="' + escapeHtml(line.name) +
            '" aria-label="Zwiększ liczbę: ' + escapeHtml(line.name) + '">+</button>' +
            "</div></div>"
          );
        }).join("");
      }
    }

    var hint = $("[data-cart-hint]");
    if (hint) {
      if (!cart.length) {
        hint.textContent = "";
      } else if (total < DELIVERY_MIN) {
        hint.textContent = "Do darmowej dostawy brakuje " + money(DELIVERY_MIN - total) + ".";
      } else {
        hint.textContent = "Zamówienie kwalifikuje się do dostawy na terenie Stalowej Woli.";
      }
    }

    var checkout = $("[data-cart-checkout]");
    if (checkout) checkout.toggleAttribute("disabled", cart.length === 0);

    renderOrderSummary();
  }

  /* Koszyk nie otwiera się sam po dodaniu dania — zamiast tego krótkie
     potwierdzenie na przycisku i podbicie licznika w nagłówku. */

  function bump(el) {
    el.removeAttribute("data-bump");
    void el.offsetWidth; // wymuszenie restartu animacji
    el.setAttribute("data-bump", "");
  }

  function confirmAdd(btn) {
    // Przyciski „+" w karcie menu nie mają napisu — potwierdzenie robi CSS (haczyk),
    // więc podmieniamy tekst tylko tam, gdzie faktycznie jest.
    var iconOnly = btn.hasAttribute("data-icon-only");

    if (btn.dataset.restoreTimer) {
      window.clearTimeout(Number(btn.dataset.restoreTimer));
    } else if (!iconOnly) {
      btn.dataset.originalText = btn.textContent;
    }

    if (!iconOnly) btn.textContent = "Dodano";
    btn.setAttribute("data-added", "");

    btn.dataset.restoreTimer = String(window.setTimeout(function () {
      if (!iconOnly) {
        btn.textContent = btn.dataset.originalText;
        delete btn.dataset.originalText;
      }
      btn.removeAttribute("data-added");
      delete btn.dataset.restoreTimer;
    }, 1400));
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function openCart(open) {
    var panel = $("[data-cart-panel]");
    var backdrop = $("[data-cart-backdrop]");
    if (!panel) return;
    panel.setAttribute("data-open", String(open));
    if (backdrop) backdrop.setAttribute("data-open", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      var closeBtn = $("[data-cart-close]", panel);
      if (closeBtn) closeBtn.focus();
    }
  }

  function initCart() {
    loadCart();
    renderCart();

    document.addEventListener("click", function (e) {
      var add = e.target.closest("[data-add]");
      if (add) {
        e.preventDefault();
        addToCart(add.getAttribute("data-name"), parseFloat(add.getAttribute("data-price")));
        confirmAdd(add);
        return;
      }

      var qty = e.target.closest("[data-qty]");
      if (qty) {
        setQty(qty.getAttribute("data-name"), parseInt(qty.getAttribute("data-qty"), 10));
        return;
      }

      if (e.target.closest("[data-cart-open]")) {
        e.preventDefault();
        openCart(true);
        return;
      }

      if (e.target.closest("[data-cart-close]") || e.target.closest("[data-cart-backdrop]")) {
        openCart(false);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") openCart(false);
    });
  }

  /* --- 6. Podsumowanie zamówienia (strona Dostawa) ------------------------ */

  function renderOrderSummary() {
    var box = $("[data-order-summary]");
    if (!box) return;

    if (!cart.length) {
      box.innerHTML =
        '<p class="muted">Koszyk jest pusty — wybierz dania w <a href="menu.html">menu</a>, ' +
        "a pojawią się tutaj.</p>";
      return;
    }

    box.innerHTML =
      "<ul class=\"footer-list\" style=\"list-style:none\">" +
      cart.map(function (l) {
        return "<li style=\"display:flex;justify-content:space-between;gap:1rem\"><span>" +
          l.qty + " × " + escapeHtml(l.name) + "</span><strong>" +
          money(l.price * l.qty) + "</strong></li>";
      }).join("") +
      "</ul>" +
      '<div class="cart-total" style="margin-top:1rem"><span>Razem</span><strong>' +
      money(cartTotal()) + "</strong></div>";
  }

  /* --- 7. Nawigacja po kategoriach menu ----------------------------------- */

  function initMenuNav() {
    var links = $$(".menu-nav__list a");
    if (!links.length || !("IntersectionObserver" in window)) return;

    var sections = links
      .map(function (a) { return $(a.getAttribute("href")); })
      .filter(Boolean);

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });

    sections.forEach(function (s) { io.observe(s); });
  }

  /* --- 8. Galeria (lightbox) ---------------------------------------------- */

  function initGallery() {
    var dialog = $("[data-lightbox]");
    if (!dialog || typeof dialog.showModal !== "function") return;

    var img = $("[data-lightbox-img]", dialog);
    var caption = $("[data-lightbox-caption]", dialog);

    var open = function (item) {
      var source = $("img", item);
      img.src = source.src;
      img.alt = source.alt;
      caption.textContent = source.alt;
      dialog.showModal();
    };

    $$(".gallery__item").forEach(function (item) {
      item.addEventListener("click", function () { open(item); });
      item.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        open(item);
      });
    });

    $("[data-lightbox-close]", dialog).addEventListener("click", function () {
      dialog.close();
    });

    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
  }

  /* --- 9. Walidacja formularzy ------------------------------------------- */

  function initForms() {
    $$("form[data-validate]").forEach(function (form) {
      var status = $("[data-form-status]", form);

      var showError = function (input, message) {
        var field = input.closest(".field, fieldset, .check");
        if (!field) return;
        field.setAttribute("data-invalid", "");
        var slot = $(".err", field);
        if (slot) slot.textContent = message;
      };

      var clearError = function (input) {
        var field = input.closest(".field, fieldset, .check");
        if (!field) return;
        field.removeAttribute("data-invalid");
        var slot = $(".err", field);
        if (slot) slot.textContent = "";
      };

      $$("input, select, textarea", form).forEach(function (input) {
        input.addEventListener("input", function () { clearError(input); });
        input.addEventListener("blur", function () {
          if (input.value && !input.checkValidity()) {
            showError(input, input.validationMessage);
          }
        });
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var firstInvalid = null;

        $$("input, select, textarea", form).forEach(function (input) {
          clearError(input);
          if (input.checkValidity()) return;
          showError(input, input.validationMessage);
          if (!firstInvalid) firstInvalid = input;
        });

        if (firstInvalid) {
          firstInvalid.focus();
          if (status) {
            status.hidden = false;
            status.className = "form-status form-status--err";
            status.innerHTML = iconSvg("alert") + "<span>Uzupełnij zaznaczone pola i spróbuj ponownie.</span>";
          }
          return;
        }

        if (status) {
          status.hidden = false;
          status.className = "form-status form-status--ok";
          status.innerHTML = iconSvg("check") + "<span>" +
            (form.getAttribute("data-success") ||
              "Dziękujemy! Zgłoszenie zostało zapisane — odezwiemy się wkrótce.") +
            "</span>";
          status.setAttribute("tabindex", "-1");
          status.focus();
        }
        form.reset();
        $$("[data-invalid]", form).forEach(function (f) { f.removeAttribute("data-invalid"); });
      });
    });
  }

  function iconSvg(kind) {
    var path = kind === "check"
      ? '<path d="m5 12 5 5 9-10"/>'
      : '<path d="M12 8v5M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>';
    return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + "</svg>";
  }

  /* --- 10. Minimalna data rezerwacji ------------------------------------- */

  function initDateLimits() {
    var input = $("input[type='date'][data-min-today]");
    if (!input) return;
    var now = new Date();
    var iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 10);
    input.min = iso;
    if (!input.value) input.value = iso;
  }

  /* --- 11. Hero: prezentacja dań i paralaksa ------------------------------ */

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initHero() {
    var hero = $("[data-hero]");
    var stage = $("[data-hero-stage]");
    if (!hero || !stage) return;

    var slides = $$(".hero__slide", stage);
    var dots = $$("[data-hero-dot]");
    var chip = $("[data-hero-label]");
    var dishEl = $("[data-hero-dish]");
    var priceEl = $("[data-hero-price]");
    var index = 0;
    var timer = null;
    var leaveTimer = null;
    var DELAY = 5000;
    var FADE = 900; // musi odpowiadać czasowi przejścia .hero__slide w CSS

    function show(next) {
      if (next === index) return;

      var leaving = slides[index];
      leaving.classList.remove("is-active");
      leaving.classList.add("is-leaving");
      dots[index].classList.remove("is-active");
      dots[index].removeAttribute("aria-current");

      // poprzedni kadr zostaje pod spodem, aż nowy w pełni się pojawi
      window.clearTimeout(leaveTimer);
      leaveTimer = window.setTimeout(function () {
        slides.forEach(function (s) { s.classList.remove("is-leaving"); });
      }, FADE);

      index = next;

      slides[index].classList.add("is-active");
      slides[index].removeAttribute("tabindex");
      slides[index].removeAttribute("aria-hidden");
      dots[index].classList.add("is-active");
      dots[index].setAttribute("aria-current", "true");

      dishEl.textContent = slides[index].getAttribute("data-dish");
      priceEl.textContent = slides[index].getAttribute("data-price");

      chip.classList.remove("is-swapping");
      void chip.offsetWidth; // restart animacji
      chip.classList.add("is-swapping");
    }

    function stop() {
      window.clearInterval(timer);
      timer = null;
    }

    function play() {
      stop();
      if (prefersReducedMotion() || document.hidden) return;
      timer = window.setInterval(function () {
        show((index + 1) % slides.length);
      }, DELAY);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10));
        play(); // odlicz od nowa po ręcznym wyborze
      });
    });

    // Pauza, gdy użytkownik ogląda lub porusza się po hero klawiaturą
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    hero.addEventListener("focusin", stop);
    hero.addEventListener("focusout", play);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else play();
    });

    // Pauza, gdy hero zjedzie z ekranu — nie ma po co animować w tle
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries[0].isIntersecting ? play() : stop();
      }, { threshold: 0.15 }).observe(hero);
    } else {
      play();
    }

    initHeroParallax(hero);
  }

  function initHeroParallax(hero) {
    if (prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;

    var ticking = false;
    var x = 0;
    var y = 0;

    hero.addEventListener("pointermove", function (e) {
      var rect = hero.getBoundingClientRect();
      x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
      y = ((e.clientY - rect.top) / rect.height - 0.5) * 30;
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        hero.style.setProperty("--px", x.toFixed(1));
        hero.style.setProperty("--py", y.toFixed(1));
      });
    });

    hero.addEventListener("pointerleave", function () {
      hero.style.setProperty("--px", 0);
      hero.style.setProperty("--py", 0);
    });
  }

  /* --- 12. Nagłówek nad ciemnym hero -------------------------------------- */

  function initHeaderScroll() {
    if (!document.body.hasAttribute("data-dark-header")) return;
    var header = $(".site-header");
    if (!header) return;

    var ticking = false;
    var update = function () {
      ticking = false;
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    };

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  /* --- 13. Nagłówek „O nas" sterowany przewijaniem ------------------------ */

  function initAboutHero() {
    var hero = $("[data-about-hero]");
    if (!hero) return;

    // Przy ograniczonym ruchu sekcja ma wysokość ekranu i --p zostaje na 1.
    if (prefersReducedMotion()) return;

    var ticking = false;

    function update() {
      ticking = false;
      var rect = hero.getBoundingClientRect();
      // droga do przebycia = wysokość sekcji minus jeden ekran (tyle „stoi" sticky)
      var zasieg = rect.height - window.innerHeight;
      if (zasieg <= 0) { hero.style.setProperty("--p", "1"); return; }

      var p = -rect.top / zasieg;
      p = p < 0 ? 0 : (p > 1 ? 1 : p);
      hero.style.setProperty("--p", p.toFixed(4));

      // Kafle dryfują tylko w bezruchu — pierwsze drgnięcie scrolla je zatrzymuje.
      hero.setAttribute("data-dryf", p > 0.005 ? "stop" : "ruch");
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* --- 14. Rok w stopce --------------------------------------------------- */

  function initYear() {
    $$("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* --- Start -------------------------------------------------------------- */

  function init() {
    initNav();
    initHours();
    initReveal();
    initMeters();
    initCart();
    initMenuNav();
    initGallery();
    initForms();
    initDateLimits();
    initHero();
    initHeaderScroll();
    initAboutHero();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
