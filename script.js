(function () {
  'use strict';

  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const sections = document.querySelectorAll('section[id], header[id]');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);

    const scrollPos = window.scrollY + 120;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.querySelectorAll('a:not(.nav-cta)').forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  });

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;

    statNumbers.forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        el.textContent = prefix + current.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    });
  }

  const impactSection = document.getElementById('impact');
  const statsObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) animateStats();
    },
    { threshold: 0.3 }
  );
  statsObserver.observe(impactSection);

  const routeProgress = document.getElementById('routeProgress');
  const routeRunner = document.getElementById('routeRunner');
  const milestoneItems = document.querySelectorAll('.route-milestone-item');

  function updateRoute(pct) {
    routeProgress.style.width = pct + '%';
    routeRunner.style.left = pct + '%';

    milestoneItems.forEach((item) => {
      const threshold = parseInt(item.dataset.pct, 10);
      item.classList.toggle('active', pct >= threshold);
    });
  }

  let routeAnimated = false;
  const routeObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !routeAnimated) {
        routeAnimated = true;
        let pct = 0;
        const interval = setInterval(() => {
          pct += 1.5;
          updateRoute(pct);
          if (pct >= 100) clearInterval(interval);
        }, 30);
      }
    },
    { threshold: 0.35 }
  );
  routeObserver.observe(document.getElementById('route'));

  updateRoute(0);
})();
