/* ============================================================
   IBAD PORTFOLIO — MASTER SCRIPT
   GSAP + ScrollTrigger, Custom Cursor, Particles,
   Theme Toggle (circular wipe), Preloader, Animations
   ============================================================ */

'use strict';

/* ─── GSAP REGISTRATION ─── */
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── UTILITIES ─── */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const raf = requestAnimationFrame;

function lerp(a, b, t) { return a + (b - a) * t; }

/* ─── PRELOADER ─── */
(function initPreloader() {
  const preloader = $('#preloader');
  const bar       = $('#preloaderBar');
  const count     = $('#preloaderCount');
  const chars     = $$('.preloader-logo span');

  if (!preloader) return;

  // Animate logo chars in
  chars.forEach((ch, i) => {
    setTimeout(() => {
      ch.style.transform = 'translateY(0)';
      ch.style.transition = `transform 0.6s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.08}s`;
    }, 100);
  });

  let progress = 0;
  const target = 100;
  const speed  = 1.8;

  function tick() {
    progress += (target - progress) * 0.04 + speed * 0.1;
    if (progress >= target) progress = target;

    const pct = Math.min(Math.floor(progress), 100);
    if (bar)   bar.style.width = pct + '%';
    if (count) count.textContent = pct + '%';

    if (progress < target) {
      raf(tick);
    } else {
      revealPage();
    }
  }

  // Start after a tiny delay so fonts load
  setTimeout(() => raf(tick), 300);

  function revealPage() {
    setTimeout(() => {
      if (typeof gsap !== 'undefined') {
        gsap.to(preloader, {
          y: '-100%',
          duration: 0.8,
          ease: 'power3.inOut',
          onComplete: () => {
            preloader.style.display = 'none';
            document.body.style.overflow = '';
            initHeroAnimation();
          }
        });
      } else {
        preloader.style.transition = 'opacity 0.5s';
        preloader.style.opacity    = '0';
        setTimeout(() => {
          preloader.style.display = 'none';
          document.body.style.overflow = '';
          initHeroAnimation();
        }, 500);
      }
    }, 400);
  }

  document.body.style.overflow = 'hidden';
})();

/* ─── CUSTOM CURSOR ─── */
(function initCursor() {
  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');
  if (!dot || !ring || window.matchMedia('(pointer:coarse)').matches) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;
  let animId;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function animCursor() {
    dot.style.transform  = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    animId = raf(animCursor);
  }
  animId = raf(animCursor);

  // Interactive state detection
  const interactiveSelectors = 'a, button, input, textarea, select, [role="button"], .skill-tab, .filter-btn, .project-card, .cert-card';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactiveSelectors)) {
      document.body.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactiveSelectors)) {
      document.body.classList.remove('cursor-hover');
    }
  });

  // Text cursor
  document.addEventListener('mouseover', e => {
    if (e.target.matches('.hero-title, p, h1, h2, h3, h4')) {
      document.body.classList.add('cursor-text');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.matches('.hero-title, p, h1, h2, h3, h4')) {
      document.body.classList.remove('cursor-text');
    }
  });
})();

