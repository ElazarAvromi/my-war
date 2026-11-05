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

### 2. Contact form
Messages go to **avromi@me.com** through [FormSubmit](https://formsubmit.co), a free relay service. There's no account to create; the address is set in `CONFIG.FORM_ENDPOINT` in `js/main.js`.

**Activate it once:**
1. Put the site online (or open it locally) and send a test message from the form.
2. FormSubmit emails avromi@me.com an activation link. Click it. Until you do, nothing is delivered and the form shows an error.
3. Optional: the activation email also gives you a random alias. Put that in place of the email address (`https://formsubmit.co/ajax/<alias>`) so the address isn't visible in the page source.

Each email has the subject "MY WAR website — new message". Replying goes straight to the sender, because FormSubmit uses the visitor's `email` field as the reply-to address. A hidden `_honey` field quietly drops spam bots.

**Subscribe form (Follow section):** uses the same FormSubmit address. Each sign-up arrives as an email with the subject "MY WAR website — new subscriber", which you collect into your mailing list. If you later move to a newsletter service (Mailchimp, Buttondown, Substack…), point `#subscribe-form` at that service instead. The Instagram and Facebook links are in the Follow section and the footer.

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
