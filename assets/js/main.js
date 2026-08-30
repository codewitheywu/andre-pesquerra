/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO MAIN.JS
   - Nav scroll behaviour
   - Mobile hamburger menu
   - Scroll reveal (IntersectionObserver)
   - Skill bar animation
   - Contact form AJAX
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Nav: Scrolled State ─────────────────────────────────── */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile Hamburger ────────────────────────────────────── */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Scroll Reveal ───────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── Skill Bars ──────────────────────────────────────────── */
  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.pct + '%';
          });
          skillObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  const skillSection = document.getElementById('about');
  if (skillSection) skillObserver.observe(skillSection);

  /* ── Contact Form (AJAX) ─────────────────────────────────── */
  const form = document.getElementById('contact-form');
  if (form) {

    // Renders a title + optional detail line (or a bulleted list for
    // multiple validation errors) instead of one run-on sentence.
    const setFormMessage = (msg, type, title, details) => {
      msg.className = 'form-msg ' + type;
      msg.innerHTML = '';

      const icon = document.createElement('span');
      icon.className = 'form-msg-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = type === 'success' ? '✓' : '!';

      const body = document.createElement('div');
      body.className = 'form-msg-body';

      const titleEl = document.createElement('p');
      titleEl.className = 'form-msg-title';
      titleEl.textContent = title;
      body.appendChild(titleEl);

      if (Array.isArray(details) && details.length > 1) {
        const list = document.createElement('ul');
        list.className = 'form-msg-list';
        details.forEach(d => {
          const li = document.createElement('li');
          li.textContent = d;
          list.appendChild(li);
        });
        body.appendChild(list);
      } else if (details) {
        const detailEl = document.createElement('p');
        detailEl.className = 'form-msg-detail';
        detailEl.textContent = Array.isArray(details) ? details[0] : details;
        body.appendChild(detailEl);
      }

      msg.appendChild(icon);
      msg.appendChild(body);
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.btn-submit');
      const msg = document.getElementById('form-msg');
      const original = btn.textContent;

      btn.disabled = true;
      btn.textContent = 'Sending…';
      msg.className = 'form-msg';
      msg.innerHTML = '';

      try {
        const res  = await fetch('pages/contact_handler.php', {
          method: 'POST',
          body: new FormData(form),
        });
        const data = await res.json();

        if (data.success) {
          let detail = "I'll get back to you soon.";
          if (typeof data.remaining === 'number') {
            if (data.remaining <= 0)      detail += ' This was your last inquiry for this month.';
            else if (data.remaining === 1) detail += ' You have 1 inquiry left this month.';
            else                            detail += ` You have ${data.remaining} inquiries left this month.`;
          }
          setFormMessage(msg, 'success', 'Message received.', detail);
          form.reset();
        } else if (data.errors) {
          setFormMessage(msg, 'error', 'Please check the form:', data.errors);
        } else {
          setFormMessage(msg, 'error', 'Unable to send your message.', data.message);
        }
      } catch {
        setFormMessage(msg, 'error', 'Network error.', 'Please check your connection and try again.');
      } finally {
        btn.disabled = false;
        btn.textContent = original;
      }
    });
  }

  /* ── Projects Fan Carousel ───────────────────────────────── */
  const fanTrack = document.querySelector('.proj-carousel-track');
  if (fanTrack) {
    const cards  = Array.from(fanTrack.querySelectorAll('.proj-fan-card'));
    const dots   = Array.from(document.querySelectorAll('.proj-dot'));
    const prevBtn = document.querySelector('.proj-carousel-prev');
    const nextBtn = document.querySelector('.proj-carousel-next');
    const total  = cards.length;
    let active   = 0;

    const render = () => {
      cards.forEach((card, i) => {
        const diff = (i - active + total) % total;
        card.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden');

        let state;
        if (diff === 0) state = 'is-active';
        else if (diff === 1) state = 'is-next';
        else if (diff === total - 1) state = 'is-prev';
        else state = 'is-hidden';
        card.classList.add(state);

        const isActive = state === 'is-active';
        card.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        card.querySelectorAll('a, button').forEach(el => {
          if (isActive) el.removeAttribute('tabindex');
          else el.setAttribute('tabindex', '-1');
        });
      });
      dots.forEach((d, i) => {
        const isActive = i === active;
        d.classList.toggle('is-active', isActive);
        d.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    };

    const goTo = (index) => {
      active = ((index % total) + total) % total;
      render();
    };

    if (total > 1) {
      prevBtn?.addEventListener('click', () => goTo(active - 1));
      nextBtn?.addEventListener('click', () => goTo(active + 1));
      dots.forEach(dot => dot.addEventListener('click', () => goTo(Number(dot.dataset.index))));
      cards.forEach(card => {
        card.addEventListener('click', (e) => {
          if (card.classList.contains('is-active')) return;
          if (e.target.closest('a, button')) return;
          goTo(Number(card.dataset.index));
        });
      });
    }

    render();
  }

  /* ── Testimonials Rotator ────────────────────────────────── */
  const testiRotator = document.querySelector('.testi-rotator');
  const testiTrack    = document.querySelector('.testi-track');
  if (testiRotator && testiTrack) {
    const slides    = Array.from(testiTrack.children);
    const dots      = Array.from(document.querySelectorAll('.testi-dot'));
    const progressFill = document.querySelector('.testi-progress-fill');
    const realCount = Number(testiTrack.dataset.count) || slides.length;
    const duration  = (Number(testiTrack.dataset.duration) || 8) * 1000;
    const hasClone  = slides.length > realCount;

    let index = 0;
    let timer = null;

    const position = (instant) => {
      testiTrack.style.transition = instant ? 'none' : '';
      testiTrack.style.transform  = `translateY(-${index * testiRotator.clientHeight}px)`;
    };

    const render = () => {
      const activeReal = index % realCount;
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === activeReal);
        d.setAttribute('aria-selected', i === activeReal ? 'true' : 'false');
      });
      slides.forEach((slide, i) => {
        slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });
    };

    const restartProgress = () => {
      if (!progressFill) return;
      progressFill.style.animation = 'none';
      void progressFill.offsetWidth; // force reflow so the animation restarts from 0
      progressFill.style.animation = `testi-progress-fill ${duration}ms linear forwards`;
    };

    const advance = () => {
      index++;
      position();
      render();
      restartProgress();
      if (hasClone && index === realCount) {
        setTimeout(() => { index = 0; position(true); }, 950);
      }
    };

    const startTimer = () => {
      clearInterval(timer);
      if (realCount > 1) {
        timer = setInterval(() => { if (!document.hidden) advance(); }, duration);
      }
    };

    const goTo = (i) => {
      index = i;
      position();
      render();
      restartProgress();
      startTimer();
    };

    if (realCount > 1) {
      dots.forEach(dot => dot.addEventListener('click', () => goTo(Number(dot.dataset.index))));

      testiRotator.addEventListener('mouseenter', () => {
        clearInterval(timer);
        if (progressFill) progressFill.style.animationPlayState = 'paused';
      });
      testiRotator.addEventListener('mouseleave', () => { restartProgress(); startTimer(); });

      window.addEventListener('resize', () => position(true));

      restartProgress();
      startTimer();
    }

    render();
  }

  /* ── Testimonial Translation ─────────────────────────────── */
  document.querySelectorAll('.testi-translate-btn').forEach(btn => {
    const quote    = btn.previousElementSibling; // .testi-quote
    const original = quote.textContent;
    let translated = null;
    let showingOriginal = true;

    btn.addEventListener('click', async () => {
      if (btn.dataset.state === 'loading' || btn.dataset.state === 'done-english') return;

      // Already translated once this session — just toggle, no re-fetch.
      if (!showingOriginal) {
        quote.textContent = original;
        btn.textContent = 'Translate to English';
        showingOriginal = true;
        return;
      }
      if (translated) {
        quote.textContent = translated;
        btn.textContent = 'Show original';
        showingOriginal = false;
        return;
      }

      btn.dataset.state = 'loading';
      btn.textContent = 'Translating…';
      try {
        const res  = await fetch('pages/translate_handler.php', {
          method: 'POST',
          body: new URLSearchParams({ text: original }),
        });
        const data = await res.json();

        if (data.success && data.translated) {
          translated = data.translated;
          quote.textContent = translated;
          btn.textContent = 'Show original';
          showingOriginal = false;
          btn.dataset.state = 'idle';
        } else if (data.success && data.alreadyEnglish) {
          // Source and target both detected as English — nothing to translate.
          btn.dataset.state = 'done-english';
          btn.textContent = 'Already in English';
        } else {
          throw new Error('Unexpected translation response');
        }
      } catch {
        btn.dataset.state = 'error';
        btn.textContent = 'Translation unavailable';
        setTimeout(() => {
          btn.dataset.state = 'idle';
          btn.textContent = 'Translate to English';
        }, 3000);
      }
    });
  });

  /* ── Smooth active nav link ──────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a');
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          navLinks.forEach(a => {
            a.style.color = a.getAttribute('href') === '#' + e.target.id
              ? 'var(--text-1)' : '';
          });
        }
      });
    },
    { rootMargin: '-45% 0px -45% 0px' }
  );
  sections.forEach(s => activeObserver.observe(s));

  /* ── Mobile scrollbar: show on touch, hide on lift ────────── */
  let scrollHideTimer = null;
  const html = document.documentElement;

  const showScrollbar = () => {
    html.classList.add('is-scrolling');
    clearTimeout(scrollHideTimer);
  };
  const hideScrollbar = () => {
    scrollHideTimer = setTimeout(() => {
      html.classList.remove('is-scrolling');
    }, 600); // fade out 600ms after touch ends
  };

  window.addEventListener('touchstart', showScrollbar, { passive: true });
  window.addEventListener('touchmove',  showScrollbar, { passive: true });
  window.addEventListener('touchend',   hideScrollbar, { passive: true });
  window.addEventListener('touchcancel',hideScrollbar, { passive: true });

})();