/* ─── HERO PARTICLE CANVAS ─── */
(function initParticles() {
  const canvas = $('#heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const isMobile = window.matchMedia('(max-width:768px)').matches;
  const COUNT = isMobile ? 35 : 65;

  let W, H, particles = [];
  let mouse = { x: -9999, y: -9999 };
  let animating = true;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function mkParticle() {
    return {
      x:   Math.random() * W,
      y:   Math.random() * H,
      vx:  (Math.random() - 0.5) * 0.4,
      vy:  (Math.random() - 0.5) * 0.4,
      r:   Math.random() * 1.5 + 0.5,
      op:  Math.random() * 0.35 + 0.08,
    };
  }

  function getAccentRgb() {
    const theme = document.documentElement.getAttribute('data-theme');
    return theme === 'light' ? '29,78,216' : '59,130,246';
  }

  function draw() {
    if (!animating) return;
    ctx.clearRect(0, 0, W, H);
    const rgb = getAccentRgb();

    particles.forEach((p, i) => {
      // Mouse repulsion
      const dx  = mouse.x - p.x;
      const dy  = mouse.y - p.y;
      const d2  = dx * dx + dy * dy;
      if (d2 < 14400) { // 120^2
        const f = (14400 - d2) / 14400 * 0.025;
        p.vx -= dx * f;
        p.vy -= dy * f;
      }

      p.vx *= 0.99;
      p.vy *= 0.99;

      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 1.8) { p.vx = p.vx / speed * 1.8; p.vy = p.vy / speed * 1.8; }

      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;

      // Dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},${p.op})`;
      ctx.fill();

      // Connections
      for (let j = i + 1; j < particles.length; j++) {
        const q  = particles[j];
        const ex = p.x - q.x;
        const ey = p.y - q.y;
        const ed = Math.sqrt(ex * ex + ey * ey);
        if (ed < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${rgb},${0.14 * (1 - ed / 110)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    });

    raf(draw);
  }

  // Only run particles in hero section
  const hero = $('#hero');
  if (hero) {
    const obs = new IntersectionObserver(entries => {
      animating = entries[0].isIntersecting;
      if (animating) raf(draw);
    }, { threshold: 0 });
    obs.observe(hero);
  }

  document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  resize();
  for (let i = 0; i < COUNT; i++) particles.push(mkParticle());
  raf(draw);

  let resizeTO;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(() => { resize(); particles = []; for (let i=0;i<COUNT;i++) particles.push(mkParticle()); }, 200);
  });
})();

/* ─── HERO ENTRANCE ANIMATION ─── */
function initHeroAnimation() {
  const chars    = $$('.hero-title .char');
  const eyebrow  = $('.hero-eyebrow');
  const subP     = $('.hero-sub p');
  const ctaWrap  = $('.hero-cta-inner');
  const scroll   = $('#heroScroll');

  if (typeof gsap === 'undefined') {
    // CSS fallback
    [eyebrow, subP, ctaWrap, scroll].forEach(el => {
      if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
    });
    chars.forEach(c => { c.style.transform = 'translateY(0)'; });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Eyebrow
  tl.from(eyebrow, { y: 20, opacity: 0, duration: 0.6 }, 0);

  // Characters stagger
  tl.to(chars, {
    y: 0,
    duration: 0.8,
    stagger: 0.035,
    ease: 'power3.out',
  }, 0.2);

  // Subtitle
  tl.to(subP, { y: 0, opacity: 1, duration: 0.7 }, 0.6);

  // CTA
  tl.to(ctaWrap, { y: 0, opacity: 1, duration: 0.6 }, 0.85);

  // Scroll indicator
  tl.to(scroll, { opacity: 1, duration: 0.5 }, 1.1);
}

/* ─── SCROLL PROGRESS ─── */
(function initScrollProgress() {
  const bar = $('#scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    bar.style.transform = `scaleX(${Math.min(pct, 1)})`;
  }, { passive: true });
})();

/* ─── NAVIGATION ─── */
(function initNav() {
  const nav       = $('#nav');
  const hamburger = $('#navHamburger');
  const mobileMenu= $('#mobileMenu');
  const allNavLinks = $$('[data-section]');
  const sections    = $$('section[id]');

  // Scroll: add .scrolled class
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (nav) {
      nav.classList.toggle('scrolled', y > 60);
    }
    lastY = y;
  }, { passive: true });

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.contains('open');
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', !isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });
  }

  // Close menu on link click
  $$('.mobile-menu .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger && hamburger.classList.remove('open');
      hamburger && hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu && mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Smooth scroll for all anchor links
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });

  // Active nav link on scroll
  let currentSection = '';
  const obsOpts = { rootMargin: '-40% 0px -40% 0px', threshold: 0 };

  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        currentSection = e.target.id;
        allNavLinks.forEach(l => {
          l.classList.toggle('active', l.dataset.section === currentSection);
        });
      }
    });
  }, obsOpts);

  sections.forEach(s => sectionObs.observe(s));
})();

/* ─── THEME TOGGLE (CIRCULAR WIPE) ─── */
(function initTheme() {
  const btn = $('#themeToggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const current  = document.documentElement.getAttribute('data-theme') || 'dark';
    const next     = current === 'dark' ? 'light' : 'dark';
    const btnRect  = btn.getBoundingClientRect();
    const cx       = btnRect.left + btnRect.width  / 2;
    const cy       = btnRect.top  + btnRect.height / 2;
    const maxR     = Math.hypot(
      Math.max(cx, window.innerWidth  - cx),
      Math.max(cy, window.innerHeight - cy)
    );
    const bgColor  = next === 'dark' ? '#0A0A0F' : '#F8F7F4';

    // Create wipe overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:99999',
      `background:${bgColor}`,
      `clip-path:circle(0px at ${cx}px ${cy}px)`,
      'pointer-events:none',
    ].join(';');
    document.body.appendChild(overlay);

    if (typeof gsap !== 'undefined') {
      gsap.to(overlay, {
        clipPath: `circle(${maxR + 50}px at ${cx}px ${cy}px)`,
        duration: 0.65,
        ease: 'power3.inOut',
        onComplete: () => {
          document.documentElement.setAttribute('data-theme', next);
          localStorage.setItem('theme', next);
          overlay.remove();
        }
      });
    } else {
      overlay.style.transition = 'clip-path 0.6s cubic-bezier(0.4,0,0.2,1)';
      raf(() => {
        overlay.style.clipPath = `circle(${maxR + 50}px at ${cx}px ${cy}px)`;
        setTimeout(() => {
          document.documentElement.setAttribute('data-theme', next);
          localStorage.setItem('theme', next);
          overlay.remove();
        }, 620);
      });
    }
  });
})();

