# MY WAR — landing page

Single-page parallax site built from the series pitch deck. Plain HTML/CSS/JS, no build step.

```
index.html        all copy and sections (deck order)
css/style.css     design tokens, textures, components, responsive + reduced-motion rules
js/main.js        GSAP/ScrollTrigger animations, Lenis smooth scroll, players + episode unlock, form, cursor, magnifier
tools/            lock-episodes.py — encrypts the episode links with the screening password
assets/img/       web-optimised images extracted from the Keynote deck (~11 MB)
```

Libraries load from CDNs: GSAP 3.12.5 + ScrollTrigger (cdnjs) and Lenis 1.1.13 (unpkg). Fonts are Reenie Beanie and Manrope from Google Fonts.

## Before going live

### 1. Videos

**Trailer (public):** in `index.html`, the trailer player in The Hook uses `data-video="youtube:VIDEO_ID"` (or `vimeo:ID`, or `vimeo:ID/hash` for unlisted Vimeo).

**Episodes 1 & 2 (password-protected):** the episode links are stored encrypted in `index.html` (`data-locked='…'`) and only unlock with the shared password, so they can't be read from the page source. To set or change the password or the links, run this in the website folder:

```bash
python3 tools/lock-episodes.py
```

It asks for the password (hidden, typed twice) and each episode's YouTube/Vimeo link, then rewrites `index.html`. Publish with `git push`. Visitors see a "Private screening" lock. One correct password unlocks both episodes until the page is reloaded. If an episode has no encrypted link yet, it shows **"Screening link coming soon"**.

The video itself is only as private as its link: anyone who gets the YouTube URL can still watch it. Keep the videos **Unlisted** and share the password, not the link.

### 2. Contact form
Messages go to **avromi@me.com** through [FormSubmit](https://formsubmit.co), a free relay service. There's no account to create; the address is set in `CONFIG.FORM_ENDPOINT` in `js/main.js`.

**Activate it once:**
1. Put the site online (or open it locally) and send a test message from the form.
2. FormSubmit emails avromi@me.com an activation link. Click it. Until you do, nothing is delivered and the form shows an error.
3. Optional: the activation email also gives you a random alias. Put that in place of the email address (`https://formsubmit.co/ajax/<alias>`) so the address isn't visible in the page source.

Each email has the subject "MY WAR website — new message". Replying goes straight to the sender, because FormSubmit uses the visitor's `email` field as the reply-to address. A hidden `_honey` field quietly drops spam bots.

## Preview locally

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080>.

## Hosting: GitHub Pages at www.mywar.film

The site is published from the `main` branch of `github.com/ElazarAvromi/my-war` by GitHub Pages. The `CNAME` file holds the custom domain, and `.nojekyll` tells GitHub to serve the files exactly as they are.

### DNS records (set these at your domain registrar)

| Type  | Host / Name | Value |
|-------|-------------|-------|
| CNAME | `www` | `elazaravromi.github.io` |
| A     | `@` | `185.199.108.153` |
| A     | `@` | `185.199.109.153` |
| A     | `@` | `185.199.110.153` |
| A     | `@` | `185.199.111.153` |
| AAAA  | `@` | `2606:50c0:8000::153` |
| AAAA  | `@` | `2606:50c0:8001::153` |
| AAAA  | `@` | `2606:50c0:8002::153` |
| AAAA  | `@` | `2606:50c0:8003::153` |

With these, `mywar.film` redirects to `www.mywar.film`. DNS changes can take up to 24 hours to spread.

### Updating the site
```bash
git add -A
git commit -m "Describe the change"
git push
```
GitHub Pages republishes automatically within a minute or two of each push.
