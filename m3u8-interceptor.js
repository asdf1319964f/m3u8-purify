// m3u8-interceptor.js
window.M3U8_Interceptor = {
    hook(processM3U8) {
        const originalXhrOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url, ...rest) {
            if (typeof url === 'string' && url.includes('.m3u8')) {
                this.addEventListener('load', () => {
                    if (this.responseText) {
                        processM3U8(this.responseText, url);
                    }
                }, { once: true });
            }
            return originalXhrOpen.call(this, method, url, ...rest);
        };

        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const url = args[0] instanceof Request ? args[0].url : args[0];
            if (typeof url === 'string' && url.includes('.m3u8')) {
                const response = await originalFetch(...args);
                const text = await response.clone().text();
                processM3U8(text, url);
                return response;
            }
            return originalFetch(...args);
        };

        console.log('[M3U8_Interceptor] 拦截器已启用');
    }
};