/* ─── SCROLL-TRIGGERED REVEALS ─── */
(function initReveals() {
  const revealEls = $$('.reveal, .reveal-left, .reveal-right');
  if (!revealEls.length) return;

  if (typeof IntersectionObserver === 'undefined') {
    revealEls.forEach(el => el.classList.add('in'));
    return;
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        // Stagger siblings in same parent
        const siblings = $$('.reveal, .reveal-left, .reveal-right', e.target.parentElement);
        const idx = siblings.indexOf(e.target);
        setTimeout(() => e.target.classList.add('in'), idx * 60);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  revealEls.forEach(el => obs.observe(el));
})();

/* ─── COUNTER ANIMATION ─── */
(function initCounters() {
  const counters = $$('[data-target]');
  if (!counters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseInt(el.dataset.target, 10);
      let start = 0;
      const dur = 1800;
      const t0  = performance.now();

      function step(now) {
        const elapsed = now - t0;
        const pct = Math.min(elapsed / dur, 1);
        const ease = 1 - Math.pow(1 - pct, 3);
        el.textContent = Math.floor(ease * target) + (pct < 1 ? '' : '+');
        if (pct < 1) raf(step);
        else el.textContent = target + '+';
      }

      raf(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
})();

/* ─── TIMELINE LINE DRAW ─── */
(function initTimeline() {
  const fill = $('#timelineFill');
  const line = fill && fill.closest('.timeline-line');
  if (!fill || !line) return;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.to(fill, {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: line,
        start: 'top 80%',
        end:   'bottom 20%',
        scrub: 1,
      }
    });
  } else {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        fill.style.transition = 'height 2s ease';
        fill.style.height = '100%';
      }
    }, { threshold: 0.1 });
    obs.observe(line);
  }
})();

/* ─── PROJECT CARD MAGNETIC EFFECT ─── */
(function initMagnetic() {
  if (window.matchMedia('(pointer:coarse)').matches) return;
  if (typeof gsap === 'undefined') return;

  $$('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width  / 2) * 0.1;
      const y = (e.clientY - rect.top  - rect.height / 2) * 0.1;
      gsap.to(card, { x, y, duration: 0.4, ease: 'power2.out' });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });
    });
  });
})();

/* ─── SKILLS TABS ─── */
(function initSkillTabs() {
  const tabs   = $$('.skill-tab');
  const panels = $$('.skills-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.panel;
      tabs.forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab);
      });
      panels.forEach(p => {
        const show = p.id === 'panel-' + target;
        p.classList.toggle('active', show);
        if (show) {
          // Re-trigger reveal for newly shown items
          $$('.skill-card', p).forEach((c, i) => {
            c.classList.remove('in');
            setTimeout(() => c.classList.add('in'), i * 50 + 20);
          });
        }
      });
    });
  });

  // Initial reveal
  $$('.skill-card', $('#panel-frontend')).forEach((c, i) => {
    setTimeout(() => c.classList.add('in'), i * 60 + 800);
  });
})();

