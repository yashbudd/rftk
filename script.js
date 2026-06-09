(function () {
  'use strict';

  const TOTAL_MILES = 70;

  const milestones = [
    { pct: 0, title: 'Starting line', text: 'Brothers gather at Georgia Tech before dawn.' },
    { pct: 15, title: 'Midtown Atlanta', text: 'Running through the heart of the city with early morning energy.' },
    { pct: 30, title: 'Decatur', text: 'Passing through historic Decatur as the sun rises.' },
    { pct: 50, title: 'Halfway point', text: 'Chapters meet for a handoff celebration at the midpoint.' },
    { pct: 70, title: 'Monroe', text: 'Pushing through the final stretch of countryside.' },
    { pct: 85, title: 'Watkinsville', text: 'Athens is in sight — the game ball is almost home.' },
    { pct: 100, title: 'Athens finish line', text: 'The game ball arrives at UGA ahead of Clean, Old-Fashioned Hate!' },
  ];

  const tierLabels = {
    community: 'Community Partner (in-kind donations or volunteer support)',
    bronze: 'Bronze ($500+)',
    silver: 'Silver ($1,500+)',
    gold: 'Gold ($3,000+)',
    platinum: 'Platinum ($5,000+)',
  };

  // Navigation
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  // Animated stats
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

  // Interactive route
  const routeSlider = document.getElementById('routeSlider');
  const routeProgress = document.getElementById('routeProgress');
  const routeRunner = document.getElementById('routeRunner');
  const milesTraveled = document.getElementById('milesTraveled');
  const routeMilestone = document.getElementById('routeMilestone');

  function updateRoute(pct) {
    pct = Math.max(0, Math.min(100, pct));
    routeSlider.value = pct;
    routeProgress.style.width = pct + '%';
    routeRunner.style.left = pct + '%';
    routeRunner.setAttribute('aria-valuenow', pct);

    const miles = Math.round((pct / 100) * TOTAL_MILES);
    milesTraveled.textContent = miles;

    let active = milestones[0];
    for (const m of milestones) {
      if (pct >= m.pct) active = m;
    }
    routeMilestone.innerHTML = `<strong>${active.title}</strong> — ${active.text}`;
  }

  routeSlider.addEventListener('input', (e) => updateRoute(parseFloat(e.target.value)));

  // Auto-animate route on first view
  let routeAnimated = false;
  const routeObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !routeAnimated) {
        routeAnimated = true;
        let pct = 0;
        const interval = setInterval(() => {
          pct += 2;
          updateRoute(pct);
          if (pct >= 100) clearInterval(interval);
        }, 40);
      }
    },
    { threshold: 0.4 }
  );
  routeObserver.observe(document.getElementById('route'));

  // Tier selection
  const tiersGrid = document.getElementById('tiersGrid');
  const tierSelect = document.getElementById('tierSelect');

  tiersGrid.querySelectorAll('.tier-card').forEach((card) => {
    card.addEventListener('click', () => {
      tiersGrid.querySelectorAll('.tier-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      tierSelect.value = card.dataset.tier;
      updateEmail();
    });
  });

  tierSelect.addEventListener('change', () => {
    const val = tierSelect.value;
    tiersGrid.querySelectorAll('.tier-card').forEach((c) => {
      c.classList.toggle('selected', c.dataset.tier === val);
    });
    updateEmail();
  });

  // Email generator
  const form = document.getElementById('outreachForm');
  const emailBody = document.getElementById('emailBody');
  const copyBtn = document.getElementById('copyEmail');
  const mailtoBtn = document.getElementById('openMailto');
  const toast = document.getElementById('toast');

  function getFormValues() {
    return {
      contactName: document.getElementById('contactName').value.trim(),
      companyName: document.getElementById('companyName').value.trim(),
      chair: document.getElementById('chairSelect').value,
      phone: document.getElementById('phoneNumber').value.trim(),
      email: document.getElementById('emailAddress').value.trim(),
      tier: document.getElementById('tierSelect').value,
      customNote: document.getElementById('customNote').value.trim(),
    };
  }

  function generateEmailText(v) {
    const greeting = v.contactName
      ? `Dear ${v.contactName},`
      : v.companyName
        ? `Dear ${v.companyName} Team,`
        : 'Dear [Name/Company Team],';

    const companyRef = v.companyName || '[Company Name]';

    let tierParagraph = '';
    if (v.tier && tierLabels[v.tier]) {
      tierParagraph = `\nWe believe the ${tierLabels[v.tier]} level would be a great fit for ${companyRef}, and we'd be happy to discuss customized benefits to meet your goals.\n`;
    }

    let customNote = '';
    if (v.customNote) {
      customNote = `\n${v.customNote}\n`;
    }

    const signature = [
      'Best regards,',
      v.chair,
      'Philanthropy Chair, Phi Gamma Delta – Georgia Tech',
      v.phone || '[Phone Number]',
      v.email || '[Email Address]',
    ].join('\n');

    return `${greeting}

I hope this email finds you well. My name is ${v.chair}, and I am one of the Philanthropy Chairs for the Georgia Tech chapter of Phi Gamma Delta (FIJI), a social fraternity on campus. I am reaching out regarding our annual philanthropy event, Run for the Kids.

Each year, members from the Georgia Tech and University of Georgia FIJI chapters participate in a relay style run carrying the game ball nearly 70 miles between Atlanta and Athens ahead of Clean, Old-Fashioned Hate, the historic rivalry game between Georgia Tech and the University of Georgia. The event serves as a fundraiser for Children's Healthcare of Atlanta (CHOA), supporting children and families across Georgia. This year's run will most likely take place on Sunday, November 22, 2026, the week before Thanksgiving.

Historically, the event has raised over $10,000 for CHOA, and this year our goal is to make an even greater impact through expanded community and corporate support.

We would love the opportunity to partner with ${companyRef} as a sponsor for this year's event. Sponsorship benefits include:

• Company logo placement on our official sponsor banner carried throughout the entire 70-mile run
• Recognition across event marketing materials and social media promotion
• Exposure through local television and campus coverage
• Brand visibility to students, alumni, and the greater Atlanta/Athens communities
• Association with a philanthropic initiative supporting Children's Healthcare of Atlanta
${tierParagraph}
We are currently seeking financial sponsors, in-kind donations, and community partners to help elevate the event and maximize our contribution to CHOA.
${customNote}
I would be happy to share additional details regarding sponsorship tiers, audience reach, and partnership opportunities. Thank you for your time and consideration, and we hope to work together to make Run for the Kids 2026 our most impactful year yet.

Here is a link to an article about our event: https://www.gatech.edu/news/2025/11/24/run-kids-delivers-game-ball-clean-old-fashioned-hate

${signature}`;
  }

  function updateEmail() {
    emailBody.textContent = generateEmailText(getFormValues());
  }

  form.querySelectorAll('input, select, textarea').forEach((el) => {
    el.addEventListener('input', updateEmail);
    el.addEventListener('change', updateEmail);
  });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  copyBtn.addEventListener('click', async () => {
    const text = generateEmailText(getFormValues());
    try {
      await navigator.clipboard.writeText(text);
      showToast('Email copied to clipboard!');
    } catch {
      showToast('Could not copy — please select and copy manually.');
    }
  });

  mailtoBtn.addEventListener('click', () => {
    const v = getFormValues();
    const subject = encodeURIComponent('Corporate Sponsorship Opportunity – Run for the Kids 2026');
    const body = encodeURIComponent(generateEmailText(v));
    const mailto = v.email
      ? `mailto:?subject=${subject}&body=${body}`
      : `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailto;
  });

  // Initial render
  updateEmail();
  updateRoute(0);

  // Pre-select gold tier visually
  const goldTier = tiersGrid.querySelector('[data-tier="gold"]');
  if (goldTier) goldTier.classList.add('selected');
})();
