document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      navToggle.classList.toggle('open');
    });
  }

  const params = new URLSearchParams(window.location.search);
  const presetSearch = params.get('q');

  const bindSearch = (root = document) => {
    const input = root.querySelector('[data-search]');
    const cards = [...root.querySelectorAll('[data-card]')];
    const resultCount = root.querySelector('[data-result-count]');
    const emptyState = root.querySelector('[data-empty-state]');
    const chips = [...root.querySelectorAll('[data-filter-chip]')];

    if (!input || !cards.length) return;

    const state = { term: presetSearch || '', filter: 'all' };

    const apply = () => {
      const q = (state.term || '').trim().toLowerCase();
      let shown = 0;

      cards.forEach(card => {
        const text = (card.dataset.title + ' ' + card.dataset.genre + ' ' + card.dataset.type + ' ' + card.dataset.region + ' ' + card.dataset.year).toLowerCase();
        const matchTerm = !q || text.includes(q);
        const matchFilter = state.filter === 'all' || card.dataset.bucket === state.filter || card.dataset.type === state.filter;
        const visible = matchTerm && matchFilter;
        card.style.display = visible ? '' : 'none';
        if (visible) shown++;
      });

      if (resultCount) resultCount.textContent = String(shown);
      if (emptyState) emptyState.style.display = shown ? 'none' : 'block';
    };

    input.value = state.term;

    input.addEventListener('input', e => {
      state.term = e.target.value;
      apply();
    });

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.filter = chip.dataset.filterChip;
        apply();
      });
    });

    apply();
  };

  bindSearch();

  const playBtn = document.querySelector('[data-play-video]');
  const video = document.querySelector('video[data-trailer]');
  if (playBtn && video) {
    playBtn.addEventListener('click', () => {
      video.play().catch(() => {});
    });
  }

  // Smooth jump to sections
  document.querySelectorAll('[data-scroll-to]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.querySelector(btn.dataset.scrollTo);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});