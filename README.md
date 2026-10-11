# MY WAR — landing page

Single-page parallax site built from the series pitch deck. Plain HTML/CSS/JS, no build step.

```
index.html        all copy and sections (deck order)
css/style.css     design tokens, textures, components, responsive + reduced-motion rules
js/main.js        GSAP/ScrollTrigger animations, Lenis smooth scroll, player, form, cursor, magnifier
assets/img/       web-optimised images extracted from the Keynote deck (~11 MB)
```

Libraries load from CDNs: GSAP 3.12.5 + ScrollTrigger (cdnjs) and Lenis 1.1.13 (unpkg). Fonts are Reenie Beanie and Manrope from Google Fonts.

## Before going live

### 1. Episode videos
In `index.html`, find the two `data-video="youtube:TODO"` buttons (Episode 1 and Episode 2) and replace `TODO`:

- YouTube: `data-video="youtube:VIDEO_ID"`
- Vimeo: `data-video="vimeo:123456789"`
- Unlisted Vimeo (private hash link): `data-video="vimeo:123456789/abcdef1234"`

While a value is `TODO`, the button shows **"Screening link coming soon"** and does nothing.

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

The site is published from the `main` branch of `github.com/elazaravramovits/my-war` by GitHub Pages. The `CNAME` file holds the custom domain, and `.nojekyll` tells GitHub to serve the files exactly as they are.

### DNS records (set these at your domain registrar)

| Type  | Host / Name | Value |
|-------|-------------|-------|
| CNAME | `www` | `elazaravramovits.github.io` |
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
