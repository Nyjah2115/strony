/* ============================================================
   OVOPOL — interakcje strony
   ============================================================ */
(function () {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const plnFmt = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" });
  const numFmt = new Intl.NumberFormat("pl-PL");

  /* ---------- Nagłówek: cień po przewinięciu + przycisk "na górę" ---------- */
  const header = $(".header");
  const toTop = $("#toTop");
  window.addEventListener("scroll", () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
    toTop.classList.toggle("is-visible", window.scrollY > 700);
  }, { passive: true });
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Menu mobilne ---------- */
  const burger = $("#burger");
  const nav = $("#nav");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Zamknij menu" : "Otwórz menu");
  });
  $$(".nav__link").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }));

  /* ---------- Scroll-spy: podświetlenie aktywnej sekcji ---------- */
  const navLinks = $$(".nav__link");
  const sections = navLinks
    .map(a => $(a.getAttribute("href")))
    .filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a =>
        a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  sections.forEach(s => spy.observe(s));

  /* ---------- Animacje wejścia ---------- */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(el => revealObs.observe(el));

  /* ---------- Kalkulator hurtowy ---------- */
  const basePrice = { sciolka: 0.74, wybieg: 0.94, eko: 1.32 };   // zł netto / jajko (M)
  const sizeMult = { S: 0.88, M: 1.0, L: 1.1, XL: 1.22 };
  const calc = {
    type: $("#calcType"), size: $("#calcSize"), pack: $("#calcPack"),
    qty: $("#calcQty"), qtyOut: $("#calcQtyOut"),
    eggs: $("#calcEggs"), unit: $("#calcUnit"), total: $("#calcTotal"),
    discRow: $("#calcDiscountRow"), disc: $("#calcDiscount")
  };

  function recalc() {
    const eggs = +calc.pack.value * +calc.qty.value;
    const unit = basePrice[calc.type.value] * sizeMult[calc.size.value];
    let discount = 0;
    if (eggs >= 25920) discount = 0.07;        // 3+ palety
    else if (eggs >= 8640) discount = 0.04;    // 1+ paleta
    const total = eggs * unit * (1 - discount);

    calc.qtyOut.textContent = calc.qty.value;
    calc.eggs.textContent = numFmt.format(eggs);
    calc.unit.textContent = unit.toFixed(2).replace(".", ",") + " zł";
    calc.discRow.hidden = discount === 0;
    calc.disc.textContent = "−" + Math.round(discount * 100) + "%";
    calc.total.textContent = plnFmt.format(total);
  }
  ["input", "change"].forEach(ev => {
    [calc.type, calc.size, calc.pack, calc.qty].forEach(el => el.addEventListener(ev, recalc));
  });
  recalc();

  /* ---------- Kalkulator → formularz kontaktowy ---------- */
  const msgField = $("#fMsg");
  const packNames = { 30: "wytłaczanek (30 jaj)", 360: "kartonów (360 jaj)", 8640: "palet (8 640 jaj)" };
  $("#calcSend").addEventListener("click", () => {
    const typeText = calc.type.options[calc.type.selectedIndex].text;
    msgField.value =
      "Dzień dobry,\nproszę o wycenę zamówienia hurtowego:\n" +
      "• rodzaj: " + typeText + "\n" +
      "• klasa wagowa: " + calc.size.value + "\n" +
      "• ilość: " + calc.qty.value + " " + packNames[calc.pack.value] +
      " = " + calc.eggs.textContent + " jaj\n" +
      "• częstotliwość dostaw: (uzupełnij)\n\nProszę o kontakt.";
    $('input[name="type"][value="hurt"]').checked = true;
    location.hash = "#kontakt";
    setTimeout(() => $("#fName").focus(), 600);
  });

  /* ---------- Linki "Zapytaj o cenę" przy produktach ---------- */
  $$("[data-product]").forEach(link => link.addEventListener("click", () => {
    if (!msgField.value.trim()) {
      msgField.value = "Dzień dobry,\nproszę o ofertę na: " + link.dataset.product + ".\nSzacowane ilości i częstotliwość: (uzupełnij)";
    }
  }));

  /* ---------- Formularz kontaktowy ---------- */
  const form = $("#contactForm");
  const status = $("#formStatus");
  form.addEventListener("submit", e => {
    e.preventDefault();
    let valid = true;
    $$("[required]", form).forEach(el => {
      const empty = el.type === "checkbox" ? !el.checked : !el.value.trim();
      const badEmail = el.type === "email" && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value);
      el.classList.toggle("is-invalid", empty || badEmail);
      if (empty || badEmail) valid = false;
    });
    if (!valid) {
      status.textContent = "Uzupełnij zaznaczone pola, aby wysłać zapytanie.";
      status.className = "form__status is-err";
      return;
    }
    // Demo: tu podłącz backend / usługę typu Formspree.
    // Wysyłka przez klienta pocztowego użytkownika:
    const data = new FormData(form);
    const body =
      "Imię i nazwisko: " + data.get("name") + "\n" +
      "Firma: " + (data.get("company") || "—") + "\n" +
      "E-mail: " + data.get("email") + "\n" +
      "Telefon: " + (data.get("phone") || "—") + "\n" +
      "Rodzaj: " + data.get("type") + "\n\n" + data.get("message");
    const mailto = "mailto:biuro@ovopol.pl?subject=" +
      encodeURIComponent("Zapytanie ze strony — " + data.get("type")) +
      "&body=" + encodeURIComponent(body);

    status.textContent = "Dziękujemy! Otwieramy Twój program pocztowy — odpowiemy w ciągu 24 h.";
    status.className = "form__status is-ok";
    form.reset();
    window.location.href = mailto;
  });
  $$("input, textarea", form).forEach(el =>
    el.addEventListener("input", () => el.classList.remove("is-invalid")));

})();
