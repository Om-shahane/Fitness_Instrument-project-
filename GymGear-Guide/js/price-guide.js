/* GymGear Guide - builds the price tables from equipment-data.js so prices stay consistent site-wide. */
(function () {
  "use strict";
  const GG = window.GG;
  const root = document.getElementById("tier-sections");
  if (!root) return;

  root.innerHTML = GG.TIERS.map((t) => {
    const list = GG.itemsInTier(t);
    const rows = list.map((it) =>
      '<tr><th scope="row"><a href="' + GG.detailUrl(it.id) + '">' + GG.esc(it.name) + "</a></th>" +
      "<td>" + GG.esc(GG.catById(it.cat).name) + "</td>" +
      "<td><strong>" + GG.range(it) + '</strong> <span class="unit">' + GG.esc(it.unit) + "</span></td></tr>"
    ).join("");
    return (
      '<section class="tier-section" id="' + t.id + '" aria-labelledby="h-' + t.id + '">' +
      '<h3 id="h-' + t.id + '">' + t.name + "</h3><p>" + t.rule + ". Approximate ranges only.</p>" +
      '<div class="table-wrap"><table class="price-table"><thead><tr><th scope="col">Equipment</th><th scope="col">Category</th><th scope="col">Approximate price in India</th></tr></thead><tbody>' +
      rows + "</tbody></table></div></section>"
    );
  }).join("");
})();
