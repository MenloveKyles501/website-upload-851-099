(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var toggle = $('[data-mobile-toggle]');
    var menu = $('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupSearchLayer() {
    var layer = $('[data-search-layer]');

    if (!layer) {
      return;
    }

    $all('[data-search-open]').forEach(function (button) {
      button.addEventListener('click', function () {
        layer.classList.add('is-open');
        layer.setAttribute('aria-hidden', 'false');
        var input = layer.querySelector('input[type="search"]');
        if (input) {
          input.focus();
        }
      });
    });

    $all('[data-search-close]').forEach(function (button) {
      button.addEventListener('click', function () {
        layer.classList.remove('is-open');
        layer.setAttribute('aria-hidden', 'true');
      });
    });

    layer.addEventListener('click', function (event) {
      if (event.target === layer) {
        layer.classList.remove('is-open');
        layer.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function setupHero() {
    var slides = $all('[data-hero-slide]');
    var dots = $all('[data-hero-dot]');
    var next = $('[data-hero-next]');
    var prev = $('[data-hero-prev]');
    var index = 0;
    var timer = null;

    if (!slides.length) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('active', position === index);
      });
    }

    function schedule() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        schedule();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        schedule();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        schedule();
      });
    });

    schedule();
  }

  function setupImageFallback() {
    $all('img').forEach(function (image) {
      image.addEventListener('error', function () {
        var wrap = image.closest('.poster-wrap');
        if (wrap) {
          wrap.classList.add('is-missing');
        }
        image.style.opacity = '0';
      });
    });
  }

  function setupPageFilter() {
    var input = $('#page-filter');
    var grid = $('[data-card-grid]');

    if (!input || !grid) {
      return;
    }

    var cards = $all('.movie-card', grid);
    var count = $('[data-card-count]');
    var empty = $('[data-empty-state]');

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = card.getAttribute('data-search') || '';
        var matched = !query || haystack.indexOf(query) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible;
      }

      if (empty) {
        empty.hidden = visible !== 0;
      }
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a href="' + escapeHtml(movie.detailUrl) + '" class="card-link" aria-label="查看' + escapeHtml(movie.title) + '详情">',
      '    <div class="poster-wrap" data-title="' + escapeHtml(movie.title) + '">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy">',
      '      <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
      '      <span class="poster-play">播放</span>',
      '    </div>',
      '    <div class="card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="card-meta">',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '        <span>' + escapeHtml(movie.region) + '</span>',
      '        <span>' + escapeHtml(movie.channelName) + '</span>',
      '      </div>',
      '      <div class="tag-row">' + tags + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupAdvancedSearch() {
    var form = $('[data-advanced-search]');
    var results = $('#search-results');
    var summary = $('[data-search-summary]');

    if (!form || !results || !window.MOVIE_DATA) {
      return;
    }

    var queryInput = $('#search-q');
    var typeSelect = $('#search-type');
    var channelSelect = $('#search-channel');
    var params = new URLSearchParams(window.location.search);

    if (params.get('q')) {
      queryInput.value = params.get('q');
    }

    if (params.get('type')) {
      typeSelect.value = params.get('type');
    }

    if (params.get('channel')) {
      channelSelect.value = params.get('channel');
    }

    if (params.get('tag')) {
      queryInput.value = params.get('tag');
    }

    function apply(event) {
      if (event) {
        event.preventDefault();
      }

      var query = queryInput.value.trim().toLowerCase();
      var type = typeSelect.value;
      var channel = channelSelect.value;
      var matched = window.MOVIE_DATA.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genreRaw,
          movie.channelName,
          (movie.tags || []).join(' '),
          movie.oneLine,
          movie.summary
        ].join(' ').toLowerCase();

        if (query && haystack.indexOf(query) === -1) {
          return false;
        }

        if (type && movie.type !== type) {
          return false;
        }

        if (channel && movie.channelName !== channel) {
          return false;
        }

        return true;
      });

      results.innerHTML = matched.slice(0, 240).map(cardTemplate).join('');
      setupImageFallback();

      if (summary) {
        if (matched.length > 240) {
          summary.textContent = '共找到 ' + matched.length + ' 部影片，当前显示前 240 部，请继续输入关键词缩小范围。';
        } else {
          summary.textContent = '共找到 ' + matched.length + ' 部影片。';
        }
      }
    }

    form.addEventListener('submit', apply);

    if (window.location.search) {
      apply();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupSearchLayer();
    setupHero();
    setupImageFallback();
    setupPageFilter();
    setupAdvancedSearch();
  });
})();