/* ─── PROJECT & CERT FILTER ─── */
(function initFilters() {
  // Project filter
  const projectBtns  = $$('#projects .filter-btn');
  const projectCards = $$('.project-card');

  projectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      projectBtns.forEach(b => b.classList.toggle('active', b === btn));
      projectCards.forEach(card => {
        const show = f === 'all' || card.dataset.category === f;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  // Certificate filter
  const certBtns  = $$('#certificates .filter-btn');
  const certCards = $$('.cert-card');

  certBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      certBtns.forEach(b => b.classList.toggle('active', b === btn));
      certCards.forEach((card, i) => {
        const show = f === 'all' || card.dataset.category === f;
        if (show) {
          card.style.display = '';
          card.classList.remove('in');
          setTimeout(() => card.classList.add('in'), i * 60);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();

/* ─── CONTACT FORM ─── */
(function initContactForm() {
  const form    = $('#contactForm');
  const success = $('#formSuccess');
  if (!form) return;

  function validate(input) {
    const v = input.value.trim();
    let ok = true;
    if (input.required && !v)                  ok = false;
    if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) ok = false;
    if (input.minLength && v.length < input.minLength) ok = false;
    input.classList.toggle('valid',   ok && v.length > 0);
    input.classList.toggle('invalid', !ok && v.length > 0);
    return ok;
  }

  // Real-time validation
  $$('input, textarea', form).forEach(input => {
    input.addEventListener('input', () => validate(input));
    input.addEventListener('blur',  () => { if (input.value) validate(input); });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const inputs = $$('input, textarea', form);
    const allValid = inputs.every(validate);
    if (!allValid) {
      const first = inputs.find(i => i.classList.contains('invalid'));
      if (first) first.focus();
      return;
    }

    // Simulate send (no actual backend)
    const btn = form.querySelector('.form-submit');
    if (btn) { btn.textContent = 'Mengirim...'; btn.disabled = true; }

    setTimeout(() => {
      form.style.display    = 'none';
      success.classList.add('show');
    }, 1200);
  });
})();

/* ─── MOBILE BOTTOM NAV ACTIVE ─── */
(function initMobileNav() {
  const items    = $$('.mb-nav-item');
  const sections = $$('section[id]');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        items.forEach(item => {
          item.classList.toggle('active', item.dataset.section === id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });

  sections.forEach(s => obs.observe(s));
})();

/* ─── GSAP SCROLL TRIGGER EXTRAS ─── */
(function initGsapAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Section labels slide in from left
  $$('.section-label').forEach(el => {
    gsap.from(el, {
      x: -40, opacity: 0, duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  // Section titles — dramatic upward reveal
  $$('.section-title').forEach(el => {
    gsap.from(el, {
      y: 70, opacity: 0, duration: 1.0,
      ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  // Timeline cards — alternating from sides
  $$('.timeline-card').forEach(card => {
    const fromLeft = card.closest('.timeline-item-left');
    gsap.from(card, {
      x: fromLeft ? -60 : 60,
      opacity: 0, duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 84%', once: true }
    });
  });

  // About stats pop-in with spring
  const stats = $$('.stat-item');
  if (stats.length) {
    gsap.from(stats, {
      scale: 0.75, opacity: 0, duration: 0.55,
      stagger: 0.1, ease: 'back.out(2)',
      scrollTrigger: { trigger: stats[0], start: 'top 82%', once: true }
    });
  }

  // Project cards — staggered scale + fade (takes over from .reveal)
  const projectCards = $$('.project-card');
  if (projectCards.length) {
    projectCards.forEach(c => {
      c.classList.remove('reveal');
      gsap.set(c, { opacity: 0, y: 80, scale: 0.95 });
    });
    gsap.to(projectCards, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.75, stagger: 0.13,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.projects-grid', start: 'top 80%', once: true }
    });
  }

  // Cert cards — staggered scale + fade
  const certCards = $$('.cert-card');
  if (certCards.length) {
    certCards.forEach(c => {
      c.classList.remove('reveal');
      gsap.set(c, { opacity: 0, y: 60, scale: 0.95 });
    });
    gsap.to(certCards, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.65, stagger: 0.09,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.certs-grid', start: 'top 80%', once: true }
    });
  }

  // Contact social links — staggered slide from left
  const socialLinks = $$('.contact-social-link');
  if (socialLinks.length) {
    socialLinks.forEach(c => {
      c.classList.remove('reveal');
      gsap.set(c, { opacity: 0, x: -50 });
    });
    gsap.to(socialLinks, {
      opacity: 1, x: 0,
      duration: 0.65, stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.contact-socials', start: 'top 82%', once: true }
    });
  }

  // Edu cards — stagger from below
  const eduCards = $$('.edu-card');
  if (eduCards.length) {
    eduCards.forEach(c => {
      c.classList.remove('reveal');
      gsap.set(c, { opacity: 0, x: -30 });
    });
    gsap.to(eduCards, {
      opacity: 1, x: 0,
      duration: 0.6, stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.edu-cards', start: 'top 82%', once: true }
    });
  }
})();

/* ─── DOM READY ENTRY POINT ─── */
document.addEventListener('DOMContentLoaded', () => {
  // Mark initial skill cards as visible after slight delay
  // (handled in initSkillTabs)

  // Preload visible images only
  if ('loading' in HTMLImageElement.prototype) {
    $$('img[loading="lazy"]').forEach(img => {
      if (img.getBoundingClientRect().top < window.innerHeight * 2) {
        img.loading = 'eager';
      }
    });
  }
});
