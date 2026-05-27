(function () {
  function setStatus(player, message, isError) {
    var status = player.querySelector('[data-player-status]');
    if (!status) {
      return;
    }
    status.textContent = message;
    status.classList.toggle('is-error', Boolean(isError));
  }

  function initializePlayer(player) {
    if (player.dataset.ready === 'true') {
      return Promise.resolve();
    }

    var video = player.querySelector('video');
    var source = player.getAttribute('data-video-src');

    if (!video || !source) {
      setStatus(player, '播放源缺失', true);
      return Promise.reject(new Error('Missing video source'));
    }

    player.dataset.ready = 'true';
    setStatus(player, '正在加载播放源');

    return new Promise(function (resolve, reject) {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus(player, '播放源已就绪');
          resolve();
        });

        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus(player, '视频加载失败，请刷新后重试', true);
            reject(new Error(data.details || 'HLS error'));
          }
        });

        player._hls = hls;
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus(player, '播放源已就绪');
          resolve();
        }, { once: true });
        video.addEventListener('error', function () {
          setStatus(player, '视频加载失败，请刷新后重试', true);
          reject(new Error('Native HLS error'));
        }, { once: true });
        return;
      }

      setStatus(player, '当前浏览器不支持 HLS 播放', true);
      reject(new Error('HLS not supported'));
    });
  }

  function play(player) {
    var video = player.querySelector('video');

    initializePlayer(player).then(function () {
      return video.play();
    }).then(function () {
      player.classList.add('is-playing');
      setStatus(player, '正在播放');
    }).catch(function () {
      setStatus(player, '请再次点击播放或检查浏览器权限', true);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.video-player').forEach(function (player) {
      var button = player.querySelector('[data-player-start]');
      var video = player.querySelector('video');

      if (button) {
        button.addEventListener('click', function () {
          play(player);
        });
      }

      if (video) {
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
          setStatus(player, '正在播放');
        });

        video.addEventListener('pause', function () {
          player.classList.remove('is-playing');
          setStatus(player, '已暂停');
        });

        video.addEventListener('waiting', function () {
          setStatus(player, '缓冲中');
        });
      }
    });
  });
})();
