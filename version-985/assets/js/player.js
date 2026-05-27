(function () {
  function initMoviePlayer(sourceUrl) {
    var video = document.getElementById("movie-player");
    var button = document.getElementById("play-button");
    var hls = null;
    var ready = false;

    if (!video || !button || !sourceUrl) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = sourceUrl;
    }

    function play() {
      prepare();
      button.classList.add("is-hidden");
      var request = video.play();

      if (request && typeof request.catch === "function") {
        request.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });
    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
