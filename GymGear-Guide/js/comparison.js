/*
 * GymGear Guide - side-by-side comparison of up to 4 items.
 * The selection is shared with the "Compare" buttons on other pages.
 * Supports ?ids=treadmill,exercise-bike in the URL.
 */
(function () {
  "use strict";
  const GG = window.GG;
  const out = document.getElementById("compare-output");
  if (!out) return;

  const select = document.getElementById("compare-select");
  const addBtn = document.getElementById("compare-add");
  const chips = document.getElementById("compare-chips");
  const presets = document.getElementById("compare-presets");
  const clearBtn = document.getElementById("compare-clear");

  // Rows shown in the table: [label, function(item) -> HTML string]
  const ROWS = [
    ["Category", (it) => GG.esc(GG.catById(it.cat).name)],
    ["Approximate price", (it) => "<strong>" + GG.range(it) + "</strong><br><span class='unit'>" + GG.esc(it.unit) + "</span>"],
    ["Main purpose", (it) => GG.esc(it.purpose)],
    ["Primary muscles", (it) => GG.esc(it.primary.join(", "))],
    ["Secondary muscles", (it) => (it.secondary.length ? GG.esc(it.secondary.join(", ")) : "None listed")],
    ["Space required", (it) => it.space],
    ["Home or commercial", (it) => it.setting],
    ["Beginner suitability", (it) => it.beginner + " (" + it.diff.toLowerCase() + " level)"],
    ["Maintenance needs", (it) => it.maint]
  ];

  function renderControls(list) {
    // Dropdown: only items that are not already selected.
    select.innerHTML = '<option value="">Choose equipment to add</option>' + GG.categories.map((c) =>
      '<optgroup label="' + GG.esc(c.name) + '">' +
      GG.items.filter((i) => i.cat === c.id && !list.includes(i.id)).map((i) => '<option value="' + i.id + '">' + GG.esc(i.name) + "</option>").join("") +
      "</optgroup>").join("");
    const full = list.length >= GG.compare.MAX;
    select.disabled = full;
    addBtn.disabled = full;

    chips.innerHTML = list.map((id) => {
      const it = GG.byId(id);
      return '<li class="chip">' + GG.esc(it.name) +
        '<button type="button" data-remove="' + id + '" aria-label="Remove ' + GG.esc(it.name) + ' from comparison">&times;</button></li>';
    }).join("");
    clearBtn.hidden = list.length === 0;
  }

  function render() {
    const list = GG.compare.list();
    renderControls(list);

    if (list.length < 2) {
      out.innerHTML = '<div class="empty"><h3>' + (list.length ? "Add one more item to compare" : "Nothing selected yet") + "</h3>" +
        "<p>Pick at least two items from the list above, use a quick comparison, or press Compare on any equipment card.</p>" +
        '<a class="btn btn-primary" href="equipment.html">Browse equipment</a></div>';
      return;
    }

    const items = list.map(GG.byId);
    let html = '<div class="table-wrap"><table class="compare-table"><caption class="sr-only">Equipment comparison</caption><thead><tr><th scope="col">Feature</th>';
    items.forEach((it) => {
      html += '<th scope="col"><a href="' + GG.detailUrl(it.id) + '">' + GG.esc(it.name) + "</a>" +
        '<button type="button" class="link-btn" data-remove="' + it.id + '" aria-label="Remove ' + GG.esc(it.name) + '">Remove</button></th>';
    });
    html += "</tr></thead><tbody>";
    ROWS.forEach((row) => {
      html += '<tr><th scope="row">' + row[0] + "</th>" + items.map((it) => "<td>" + row[1](it) + "</td>").join("") + "</tr>";
    });
    html += "</tbody></table></div>";
    html += '<p class="fineprint">Prices are indicative ranges in Indian rupees, not live prices. Verify with current manufacturers or sellers.</p>';
    out.innerHTML = html;
  }

  document.addEventListener("click", function (e) {
    const rm = e.target.closest("[data-remove]");
    if (rm) GG.compare.remove(rm.dataset.remove);
  });
  addBtn.addEventListener("click", function () {
    if (!select.value) { GG.toast("Choose an item from the list first."); select.focus(); return; }
    GG.compare.toggle(select.value);
  });
  clearBtn.addEventListener("click", () => GG.compare.clear());
  presets.addEventListener("click", function (e) {
    const b = e.target.closest("[data-ids]");
    if (b) GG.compare.set(b.dataset.ids.split(","));
  });
  document.addEventListener("gg:compare", render);

  // Allow ?ids=a,b links to preselect items.
  const ids = new URLSearchParams(location.search).get("ids");
  if (ids) GG.compare.set(ids.split(",").map((s) => s.trim()));
  render();
})();
