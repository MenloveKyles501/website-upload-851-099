(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      var opened = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", opened ? "false" : "true");
      panel.hidden = opened;
    });
  }

  function setupHero() {
    var slider = document.querySelector(".hero-slider");

    if (!slider) {
      return;
    }

    var slides = selectAll(".hero-slide", slider);
    var dots = selectAll(".hero-dot", slider);
    var prev = slider.querySelector(".hero-arrow.prev");
    var next = slider.querySelector(".hero-arrow.next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupFiltering() {
    var containers = selectAll(".movie-grid, .poster-grid, .ranking-list");
    var inputs = selectAll(".filter-input, .local-search input[type='search']");
    var chips = selectAll(".filter-chips button");
    var urlParams = new URLSearchParams(window.location.search);
    var query = normalize(urlParams.get("q"));

    function cardText(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" "));
    }

    function apply(value) {
      var keyword = normalize(value);

      inputs.forEach(function (input) {
        if (document.activeElement !== input) {
          input.value = value || "";
        }
      });

      containers.forEach(function (container) {
        var cards = selectAll(".searchable-card", container);
        var visible = 0;
        var oldMessage = container.querySelector(".empty-message");

        if (oldMessage) {
          oldMessage.remove();
        }

        cards.forEach(function (card) {
          var matched = !keyword || cardText(card).indexOf(keyword) !== -1;
          card.classList.toggle("hidden-by-filter", !matched);

          if (matched) {
            visible += 1;
          }
        });

        if (cards.length && visible === 0) {
          var message = document.createElement("div");
          message.className = "empty-message";
          message.textContent = container.getAttribute("data-empty") || "未找到匹配影片";
          container.appendChild(message);
        }
      });
    }

    inputs.forEach(function (input) {
      if (query && input.classList.contains("auto-focus")) {
        input.value = query;
      }

      input.addEventListener("input", function () {
        apply(input.value);
      });
    });

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        apply(chip.getAttribute("data-filter") || "");
      });
    });

    if (query) {
      apply(query);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupFiltering();
  });
})();
