/*
 * GymGear Guide - equipment detail page.
 * One template renders every item: equipment-details.html?id=<equipment id>
 */
(function () {
  "use strict";
  const GG = window.GG;
  const root = document.getElementById("detail-root");
  if (!root) return;

  const li = (arr) => "<ul>" + arr.map((x) => "<li>" + GG.esc(x) + "</li>").join("") + "</ul>";
  const section = (title, body, cls) =>
    '<section class="d-section ' + (cls || "") + '"><h2>' + title + "</h2>" + body + "</section>";

  const id = new URLSearchParams(location.search).get("id");
  const it = GG.byId(id);

  if (!it) {
    document.title = "Equipment not found | GymGear Guide";
    root.innerHTML =
      '<div class="empty"><h1>We could not find that equipment</h1><p>The link may be out of date. Browse the full list to find what you need.</p>' +
      '<a class="btn btn-primary" href="equipment.html">Browse all equipment</a></div>';
    return;
  }

  const cat = GG.catById(it.cat);
  const defaults = window.GG_CATEGORY_DEFAULTS[it.cat];
  const tier = GG.tierOf(it);

  // Page title and meta description for this item.
  document.title = it.name + ": uses, muscles worked and price in India | GymGear Guide";
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute("content", "What a " + it.name.toLowerCase() + " is used for, the muscles it works, safety tips and an approximate price range in India (" + GG.range(it) + ").");
  }

  const faqs = it.faqs.map((f) => ({ q: f[0], a: f[1] }));

  root.innerHTML =
    '<nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span>' +
    '<a href="equipment.html">Equipment</a><span aria-hidden="true">/</span>' +
    '<a href="equipment.html?cat=' + it.cat + '">' + GG.esc(cat.name) + '</a><span aria-hidden="true">/</span><span aria-current="page">' + GG.esc(it.name) + "</span></nav>" +

    '<div class="detail-top"><div class="detail-media">' + GG.imgTag(it, false) + "</div>" +
    '<div class="detail-intro"><div class="badges"><span class="badge">' + GG.esc(cat.name) + '</span><span class="badge badge-level" data-level="' + it.diff + '">' + it.diff + "</span></div>" +
    "<h1>" + GG.esc(it.name) + "</h1><p class=\"lead\">" + GG.esc(it.overview) + "</p>" +
    '<div class="price-box"><span class="price-label">Approximate price in India</span><span class="price-big">' + GG.range(it) + "</span>" +
    '<span class="unit">' + GG.esc(it.unit) + " &middot; indicative range, not a live price</span></div>" +
    '<div class="detail-actions">' + GG.compareButton(it) + '<a class="btn btn-ghost" href="comparison.html">Open comparison</a></div></div></div>' +

    '<aside class="note" role="note"><strong>Technique and settings matter.</strong> Proper form and correct equipment settings are important for safe use. ' +
    "This page is general education, not personal training or medical advice. If you are new to exercise, injured or managing a health condition, ask a qualified trainer or doctor first.</aside>" +

    '<div class="detail-grid">' +
    section("What it is used for", li(it.uses)) +
    section("Muscles targeted",
      '<p><strong>Primary:</strong> ' + GG.esc(it.primary.join(", ")) + "</p><p><strong>Secondary:</strong> " +
      (it.secondary.length ? GG.esc(it.secondary.join(", ")) : "None listed") + "</p>") +
    section("Key benefits", li(it.benefits)) +
    section("Features and specifications to look at", li(it.specs)) +
    section("Types and variations", li(it.types)) +
    section("How to use it: beginner steps", "<ol>" + it.steps.map((s) => "<li>" + GG.esc(s) + "</li>").join("") + "</ol>") +
    section("Basic safety precautions", li(it.safety.concat(["Have a trainer check your technique and settings, especially in your first sessions."]))) +
    section("Advantages and limitations",
      '<div class="two-col"><div><h3>Advantages</h3>' + li(it.pros) + "</div><div><h3>Limitations</h3>" + li(it.cons) + "</div></div>") +
    section("Price in India",
      "<p>Typical range: <strong>" + GG.range(it) + "</strong> (" + GG.esc(it.unit) + "). It sits in the <a href=\"price-guide.html#" + tier.id + '">' + tier.name.toLowerCase() + "</a> group of our price guide.</p>" +
      '<p class="fineprint">Approximate and for guidance only. Prices change with brand, seller and time, so verify with current manufacturers or sellers.</p>') +
    section("What affects the price", li(defaults.priceFactors)) +
    section("Maintenance tips", li(defaults.maintenance) + "<p>Maintenance effort for this item: <strong>" + it.maint.toLowerCase() + "</strong>.</p>") +
    "</div>" +

    '<section class="d-section faq-section"><h2>Frequently asked questions</h2><div class="faq-list">' +
    faqs.map((f) => "<details><summary>" + GG.esc(f.q) + "</summary><p>" + GG.esc(f.a) + "</p></details>").join("") + "</div></section>" +

    '<section class="d-section"><h2>Related equipment</h2><ul class="related">' +
    it.related.map(GG.byId).filter(Boolean).map((r) => '<li><a href="' + GG.detailUrl(r.id) + '">' + GG.esc(r.name) + '</a> <span class="unit">' + GG.range(r) + "</span></li>").join("") + "</ul></section>";

  // Structured data that mirrors the visible FAQ section only.
  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))
  });
  document.head.appendChild(ld);

  // Re-sync the compare button state for the freshly rendered page.
  document.dispatchEvent(new CustomEvent("gg:compare"));
})();
