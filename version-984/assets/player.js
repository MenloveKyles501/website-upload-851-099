var Hls = window.Hls;

function attachPlayer(shell) {
  var video = shell.querySelector(".js-video");
  var button = shell.querySelector(".js-play-button");
  var source = shell.getAttribute("data-video-url");
  var initialized = false;
  var hls = null;
  var readyCallbacks = [];

  if (!video || !source) {
    return;
  }

  function runReadyCallbacks() {
    var callbacks = readyCallbacks.splice(0, readyCallbacks.length);
    callbacks.forEach(function (callback) {
      callback();
    });
  }

  function waitForVideoReady(callback) {
    readyCallbacks.push(callback);
    if (video.readyState > 0) {
      window.setTimeout(runReadyCallbacks, 0);
    }
  }

  function loadVideo(callback) {
    if (callback) {
      waitForVideoReady(callback);
    }

    if (initialized) {
      return;
    }

    initialized = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.addEventListener("loadedmetadata", runReadyCallbacks, { once: true });
      video.src = source;
      video.load();
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      if (Hls.Events && Hls.Events.MANIFEST_PARSED) {
        hls.on(Hls.Events.MANIFEST_PARSED, runReadyCallbacks);
      } else {
        video.addEventListener("loadedmetadata", runReadyCallbacks, { once: true });
      }
      return;
    }

    video.addEventListener("loadedmetadata", runReadyCallbacks, { once: true });
    video.src = source;
    video.load();
  }

  function playWhenReady() {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        shell.classList.remove("is-playing");
      });
    }
  }

  function startPlayback() {
    shell.classList.add("is-playing");
    loadVideo(playWhenReady);
  }

  if (button) {
    button.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener("play", function () {
    shell.classList.add("is-playing");
  });

  video.addEventListener("ended", function () {
    shell.classList.remove("is-playing");
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

document.querySelectorAll("[data-player]").forEach(attachPlayer);
