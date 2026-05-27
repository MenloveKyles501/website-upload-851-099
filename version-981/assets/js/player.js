function initMoviePlayer(streamUrl) {
  var video = document.querySelector('.video-player');
  var cover = document.querySelector('.player-cover');
  var started = false;
  var hls = null;

  if (!video || !streamUrl) {
    return;
  }

  function attach() {
    if (started) {
      return;
    }
    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function play() {
    attach();
    if (cover) {
      cover.classList.add('hide');
    }
    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('hide');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
