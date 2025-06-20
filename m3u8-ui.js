// m3u8-ui.js
window.M3U8_UI = {
    inject(onFallbackClick) {
        if (document.getElementById('m3u8-settings-btn')) return;

        const style = document.createElement('style');
        style.textContent = `
            .m3u8-platform-btn {
                position: fixed;
                bottom: 20px;
                width: 50px; height: 50px;
                border-radius: 50%;
                background: #007bff;
                color: #fff;
                font-size: 24px;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 99999;
                cursor: pointer;
                transition: transform 0.2s ease;
            }
            .m3u8-platform-btn:hover { transform: scale(1.1); }
            #m3u8-fallback-btn { right: 80px; background: #28a745; display: none; }
            #m3u8-fallback-btn.ready { display: flex; }
            #m3u8-settings-btn { right: 20px; }
            #m3u8-settings-panel, #m3u8-settings-backdrop {
                position: fixed; z-index: 100000;
            }
            #m3u8-settings-backdrop {
                inset: 0;
                background-color: rgba(0,0,0,0.6);
                display: none;
            }
            #m3u8-settings-panel {
                top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                width: 90%; max-width: 600px;
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 6px 30px rgba(0,0,0,0.25);
                display: none;
                font-family: sans-serif;
            }
            #m3u8-settings-panel textarea {
                width: 100%;
                height: 100px;
                font-family: monospace;
                margin-bottom: 10px;
            }
        `;
        document.head.appendChild(style);

        const settingsBtn = document.createElement('div');
        settingsBtn.id = 'm3u8-settings-btn';
        settingsBtn.className = 'm3u8-platform-btn';
        settingsBtn.textContent = '⚙️';

        const fallbackBtn = document.createElement('div');
        fallbackBtn.id = 'm3u8-fallback-btn';
        fallbackBtn.className = 'm3u8-platform-btn';
        fallbackBtn.textContent = '▶️';

        const backdrop = document.createElement('div');
        backdrop.id = 'm3u8-settings-backdrop';

        const panel = document.createElement('div');
        panel.id = 'm3u8-settings-panel';
        panel.innerHTML = `
            <h2>M3U8 设置</h2>
            <label>站点匹配规则（每行一个）</label>
            <textarea id="m3u8-sites-input"></textarea>
            <label>过滤关键词（每行一个）</label>
            <textarea id="m3u8-keywords-input"></textarea>
            <label><input type="checkbox" id="m3u8-smart-toggle"> 启用智能切片</label><br><br>
            <label>默认播放速度</label>
            <input type="number" step="0.1" min="0.1" max="10" id="m3u8-rate-input" value="1"><br><br>
            <button id="m3u8-save-btn">保存并刷新</button>
            <button id="m3u8-close-btn">关闭</button>
        `;

        document.body.append(backdrop, panel, settingsBtn, fallbackBtn);

        // 打开面板
        settingsBtn.onclick = async () => {
            const s = window.M3U8_Settings;
            document.getElementById('m3u8-sites-input').value = s.sites.join('\n');
            document.getElementById('m3u8-keywords-input').value = s.keywords.join('\n');
            document.getElementById('m3u8-smart-toggle').checked = s.isSmartSlicingEnabled;
            document.getElementById('m3u8-rate-input').value = s.playbackRate;
            backdrop.style.display = 'block';
            panel.style.display = 'block';
        };

        // 保存设置
        document.getElementById('m3u8-save-btn').onclick = async () => {
            const sites = document.getElementById('m3u8-sites-input').value.split('\n').map(v => v.trim()).filter(Boolean);
            const keywords = document.getElementById('m3u8-keywords-input').value.split('\n').map(v => v.trim()).filter(Boolean);
            const smart = document.getElementById('m3u8-smart-toggle').checked;
            const rate = parseFloat(document.getElementById('m3u8-rate-input').value);
            await window.M3U8_Settings.save({ sites, keywords, isSmartSlicingEnabled: smart, playbackRate: rate });
            alert('设置已保存，页面将刷新！');
            location.reload();
        };

        // 关闭设置
        document.getElementById('m3u8-close-btn').onclick = () => {
            backdrop.style.display = 'none';
            panel.style.display = 'none';
        };
        backdrop.onclick = () => {
            backdrop.style.display = 'none';
            panel.style.display = 'none';
        };

        // 备用播放按钮
        fallbackBtn.onclick = onFallbackClick;
    }
};