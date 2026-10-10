/*
 * GymGear Guide - shared behaviour (loaded on every page after equipment-data.js)
 * Exposes helpers on window.GG that the page-specific scripts reuse.
 */
(function () {
  "use strict";

  const GG = (window.GG = window.GG || {});
  GG.items = window.GG_EQUIPMENT || [];
  GG.categories = window.GG_CATEGORIES || [];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Lookups and formatting ---------- */
  GG.byId = (id) => GG.items.find((i) => i.id === id);
  GG.catById = (id) => GG.categories.find((c) => c.id === id);
  GG.esc = (s) =>
    String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  // Indian digit grouping, e.g. 250000 -> ₹2,50,000
  GG.inr = (n) => "₹" + Number(n).toLocaleString("en-IN");
  GG.range = (it) => GG.inr(it.min) + " – " + GG.inr(it.max);
  GG.detailUrl = (id) => "equipment-details.html?id=" + encodeURIComponent(id);

  /* ---------- Price tiers (grouped by the midpoint of each item's range) ---------- */
  GG.TIERS = [
    { id: "budget", name: "Budget-friendly equipment", rule: "Typical range centres below ₹5,000",
      test: (m) => m < 5000 },
    { id: "home", name: "Home gym equipment", rule: "Typical range centres between ₹5,000 and ₹50,000",
      test: (m) => m >= 5000 && m < 50000 },
    { id: "mid", name: "Mid-range commercial equipment", rule: "Typical range centres between ₹50,000 and ₹2,00,000",
      test: (m) => m >= 50000 && m < 200000 },
    { id: "premium", name: "Premium commercial gym equipment", rule: "Typical range centres above ₹2,00,000",
      test: (m) => m >= 200000 }
  ];
  GG.tierOf = (it) => GG.TIERS.find((t) => t.test((it.min + it.max) / 2));
  GG.itemsInTier = (tier) => GG.items.filter((it) => GG.tierOf(it).id === tier.id).sort((a, b) => a.min - b.min);

  /* ---------- Images (generated illustration unless real photos are enabled) ---------- */
  GG.placeholder = function (it) {
    const cat = GG.catById(it.cat);
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#262626"/><stop offset="1" stop-color="#000"/></linearGradient></defs>' +
      '<rect width="800" height="600" fill="url(#g)"/>' +
      '<g transform="translate(400 235)" fill="none">' +
      '<circle r="150" stroke="#ff6a00" stroke-width="30"/>' +
      '<circle r="96" stroke="#fff" stroke-opacity=".9" stroke-width="6"/>' +
      '<circle r="52" stroke="#ff6a00" stroke-width="10" stroke-dasharray="14 10"/>' +
      '<circle r="16" fill="#fff"/></g>' +
      '<text x="400" y="485" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="42" font-weight="700" fill="#fff">' +
      GG.esc(it.name) + "</text>" +
      '<text x="400" y="535" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="26" fill="#ff9a52">' +
      GG.esc(cat ? cat.name : "") + "</text></svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  };
  GG.imageSrc = function (it) {
    const cat = GG.catById(it.cat);
    return window.GG_USE_LOCAL_IMAGES ? "images/" + cat.folder + "/" + it.id + ".jpg" : GG.placeholder(it);
  };
  GG.imgTag = function (it, lazy) {
    const cat = GG.catById(it.cat);
    return (
      '<img src="' + GG.imageSrc(it) + '" alt="' + GG.esc(it.name + " - " + cat.name.toLowerCase() + " illustration") +
      '" width="800" height="600" ' + (lazy === false ? "" : 'loading="lazy" ') + 'decoding="async" data-fallback-id="' + it.id + '">'
    );
  };
  // If a real photo fails to load, swap in the generated illustration.
  document.addEventListener("error", function (e) {
    const img = e.target;
    if (img && img.tagName === "IMG" && img.dataset.fallbackId) {
      const it = GG.byId(img.dataset.fallbackId);
      img.removeAttribute("data-fallback-id");
      if (it) img.src = GG.placeholder(it);
    }
  }, true);

  /* ---------- Equipment card ---------- */
  GG.cardHTML = function (it) {
    const cat = GG.catById(it.cat);
    return (
      '<article class="card">' +
      '<a class="card-media" href="' + GG.detailUrl(it.id) + '" tabindex="-1" aria-hidden="true">' + GG.imgTag(it) + "</a>" +
      '<div class="card-body">' +
      '<div class="badges"><span class="badge">' + GG.esc(cat.name) + '</span><span class="badge badge-level" data-level="' + it.diff + '">' + it.diff + "</span></div>" +
      '<h3 class="card-title"><a href="' + GG.detailUrl(it.id) + '">' + GG.esc(it.name) + "</a></h3>" +
      '<p class="card-text">' + GG.esc(it.short) + "</p>" +
      '<dl class="facts">' +
      "<div><dt>Muscles</dt><dd>" + GG.esc(it.primary.join(", ")) + "</dd></div>" +
      "<div><dt>Main uses</dt><dd>" + GG.esc(it.uses.slice(0, 2).join("; ")) + "</dd></div>" +
      '<div><dt>Approx. price</dt><dd class="price">' + GG.range(it) + ' <span class="unit">' + GG.esc(it.unit) + "</span></dd></div>" +
      "</dl>" +
      '<div class="card-actions"><a class="btn btn-primary" href="' + GG.detailUrl(it.id) +
      '">View Details<span class="sr-only"> for ' + GG.esc(it.name) + "</span></a>" + GG.compareButton(it) + "</div>" +
      "</div></article>"
    );
  };
  GG.renderCards = function (container, list) {
    container.innerHTML = list.map(GG.cardHTML).join("");
    syncCompareUI();
  };

  /* ---------- Toast (small status message) ---------- */
  let toastTimer;
  GG.toast = function (msg) {
    let t = document.getElementById("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.className = "toast";
      t.setAttribute("role", "status");
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
  };

  /* ---------- Comparison list (saved in localStorage when available) ---------- */
  const KEY = "ggg-compare";
  const MAX = 4;
  let memory = [];
  function loadList() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (Array.isArray(v)) return v.filter((id) => GG.byId(id)).slice(0, MAX);
    } catch (e) { /* storage blocked: fall back to memory */ }
    return memory.filter((id) => GG.byId(id));
  }
  function saveList(list) {
    memory = list.slice();
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
    document.dispatchEvent(new CustomEvent("gg:compare", { detail: list }));
  }
  GG.compare = {
    MAX: MAX,
    list: loadList,
    has: (id) => loadList().includes(id),
    set: (ids) => saveList(ids.filter((id) => GG.byId(id)).slice(0, MAX)),
    remove: (id) => saveList(loadList().filter((x) => x !== id)),
    clear: () => saveList([]),
    toggle: function (id) {
      const list = loadList();
      if (list.includes(id)) { saveList(list.filter((x) => x !== id)); return; }
      if (list.length >= MAX) { GG.toast("You can compare up to " + MAX + " items. Remove one first."); return; }
      list.push(id);
      saveList(list);
    }
  };
  GG.compareButton = (it) =>
    '<button type="button" class="btn btn-ghost" data-compare="' + it.id + '" data-name="' + GG.esc(it.name) + '" aria-pressed="false">Compare</button>';

  function syncCompareUI() {
    const list = loadList();
    document.querySelectorAll("[data-compare]").forEach((btn) => {
      const on = list.includes(btn.dataset.compare);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("is-on", on);
      btn.textContent = on ? "In comparison" : "Compare";
      btn.setAttribute("aria-label", (on ? "Remove " : "Add ") + btn.dataset.name + (on ? " from comparison" : " to comparison"));
    });
    let bar = document.getElementById("compare-bar");
    const onComparePage = document.body.dataset.page === "comparison";
    if (!bar && !onComparePage) {
      bar = document.createElement("div");
      bar.id = "compare-bar";
      bar.className = "compare-bar";
      bar.hidden = true;
      bar.innerHTML =
        '<p class="compare-bar-text" id="compare-bar-text"></p>' +
        '<a class="btn btn-primary" href="comparison.html">Compare now</a>' +
        '<button type="button" class="btn btn-ghost-light" id="compare-bar-clear">Clear</button>';
      document.body.appendChild(bar);
      bar.querySelector("#compare-bar-clear").addEventListener("click", () => GG.compare.clear());
    }
    if (bar) {
      bar.hidden = list.length === 0;
      const txt = bar.querySelector("#compare-bar-text");
      if (txt) txt.textContent = list.length + " selected: " + list.map((id) => GG.byId(id).name).join(", ");
    }
  }
  document.addEventListener("gg:compare", syncCompareUI);
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-compare]");
    if (btn) GG.compare.toggle(btn.dataset.compare);
  });

  /* ---------- Navigation, scrolling, FAQ ---------- */
  function setupNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;
    const close = () => { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); };
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { close(); toggle.focus(); } });
  }

  function setupBackToTop() {
    const btn = document.getElementById("back-top");
    if (!btn) return;
    const update = () => { btn.classList.toggle("show", window.scrollY > 600); };
    window.addEventListener("scroll", update, { passive: true });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
    update();
  }

  // Only one FAQ answer open at a time inside the same list.
  document.addEventListener("toggle", function (e) {
    const d = e.target;
    if (d.tagName === "DETAILS" && d.open && d.parentElement && d.parentElement.classList.contains("faq-list")) {
      d.parentElement.querySelectorAll("details[open]").forEach((o) => { if (o !== d) o.open = false; });
    }
  }, true);

  /* ---------- Home page widgets ---------- */
  function setupHome() {
    const popular = document.getElementById("popular");
    if (popular) {
      const ids = ["treadmill", "dumbbells", "squat-rack", "lat-pulldown-machine", "kettlebells", "weightlifting-bench"];
      GG.renderCards(popular, ids.map(GG.byId).filter(Boolean));
    }
    document.querySelectorAll("[data-cat-count]").forEach((el) => {
      const n = GG.items.filter((i) => i.cat === el.dataset.catCount).length;
      el.textContent = n + (n === 1 ? " item" : " items");
    });
    const tiers = document.getElementById("tier-overview");
    if (tiers) {
      tiers.innerHTML = GG.TIERS.map((t) => {
        const list = GG.itemsInTier(t);
        return (
          '<article class="tier-card"><h3>' + t.name + "</h3><p>" + t.rule + ".</p>" +
          '<p class="tier-count">' + list.length + (list.length === 1 ? " item" : " items") +
          (list.length ? ", from " + GG.inr(list[0].min) : "") + "</p></article>"
        );
      }).join("");
    }
  }

  /* ---------- Contact form validation (demonstration only) ---------- */
  function setupContact() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    const status = document.getElementById("form-status");
    const rules = {
      name: (v) => (v.trim().length >= 2 ? "" : "Enter your name (at least 2 characters)."),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter a valid email address, like name@example.com."),
      subject: (v) => (v.trim().length >= 3 ? "" : "Enter a subject (at least 3 characters)."),
      message: (v) => (v.trim().length >= 10 ? "" : "Write a message of at least 10 characters.")
    };
    function check(field) {
      const input = form.elements[field];
      const err = form.querySelector('[data-error-for="' + field + '"]');
      const msg = rules[field](input.value);
      err.textContent = msg;
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      return !msg;
    }
    Object.keys(rules).forEach((f) => form.elements[f].addEventListener("blur", () => check(f)));
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";
      status.textContent = "";
      const results = Object.keys(rules).map(check);
      if (results.includes(false)) {
        const firstBad = Object.keys(rules).find((f) => form.elements[f].getAttribute("aria-invalid") === "true");
        form.elements[firstBad].focus();
        status.className = "form-status error";
        status.textContent = "Please fix the highlighted fields and try again.";
        return;
      }
      // No backend is connected, so nothing is sent or stored.
      status.className = "form-status success";
      status.textContent = "Demonstration only: your entries passed validation, but this site has no backend, so no message was emailed or saved.";
      form.reset();
      Object.keys(rules).forEach((f) => form.elements[f].setAttribute("aria-invalid", "false"));
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupNav();
    setupBackToTop();
    setupHome();
    setupContact();
    document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
    syncCompareUI();
  });
})();
