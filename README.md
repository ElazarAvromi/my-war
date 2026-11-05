# MY WAR — landing page

Single-page parallax site built from the series pitch deck. Plain HTML/CSS/JS, no build step.

```
index.html        all copy and sections (deck order)
css/style.css     design tokens, textures, components, responsive + reduced-motion rules
js/main.js        GSAP/ScrollTrigger animations, Lenis smooth scroll, video players, form, cursor, magnifier
assets/img/       web-optimised images extracted from the Keynote deck (~11 MB)
```

Libraries load from CDNs: GSAP 3.12.5 + ScrollTrigger (cdnjs) and Lenis 1.1.13 (unpkg). Fonts are Reenie Beanie and Manrope from Google Fonts.

## Before going live

### 1. Videos

Each player shows a poster still and only loads the video when someone presses play. Set the video in `index.html` with `data-video`:

- YouTube: `data-video="youtube:VIDEO_ID"`
- Vimeo: `data-video="vimeo:123456789"` (unlisted Vimeo with a private hash: `vimeo:123456789/abcdef1234`)

**Trailer (The Hook):** public Vimeo video.

**Episodes 1–3:** password-protected Vimeo videos. The Vimeo player shows its own password screen inside the frame, so the password is managed in Vimeo (video → Privacy → Password), not on this site. The play buttons are labelled "Private screening · password required". To add Episode 4 later, copy an episode section and set its `vimeo:` ID.

### 2. Contact + subscribe forms
Both forms are delivered by [Web3Forms](https://web3forms.com) (free plan, 250 submissions/month) to the inbox set in the Web3Forms dashboard (currently **infoavromi@gmail.com**; change it at app.web3forms.com → My First Form → Settings → Recipient Emails). The form access key is in `CONFIG.WEB3FORMS_KEY` at the top of `js/main.js`. The key is public by design: it can only send mail to that inbox.

- Contact messages arrive with the subject "MY WAR website — new message"; replying goes straight to the sender.
- Subscribe sign-ups arrive with the subject "MY WAR website — new subscriber". You collect these into your mailing list (or later point `#subscribe-form` at a newsletter service).
- A hidden `botcheck` field quietly drops spam bots.
- If sending fails (no key, network or service down), visitors are offered a pre-filled email to avromi@me.com instead, so no message is lost.

(The forms used FormSubmit until November 2026; it went down, so they were moved to Web3Forms.)

The Instagram and Facebook links are in the Follow section and the footer.

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
