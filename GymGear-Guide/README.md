# GymGear Guide

**Your Complete Guide to Gym Equipment.**

GymGear Guide is a static, informational website about gym equipment. It explains what 29 common gym instruments are used for, which muscles they work, how to use them safely, how to maintain them and what they typically cost in India. It is **not** an e-commerce site: there is no cart, checkout or payment code.

## Features

- Live search, category filter, difficulty filter, price-range filter and sorting (name or approximate price)
- Equipment cards with muscles, uses, difficulty and an approximate price in rupees
- A detail page for every item (overview, uses, muscles, benefits, specs, types, beginner steps, safety, pros and cons, price, price factors, maintenance, FAQ, related items)
- Price guide in four groups: budget-friendly, home gym, mid-range commercial and premium commercial
- Side-by-side comparison of up to four items, with quick-comparison shortcuts
- Seven beginner-friendly articles, About page and a demonstration contact form with validation
- Mobile menu, accordion FAQ, back-to-top button, smooth scrolling, empty states, keyboard-accessible controls and reduced-motion support

All prices are **approximate, indicative ranges** and not live market prices. Verify with current manufacturers or sellers.

## Technology

HTML5, CSS3 and vanilla JavaScript. No framework, build step or external dependency (system fonts, no CDN).

## Project structure

```
GymGear-Guide/
├── index.html               Home
├── equipment.html           Search, filters, sorting
├── equipment-details.html   Detail page for any item (?id=treadmill)
├── price-guide.html         Price guide
├── comparison.html          Compare equipment
├── articles.html            Knowledge articles
├── about.html
├── contact.html
├── robots.txt
├── sitemap.xml
├── css/   style.css, responsive.css
├── js/
│   ├── equipment-data.js    All equipment data (edit this to add or change items)
│   ├── main.js              Shared helpers, cards, compare list, nav, forms
│   ├── search-filter.js     Equipment search, filters, sorting
│   ├── comparison.js        Comparison table
│   ├── details.js           Detail page template
│   └── price-guide.js       Price tables
├── images/  cardio/ strength/ free-weights/ functional/ accessories/
└── assets/  favicon.svg
```

## Run locally

Option 1: open `index.html` in a browser.

Option 2 (recommended, behaves like a real server):

```bash
cd GymGear-Guide
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Images

The site ships **without photographs**. Until you add your own, it shows a generated illustration for each item, so nothing is broken.

To use real photos:

1. Use photos you own or that are licensed for reuse, and keep attribution where required.
2. Save each as `images/<category-folder>/<equipment-id>.jpg`, for example `images/cardio/treadmill.jpg` (4:3 ratio works best, under about 200 KB each).
3. In `js/equipment-data.js`, set `window.GG_USE_LOCAL_IMAGES = true;`.

If a photo is missing or fails to load, the illustration is shown instead.

## Editing content

Everything lives in `js/equipment-data.js`. Add an object to `GG_EQUIPMENT` (copy an existing one), and cards, filters, detail pages, comparison and price tables all update. Prices are `min` and `max` in rupees, and the price group is worked out from their midpoint.

## Deploy to GitHub Pages

1. Create a new public repository on GitHub, for example `GymGear-Guide`.
2. Upload the contents of this folder (or push with git):
   ```bash
   git init
   git add .
   git commit -m "GymGear Guide"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/GymGear-Guide.git
   git push -u origin main
   ```
3. In the repository, open **Settings > Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. After a minute the site is available at `https://YOUR-USERNAME.github.io/GymGear-Guide/`.

## Before you publish

- Replace `YOUR-USERNAME` in `sitemap.xml` and `robots.txt` with your real address.
- Add a canonical link to each page once your final domain is known (a reminder comment is in every page's `<head>`).
- Replace the placeholder email `hello@gymgearguide.example` in the footer and Contact page.
- The contact form is a demonstration. It validates input in the browser but sends and stores nothing. To receive messages, connect a form service of your choice.

## Notes and limits

- Detail pages use one template with `?id=` in the URL, which keeps the project simple. If you want separate crawlable pages per item, generate one HTML file per equipment id.
- Structured data (FAQ markup) on detail pages mirrors the visible FAQ only. Nothing here promises indexing or search rankings.
- Content is general education, not medical or personal training advice.
