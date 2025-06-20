// m3u8-player.js
window.M3U8_Player = {
    inject(m3u8Content) {
        if (document.getElementById('purified-player-container')) {
            return; // 已注入，避免重复
        }

        const oldPlayer = document.querySelector('#player, video, .dplayer, .prism-player');
        if (oldPlayer) oldPlayer.style.display = 'none';

        const container = document.createElement('div');
        container.id = 'purified-player-container';
        container.style.cssText = 'margin: 20px auto; max-width: 100%;';

        const video = document.createElement('video');
        video.id = 'purified-player';
        video.controls = true;
        video.autoplay = true;
        video.style.cssText = 'width: 100%; background: black; aspect-ratio: 16/9;';
        container.appendChild(video);
        document.body.prepend(container);

        const Settings = window.M3U8_Settings;
        video.playbackRate = Settings.playbackRate || 1.0;

        const blob = new Blob([m3u8Content], { type: 'application/vnd.apple.mpegurl' });
        const blobUrl = URL.createObjectURL(blob);
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(blobUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play();
                console.log('[M3U8_Player] 播放器加载完毕并开始播放');
            });
        } else {
            video.src = blobUrl;
            video.play();
        }

        // 自动倍速控制
        video.addEventListener('ratechange', () => {
            Settings.playbackRate = video.playbackRate;
            GM_setValue('m3u8_playback_rate', video.playbackRate);
        });

        // 快捷键控制
        window.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.code === 'KeyF') video.requestFullscreen();
            if (e.code === 'KeyP') togglePIP(video);
            if (e.code === 'ArrowRight') video.currentTime += 10;
            if (e.code === 'ArrowLeft') video.currentTime -= 10;
        });

        // 画中画控制
        function togglePIP(video) {
            if (document.pictureInPictureElement) {
                document.exitPictureInPicture();
            } else {
                video.requestPictureInPicture().catch(err => {
                    console.warn('PiP 开启失败', err);
                });
            }
        }

        console.log('[M3U8_Player] 播放器已注入');
    }
};