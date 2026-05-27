(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        var open = mobilePanel.hasAttribute("hidden");
        if (open) {
          mobilePanel.removeAttribute("hidden");
        } else {
          mobilePanel.setAttribute("hidden", "");
        }
        menuButton.setAttribute("aria-expanded", String(open));
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
      var nextButton = hero.querySelector("[data-hero-next]");
      var prevButton = hero.querySelector("[data-hero-prev]");
      var index = Math.max(0, slides.findIndex(function (slide) {
        return slide.classList.contains("is-active");
      }));
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (nextButton) {
        nextButton.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      if (prevButton) {
        prevButton.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          restart();
        });
      });

      show(index);
      restart();
    });

    document.querySelectorAll("[data-filter-area]").forEach(function (area) {
      var input = area.querySelector("[data-filter-input]");
      var year = area.querySelector("[data-filter-year]");
      var region = area.querySelector("[data-filter-region]");
      var genre = area.querySelector("[data-filter-genre]");
      var cards = Array.from(area.querySelectorAll(".movie-card"));
      var empty = area.querySelector("[data-no-results]");

      if (area.hasAttribute("data-query-sync") && input) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
          input.value = query;
        }
      }

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var selectedYear = normalize(year ? year.value : "");
        var selectedRegion = normalize(region ? region.value : "");
        var selectedGenre = normalize(genre ? genre.value : "");
        var visibleCount = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.genre,
            card.textContent
          ].join(" "));
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
          var matchesRegion = !selectedRegion || normalize(card.dataset.region) === selectedRegion;
          var matchesGenre = !selectedGenre || normalize(card.dataset.genre).indexOf(selectedGenre) !== -1;
          var visible = matchesKeyword && matchesYear && matchesRegion && matchesGenre;

          card.hidden = !visible;
          if (visible) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.hidden = visibleCount !== 0;
        }
      }

      [input, year, region, genre].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });

      apply();
    });
  });
})();
