/* ═══════════════════════════════════════════════════════════════
   CMS MAIN.JS
   - Mobile sidebar: hamburger + backdrop
   - Project form tabs
   - Auto-generate slug from title
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Mobile Sidebar ────────────────────────────────────────── */
  const sidebar   = document.querySelector('.sidebar');
  const hamburger = document.getElementById('cmsHamburger');
  const backdrop  = document.getElementById('sidebarBackdrop');

  function openSidebar() {
    sidebar.classList.add('open');
    hamburger.classList.add('open');
    backdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    hamburger.classList.remove('open');
    backdrop.classList.remove('visible');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
  }

  if (hamburger && sidebar && backdrop) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });

    // Close on backdrop tap
    backdrop.addEventListener('click', closeSidebar);

    // Close when a nav link is tapped on mobile
    sidebar.querySelectorAll('.nav-item').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 900) closeSidebar();
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar();
    });
  }

  /* ── Project Form Tabs ─────────────────────────────────────── */
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b  => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const panel = document.getElementById('tab-' + btn.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  /* ── Copy Email (fallback for when mailto: has no handler) ──── */
  document.querySelectorAll('.js-copy-email').forEach(btn => {
    btn.addEventListener('click', async () => {
      const email = btn.dataset.email || '';
      const original = btn.textContent;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
        } else {
          const ta = document.createElement('textarea');
          ta.value = email;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        btn.textContent = 'Copied!';
      } catch {
        btn.textContent = 'Copy failed';
      }
      setTimeout(() => { btn.textContent = original; }, 1500);
    });
  });

  /* ── Auto-generate Slug ────────────────────────────────────── */
  const titleInput = document.querySelector('input[name="title"]');
  const slugInput  = document.querySelector('input[name="slug"]');

  if (titleInput && slugInput) {
    titleInput.addEventListener('input', () => {
      if (slugInput.value === '') {
        slugInput.value = titleInput.value
          .toLowerCase().trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
    });
  }

})();