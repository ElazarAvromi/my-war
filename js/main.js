/* ==========================================================================
   MY WAR — landing page interactions
   GSAP + ScrollTrigger for parallax/reveals, Lenis for smooth scroll.
   Content is visible by default; every hidden start-state is set from JS,
   so the page reads fine without JS or with reduced motion.
   ========================================================================== */

const CONFIG = {
  // Messages are relayed by FormSubmit (https://formsubmit.co) to this inbox.
  // After activating, you can swap the email for the random alias FormSubmit gives you,
  // e.g. "https://formsubmit.co/ajax/1a2b3c4d5e6f…", so the address isn't in the page source.
  FORM_ENDPOINT: "https://formsubmit.co/ajax/avromi@me.com",
  // Fallback shown to visitors if sending fails (opens their mail app, message pre-filled)
  CONTACT_EMAIL: "avromi@me.com",
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

let lenis = null;

/* --------------------------------------------------------------------------
   Hand-drawn SVG bits
   -------------------------------------------------------------------------- */
const UNDERLINES = [
  ["M2 8 C 50 3, 110 11, 170 6 S 262 4, 298 8", "M16 12.5 C 84 9.5, 172 14.5, 286 11"],
  ["M3 6 C 72 10, 140 3, 212 7 S 282 9, 297 5", "M10 11.5 C 94 13.5, 200 8.5, 290 12.5"],
  ["M2 7 C 40 9, 96 4, 150 7 S 250 10, 298 6", "M24 12 C 90 10.5, 190 14, 280 11.5"],
];

function injectUnderlines() {
  $$(".u-line").forEach((el, i) => {
    const [a, b] = UNDERLINES[i % UNDERLINES.length];
    el.innerHTML =
      `<svg viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden="true">` +
      `<path pathLength="1" d="${a}"/><path pathLength="1" d="${b}"/></svg>`;
  });
}

function buildWave() {
  const wave = $(".wave");
  if (!wave) return;
  const n = 46;
  let html = "";
  for (let i = 0; i < n; i++) {
    const env = Math.sin((i / (n - 1)) * Math.PI) * 0.7 + 0.3;
    const h = (0.15 + Math.random() * 0.85) * env;
    html += `<i style="--h:${h.toFixed(2)};--d:${(-Math.random() * 1.4).toFixed(2)}s"></i>`;
  }
  wave.innerHTML = html;
}

// Seeded random so the scribble looks the same on every visit
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildScribble() {
  const svg = $(".why__scribble");
  if (!svg) return;
  const rand = mulberry32(1987);
  const paths = [];
  for (let k = 0; k < 4; k++) {
    const pts = [];
    const n = 9 + Math.floor(rand() * 5);
    for (let i = 0; i < n; i++) pts.push([20 + rand() * 360, 20 + rand() * 380]);
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 5, p1[1] + (p2[1] - p0[1]) / 5];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 5, p2[1] - (p3[1] - p1[1]) / 5];
      d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    paths.push(`<path pathLength="1" d="${d}" style="stroke-width:${(1.2 + rand() * 2.4).toFixed(1)}"/>`);
  }
  svg.innerHTML = paths.join("");
}

/* --------------------------------------------------------------------------
   Progress bar + chapter indicator (native; works without GSAP)
   -------------------------------------------------------------------------- */
function initChrome() {
  const bar = $(".progress span");
  const logo = $(".logo");
  const num = $(".chapter__num");
  const name = $(".chapter__name");
  const sections = $$("[data-chapter]");

  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    if (bar) bar.style.transform = `scaleY(${p.toFixed(4)})`;
    if (logo) logo.classList.toggle("is-hidden", window.scrollY < window.innerHeight * .6);
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();

  if (!num || !name) return;
  let current = -1;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const i = sections.indexOf(e.target);
      if (i === current) return;
      current = i;
      const label = e.target.dataset.chapter;
      num.textContent = String(i + 1).padStart(2, "0");
      if (!hasGSAP || reduceMotion) document.documentElement.classList.remove("intro-pending");
if (hasGSAP && !reduceMotion) {
        gsap.fromTo(name, { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .5, ease: "power3.out", onStart: () => { name.textContent = label; } });
      } else {
        name.textContent = label;
      }
    });
  }, { rootMargin: "-50% 0px -50% 0px" });
  sections.forEach((s) => io.observe(s));
}

