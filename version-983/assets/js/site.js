(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
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

        show(0);
        restart();
    }

    function setupFiltering() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
            var section = panel.parentElement;
            var grid = section ? section.querySelector("[data-card-grid]") : null;
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
            var empty = document.createElement("div");
            empty.className = "empty-state hidden";
            empty.textContent = "没有找到匹配的影片";
            grid.appendChild(empty);
            var activeValue = "all";

            function textFor(card) {
                return [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var content = textFor(card);
                    var matchesQuery = !query || content.indexOf(query) !== -1;
                    var matchesChip = activeValue === "all" || content.indexOf(activeValue.toLowerCase()) !== -1;
                    var show = matchesQuery && matchesChip;
                    card.classList.toggle("hidden", !show);
                    if (show) {
                        visible += 1;
                    }
                });
                empty.classList.toggle("hidden", visible !== 0);
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    activeValue = chip.getAttribute("data-filter-value") || "all";
                    chips.forEach(function (item) {
                        item.classList.toggle("active", item === chip);
                    });
                    apply();
                });
            });
        });
    }

    function attachStream(video, url) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            return;
        }
        video.src = url;
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            if (!video || !overlay) {
                return;
            }
            var url = video.getAttribute("data-video");
            var loaded = false;

            function start() {
                if (!loaded && url) {
                    attachStream(video, url);
                    loaded = true;
                }
                overlay.classList.add("is-hidden");
                video.setAttribute("controls", "controls");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            overlay.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (!loaded) {
                    start();
                }
            });
            document.querySelectorAll("[data-play-shortcut]").forEach(function (link) {
                link.addEventListener("click", function (event) {
                    event.preventDefault();
                    player.scrollIntoView({ behavior: "smooth", block: "center" });
                    window.setTimeout(start, 260);
                });
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFiltering();
        setupPlayers();
    });
})();
