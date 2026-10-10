/*
 * GymGear Guide - equipment listing: live search, filters and sorting.
 * Reads ?q=, ?cat=, ?price=, ?level= and ?sort= from the URL so the home-page
 * search box and category cards can link straight to filtered results.
 */
(function () {
  "use strict";
  const GG = window.GG;
  const form = document.getElementById("filter-form");
  if (!form) return;

  const els = {
    q: form.elements.q, cat: form.elements.cat, price: form.elements.price,
    level: form.elements.level, sort: form.elements.sort
  };
  const results = document.getElementById("results");
  const count = document.getElementById("result-count");

  // Fill the category dropdown from the data file.
  GG.categories.forEach((c) => els.cat.insertAdjacentHTML("beforeend", '<option value="' + c.id + '">' + GG.esc(c.name) + "</option>"));

  // Difficulty dropdown: only levels that actually exist in the data.
  ["Beginner", "Intermediate", "Advanced"]
    .filter((lv) => GG.items.some((i) => i.diff === lv))
    .forEach((lv) => els.level.insertAdjacentHTML("beforeend", '<option value="' + lv + '">' + lv + "</option>"));

  // "0-5000" -> {lo:0, hi:5000}; "200000-" -> {lo:200000, hi:Infinity}
  function parseBand(v) {
    if (!v) return null;
    const p = v.split("-");
    return { lo: Number(p[0]) || 0, hi: p[1] === "" ? Infinity : Number(p[1]) };
  }

  function matchesText(it, q) {
    if (!q) return true;
    const hay = [it.name, it.short, GG.catById(it.cat).name, it.primary.join(" "), it.secondary.join(" "), it.uses.join(" "), it.purpose]
      .join(" ").toLowerCase();
    return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
  }

  let lastKey = null;

  function apply() {
    const q = els.q.value.trim();
    const band = parseBand(els.price.value);
    let list = GG.items.filter((it) =>
      matchesText(it, q) &&
      (!els.cat.value || it.cat === els.cat.value) &&
      (!els.level.value || it.diff === els.level.value) &&
      // Show items whose typical range overlaps the chosen band.
      (!band || (it.max >= band.lo && it.min <= band.hi))
    );

    const s = els.sort.value;
    list.sort((a, b) => {
      if (s === "name-desc") return b.name.localeCompare(a.name);
      if (s === "price-asc") return a.min - b.min || a.name.localeCompare(b.name);
      if (s === "price-desc") return b.max - a.max || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });

    count.textContent = "Showing " + list.length + " of " + GG.items.length + " items";
    // Skip re-drawing when nothing changed, so a button clicked right after typing
    // (which fires a "change" event on blur) is not replaced mid-click.
    const key = list.map((i) => i.id).join(",");
    updateUrl();
    if (key === lastKey) return;
    lastKey = key;
    if (!list.length) {
      results.innerHTML =
        '<div class="empty"><h3>No equipment matches your search</h3>' +
        "<p>Try a shorter keyword, a different category, or clear the filters.</p>" +
        '<button type="button" class="btn btn-primary" id="empty-reset">Clear all filters</button></div>';
      document.getElementById("empty-reset").addEventListener("click", reset);
    } else {
      GG.renderCards(results, list);
    }
  }

  function updateUrl() {
    const p = new URLSearchParams();
    if (els.q.value.trim()) p.set("q", els.q.value.trim());
    if (els.cat.value) p.set("cat", els.cat.value);
    if (els.price.value) p.set("price", els.price.value);
    if (els.level.value) p.set("level", els.level.value);
    if (els.sort.value !== "name-asc") p.set("sort", els.sort.value);
    const qs = p.toString();
    try { history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "")); } catch (e) { /* file:// may block this */ }
  }

  function reset() {
    form.reset();
    apply();
    els.q.focus();
  }

  // Restore state from the URL.
  const params = new URLSearchParams(location.search);
  els.q.value = params.get("q") || "";
  if (GG.catById(params.get("cat"))) els.cat.value = params.get("cat");
  ["price", "level", "sort"].forEach((k) => {
    const v = params.get(k);
    if (v && Array.from(els[k].options).some((o) => o.value === v)) els[k].value = v;
  });

  form.addEventListener("input", apply);
  form.addEventListener("change", apply);
  form.addEventListener("submit", (e) => { e.preventDefault(); apply(); });
  document.getElementById("filter-reset").addEventListener("click", reset);
  apply();
})();
