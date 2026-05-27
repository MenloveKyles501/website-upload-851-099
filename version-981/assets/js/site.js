(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    if (slides.length > 1) {
      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(current - 1);
          startHero();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          showSlide(current + 1);
          startHero();
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          showSlide(index);
          startHero();
        });
      });
      startHero();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.movie-search'));

  searchInputs.forEach(function (input) {
    var area = input.closest('main') || document;
    var region = area.querySelector('.filter-region');
    var type = area.querySelector('.filter-type');
    var cards = Array.prototype.slice.call(area.querySelectorAll('.movie-card'));
    var empty = area.querySelector('.filter-empty');

    function applyFilter() {
      var keyword = normalize(input.value);
      var regionValue = region ? normalize(region.value) : '';
      var typeValue = type ? normalize(type.value) : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-title'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (regionValue && cardRegion !== regionValue) {
          matched = false;
        }
        if (typeValue && cardType !== typeValue) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    input.addEventListener('input', applyFilter);
    if (region) {
      region.addEventListener('change', applyFilter);
    }
    if (type) {
      type.addEventListener('change', applyFilter);
    }
  });
}());
