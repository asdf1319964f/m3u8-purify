// m3u8-settings.js
window.M3U8_Settings = {
    sites: [],
    keywords: [],
    isSmartSlicingEnabled: false,
    playbackRate: 1.0,

    async load() {
        this.sites = await GM_getValue('m3u8_sites', ['*://*.xhsee20.vip/*']);
        this.keywords = await GM_getValue('m3u8_keywords', ['#EXT-X-DISCONTINUITY']);
        this.isSmartSlicingEnabled = await GM_getValue('m3u8_smart_slice', false);
        this.playbackRate = await GM_getValue('m3u8_playback_rate', 1.0);
        console.log('[M3U8_Settings] 配置加载完成：', this);
    },

    async save(newSettings) {
        Object.assign(this, newSettings);
        await GM_setValue('m3u8_sites', this.sites);
        await GM_setValue('m3u8_keywords', this.keywords);
        await GM_setValue('m3u8_smart_slice', this.isSmartSlicingEnabled);
        await GM_setValue('m3u8_playback_rate', this.playbackRate);
        console.log('[M3U8_Settings] 配置已保存：', this);
    }
};