/* --------------------------------------------------------------------------
   Smooth scroll
   -------------------------------------------------------------------------- */
function initLenis() {
  if (typeof window.Lenis === "undefined") return;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

function initAnchors() {
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id === "#top" ? document.body : $(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(id === "#top" ? 0 : target, { duration: 1.6 });
      else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  });
}

/* --------------------------------------------------------------------------
   Scroll animations
   -------------------------------------------------------------------------- */
const DRAWABLE = ".u-line path, .draw path, .hook__arrow path, .timeline__axis path, .memory__arrow path, .wardrobe__circle path, .scroll-cue path, .why__scribble path";

function hideStrokes() {
  gsap.set($$(DRAWABLE), { strokeDasharray: "1 1", strokeDashoffset: 1 });
}

const draw = (targets, vars = {}) =>
  gsap.to(targets, { strokeDashoffset: 0, duration: .9, ease: "power2.inOut", stagger: .15, ...vars });

const wipeFrom = { clipPath: "inset(-25% 100% -35% -2%)" };
const wipeTo = { clipPath: "inset(-25% -2% -35% -2%)" };

/* Hero title: painted on in two spray-can passes ("MY", then "WAR"),
   with overspray specks flying off the wet edge, then a small thud. */
function sprayTitle() {
  const wrap = $(".hero__title");
  const img = $("img", wrap);
  const tl = gsap.timeline();
  if (!img) return tl;

  const canvas = document.createElement("canvas");
  canvas.className = "hero__spray";
  canvas.setAttribute("aria-hidden", "true");
  wrap.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let box = null;
  const measure = () => {
    const c = canvas.getBoundingClientRect();
    const i = img.getBoundingClientRect();
    canvas.width = c.width * dpr;
    canvas.height = c.height * dpr;
    box = { x: i.left - c.left, y: i.top - c.top, w: i.width, h: i.height };
  };

  const specks = [];
  const state = { s: -8 };
  let painting = false;
  let last = performance.now();

  const emit = () => {
    if (!box) return;
    const ex = box.x + (state.s / 100) * box.w;
    for (let k = 0; k < 9; k++) {
      const haze = Math.random() < .12;
      const a = (Math.random() - .5) * Math.PI * .9;
      const v = haze ? 10 + Math.random() * 25 : 40 + Math.random() * 160;
      specks.push({
        x: ex + (Math.random() - .3) * 14,
        y: box.y + box.h * (.12 + Math.random() * .76),
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        r: haze ? 8 + Math.random() * 16 : .4 + Math.random() * 1.6,
        a: haze ? .07 : .45 + Math.random() * .45,
        haze,
        life: haze ? .9 : .35 + Math.random() * .8,
        age: 0,
      });
    }
  };

  const render = () => {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, .05);
    last = now;
    if (painting) emit();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = specks.length - 1; i >= 0; i--) {
      const p = specks[i];
      p.age += dt;
      if (p.age >= p.life) { specks.splice(i, 1); continue; }
      p.vx *= .94; p.vy = p.vy * .94 + 30 * dt; // drag + a little gravity
      p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.globalAlpha = p.a * (1 - p.age / p.life);
      if (p.haze) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, "rgba(217,214,209,1)");
        g.addColorStop(1, "rgba(217,214,209,0)");
        ctx.fillStyle = g;
      } else {
        ctx.fillStyle = "#d9d6d1";
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!painting && !specks.length) { gsap.ticker.remove(render); canvas.remove(); }
  };

  const setSweep = () => img.style.setProperty("--sweep", `${state.s}%`);

  gsap.set(img, { "--sweep": "-8%", filter: "blur(1.5px)" });
  document.documentElement.classList.remove("intro-pending");
  tl.call(() => { measure(); last = performance.now(); painting = true; gsap.ticker.add(render); })
    .to(state, { s: 44, duration: .55, ease: "power1.inOut", onUpdate: setSweep })        // "MY"
    .call(() => { painting = false; })
    .to({}, { duration: .2 })                                                            // lift the can
    .call(() => { painting = true; })
    .to(state, { s: 112, duration: .8, ease: "power1.inOut", onUpdate: setSweep })       // "WAR"
    .call(() => { painting = false; })
    .to(img, { filter: "blur(0px)", duration: .4 }, "-=.3")
    .fromTo(img, { scale: 1.035 }, { scale: 1, duration: .7, ease: "elastic.out(1, .45)" }, "-=.15")
    .to(img, { keyframes: { x: [-2.5, 2, -1.2, .6, 0] }, duration: .35, ease: "none" }, "<")
    .set(img, { "--sweep": "130%" });
  return tl;
}

