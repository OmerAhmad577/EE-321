/* ============================================================
   VOLTA — Sonic Engineering
   Animation + 3D orchestration
   ============================================================ */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const animate = hasGsap && !reduced;

  document.documentElement.classList.toggle('reduced-motion', reduced);
  if (!animate) document.documentElement.classList.add('no-anim');

  /* ============================================================
     HOTSPOT CONFIG — nudge marker positions here.
     `frac` places each marker relative to the model's bounding box:
     each axis runs -1 … +1 from the center to the box faces.
       x: -1 left  … +1 right
       y: -1 floor … +1 top
       z: -1 back  … +1 front   (flip signs if your model faces -z)
     ============================================================ */
  const HOTSPOTS = {
    battery: {
      index: 'SYS.A', title: 'Battery',
      frac: { x: 0.0, y: -0.05, z: 0.05 },
      body: '12 kWh high-voltage pack, engineered for high-performance discharge. Managed by a custom BMS with an active cooling system and a multi-node emergency-stop network for instant battery isolation.'
    },
    motor: {
      index: 'SYS.B', title: 'Motor',
      frac: { x: 0.0, y: 0.1, z: -0.72 },
      body: '50 kW peak PMSM, 160 Nm torque, rear-wheel drive. Driven by high-precision Field Oriented Control (FOC) for razor-sharp response.'
    },
    ecu: {
      index: 'SYS.C', title: 'ECU',
      frac: { x: 0.0, y: 0.35, z: 0.6 },
      body: 'Custom-built Electronic Control Unit running FOC. Eco / Normal / Sport drive modes, active-aero and safety-lighting management, active over-current protection, and a real-time radio telemetry link streaming GPS, RPM, voltage, and temperature.'
    }
  };

  /* ---------- smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (animate && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', () => window.ScrollTrigger && ScrollTrigger.update());
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* anchor navigation (works with or without Lenis) */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = $(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -64 });
      else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- header state ---------- */
  const header = $('#site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- missing-asset placeholders ---------- */
  $$('img[data-asset]').forEach((img) => {
    const mark = () => {
      const box = img.closest('[data-missing]');
      if (box) { box.classList.add('missing'); img.remove(); }
    };
    if (img.complete && img.naturalWidth === 0) mark();
    else img.addEventListener('error', mark);
  });

  /* hero background: apply only if the file exists */
  const hero = $('#hero');
  (() => {
    const probe = new Image();
    probe.onload = () => hero.classList.add('has-img');
    probe.src = 'assets/img/hero-silhouette.jpg';
  })();

  /* ============================================================
     PRELOADER + HERO INTRO
     ============================================================ */
  const preloader = $('#preloader');
  document.body.classList.add('is-loading');

  const heroIntro = () => {
    document.body.classList.remove('is-loading');
    if (!animate) { hero.classList.add('intro-done'); return; }
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .to('.hero-word .hl span', { yPercent: 0, duration: 1.05, stagger: 0.07 })
      .to('.hero-eyebrow',       { autoAlpha: 1, duration: 0.7 }, '-=0.6')
      .to('.hero-sub',           { autoAlpha: 1, y: 0, duration: 0.8 }, '-=0.45')
      .to('.hero-line',          { autoAlpha: 1, y: 0, duration: 0.8 }, '-=0.55')
      .to('.hud-tag',            { autoAlpha: 1, duration: 0.6, stagger: 0.08 }, '-=0.5')
      .to('.scroll-cue',         { autoAlpha: 1, duration: 0.7 }, '-=0.3')
      .add(() => hero.classList.add('intro-done'), '-=0.6');
  };

  const initPreloader = () => {
    if (!preloader) { heroIntro(); return; }

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (!animate) {
        preloader.style.display = 'none';
        heroIntro();
        return;
      }
      gsap.timeline()
        .to('#pre-pct', { textContent: 100, snap: { textContent: 1 }, duration: 0.35 })
        .to(preloader, { yPercent: -100, duration: 0.9, ease: 'power3.inOut', delay: 0.3 })
        .add(() => { preloader.style.display = 'none'; }, '>-0.05')
        .add(heroIntro, '<-0.45');
    };

    if (!animate) {
      if (document.readyState === 'complete') finish();
      else window.addEventListener('load', finish);
      setTimeout(finish, 3500);
      return;
    }

    /* pre-animation states for the hero (set while covered) */
    gsap.set('.hero-word .hl span', { yPercent: 112 });
    gsap.set(['.hero-eyebrow', '.hud-tag', '.scroll-cue'], { autoAlpha: 0 });
    gsap.set(['.hero-sub', '.hero-line'], { autoAlpha: 0, y: 24 });

    const pct = $('#pre-pct');
    const state = { v: 0 };
    gsap.to('.pre-word', { opacity: 1, duration: 1.0, ease: 'power2.out' });
    gsap.to('.pre-line i', { scaleX: 1, duration: 2.3, ease: 'power2.inOut' });
    const counter = gsap.to(state, {
      v: 88, duration: 2.2, ease: 'power1.inOut',
      onUpdate: () => { pct.textContent = String(Math.round(state.v)).padStart(2, '0'); }
    });

    let loaded = document.readyState === 'complete';
    let minTimeDone = false;
    window.addEventListener('load', () => { loaded = true; });
    setTimeout(() => { minTimeDone = true; }, 1900);

    const poll = setInterval(() => {
      if (loaded && minTimeDone) { clearInterval(poll); counter.kill(); finish(); }
    }, 120);
    setTimeout(() => { clearInterval(poll); counter.kill(); finish(); }, 7000);
  };
  initPreloader();

  /* ============================================================
     SCROLL-DRIVEN ANIMATION
     ============================================================ */
  if (animate && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    /* generic reveals */
    const reveals = $$('.reveal');
    gsap.set(reveals, { autoAlpha: 0, y: 36 });
    ScrollTrigger.batch(reveals, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => gsap.to(batch, {
        autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08
      })
    });

    /* mission — line-by-line statement + slow parallax zoom */
    const missionLines = $$('.mission-statement .m-line > span');
    gsap.set(missionLines, { yPercent: 115 });
    gsap.to(missionLines, {
      yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.14,
      scrollTrigger: { trigger: '#mission', start: 'top 68%', once: true }
    });
    const missionBg = $('.mission-bg');
    if (missionBg) {
      gsap.fromTo(missionBg,
        { scale: 1.16, yPercent: -4 },
        { scale: 1.0, yPercent: 4, ease: 'none',
          scrollTrigger: { trigger: '#mission', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
    }

    /* model frame */
    gsap.set('.reveal-frame', { autoAlpha: 0, y: 52, scale: 0.965 });
    gsap.to('.reveal-frame', {
      autoAlpha: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: '#machine', start: 'top 62%', once: true }
    });

    /* pillars — directional wipe-in */
    const pillars = $$('.pillar');
    gsap.set(pillars, { autoAlpha: 0, x: -44 });
    gsap.to(pillars, {
      autoAlpha: 1, x: 0, duration: 0.95, ease: 'power3.out', stagger: 0.14,
      scrollTrigger: { trigger: '.pillars-list', start: 'top 78%', once: true }
    });

    /* systems — block + chips */
    $$('.reveal-block').forEach((block) => {
      gsap.set(block, { autoAlpha: 0, y: 56 });
      const chips = $$('.chips li', block);
      gsap.set(chips, { autoAlpha: 0, y: 14 });
      gsap.timeline({
        scrollTrigger: { trigger: block, start: 'top 78%', once: true }
      })
        .to(block, { autoAlpha: 1, y: 0, duration: 1.0, ease: 'power3.out' })
        .to(chips, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.05 }, '-=0.5');
    });

    /* spec counters */
    const runCounters = () => {
      $$('.count').forEach((el) => {
        const target   = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const prefix   = el.dataset.prefix || '';
        const state    = { v: 0 };
        gsap.to(state, {
          v: target, duration: 1.7, ease: 'power2.out',
          onUpdate: () => { el.innerHTML = prefix + state.v.toFixed(decimals); }
        });
      });
    };
    ScrollTrigger.create({
      trigger: '.specs-grid', start: 'top 80%', once: true, onEnter: runCounters
    });

    /* gallery — pinned horizontal traverse on desktop */
    const wrap  = $('#gallery-wrap');
    const track = $('#gallery-track');
    if (wrap && track) {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 900px)', () => {
        wrap.classList.add('is-pinned');
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const tween = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: '#gallery',
            start: 'top top',
            end: () => '+=' + dist(),
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });
        return () => {
          wrap.classList.remove('is-pinned');
          gsap.set(track, { x: 0 });
          tween.scrollTrigger && tween.scrollTrigger.kill();
          tween.kill();
        };
      });
    }

    /* contact statement rule draws in */
    gsap.set('.green-rule', { scaleX: 0, transformOrigin: 'left center' });
    gsap.to('.green-rule', {
      scaleX: 1, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.contact-statement', start: 'top 85%', once: true }
    });

    window.addEventListener('load', () => ScrollTrigger.refresh());
  } else {
    /* no animation path: make sure counters show final values */
    $$('.count').forEach((el) => {
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      el.innerHTML = (el.dataset.prefix || '') + parseFloat(el.dataset.count).toFixed(decimals);
    });
    $('.gallery-hint') && ($('.gallery-hint').textContent = 'SWIPE TO TRAVERSE');
  }

  /* ============================================================
     3D MODEL — model-viewer
     ============================================================ */
  const mv       = $('#volta-model');
  const loading  = $('#model-loading');
  const fallback = $('#model-fallback');
  const cards    = $('#machine-cards');
  const card     = $('#hotspot-card');

  const modelFailed = () => {
    if (mv) mv.style.display = 'none';
    if (loading) loading.classList.add('done');
    if (card) card.hidden = true;
    if (fallback) fallback.hidden = false;
    if (cards) cards.hidden = false;
  };

  if (mv) {
    /* if the web component never registers (module blocked), fall back */
    setTimeout(() => {
      if (!window.customElements || !customElements.get('model-viewer')) modelFailed();
    }, 6000);

    if (reduced) mv.removeAttribute('auto-rotate');

    /* loading progress */
    const fill = $('#ml-fill');
    const text = $('#ml-text');
    mv.addEventListener('progress', (e) => {
      const p = Math.round((e.detail.totalProgress || 0) * 100);
      if (fill) fill.style.width = p + '%';
      if (text) text.textContent = 'LOADING MODEL — ' + p + '%';
    });

    mv.addEventListener('load', () => {
      if (loading) loading.classList.add('done');
      placeHotspots();
    });
    mv.addEventListener('error', modelFailed);

    /* place hotspots proportionally on the model's bounding box,
       so they land sensibly regardless of model scale/origin */
    const placeHotspots = () => {
      try {
        const c = mv.getBoundingBoxCenter();
        const d = mv.getDimensions();
        Object.entries(HOTSPOTS).forEach(([key, cfg]) => {
          const x = c.x + cfg.frac.x * d.x / 2;
          const y = c.y + cfg.frac.y * d.y / 2;
          const z = c.z + cfg.frac.z * d.z / 2;
          mv.updateHotspot({ name: 'hotspot-' + key, position: `${x}m ${y}m ${z}m` });
        });
      } catch (err) { /* keep the static data-position fallbacks */ }
    };

    /* pause auto-rotate while the user drives, resume after idle */
    let rotTimer = null;
    mv.addEventListener('camera-change', (e) => {
      if (reduced || e.detail.source !== 'user-interaction') return;
      mv.removeAttribute('auto-rotate');
      clearTimeout(rotTimer);
      rotTimer = setTimeout(() => mv.setAttribute('auto-rotate', ''), 4000);
    });

    /* hotspot info cards */
    const hcIndex = $('#hc-index');
    const hcTitle = $('#hc-title');
    const hcBody  = $('#hc-body');
    const buttons = $$('.hotspot', mv);

    const closeCard = () => {
      card.hidden = true;
      buttons.forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-expanded', 'false'); });
    };

    const openCard = (key, btn) => {
      const cfg = HOTSPOTS[key];
      if (!cfg) return;
      hcIndex.textContent = cfg.index;
      hcTitle.textContent = cfg.title;
      hcBody.textContent  = cfg.body;
      buttons.forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-expanded', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      card.hidden = false;
      if (animate) gsap.fromTo(card, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' });
      card.setAttribute('tabindex', '-1');
    };

    buttons.forEach((btn) => {
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (btn.classList.contains('active')) closeCard();
        else openCard(btn.dataset.key, btn);
      });
    });
    $('#hc-close').addEventListener('click', closeCard);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCard(); });
  }
})();
