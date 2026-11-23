# திரிஷா பேரவை / Trisha Peravai

A premium, responsive, static bilingual website for **இளைய புரட்சித் தலைவி – திரிஷா பேரவை (Trisha Peravai)**. The site is built with plain HTML5, Tailwind CSS CDN, vanilla JavaScript, Lucide icons, and Google Fonts. It has no build step and is compatible with GitHub Pages.

## Pages

- `index.html` — Home
- `about.html` — About
- `vision.html` — Vision / mission / values
- `gallery.html` — Filterable gallery with lightbox
- `news.html` — Sample news/updates with detail modal
- `events.html` — Sample events with detail modal
- `members.html` — Member interest form (demo)
- `contact.html` — Contact form (demo)
- `credits.html` — Image and asset credits

## Features

- **Tamil / English language switch** with `localStorage` persistence, `data-i18n` attributes, and `<html lang>` updates.
- **Responsive design** with glassmorphism header, premium green/gold palette, animations, and reduced-motion support.
- **Gallery** with category filters, lightbox, keyboard navigation, captions, and image credits.
- **Sample news and events** clearly marked as demo/sample content.
- **Forms** with client-side validation and success feedback, ready to connect to a backend/form service.
- **SEO/accessibility basics**: semantic HTML, unique metadata, Open Graph tags, sitemap, robots, favicon, alt text, keyboard navigation.

## Local preview

Serve the folder with any static file server. For example:

```bash
# Python (optional, local preview only)
python -m http.server 8080

# Or Node
npx serve .
```

Then open `http://localhost:8080/`.

## GitHub Pages deployment

1. Push this repository to GitHub.
2. In GitHub: **Settings → Pages**.
3. Set **Source** to your branch (usually `main`) and folder `/ (root)`.
4. Save. GitHub Pages will publish the site.

## Replace the placeholder URL

Before publishing, replace the placeholder base URL:

```text
https://YOUR-USERNAME.github.io/trisha-peravai/
```

Update it in:

- `sitemap.xml`
- `robots.txt`
- Every HTML file's canonical/Open Graph/Twitter `og:url` and `og:image` metadata.

You can do a project-wide find-and-replace in your editor.

## Connect real forms

The member and contact forms are **demo-only**. They validate in the browser and show a success message, but they do not send data anywhere.

To make them live, connect `form[data-demo-form]` in `js/main.js` to a backend service such as Formspree, Netlify Forms, Cloudflare Workers, or your own API. When adding a backend:

- Add a real `action`/endpoint or fetch submission.
- Handle loading, success, and error states.
- Add spam protection (honeypot/CAPTCHA/rate limiting) as needed.
- Update the privacy/demo note text in `js/translations.js`.

## Images and logo

- Real photographs are licensed Wikimedia Commons images stored locally under `assets/images/`.
- Responsive WebP derivatives are included for performance.
- Image attribution and licenses are listed in `credits.html` and `assets/images/ATTRIBUTION.md`.
- The emblem was derived from artwork supplied for this project and adapted for the site identity.
- Community/cultural images are illustrative where noted and are not actual Trisha Peravai event photos.

## Project structure

```text
.
├── assets/
│   └── images/
│       ├── community/
│       ├── culture/
│       ├── logo/
│       ├── portraits/
│       ├── screen/
│       └── ATTRIBUTION.md
├── css/
│   ├── style.css
│   └── pages.css
├── js/
│   ├── animations.js
│   ├── gallery.js
│   ├── language.js
│   ├── main.js
│   ├── news-events.js
│   └── translations.js
├── tools/
│   └── image-manifest.json
├── about.html
├── contact.html
├── credits.html
├── events.html
├── gallery.html
├── index.html
├── members.html
├── news.html
├── vision.html
├── robots.txt
└── sitemap.xml
```

## Credits

- Icons: [Lucide](https://lucide.dev/)
- Fonts: [Google Fonts](https://fonts.google.com/) (Noto Sans Tamil, Anek Tamil, Playfair Display, Plus Jakarta Sans)
- Images: [Wikimedia Commons](https://commons.wikimedia.org/) — see `credits.html` for per-image attribution.