function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  hideStrokes();

  /* ----- Hero: intro + parallax ----- */
  const hero = gsap.timeline({ delay: .15 });
  hero
    .from(".hero__poster img", { scale: 1.2, opacity: 0, duration: 2.2, ease: "power3.out" }, 0)
    .add(sprayTitle(), .35)
    .from(".hero__byline", { opacity: 0, x: 20, duration: .8, ease: "power2.out" }, 1.5)
    .add(draw($$(".hero .u-line path"), { duration: 1 }), 1.4)
    .fromTo($$(".hero .wipe"), wipeFrom, { ...wipeTo, duration: 1.1, ease: "power2.inOut", stagger: .5 }, 1.7)
    .from(".wave", { opacity: 0, duration: 1 }, 2.6)
    .from(".hero__scrap", { opacity: 0, y: 30, duration: 1.4, stagger: .2 }, 1)
    .add(draw($$(".scroll-cue path"), { duration: .8 }), 2.8)
    .from(".scroll-cue .hand", { opacity: 0, duration: .6 }, 2.8);

  const heroScroll = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
  gsap.to(".hero__poster img", { yPercent: 14, ease: "none", scrollTrigger: heroScroll });
  gsap.to(".hero__title", { y: -160, ease: "none", scrollTrigger: heroScroll });
  gsap.to(".hero__tag", { y: -70, ease: "none", scrollTrigger: heroScroll });
  gsap.to(".hero__scrap--a", { y: -220, rotation: 12, ease: "none", scrollTrigger: heroScroll });
  gsap.to(".hero__scrap--b", { y: -90, rotation: -6, ease: "none", scrollTrigger: heroScroll });
  gsap.to(".scroll-cue", { opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "20% top", scrub: true } });

  /* ----- Section titles: ghost + marker wipe + underline ----- */
  $$(".sec-title").forEach((t) => {
    const ghost = $(".ghost", t);
    const title = $(".title", t);
    const lines = $$(".u-line path", t);
    gsap.timeline({ scrollTrigger: { trigger: t, start: "top 82%" } })
      .from(ghost, { opacity: 0, x: -50, duration: 1.4, ease: "power3.out" }, 0)
      .fromTo(title, wipeFrom, { ...wipeTo, duration: 1.1, ease: "power2.inOut" }, .15)
      .add(draw(lines), .8);

    const sliding = t.classList.contains("sec-title--slide");
    gsap.fromTo(ghost,
      { xPercent: sliding ? 12 : 0, yPercent: 10 },
      { xPercent: sliding ? -30 : -6, yPercent: -30, ease: "none",
        scrollTrigger: { trigger: t.closest("section"), start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ----- Standalone underlines ----- */
  $$(".u-line").filter((u) => !u.closest(".sec-title") && !u.closest(".hero") && !u.closest(".arc__ep"))
    .forEach((u) => draw($$("path", u), { scrollTrigger: { trigger: u, start: "top 88%" } }));

  /* ----- Handwriting wipes (outside the hero) ----- */
  const wipeGroups = new Map();
  $$(".wipe").filter((w) => !w.closest(".hero")).forEach((w) => {
    const g = w.parentElement;
    if (!wipeGroups.has(g)) wipeGroups.set(g, []);
    wipeGroups.get(g).push(w);
  });
  wipeGroups.forEach((items, group) => {
    gsap.fromTo(items, wipeFrom, { ...wipeTo, duration: 1.2, ease: "power2.inOut", stagger: .55,
      scrollTrigger: { trigger: group, start: "top 85%" } });
  });

  /* ----- Generic fade-up ----- */
  gsap.set(".reveal", { opacity: 0, y: 34 });
  ScrollTrigger.batch(".reveal", {
    start: "top 90%",
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: .1, overwrite: true }),
  });

  /* ----- Generic parallax ----- */
  $$("[data-parallax]").forEach((el) => {
    const v = parseFloat(el.dataset.parallax) || 40;
    gsap.fromTo(el, { y: -v }, { y: v, ease: "none",
      scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ----- The Hook ----- */
  gsap.timeline({ scrollTrigger: { trigger: ".hook", start: "top 45%" } })
    .add(draw($$(".hook__arrow path"), { duration: 1, stagger: .7 }), 0)
    .from(".hook__id", { rotation: -32, y: -90, opacity: 0, duration: 1.8, ease: "elastic.out(1, 0.42)" }, .9);

  /* ----- Series overview: identity timeline ----- */
  const items = $$(".timeline__item");
  const buildTimeline = (tl) => {
    tl.to($$(".timeline__axis path"), { strokeDashoffset: 0, duration: 5, stagger: 4.8, ease: "none" }, 0);
    items.forEach((it, i) => {
      tl.from($(".polaroid", it), { y: -140, rotation: i % 2 ? 22 : -22, opacity: 0, duration: .9, ease: "back.out(1.7)" }, .3 + i * .95)
        .from($(".hand", it), { opacity: 0, y: 10, duration: .5 }, .55 + i * .95);
    });
    tl.from(".overview__question", { opacity: 0, y: 24, duration: 1 }, 4.6);
    return tl;
  };
  mm.add("(min-width: 768px)", () => {
    buildTimeline(gsap.timeline({
      scrollTrigger: { trigger: ".overview__pin", start: "bottom bottom", end: "+=120%", pin: true, scrub: .6 },
    }));
  });
  mm.add("(max-width: 767px)", () => {
    buildTimeline(gsap.timeline({ scrollTrigger: { trigger: ".timeline", start: "top 85%", end: "bottom 45%", scrub: .6 } }));
  });

  /* ----- Episodes: stills rows slide in from alternating sides ----- */
  $$(".stills").forEach((stills) => {
    $$(".stills__row", stills).forEach((row, i) => {
      const dir = parseFloat(row.dataset.dir) || 1;
      gsap.from(row.children, {
        xPercent: 45 * dir, opacity: 0, rotation: 3 * dir,
        duration: 1.3, ease: "power3.out", stagger: .09,
        scrollTrigger: { trigger: row, start: "top 90%" },
      });
      mm.add("(min-width: 768px)", () => {
        gsap.to(row, { y: (i - 1) * -45, ease: "none",
          scrollTrigger: { trigger: stills, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
  });

  /* ----- Descent: eye pushes in, crosshair locks on ----- */
  gsap.fromTo(".descent__eye img", { scale: 1.05 }, { scale: 1.45, ease: "none",
    scrollTrigger: { trigger: ".descent", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.from(".crosshair", { scale: .5, opacity: 0, rotation: -90, duration: 1.8, ease: "power3.out",
    scrollTrigger: { trigger: ".descent", start: "top 55%" } });
  $$(".descent .arc__ep").forEach((ep, i) => {
    gsap.timeline({ scrollTrigger: { trigger: ep, start: "top 86%" }, delay: i * .08 })
      .from(ep, { opacity: 0, x: -40, duration: 1, ease: "power3.out" }, 0)
      .add(draw($$(".u-line path", ep)), .3);
  });
  $$(".transform .arc__ep").forEach((ep) => {
    draw($$(".u-line path", ep), { scrollTrigger: { trigger: ep, start: "top 86%" }, delay: .3 });
  });

  /* ----- Gabriel: collage, boot circle ----- */
  const gab = $(".gabriel");

  gsap.from(".collage__item", { opacity: 0, scale: .82, y: 60, duration: 1.2, ease: "power3.out", stagger: .12,
    scrollTrigger: { trigger: ".collage", start: "top 78%" } });
  gsap.from(".collage__label, .collage__x", { opacity: 0, y: 12, duration: .7, stagger: .12, delay: .8,
    scrollTrigger: { trigger: ".collage", start: "top 78%" } });
  draw($$(".collage__arrow path"), { delay: 1, scrollTrigger: { trigger: ".collage", start: "top 70%" } });
  draw($$(".wardrobe__circle path"), { duration: 1.2, stagger: .5, scrollTrigger: { trigger: ".wardrobe__circle", start: "top 85%" } });

  if (finePointer) {
    const depthEls = $$("[data-depth]", gab);
    gab.addEventListener("mousemove", (e) => {
      const r = gab.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5;
      const ny = (e.clientY - r.top) / r.height - .5;
      depthEls.forEach((el) => {
        const d = parseFloat(el.dataset.depth) || 10;
        gsap.to(el, { x: -nx * d * 1.6, y: -ny * d * 1.6, duration: 1, ease: "power3.out", overwrite: "auto" });
      });
    });
  }

  /* ----- Characters ----- */
  gsap.from(".card", { opacity: 0, y: 90, rotation: (i) => (i % 2 ? 6 : -6), duration: 1.3, ease: "power3.out", stagger: .14,
    scrollTrigger: { trigger: ".cast", start: "top 82%" } });
  gsap.from(".card .tape", { opacity: 0, duration: .5, stagger: .14, delay: .6,
    scrollTrigger: { trigger: ".cast", start: "top 82%" } });

  /* ----- Visual language ----- */
  gsap.from(".visual__pins .polaroid", { opacity: 0, rotation: (i) => (i ? 16 : -16), scale: .85, duration: 1.3, ease: "back.out(1.4)", stagger: .2,
    scrollTrigger: { trigger: ".visual__pins", start: "top 80%" } });
  $$(".ref").forEach((ref, i) => {
    gsap.from($(".ref__frame", ref), { opacity: 0, y: 70, rotation: i ? 2 : -2, duration: 1.3, ease: "power3.out",
      scrollTrigger: { trigger: ref, start: "top 85%" } });
    gsap.from($$(".swatches i", ref), { scaleX: 0, duration: .5, ease: "power2.out", stagger: .09,
      scrollTrigger: { trigger: $(".swatches", ref), start: "top 92%" } });
  });
  draw($$(".refs__arrows path"), { stagger: .2, scrollTrigger: { trigger: ".refs", start: "top 60%" } });

  /* ----- Creative approach: archive → reconstruction ----- */
  $$(".memory").forEach((m) => {
    const from = $$(".memory__from .polaroid", m);
    gsap.timeline({ scrollTrigger: { trigger: m, start: "top 85%", end: "center 50%", scrub: .6 } })
      .from($(".memory__tag", m), { opacity: 0, y: 14, duration: .4 }, 0)
      .from(from, { opacity: 0, y: 50, rotation: "+=10", duration: .8, stagger: .25 }, 0)
      .to($$(".memory__arrow path", m), { strokeDashoffset: 0, duration: .6, ease: "none" }, .7)
      .fromTo($(".memory__to", m), { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "none" }, 1.1)
      .from($(".memory__to img", m), { scale: 1.25, duration: 1.2, ease: "none" }, 1.1)
      .from($(".memory__badge", m), { opacity: 0, duration: .3 }, 2);
  });

  /* ----- Why: scribble draws itself, still drifts ----- */
  draw($$(".why__scribble path"), { duration: 2.6, stagger: .5, ease: "power1.inOut",
    scrollTrigger: { trigger: ".why", start: "top 65%" } });
  gsap.fromTo(".why__still img", { scale: 1.22, xPercent: 3 }, { scale: 1, xPercent: -2, ease: "none",
    scrollTrigger: { trigger: ".why", start: "top bottom", end: "bottom top", scrub: true } });

  /* ----- Contact ----- */
  gsap.from(".footer > *", { opacity: 0, y: 20, duration: .9, stagger: .1, scrollTrigger: { trigger: ".footer", start: "top 95%" } });

  /* Keep positions right as fonts and lazy images arrive */
  let t;
  const refresh = () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 250); };
  $$("img").forEach((img) => { if (!img.complete) img.addEventListener("load", refresh, { once: true }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener("load", refresh);
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
}

/* --------------------------------------------------------------------------
   Gabriel: hovering an identity lights up its photos (and vice versa)
   -------------------------------------------------------------------------- */
function initIdentityLinks() {
  const gab = $(".gabriel");
  if (!gab) return;
  const items = $$(".identities li[data-show]", gab);
  const targets = $$("[data-group]", gab);
  const animate = hasGSAP && !reduceMotion;
  let current = null;

  const light = (group) => {
    if (group === current) return;
    current = group;
    gab.classList.toggle("is-linking", !!group);
    items.forEach((li) => li.classList.toggle("is-lit", li.dataset.show === group));
    targets.forEach((el) => {
      const on = el.dataset.group === group;
      el.classList.toggle("is-lit", on);
      if (animate && !el.classList.contains("collage__label")) {
        gsap.to(el, { scale: on ? 1.06 : 1, duration: .5, ease: "power3.out" });
      }
    });
  };

  items.forEach((li) => {
    li.addEventListener("pointerenter", () => light(li.dataset.show));
    li.addEventListener("focus", () => light(li.dataset.show));
    li.addEventListener("blur", () => light(null));
    // touch: tap toggles
    li.addEventListener("click", () => { if (!finePointer) light(current === li.dataset.show ? null : li.dataset.show); });
    li.addEventListener("keydown", (e) => { if (e.key === "Escape") li.blur(); });
  });
  $(".identities", gab).addEventListener("pointerleave", () => { if (finePointer) light(null); });

  // hovering a photo highlights its line in the list
  if (finePointer) {
    targets.forEach((el) => {
      el.addEventListener("pointerenter", () => light(el.dataset.group));
      el.addEventListener("pointerleave", () => light(null));
    });
  }
}

/* --------------------------------------------------------------------------
   Character cards: 3D tilt
   -------------------------------------------------------------------------- */
function initTilt() {
  if (!finePointer || reduceMotion || !hasGSAP) return;
  $$(".card").forEach((card) => {
    const photo = $(".card__photo", card);
    card.addEventListener("mousemove", (e) => {
      const r = photo.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5;
      const ny = (e.clientY - r.top) / r.height - .5;
      gsap.to(photo, { rotationY: nx * 16, rotationX: -ny * 14, y: -8, duration: .5, ease: "power2.out", transformPerspective: 700 });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(photo, { rotationY: 0, rotationX: 0, y: 0, duration: .9, ease: "elastic.out(1, 0.5)" });
    });
  });
}

/* --------------------------------------------------------------------------
   Film-grain magnifier over the Snatch frame
   -------------------------------------------------------------------------- */
function initMagnifier() {
  const frame = $("[data-magnify]");
  if (!frame) return;
  const img = $("img", frame);
  const lens = $(".lens", frame);
  const lensImg = $(".lens__img", frame);
  const label = $(".lens__label", frame);
  const ZOOM = 2.6;
  const state = { x: 0, y: 0 };

  const rest = () => ({ x: frame.clientWidth * .9, y: frame.clientHeight * .14 });
  const place = () => {
    const w = frame.clientWidth, h = frame.clientHeight, L = lens.offsetWidth;
    lens.style.left = `${state.x}px`;
    lens.style.top = `${state.y}px`;
    lensImg.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
    lensImg.style.backgroundSize = `${w * ZOOM}px ${h * ZOOM}px`;
    lensImg.style.backgroundPosition = `${-(state.x * ZOOM - L / 2)}px ${-(state.y * ZOOM - L / 2)}px`;
  };
  const moveTo = (x, y, d = .45) => {
    if (hasGSAP && !reduceMotion) gsap.to(state, { x, y, duration: d, ease: "power3.out", onUpdate: place, overwrite: true });
    else { state.x = x; state.y = y; place(); }
  };

  const init = () => { Object.assign(state, rest()); place(); };
  if (img.complete) init(); else img.addEventListener("load", init, { once: true });
  window.addEventListener("resize", init);

  if (!finePointer) return;
  frame.addEventListener("mousemove", (e) => {
    const r = frame.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    label.style.opacity = "0";
  });
  frame.addEventListener("mouseleave", () => {
    const p = rest();
    moveTo(p.x, p.y, 1);
    label.style.opacity = "";
  });
  label.style.transition = "opacity .3s";
}

/* --------------------------------------------------------------------------
   Inline episode players (YouTube / Vimeo). The iframe only loads on play,
   so nothing from YouTube/Vimeo is fetched until a visitor presses play.
   -------------------------------------------------------------------------- */
function videoURL(spec) {
  const [provider, rest] = (spec || "").split(":");
  if (!rest || rest === "TODO") return null;
  if (provider === "youtube") {
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(rest)}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  }
  if (provider === "vimeo") {
    // unlisted Vimeo links carry a hash: "vimeo:123456789/abcdef1234"
    const [id, hash] = rest.split("/");
    const h = hash ? `h=${encodeURIComponent(hash)}&` : "";
    return `https://player.vimeo.com/video/${encodeURIComponent(id)}?${h}autoplay=1&title=0&byline=0&portrait=0`;
  }
  return null;
}

function initEmbeds() {
  const embeds = $$(".embed[data-video]");
  const resets = [];

  embeds.forEach((embed) => {
    const url = videoURL(embed.dataset.video);
    const frame = $(".embed__frame", embed);
    const btn = $(".embed__play", embed);
    const original = frame.innerHTML;

    if (!url) {
      embed.classList.add("is-pending");
      btn.setAttribute("aria-disabled", "true");
      btn.removeAttribute("data-cursor");
      $(".embed__label", btn).textContent = "Screening link coming soon";
      return;
    }

    const reset = () => {
      if (!embed.classList.contains("is-playing")) return;
      embed.classList.remove("is-playing");
      frame.innerHTML = original;
      bind();
    };
    const play = () => {
      resets.forEach((r) => r !== reset && r());   // only one episode plays at a time
      embed.classList.add("is-playing");
      const tape = $(".tape", frame);
      frame.innerHTML = "";
      if (tape) frame.appendChild(tape);
      const iframe = document.createElement("iframe");
      iframe.src = url;
      iframe.title = embed.dataset.title || "Episode";
      iframe.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media";
      frame.appendChild(iframe);
      iframe.focus();
    };
    const bind = () => $(".embed__play", embed).addEventListener("click", play);
    resets.push(reset);
    bind();
  });
}

/* --------------------------------------------------------------------------
   Contact form (FormSubmit → email)
   -------------------------------------------------------------------------- */
function initForm() {
  const form = $("#contact-form");
  if (!form) return;
  const status = $(".form__status", form);
  const btn = $(".send", form);
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const say = (msg, ok, link) => {
    status.textContent = msg;
    if (link) {
      const a = document.createElement("a");
      a.href = link.href;
      a.textContent = link.text;
      status.append(" ", a);
    }
    status.classList.toggle("is-ok", !!ok);
    status.classList.toggle("is-err", !ok);
    if (hasGSAP && !reduceMotion) gsap.fromTo(status, wipeFrom, { ...wipeTo, duration: .9, ease: "power2.inOut" });
  };

  form.addEventListener("input", (e) => e.target.closest(".field")?.classList.remove("is-invalid"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot: bots fill hidden fields — pretend success, send nothing
    if (form.elements._honey.value) { say("Thank you — message received.", true); form.reset(); return; }

    let firstBad = null;
    ["name", "email", "message"].forEach((n) => {
      const el = form.elements[n];
      const bad = !el.value.trim() || (n === "email" && !emailRe.test(el.value.trim()));
      el.closest(".field").classList.toggle("is-invalid", bad);
      if (bad && !firstBad) firstBad = el;
    });
    if (firstBad) { say("Please fill in your name, a valid email and a message.", false); firstBad.focus(); return; }

    btn.disabled = true;
    say("Sending…", true);
    try {
      const res = await fetch(CONFIG.FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      // FormSubmit answers 200 with success "false" (e.g. before the inbox is activated)
      if (!res.ok || String(data.success) === "false") throw new Error(data.message || `HTTP ${res.status}`);
      form.reset();
      say("Thank you — message received.", true);
    } catch (err) {
      console.error("[My War] form error", err);
      // Don't lose the message: offer a pre-filled email instead
      const f = form.elements;
      const body = `${f.message.value}\n\n— ${f.name.value}${f.organisation.value ? `, ${f.organisation.value}` : ""}\n${f.email.value}`;
      const href = `mailto:${CONFIG.CONTACT_EMAIL}?subject=${encodeURIComponent("MY WAR — message from the website")}&body=${encodeURIComponent(body)}`;
      say("The form couldn’t send just now —", false, { href, text: "email us directly instead" });
    } finally {
      btn.disabled = false;
    }
  });
}

/* --------------------------------------------------------------------------
   Custom cursor
   -------------------------------------------------------------------------- */
function initCursor() {
  if (!finePointer || reduceMotion || !hasGSAP) return;
  document.documentElement.classList.add("has-cursor");
  const cursor = $(".cursor");
  const dot = $(".cursor__dot");
  const ring = $(".cursor__ring");
  const dx = gsap.quickTo(dot, "x", { duration: .08 });
  const dy = gsap.quickTo(dot, "y", { duration: .08 });
  const rx = gsap.quickTo(ring, "x", { duration: .45, ease: "power3.out" });
  const ry = gsap.quickTo(ring, "y", { duration: .45, ease: "power3.out" });
  gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });

  window.addEventListener("mousemove", (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
  document.addEventListener("mouseleave", () => gsap.to(cursor, { opacity: 0, duration: .3 }));
  document.addEventListener("mouseenter", () => gsap.to(cursor, { opacity: 1, duration: .3 }));
  document.addEventListener("mouseover", (e) => {
    const t = e.target;
    cursor.classList.toggle("is-text", !!t.closest("input, textarea"));
    cursor.classList.toggle("is-hover", !!t.closest("a, button:not([aria-disabled='true']), [data-cursor], .still, .card, .wardrobe, [data-magnify]"));
  });
}

/* --------------------------------------------------------------------------
   Boot
   -------------------------------------------------------------------------- */
injectUnderlines();
buildWave();
buildScribble();
initChrome();
initEmbeds();
initForm();
initMagnifier();
initIdentityLinks();

if (hasGSAP && !reduceMotion) {
  initLenis();
  initAnimations();
  initTilt();
  initCursor();
}
initAnchors();
