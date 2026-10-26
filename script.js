(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // What each gift amount covers, based on the salon's starting prices
  const covers = {
    50: 'a gel polish manicure',
    100: 'a long haircut + a moisturizing treatment',
    150: 'partial foils, or a full colour + bang trim',
    200: 'a full ombre / balayage',
  };

  // Amount picker -> live card preview + CTA label
  const chips = document.querySelectorAll('.chip');
  const cardAmount = document.getElementById('card-amount');
  const buyAmount = document.getElementById('buy-amount');
  const coversText = document.getElementById('covers-text');

  const swap = (el, value) => {
    el.classList.add('is-swapping');
    setTimeout(() => {
      el.textContent = value;
      el.classList.remove('is-swapping');
    }, reduceMotion ? 0 : 220);
  };

  const select = (chip) => {
    chips.forEach((c) => {
      const on = c === chip;
      c.setAttribute('aria-checked', String(on));
      c.tabIndex = on ? 0 : -1;
    });
    const amount = chip.dataset.amount;
    swap(cardAmount, amount);
    swap(coversText, covers[amount]);
    buyAmount.textContent = `$${amount}`;
  };

  chips.forEach((chip, i) => {
    chip.tabIndex = chip.getAttribute('aria-checked') === 'true' ? 0 : -1;
    chip.addEventListener('click', () => select(chip));
    chip.addEventListener('keydown', (e) => {
      const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      const next = chips[(i + dir + chips.length) % chips.length];
      next.focus();
      select(next);
    });
  });

  // 3D tilt on the gift card
  const card = document.getElementById('giftcard');
  const visual = document.querySelector('.hero__visual');
  if (card && visual && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    visual.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.classList.add('is-tilting');
      card.style.setProperty('--ry', `${x * 22}deg`);
      card.style.setProperty('--rx', `${-y * 18}deg`);
    });
    visual.addEventListener('pointerleave', () => {
      card.classList.remove('is-tilting');
      card.style.removeProperty('--ry');
      card.style.removeProperty('--rx');
    });
  }

  // Scroll reveal with a small stagger per group
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
      el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 5) * 0.08}s`);
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // Sticky nav shadow + mobile action bar once past the hero CTA
  const nav = document.querySelector('.nav');
  const bar = document.querySelector('.mobilebar');
  const heroActions = document.querySelector('.hero__actions');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
    if (bar && heroActions) bar.classList.toggle('is-shown', heroActions.getBoundingClientRect().bottom < 0);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.getElementById('year').textContent = new Date().getFullYear();
})();
