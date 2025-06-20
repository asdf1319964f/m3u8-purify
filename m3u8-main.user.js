// ==UserScript==
// @name         M3U8 通用净化平台（模块版）
// @namespace    https://tampermonkey.net/
// @version      12.3.0
// @description  广告过滤 + 多站支持 + 倍速 + 悬浮播放 + 设置面板 + 模块化维护
// @match        *://*/*
// @require      https://cdn.jsdelivr.net/npm/hls.js@latest
// @require      file://<本地路径>/m3u8-settings.js
// @require      file://<本地路径>/m3u8-ui.js
// @require      file://<本地路径>/m3u8-interceptor.js
// @require      file://<本地路径>/m3u8-player.js
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// ==/UserScript==

(async function () {
    'use strict';

    const Settings = window.M3U8_Settings;
    const UI = window.M3U8_UI;
    const Interceptor = window.M3U8_Interceptor;
    const Player = window.M3U8_Player;

    await Settings.load();

    const isMatched = Settings.sites.some(rule => {
        const pattern = rule.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(location.href);
    });

    if (!isMatched) {
        console.log('[M3U8 Platform] 当前站点未启用');
        return;
    }

    let lastCleaned = null;

    function processM3U8(text, m3u8Url) {
        let lines = text.split('\n');
        const modified = [];

        if (Settings.isSmartSlicingEnabled) {
            const dIndex = lines.findIndex(l => l.includes('#EXT-X-DISCONTINUITY'));
            const hIndex = lines.findIndex(l => l.includes('#EXTINF'));
            if (dIndex > 0 && hIndex > -1) {
                lines = [...lines.slice(0, hIndex), ...lines.slice(dIndex)];
                modified.push('智能片头切除');
            }
        }

        lines = lines.filter(line => {
            if (Settings.keywords.some(keyword => line.includes(keyword))) {
                modified.push(`过滤：${line}`);
                return false;
            }
            return true;
        });

        // 处理相对路径
        const url = new URL(m3u8Url);
        const origin = url.origin;
        const base = m3u8Url.slice(0, m3u8Url.lastIndexOf('/') + 1);

        lines = lines.map(line => {
            const t = line.trim();
            if (t.endsWith('.ts') && !t.startsWith('http')) {
                return t.startsWith('/') ? origin + t : base + t + url.search;
            }
            if (t.startsWith('#EXT-X-KEY')) {
                const match = t.match(/URI="([^"]+)"/);
                if (match && !match[1].startsWith('http')) {
                    const abs = match[1].startsWith('/') ? origin + match[1] : base + match[1];
                    return t.replace(match[1], abs);
                }
            }
            return line;
        });

        console.log('[M3U8 Platform] 处理完成:', modified);
        return lines.join('\n');
    }

    UI.inject(() => {
        if (lastCleaned) {
            Player.inject(lastCleaned);
        } else {
            alert('尚未检测到 M3U8 请求，请先播放视频。');
        }
    });

    Interceptor.hook((text, url) => {
        lastCleaned = processM3U8(text, url);
        const fallbackBtn = document.getElementById('m3u8-fallback-btn');
        if (fallbackBtn) fallbackBtn.classList.add('ready');
        console.log('[M3U8 Platform] M3U8 已拦截并净化，备用播放器已就绪。');
    });
})();