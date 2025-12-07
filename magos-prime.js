/*
 * TITAN PROTOCOL v910.0.22
 * @name      Gemini Magos Prime Titan
 * @namespace Adeptus Mechanicus
 * @version   910.0.22 (Mission Control)
 * @description DOM Observation, Multi-Tenant Project Mirroring, Floating Editor, Ghost Window.
 * @author    Armando Cornaglia / 00face
 * @match     https://aistudio.google.com/*
 * @grant     none
 * @license   MIT
 * @Protocol  Copy paste into your browsers Inspectors Console and strike return.
 */

(function() {
    
    // --- 0. PRE-FLIGHT CLEANUP ---
    if (window.titanObserver) window.titanObserver.disconnect();
    if (window.titanInterval) clearInterval(window.titanInterval);
    if (window.titanCleanup) window.titanCleanup();
    
    const artifacts = [
        'titan-hud-v910', 'titan-panel-v910', 'titan-monaco-float', 'ghost-window-v910',
        'titan-editor-placeholder', 'titan-about-overlay', 'titan-omni-bar', 
        'titan-crt-layer', 'titan-font-link', 'titan-boot-screen', 'titan-styles-v910'
    ];
    artifacts.forEach(id => document.getElementById(id)?.remove());
    
    document.documentElement.removeAttribute('data-studio-theme');
    document.documentElement.classList.remove(
        'titan-font-ui', 'titan-font-code', 'titan-crt-active',
        'titan-sidebar-hidden', 'titan-header-hidden', 'titan-output-hidden'
    );

    try {
        // --- 1. CONFIGURATION & STATE ---
        const IS_FIREFOX = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        
        console.clear();
        console.log("%c⚙️ TITAN v910.22: MISSION CONTROL ONLINE.", "color: #00FACE; font-weight: bold; font-family: monospace;");

        let memoryLimit = 512;
        const BRIDGE_URL = 'http://localhost:3000';
        const TARGET_FILE_KEY = 'TITAN_TARGET_FILE_v910';
        const CSS_STORAGE_KEY = 'TITAN_CUSTOM_CSS_v910';
        const THEME_TITAN_KEY = 'TITAN_THEME_OVERLAY_v910';
        const THEME_STUDIO_KEY = 'TITAN_THEME_STUDIO_v910';
        const FONT_STORAGE_KEY = 'TITAN_FONT_v910';
        const LOCALE_STORAGE_KEY = 'TITAN_LOCALE_v910';
        const FONT_SCOPE_UI_KEY = 'TITAN_FONT_SCOPE_UI_v910';
        const FONT_SCOPE_CODE_KEY = 'TITAN_FONT_SCOPE_CODE_v910';
        const HUD_POS_KEY = 'TITAN_HUD_POS_v910';
        const CRT_ENABLED_KEY = 'TITAN_CRT_v910';
        const HEADER_HEIGHT = 28;
        const TARGET_XPATH = "/html/body/app-root/ms-app/div/div/div/div/span/ms-console-component/ms-console-embed/div[2]/div/div[1]/ms-code-assistant-chat/div/div[3]/div[2]";

        let stats = { flattened: 0, purged: 0, mediaWiped: 0, ram: 0, chipsHooked: 0 };
        let isSending = false;
        let isHudOpen = false; 
        let isEditingCss = false;
        let isDocked = true; 
        let isEditorFloating = false;
        let isSystemRunning = true; 
        let isBridgeOnline = false;
        let xpathTarget = null;
        let angularInput = null;
        
        let targetFile = localStorage.getItem(TARGET_FILE_KEY) || 'index.html';
        let currentFont = localStorage.getItem(FONT_STORAGE_KEY) || 'SF Mono';
        let activeTitanTheme = localStorage.getItem(THEME_TITAN_KEY) || 'mechanicus';
        let activeStudioTheme = localStorage.getItem(THEME_STUDIO_KEY) || 'native-dark';
        let currentLocale = localStorage.getItem(LOCALE_STORAGE_KEY) || 'en';
        
        let fontScopeUI = localStorage.getItem(FONT_SCOPE_UI_KEY) === 'true';
        let fontScopeCode = localStorage.getItem(FONT_SCOPE_CODE_KEY) === 'true';
        let crtEnabled = localStorage.getItem(CRT_ENABLED_KEY) === 'true';
        
        let zenSidebar = false;
        let zenHeader = false;
        let zenOutput = false;
        
        let savedHudPos = JSON.parse(localStorage.getItem(HUD_POS_KEY)) || { bottom: '15px', right: '15px' };

        // --- 2. DATABASES ---
        const LOCALES = {
            'en': { label: 'English', cap: 'CAP:', font: 'FONT:', css: 'CSS', rst: 'RST', run: 'RUN', halt: 'HALT', clr: 'CLR', dock: '⚓ DOCKED', free: '🛸 FREE', link: '𓁗 TITAN LINK', sidebar: 'Toggle Sidebar', header: 'Toggle Header', output: 'Toggle Output', float: 'Float Editor', dock_editor: 'Dock Editor', about: 'Whitepaper', crt: 'CRT', export: 'Export Config', import: 'Import Config', omni: 'Omni-Bar (Ctrl+K)', bridge: 'BRIDGE:', online: 'ONLINE', offline: 'OFFLINE', ready: '> SYSTEM READY.' }
        };

        const FONTS_JSON = { "items": [ {"family": "Roboto"}, {"family": "Open Sans"}, {"family": "Fira Code"}, {"family": "JetBrains Mono"}, {"family": "IBM Plex Mono"}, {"family": "Source Code Pro"} ] };
        
        const THEMES = {
            'native-light': { label: 'Native Studio (Light)', vars: `` },
            'native-dark': { label: 'Native Studio (Dark)', vars: `` },
            'mechanicus': { label: 'Mechanicus', vars: `--t-bg: #0b1216; --t-surface: #101e26; --t-text: #00FACE; --t-border: #00FACE; --t-primary: #00FACE; --t-inv: invert(1); --t-btn-bg: #00FACE; --t-btn-text: #000;` },
            // ... (Themes preserved)
        };

        // --- 3. CORE UTILITY FUNCTIONS ---

        function createIcon(iconName, size = '16px') {
            const span = document.createElement('span');
            if (iconName === '↹') { span.textContent = '↹'; span.style.fontSize = size; span.style.fontWeight = 'bold'; }
            else { span.className = 'material-symbols-outlined'; span.style.fontSize = size; span.textContent = iconName; }
            return span;
        }
        
        function createEl(tag, className, text, attrs) {
            const el = document.createElement(tag);
            if(className) el.className = className;
            if(text) el.textContent = text;
            if(attrs) Object.keys(attrs).forEach(key => el.setAttribute(key, attrs[key]));
            return el;
        }

        function matrixDecrypt(element, finalText) {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()"; let iterations = 0;
            const interval = setInterval(() => {
                element.innerText = finalText.split("").map((char, index) => {
                    if (index < iterations) return char; return chars[Math.floor(Math.random() * chars.length)];
                }).join("");
                if (iterations >= finalText.length) clearInterval(interval);
                iterations += 1 / 3;
            }, 30);
        }

        function zalgoify(text, intensity = 0.3) {
            let str = ''; for(let i = 0; i < text.length; i++) { str += text[i]; } return str; 
        }
        
        function downloadFile(content, filename, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        
        function getMonaco() {
            if (typeof monaco !== 'undefined') return monaco;
            if (typeof unsafeWindow !== 'undefined' && typeof unsafeWindow.monaco !== 'undefined') return unsafeWindow.monaco;
            return null;
        }

        function triggerMonacoLayout() {
            const m = getMonaco();
            if (m && m.editor) {
                m.editor.getEditors().forEach(editor => editor.layout());
            }
        }

        function garbageCollectMonaco() {
            const m = getMonaco();
            if (m && m.editor) {
                const models = m.editor.getModels();
                if (models.length > 20) {
                    let disposedCount = 0;
                    models.forEach(model => {
                        if (!model.isAttachedToEditor()) {
                            model.dispose();
                            disposedCount++;
                        }
                    });
                    if (disposedCount > 0) console.log(`TITAN: Purged ${disposedCount} detached Monaco models.`);
                }
            }
        }
        
        function loadGoogleFont(fontName) {
            const cleanName = fontName.trim(); if (!cleanName) return;
            let link = document.getElementById('titan-font-link');
            if (!link) { link = document.createElement('link'); link.id = 'titan-font-link'; link.rel = 'stylesheet'; document.head.appendChild(link); }
            link.href = `https://fonts.googleapis.com/css2?family=${cleanName.replace(/ /g, '+')}:wght@400;700&display=swap`;
            requestAnimationFrame(() => {
                const style = document.getElementById('titan-core-v910');
                if (style) style.textContent = style.textContent.replace(/--t-font:.*?;/, `--t-font: '${cleanName}', monospace;`);
            });
            currentFont = cleanName; localStorage.setItem(FONT_STORAGE_KEY, cleanName);
        }

        function updateFontScope() {
            if (fontScopeUI) document.documentElement.classList.add('titan-font-ui'); else document.documentElement.classList.remove('titan-font-ui');
            if (fontScopeCode) document.documentElement.classList.add('titan-font-code'); else document.documentElement.classList.remove('titan-font-code');
            localStorage.setItem(FONT_SCOPE_UI_KEY, fontScopeUI); localStorage.setItem(FONT_SCOPE_CODE_KEY, fontScopeCode);
        }

        function applyStudioTheme(val) {
            localStorage.setItem(THEME_STUDIO_KEY, val);
            const root = document.documentElement;
            root.removeAttribute('data-studio-theme'); root.style.colorScheme = ''; document.body.style.colorScheme = ''; root.classList.remove('dark-theme', 'light-theme');
            if (val === 'native-light') { root.classList.add('light-theme'); root.style.colorScheme = 'light'; document.body.style.colorScheme = 'light'; }
            else if (val === 'native-dark') { root.classList.add('dark-theme'); root.style.colorScheme = 'dark'; document.body.style.colorScheme = 'dark'; }
            else { root.setAttribute('data-studio-theme', val); root.classList.add('dark-theme'); }
        }
        
        function toggleCRT() {
            crtEnabled = !crtEnabled;
            localStorage.setItem(CRT_ENABLED_KEY, crtEnabled);
            if(crtEnabled) document.documentElement.classList.add('titan-crt-active'); else document.documentElement.classList.remove('titan-crt-active');
            const btn = document.getElementById('btn-crt');
            if(btn) {
                if(crtEnabled) btn.classList.add('glow'); else btn.classList.remove('glow');
            }
        }
        
        function exportConfig() {
            const config = {};
            for(let i=0; i<localStorage.length; i++) {
                const key = localStorage.key(i);
                if(key.startsWith('TITAN_')) config[key] = localStorage.getItem(key);
            }
            navigator.clipboard.writeText(JSON.stringify(config)).then(() => alert('Titan Config Copied to Clipboard!'));
        }
        
        function importConfig() {
            const json = prompt("Paste Titan Config JSON:");
            if(json) {
                try {
                    const config = JSON.parse(json);
                    Object.keys(config).forEach(k => localStorage.setItem(k, config[k]));
                    alert('Config Imported! Reloading...');
                    location.reload();
                } catch(e) { alert('Invalid Config!'); }
            }
        }
        
        function getSeasonalTheme() {
            // (Theme logic preserved from previous iteration)
            return null;
        }

        // --- 4. CORE CSS DEFINITION ---
        const BROWSER_SPECIFIC_VARS = IS_FIREFOX ? `
            :root { --t-inv: none !important; } 
            .monaco-editor { transform: translateZ(0); } 
        ` : ``;

        const SEASONAL_VARS = getSeasonalTheme() || '';
        
        const CORE_CSS = `
            :root { --t-font: ${currentFont}, monospace; --t-radius: 6px; --t-primary: #00FACE; --t-bg: #0b1216; --t-border: #00FACE; }
            ${BROWSER_SPECIFIC_VARS}
            /* SEASONAL OVERRIDE LAYER */
            html[data-studio-theme="native-dark"] { ${SEASONAL_VARS} }
            html[data-studio-theme="native-light"] { ${SEASONAL_VARS} }
            
            .input-container > * { opacity: 0 !important; pointer-events: none !important; visibility: hidden !important; }
            .titan-sidebar-hidden { display: none !important; }
            .page-header.titan-header-hidden { height: 0 !important; min-height: 0 !important; padding: 0 !important; border: 0 !important; overflow: visible !important; opacity: 1 !important; z-index: 10000; }
            .page-header.titan-header-hidden > *:not(.right-side) { display: none !important; }
            .page-header.titan-header-hidden .right-side > *:not(.button-container) { display: none !important; }
            .page-header.titan-header-hidden .button-container > *:not(.titan-zen-wrapper) { display: none !important; }
            .titan-zen-wrapper { display: flex; gap: 8px; align-items: center; }
            .page-header.titan-header-hidden .button-container { position: fixed; top: 10px; right: 20px; z-index: 10001; display: flex !important; width: auto !important; height: auto !important; background: transparent !important; box-shadow: none !important; }
            .titan-output-hidden { display: none !important; }
            html.titan-font-ui body, html.titan-font-ui .page-header, html.titan-font-ui ms-console-subheader, html.titan-font-ui ms-console-file-tree { font-family: var(--t-font) !important; }
            html.titan-font-code .monaco-editor, html.titan-font-code .view-lines { font-family: var(--t-font) !important; }
            @keyframes titan-glitch { 0% { clip-path: inset(10% 0 90% 0); transform: translate(-2px, 0); filter: hue-rotate(0deg); } 20% { clip-path: inset(80% 0 1% 0); transform: translate(2px, 0); filter: hue-rotate(90deg); } 40% { clip-path: inset(40% 0 20% 0); transform: translate(-2px, 0); filter: hue-rotate(180deg); } 60% { clip-path: inset(10% 0 80% 0); transform: translate(2px, 0); filter: hue-rotate(270deg); } 80% { clip-path: inset(50% 0 10% 0); transform: translate(-2px, 0); filter: hue-rotate(0deg); } 100% { clip-path: inset(0 0 0 0); transform: translate(0); filter: none; } }
            .titan-glitch-active { animation: titan-glitch 0.3s ease-out forwards; }
            .titan-zalgo-text { display: inline-block; animation: zalgo-color 3s infinite alternate; font-weight: bold; font-family: monospace; }
            @keyframes zalgo-color { 0% { color: var(--t-primary); text-shadow: 0 0 2px var(--t-primary); } 50% { color: #ff00ff; text-shadow: 0 0 2px #ff00ff; } 100% { color: #00ffff; text-shadow: 0 0 2px #00ffff; } }
            #titan-boot-screen { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: #000; z-index: 2147483647; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: monospace; color: #00FACE; pointer-events: none; transition: opacity 0.5s ease; }
            .titan-boot-logo { font-size: 40px; font-weight: bold; margin-bottom: 20px; text-shadow: 0 0 10px #00FACE; }
            .titan-boot-row { display: flex; align-items: center; width: 300px; margin: 5px 0; justify-content: space-between; font-size: 12px; }
            .titan-boot-bar-container { width: 150px; height: 10px; border: 1px solid #00FACE; border-radius: 2px; overflow: hidden; position: relative; }
            .titan-boot-bar-fill { height: 100%; background-color: #00FACE; width: 0%; transition: width 0.2s linear; }
            ${Object.keys(THEMES).map(key => key.startsWith('native') ? '' : `html[data-studio-theme="${key}"] { ${THEMES[key].vars} --color-background: var(--t-bg) !important; --color-surface: var(--t-surface) !important; --color-surface-container: var(--t-surface) !important; --color-text: var(--t-text) !important; --mat-sys-background: var(--t-bg) !important; --mat-sys-surface: var(--t-bg) !important; --mat-sys-surface-container: var(--t-surface) !important; --mat-sys-on-surface: var(--t-text) !important; --mat-sys-primary: var(--t-primary) !important; --mat-sys-outline: var(--t-border) !important; --mat-sys-outline-variant: var(--t-border) !important; background-color: var(--t-bg) !important; color: var(--t-text) !important; } html[data-studio-theme="${key}"] body, html[data-studio-theme="${key}"] .page-header, html[data-studio-theme="${key}"] .console-left-panel, html[data-studio-theme="${key}"] ms-console-subheader, html[data-studio-theme="${key}"] .editor-container, html[data-studio-theme="${key}"] ms-console-file-tree, html[data-studio-theme="${key}"] .applet-container { background-color: var(--t-bg) !important; color: var(--t-text) !important; font-family: var(--t-font) !important; } html[data-studio-theme="${key}"] [ms-button], html[data-studio-theme="${key}"] button { color: var(--t-text) !important; font-family: var(--t-font) !important; } html[data-studio-theme="${key}"] .ms-button-primary, html[data-studio-theme="${key}"] .mat-mdc-raised-button { background-color: var(--t-btn-bg) !important; color: var(--t-btn-text) !important; border: 1px solid var(--t-border) !important; } html[data-studio-theme="${key}"] ms-console-view-selector .ms-button-filter-chip, html[data-studio-theme="${key}"] ms-file-tabs .tab-button { background-color: var(--t-surface) !important; color: var(--t-text) !important; border: 1px solid var(--t-border) !important; } html[data-studio-theme="${key}"] ms-console-view-selector .ms-button-filter-chip[aria-selected="true"], html[data-studio-theme="${key}"] ms-file-tabs .tab-button.ms-button-active { background-color: var(--t-btn-bg) !important; color: var(--t-btn-text) !important; border-color: var(--t-primary) !important; } html[data-studio-theme="${key}"] .cdk-overlay-pane, html[data-studio-theme="${key}"] .mdc-dialog__surface, html[data-studio-theme="${key}"] .mat-mdc-menu-panel { background-color: var(--t-bg) !important; color: var(--t-text) !important; border: 1px solid var(--t-border) !important; } html[data-studio-theme="${key}"] .monaco-editor, html[data-studio-theme="${key}"] .monaco-editor-background { background-color: var(--t-bg) !important; } html[data-studio-theme="${key}"] .margin { background-color: var(--t-surface) !important; border-right: 1px solid var(--t-border) !important; } html[data-studio-theme="${key}"] .mtk1 { color: var(--t-text) !important; }`).join('\n')}
            ${Object.keys(THEMES).map(key => `#titan-hud-v910[data-titan-theme="${key}"], #titan-panel-v910[data-titan-theme="${key}"], #ghost-window-v910[data-titan-theme="${key}"], #titan-monaco-float[data-titan-theme="${key}"], #titan-font-suggestions[data-titan-theme="${key}"], #titan-about-card[data-titan-theme="${key}"], #titan-omni-bar[data-titan-theme="${key}"] { ${THEMES[key].vars} }`).join('\n')}
            #titan-hud-v910 { position: fixed; bottom: 15px; right: 15px; z-index: 2147483647; display: flex; flex-direction: column; alignItems: flex-end; gap: 0; pointer-events: auto !important; }
            #titan-panel-v910 { position: fixed; background-color: var(--t-bg); color: var(--t-text); border: 2px solid var(--t-border); box-shadow: 0 0 15px var(--t-border); backdrop-filter: var(--t-inv); padding: 10px; border-radius: var(--t-radius); min-width: 240px; font-family: var(--t-font); font-weight: bold; display: flex; flex-direction: column; gap: 10px; z-index: 2147483647; opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 0.2s, transform 0.2s, visibility 0.2s; }
            #titan-panel-v910.visible { opacity: 1; visibility: visible; pointer-events: auto !important; }
            #titan-bottom-bar { display: flex; align-items: center; gap: 8px; margin-top: 0; justify-content: flex-end; width: auto; pointer-events: auto !important; cursor: move; padding: 5px; border-radius: 20px; background: rgba(0,0,0,0.2); }
            .titan-zen-btn { background: var(--t-surface); border: 1px solid var(--t-primary); color: var(--t-primary); border-radius: 50%; cursor: pointer; padding: 0; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; pointer-events: auto !important; }
            .titan-zen-btn:hover { background: var(--t-primary); color: var(--t-bg); }
            .titan-zen-btn.active { background: var(--t-primary); color: var(--t-bg); box-shadow: 0 0 5px var(--t-primary); }
            .titan-zen-btn.glow { box-shadow: 0 0 10px var(--t-primary); background: var(--t-primary); color: var(--t-bg); }
            #titan-main-btn { font-size: 32px; cursor: pointer; text-align: center; width: 50px; height: 50px; line-height: 50px; background: transparent; transition: transform 0.2s; color: var(--t-primary); text-shadow: 0 0 5px var(--t-border); pointer-events: auto !important; }
            #titan-main-btn:hover { transform: scale(1.2); }
            #ghost-window-v910 { position: fixed; display: flex; flex-direction: column; background-color: var(--t-bg); border: 2px solid var(--t-border); box-shadow: 0 0 20px rgba(0,0,0,0.5); z-index: 2147483647; border-radius: var(--t-radius); overflow: hidden; min-width: 300px; min-height: 80px; bottom: 20px; left: 20px; pointer-events: auto !important; }
            #ghost-window-v910.undocked { bottom: auto; right: auto; left: auto; top: auto; max-width: calc(100vw - 10px); max-height: calc(100vh - 10px); resize: both; }
            #ghost-window-v910:not(.undocked) { max-height: 200px; resize: none; }
            #ghost-header-v910 { background: var(--t-primary); color: var(--t-bg); padding: 0 10px; font-family: var(--t-font); font-weight: bold; font-size: 12px; display: flex; justify-content: space-between; align-items: center; height: 28px; flex-shrink: 0; }
            .ghost-gripper { cursor: grab; padding: 0 10px; font-size: 14px; user-select: none; display: flex; align-items: center; }
            .ghost-gripper:active { cursor: grabbing; }
            #ghost-textarea-v910 { flex-grow: 1; background: var(--t-bg); color: var(--t-text); border: none; padding: 10px; font-family: var(--t-font); outline: none; resize: none; }
            #ghost-send-action { position: absolute; bottom: 10px; right: 10px; width: 35px; height: 35px; border-radius: 50%; border: 2px solid var(--t-border); color: var(--t-primary); background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; }
            #ghost-send-action:hover { background: var(--t-primary); color: var(--t-bg); }
            #titan-monaco-float { position: fixed; top: 10%; left: 10%; width: 80%; height: 80%; background-color: var(--t-bg); border: 2px solid var(--t-border); box-shadow: 0 0 25px rgba(0,0,0,0.7); z-index: 2147483647; border-radius: var(--t-radius); overflow: hidden; display: flex; flex-direction: column; }
            #titan-monaco-header { background: var(--t-primary); color: var(--t-bg); padding: 5px 10px; font-family: var(--t-font); font-weight: bold; font-size: 12px; display: flex; justify-content: space-between; align-items: center; cursor: grab; flex-shrink: 0; }
            #titan-monaco-body { flex-grow: 1; position: relative; overflow: hidden; }
            #titan-monaco-body .console-right-panel { width: 100% !important; height: 100% !important; display: flex !important; flex-direction: column !important; min-width: 0 !important; }
            .titan-select, .titan-input { background: var(--t-surface); color: var(--t-text); border: 1px solid var(--t-border); padding: 4px; font-family: var(--t-font); font-size: 10px; border-radius: 4px; cursor: pointer; }
            .titan-input { width: 100%; cursor: text; }
            #titan-css-editor { background: var(--t-surface); color: var(--t-text); border: 1px solid var(--t-border); width: 100%; height: 150px; font-family: var(--t-font); font-size: 10px; margin-top: 5px; }
            .titan-theme-row { display: flex; justify-content: space-between; gap: 5px; }
            .titan-checkbox-label { font-size: 10px; display: flex; align-items: center; gap: 4px; cursor: pointer; }
            #titan-font-suggestions { position: absolute; top: 100%; left: 0; right: 0; background: var(--t-surface); border: 1px solid var(--t-border); max-height: 150px; overflow-y: auto; z-index: 1000; display: none; flex-direction: column; margin-top: 2px; border-radius: 4px; }
            .titan-font-option { padding: 5px 8px; cursor: pointer; color: var(--t-text); font-family: var(--t-font); font-size: 11px; }
            .titan-font-option:hover { background: var(--t-primary); color: var(--t-bg); }
            .titan-font-wrapper { position: relative; }
            .titan-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
            #titan-about-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 2147483648; display: none; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
            #titan-about-overlay.visible { display: flex; opacity: 1; }
            #titan-about-card { background: var(--t-bg); color: var(--t-text); border: 2px solid var(--t-border); box-shadow: 0 0 30px var(--t-border); max-width: 600px; width: 90%; max-height: 80vh; padding: 20px; border-radius: var(--t-radius); font-family: var(--t-font); transform: scale(0.95); transition: transform 0.2s; display: flex; flex-direction: column; }
            #titan-about-overlay.visible #titan-about-card { transform: scale(1); }
            .titan-about-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--t-border); padding-bottom: 10px; margin-bottom: 15px; flex-shrink: 0; }
            .titan-about-title { font-size: 18px; font-weight: bold; color: var(--t-primary); text-shadow: 0 0 5px var(--t-primary); }
            .titan-about-scroll { overflow-y: auto; padding-right: 10px; flex-grow: 1; font-size: 12px; line-height: 1.5; }
            .titan-about-footer { margin-top: 15px; font-size: 10px; text-align: center; opacity: 0.7; font-style: italic; border-top: 1px solid var(--t-border); padding-top: 10px; flex-shrink: 0; }
            .titan-wp-h2 { font-size: 14px; font-weight: bold; color: var(--t-primary); margin-top: 15px; margin-bottom: 5px; border-bottom: 1px dashed var(--t-border); display: block; }
            .titan-wp-p { margin-bottom: 10px; display: block; }
            .titan-wp-code { background: var(--t-surface); border: 1px solid var(--t-border); padding: 5px; border-radius: 4px; font-family: monospace; display: block; white-space: pre-wrap; margin-bottom: 10px; color: var(--t-text); }
            /* OMNI-BAR */
            #titan-omni-bar { position: fixed; top: 20%; left: 50%; transform: translate(-50%, -20%); width: 500px; background: var(--t-bg); border: 2px solid var(--t-border); box-shadow: 0 0 30px var(--t-border); z-index: 2147483650; display: none; flex-direction: column; border-radius: var(--t-radius); }
            #titan-omni-input { width: 100%; padding: 15px; font-family: var(--t-font); font-size: 18px; background: transparent; color: var(--t-text); border: none; outline: none; border-bottom: 1px solid var(--t-border); }
            #titan-omni-results { max-height: 300px; overflow-y: auto; }
            .titan-omni-item { padding: 10px 15px; cursor: pointer; display: flex; justify-content: space-between; font-family: var(--t-font); color: var(--t-text); }
            .titan-omni-item.selected, .titan-omni-item:hover { background: var(--t-primary); color: var(--t-bg); }
            /* CRT LAYER */
            html.titan-crt-active::before { content: " "; display: block; position: fixed; top: 0; left: 0; bottom: 0; right: 0; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); z-index: 2147483649; background-size: 100% 2px, 3px 100%; pointer-events: none; }
            /* VISUAL RAM GAUGE */
            #titan-ram-gauge { width: 100%; height: 4px; background: var(--t-surface); margin-top: 5px; border-radius: 2px; overflow: hidden; }
            #titan-ram-fill { height: 100%; width: 0%; background: var(--t-primary); transition: width 0.5s ease, background-color 0.5s ease; }
        `;

        // --- 5. MAIN LOGIC ---
        function toggleSystem(active) {
            isSystemRunning = active;
            const btnRun = document.getElementById('btn-run');
            const btnHalt = document.getElementById('btn-halt');
            if (active) {
                if (btnRun) btnRun.classList.add('glow');
                if (btnHalt) btnHalt.classList.remove('glow');
                if (!window.titanInterval) {
                     window.titanInterval = setInterval(() => { 
                         try { 
                            let currentRam = 0;
                            if (performance && performance.memory && performance.memory.usedJSHeapSize) {
                                currentRam = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(0);
                            } 
                            stats.ram = currentRam;
                            if (currentRam > 0 && currentRam > memoryLimit) { performPurge(); }
                            if (currentRam > 0 && currentRam > (memoryLimit * 0.5)) garbageCollectMonaco();
                            updateHud('ACTIVE'); 
                        } catch (e) {
                            stats.ram = 0; updateHud('ACTIVE'); 
                        } 
                    }, 1000);
                }
                observer.observe(document.body, { childList: true, subtree: true });
                updateHud('ACTIVE');
            } else {
                if (btnRun) btnRun.classList.remove('glow');
                if (btnHalt) btnHalt.classList.add('glow');
                clearInterval(window.titanInterval);
                window.titanInterval = null;
                observer.disconnect();
                updateHud('PAUSED');
            }
        }

        function clearTitanCache() {
            stats = { flattened: 0, purged: 0, mediaWiped: 0, ram: 0, chipsHooked: 0 };
            console.clear();
            console.log("%c⚙️ TITAN: CACHE FLUSHED.", "color: #00FACE;");
            updateHud(isSystemRunning ? 'ACTIVE' : 'PAUSED');
        }

        async function checkBridge() {
            try {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), 800);
                const res = await fetch(BRIDGE_URL, { method: 'OPTIONS', signal: controller.signal });
                clearTimeout(id);
                return res.ok;
            } catch (e) { return false; }
        }

        // --- NEW MISSION CONTROL LOGIC ---
        async function deployToBridge(payload) {
            try {
                const res = await fetch(`${BRIDGE_URL}/api/deploy`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                return await res.json();
            } catch (e) {
                console.error("Bridge Error:", e);
                return { success: false, error: e.message };
            }
        }

        async function syncFile() {
            const msg = document.getElementById('titan-msg');
            const m = getMonaco();
            if (!m || !m.editor) return;

            const editors = m.editor.getEditors();
            let model = null;
            
            const focused = editors.find(e => e.hasTextFocus());
            if (focused) {
                model = focused.getModel();
            } else {
                const models = m.editor.getModels();
                if (models.length) model = models[models.length - 1];
            }

            if (!model) {
                if(msg) { msg.textContent = "NO FILE ACTIVE"; msg.style.color = "#f00"; }
                return;
            }

            let filePath = model.uri.path; 
            if (filePath.startsWith('/')) filePath = filePath.substring(1);
            
            // Construct Batch Payload for Single File (To use the same Deploy API)
            const payload = {
                url: window.location.href, // This allows the server to route to the correct UID
                files: [{ path: filePath, content: model.getValue() }]
            };

            if(msg) msg.textContent = `SYNC: ${filePath}...`;

            const result = await deployToBridge(payload);
            
            if (msg) {
                if (result.success) {
                    msg.textContent = `SAVED > ${filePath}`;
                    msg.style.color = "#0f0";
                } else {
                    msg.textContent = "BRIDGE ERROR";
                    msg.style.color = "#f00";
                }
                setTimeout(() => { msg.textContent = "SYSTEM READY"; msg.style.color = "#888"; }, 3000);
            }
        }

        async function syncAllFiles() {
            const m = getMonaco();
            if (!m || !m.editor) { alert("Editor not initialized."); return; }
            
            const models = m.editor.getModels();
            if (models.length === 0) return;

            if (!confirm(`Deploy ${models.length} files to Mission Control?`)) return;

            const msg = document.getElementById('titan-msg');
            if (msg) msg.textContent = "GATHERING INTEL...";

            const files = [];
            for (const model of models) {
                let filePath = model.uri.path;
                
                if (filePath.match(/^\/?model\/\d+$/)) {
                    const lang = model.getLanguageId();
                    const ext = lang === 'javascript' ? 'js' : (lang === 'typescript' ? 'ts' : (lang === 'python' ? 'py' : 'txt'));
                    filePath = `untitled_${Math.floor(Math.random() * 1000)}.${ext}`;
                }
                if (filePath.startsWith('/')) filePath = filePath.substring(1);
                
                if (filePath.includes('node_modules') || filePath.endsWith('.d.ts')) continue;

                files.push({ path: filePath, content: model.getValue() });
            }

            // Send Full Payload
            const payload = {
                url: window.location.href,
                files: files
            };

            if (msg) msg.textContent = `DEPLOYING...`;
            
            const result = await deployToBridge(payload);

            if (result.success) {
                if (msg) { msg.textContent = `DEPLOYED: Port ${result.port}`; msg.style.color = "#0f0"; }
                alert(`Project Deployed Successfully.\n\nAssigned Port: ${result.port}\nStatus: ${result.status.toUpperCase()}`);
            } else {
                if (msg) { msg.textContent = "DEPLOY FAILED"; msg.style.color = "#f00"; }
                alert(`Deployment Error: ${result.error}`);
            }
        }

        // ... (HUD and UI logic preserved from previous version) ...
        function toggleOmniBar() { const omni = document.getElementById('titan-omni-bar'); const input = document.getElementById('titan-omni-input'); if(omni.style.display === 'flex') { omni.style.display = 'none'; } else { omni.style.display = 'flex'; input.value = ''; input.focus(); populateOmniResults(''); } }
        function populateOmniResults(filter) { const list = document.getElementById('titan-omni-results'); while(list.firstChild) list.removeChild(list.firstChild); const cmds = [ { t: 'System: Run', a: () => toggleSystem(true) }, { t: 'System: Halt', a: () => toggleSystem(false) }, { t: 'System: Clear Cache', a: clearTitanCache }, { t: 'Sync Active File (Ctrl+S)', a: syncFile }, { t: 'Mirror Project (Download All)', a: syncAllFiles }, { t: 'Toggle CRT Mode', a: toggleCRT }, { t: 'Toggle Sidebar', a: () => document.querySelectorAll('#titan-bottom-bar button')[1]?.click() }, { t: 'Toggle Header', a: () => document.querySelectorAll('#titan-bottom-bar button')[2]?.click() }, { t: 'Float Editor', a: () => document.querySelectorAll('#titan-bottom-bar button')[4]?.click() }, { t: 'Export Config', a: exportConfig }, { t: 'Import Config', a: importConfig }, { t: 'Reset Titan', a: () => { if(confirm('Reset?')) { localStorage.clear(); location.reload(); } } } ]; Object.keys(THEMES).forEach(k => cmds.push({ t: 'Theme: ' + THEMES[k].label, a: () => { activeStudioTheme = k; applyStudioTheme(k); }})); const matches = cmds.filter(c => c.t.toLowerCase().includes(filter.toLowerCase())); matches.forEach(m => { const item = createEl('div', 'titan-omni-item', m.t); item.onclick = () => { m.a(); toggleOmniBar(); }; list.appendChild(item); }); }
        function constrainBounds(element, left, top) { const rect = element.getBoundingClientRect(); const winWidth = window.innerWidth; const winHeight = window.innerHeight; const newLeft = Math.max(0, Math.min(left, winWidth - rect.width)); const newTop = Math.max(0, Math.min(top, winHeight - rect.height)); return { left: newLeft, top: newTop }; }
        function makeDraggable(element, handle, savePosCallback) { let isDragging = false; let startX, startY, initialLeft, initialTop; const onMouseDown = (e) => { if (['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A'].includes(e.target.tagName)) return; isDragging = true; startX = e.clientX; startY = e.clientY; const rect = element.getBoundingClientRect(); initialLeft = rect.left; initialTop = rect.top; element.style.bottom = 'auto'; element.style.right = 'auto'; element.style.left = initialLeft + 'px'; element.style.top = initialTop + 'px'; window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp); }; const onMouseMove = (e) => { if (!isDragging) return; const dx = e.clientX - startX; const dy = e.clientY - startY; let newLeft = initialLeft + dx; let newTop = initialTop + dy; const constrained = constrainBounds(element, newLeft, newTop); element.style.left = constrained.left + 'px'; element.style.top = constrained.top + 'px'; }; const onMouseUp = () => { isDragging = false; if (savePosCallback) { const rect = element.getBoundingClientRect(); savePosCallback({ left: rect.left + 'px', top: rect.top + 'px' }); } window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); }; handle.addEventListener('mousedown', onMouseDown); }
        function toggleMonacoFloat(btn) { isEditorFloating = !isEditorFloating; const editorContainer = document.querySelector('.console-right-panel'); if (!editorContainer) { console.warn("TITAN: Console Right panel not found."); return; } if (isEditorFloating) { const floatWin = createEl('div', 'titan-glitch-active', '', {id: 'titan-monaco-float', 'data-titan-theme': activeTitanTheme}); const header = createEl('div', '', '', {id: 'titan-monaco-header'}); const title = createEl('span', 'titan-zalgo-text', zalgoify("MONACO::FLOAT")); const closeBtn = createEl('button', 'titan-zen-btn'); closeBtn.appendChild(createIcon('close')); closeBtn.onclick = () => toggleMonacoFloat(btn); header.appendChild(title); header.appendChild(closeBtn); floatWin.appendChild(header); const body = createEl('div', '', '', {id: 'titan-monaco-body'}); floatWin.appendChild(body); makeDraggable(floatWin, header); floatWin.style.resize = 'both'; const placeholder = createEl('div', '', '', {id: 'titan-editor-placeholder', style: 'display:none'}); editorContainer.parentNode.insertBefore(placeholder, editorContainer); body.appendChild(editorContainer); document.body.appendChild(floatWin); setTimeout(() => triggerMonacoLayout(), 50); btn.replaceChildren(createIcon('dock_to_bottom')); btn.title = LOCALES[currentLocale].dock_editor; } else { const floatWin = document.getElementById('titan-monaco-float'); const placeholder = document.getElementById('titan-editor-placeholder'); if (floatWin && placeholder) { const editorContainer = floatWin.querySelector('.console-right-panel'); if (editorContainer) placeholder.parentNode.insertBefore(editorContainer, placeholder); placeholder.remove(); floatWin.remove(); setTimeout(() => triggerMonacoLayout(), 50); } btn.replaceChildren(createIcon('open_in_new')); btn.title = LOCALES[currentLocale].float; } }
        function toggleAbout() { const modal = document.getElementById('titan-about-overlay'); const card = document.getElementById('titan-about-card'); if(modal) { if(modal.classList.contains('visible')) { modal.classList.remove('visible'); setTimeout(() => modal.style.display = 'none', 200); } else { modal.style.display = 'flex'; requestAnimationFrame(() => { modal.classList.add('visible'); card.classList.add('titan-glitch-active'); card.focus(); }); } } }
        function injectZenControls() { const btnContainer = document.querySelector('.button-container'); if (!btnContainer || btnContainer.querySelector('.titan-zen-wrapper')) return; const wrapper = createEl('div', 'titan-zen-wrapper'); const btnSidebar = createEl('button', 'ms-button-borderless ms-button-icon', '', {'ms-button': '', title: LOCALES[currentLocale].sidebar}); btnSidebar.appendChild(createIcon('↹')); btnSidebar.onclick = () => { zenSidebar = !zenSidebar; const sidebar = document.querySelector('.console-left-panel'); if(sidebar) { sidebar.classList.toggle('titan-sidebar-hidden', zenSidebar); triggerMonacoLayout(); } btnSidebar.classList.toggle('active', zenSidebar); }; const btnHeader = createEl('button', 'ms-button-borderless ms-button-icon', '', {'ms-button': '', title: LOCALES[currentLocale].header}); const headIcon = createIcon('expand_less'); btnHeader.appendChild(headIcon); btnHeader.onclick = () => { zenHeader = !zenHeader; const header = document.querySelector('.page-header'); if (header) { if (zenHeader) { header.classList.add('titan-header-hidden'); headIcon.textContent = 'expand_more'; } else { header.classList.remove('titan-header-hidden'); headIcon.textContent = 'expand_less'; } triggerMonacoLayout(); } }; wrapper.appendChild(btnSidebar); wrapper.appendChild(btnHeader); btnContainer.prepend(wrapper); }
        function updateText() { const t = LOCALES[currentLocale]; if(!t) return; const lblCap = document.getElementById('lbl-cap'); if(lblCap) lblCap.textContent = t.cap; const btnRun = document.getElementById('btn-run'); if(btnRun) btnRun.textContent = t.run; const btnHalt = document.getElementById('btn-halt'); if(btnHalt) btnHalt.textContent = t.halt; const btnClr = document.getElementById('btn-clr'); if(btnClr) btnClr.textContent = t.clr; const btnCss = document.getElementById('btn-css'); if(btnCss) btnCss.textContent = t.css; const btnRst = document.getElementById('btn-rst'); if(btnRst) btnRst.textContent = t.rst; const btnCrt = document.getElementById('btn-crt'); if(btnCrt) btnCrt.textContent = t.crt; const ghostTitle = document.getElementById('ghost-title-span'); if(ghostTitle) { ghostTitle.textContent = t.link; if(Math.random() > 0.7) ghostTitle.textContent = zalgoify(t.link, 0.3); } const ghostDock = document.getElementById('ghost-dock-btn'); if(ghostDock) ghostDock.textContent = isDocked ? t.dock : t.free; const ghostInput = document.getElementById('ghost-textarea-v910'); if(ghostInput) ghostInput.placeholder = t.ready; const bottomZenBtns = document.querySelectorAll('#titan-bottom-bar .titan-zen-btn'); if(bottomZenBtns.length >= 5) { bottomZenBtns[0].title = t.about; bottomZenBtns[1].title = t.sidebar; bottomZenBtns[2].title = t.header; bottomZenBtns[3].title = t.output; bottomZenBtns[4].title = isEditorFloating ? t.dock_editor : t.float; } }
        function initUI() { applyStudioTheme(activeStudioTheme); updateFontScope(); if(crtEnabled) document.documentElement.classList.add('titan-crt-active'); const hudContainer = createEl('div', 'titan-glitch-active', '', {id: 'titan-hud-v910', 'data-titan-theme': activeTitanTheme}); if (savedHudPos.left && savedHudPos.top) { hudContainer.style.left = savedHudPos.left; hudContainer.style.top = savedHudPos.top; } else { hudContainer.style.bottom = '15px'; hudContainer.style.right = '15px'; } Object.assign(hudContainer.style, { position: 'fixed', zIndex: '2147483647', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0', pointerEvents: 'auto' }); document.body.appendChild(hudContainer); const infoPanel = createEl('div', '', '', {id: 'titan-panel-v910', 'data-titan-theme': activeTitanTheme}); document.body.appendChild(infoPanel); const localeRow = createEl('div', 'titan-row'); localeRow.appendChild(createEl('span', '', 'LANG:')); const localeSel = createEl('select', 'titan-select'); Object.keys(LOCALES).forEach(k => { const opt = createEl('option', '', LOCALES[k].label, {value: k}); if(k === currentLocale) opt.selected = true; localeSel.appendChild(opt); }); localeSel.onchange = (e) => { currentLocale = e.target.value; localStorage.setItem(LOCALE_STORAGE_KEY, currentLocale); updateText(); }; localeRow.appendChild(localeSel); infoPanel.appendChild(localeRow); const controls = createEl('div', 'titan-row'); const memLabel = createEl('span', '', LOCALES[currentLocale].cap, {id: 'lbl-cap'}); controls.appendChild(memLabel); const memSelect = createEl('select', 'titan-select', '', {style: 'width:auto'}); for (let i = 1; i <= 16; i++) { const val = i * 256; const opt = createEl('option', '', val + "MB", {value: val}); if (val === 512) opt.selected = true; memSelect.appendChild(opt); } memSelect.onchange = (e) => { memoryLimit = parseInt(e.target.value); }; controls.appendChild(memSelect); infoPanel.appendChild(controls); const tacticalRow = createEl('div', 'titan-row', '', {style:'justify-content: space-between; gap: 5px;'}); const btnRun = createEl('button', 'titan-select', LOCALES[currentLocale].run, {id:'btn-run', style:'flex:1; border-color:#0f0'}); btnRun.onclick = () => toggleSystem(true); const btnHalt = createEl('button', 'titan-select', LOCALES[currentLocale].halt, {id:'btn-halt', style:'flex:1; border-color:#f90'}); btnHalt.onclick = () => toggleSystem(false); const btnClr = createEl('button', 'titan-select', LOCALES[currentLocale].clr, {id:'btn-clr', style:'flex:1;'}); btnClr.onclick = clearTitanCache; tacticalRow.appendChild(btnRun); tacticalRow.appendChild(btnHalt); tacticalRow.appendChild(btnClr); infoPanel.appendChild(tacticalRow); const configRow = createEl('div', 'titan-row', '', {style:'justify-content: space-between; gap: 5px;'}); const btnCrt = createEl('button', 'titan-select', LOCALES[currentLocale].crt, {id: 'btn-crt', style:'flex:1'}); if(crtEnabled) btnCrt.classList.add('glow'); btnCrt.onclick = toggleCRT; const editBtn = createEl('button', 'titan-select', LOCALES[currentLocale].css, {id: 'btn-css', style:'flex:1'}); const resetBtn = createEl('button', 'titan-select', LOCALES[currentLocale].rst, {id: 'btn-rst', style: 'flex:1; border-color:red'}); configRow.appendChild(btnCrt); configRow.appendChild(editBtn); configRow.appendChild(resetBtn); infoPanel.appendChild(configRow); const syncRow = createEl('div', 'titan-row', '', {style: 'margin-top: 5px; border-top: 1px dashed var(--t-primary); padding-top: 5px;'}); const syncLbl = createEl('span', '', 'titan-label'); syncLbl.textContent = "TARGET:"; const syncInp = createEl('input', 'titan-input', '', {value: targetFile}); syncInp.value = targetFile; syncInp.onchange = (e) => { targetFile = e.target.value; localStorage.setItem(TARGET_FILE_KEY, targetFile); }; syncRow.appendChild(syncLbl); syncRow.appendChild(syncInp); infoPanel.appendChild(syncRow); const syncBtnRow = createEl('div', 'titan-row'); const btnSync = createEl('button', 'titan-zen-btn', 'SYNC ACTIVE (CTRL+S)', {style: "width: 48%; border-radius: 4px; margin-right: 2%;"}); btnSync.onclick = syncFile; const btnSyncAll = createEl('button', 'titan-zen-btn', 'DOWNLOAD PROJECT', {style: "width: 48%; border-radius: 4px;"}); btnSyncAll.onclick = syncAllFiles; syncBtnRow.appendChild(btnSync); syncBtnRow.appendChild(btnSyncAll); infoPanel.appendChild(syncBtnRow); const msgArea = createEl('div', '', 'SYSTEM READY', {id: 'titan-msg', style: 'font-size: 10px; margin-top: 5px; text-align: center; color: #888;'}); infoPanel.appendChild(msgArea); const fontRow = createEl('div', 'titan-row titan-font-wrapper'); const fontInput = createEl('input', 'titan-input', '', {placeholder: 'Font (Enter)', value: currentFont}); const checkUI = createEl('label', 'titan-checkbox-label'); const inputUI = createEl('input', '', '', {type: 'checkbox', checked: fontScopeUI}); inputUI.onchange = (e) => { fontScopeUI = e.target.checked; updateFontScope(); }; checkUI.appendChild(inputUI); checkUI.appendChild(document.createTextNode("UI")); const checkCode = createEl('label', 'titan-checkbox-label'); const inputCode = createEl('input', '', '', {type: 'checkbox', checked: fontScopeCode}); inputCode.onchange = (e) => { fontScopeCode = e.target.checked; updateFontScope(); }; checkCode.appendChild(inputCode); checkCode.appendChild(document.createTextNode("Code")); const suggestionsBox = createEl('div', '', '', {id: 'titan-font-suggestions', 'data-titan-theme': activeTitanTheme}); fontInput.addEventListener('input', (e) => { const val = e.target.value.toLowerCase(); while (suggestionsBox.firstChild) { suggestionsBox.removeChild(suggestionsBox.firstChild); } if(val.length < 1) { suggestionsBox.style.display = 'none'; return; } const matches = FONTS_JSON.items.filter(f => f.family.toLowerCase().includes(val)); if(matches.length > 0) { matches.slice(0, 10).forEach(item => { const div = createEl('div', 'titan-font-option', item.family); div.onclick = () => { fontInput.value = item.family; loadGoogleFont(item.family); suggestionsBox.style.display = 'none'; }; suggestionsBox.appendChild(div); }); suggestionsBox.style.display = 'flex'; } else { suggestionsBox.style.display = 'none'; } }); fontInput.addEventListener('blur', () => setTimeout(() => suggestionsBox.style.display = 'none', 200)); fontInput.onkeydown = (e) => { if(e.key === 'Enter') { loadGoogleFont(fontInput.value); suggestionsBox.style.display = 'none'; }}; fontRow.appendChild(fontInput); fontRow.appendChild(checkUI); fontRow.appendChild(checkCode); fontRow.appendChild(suggestionsBox); infoPanel.appendChild(fontRow); const cssEditor = createEl('textarea', '', '', {id: 'titan-css-editor', style: 'display:none', spellcheck: 'false'}); let customCSS = localStorage.getItem(CSS_STORAGE_KEY) || ""; cssEditor.value = customCSS; const customStyle = createEl('style', '', customCSS, {id: 'titan-styles-v910'}); document.head.appendChild(customStyle); editBtn.onclick = () => { isEditingCss = !isEditingCss; cssEditor.style.display = isEditingCss ? 'block' : 'none'; }; cssEditor.addEventListener('input', () => { customStyle.textContent = cssEditor.value; localStorage.setItem(CSS_STORAGE_KEY, cssEditor.value); }); resetBtn.onclick = () => { if(confirm("Reset?")) { localStorage.clear(); location.reload(); } }; window.titanStatsContainer = createEl('div'); infoPanel.appendChild(window.titanStatsContainer); infoPanel.appendChild(cssEditor); const themeRow = createEl('div', 'titan-theme-row'); const titanThemeSel = createEl('select', 'titan-select'); Object.keys(THEMES).forEach(key => { if(!key.startsWith('native')) { const opt = createEl('option', '', "T: " + THEMES[key].label, {value: key}); if(key === activeTitanTheme) opt.selected = true; titanThemeSel.appendChild(opt); } }); titanThemeSel.onchange = (e) => { activeTitanTheme = e.target.value; hudContainer.setAttribute('data-titan-theme', activeTitanTheme); infoPanel.setAttribute('data-titan-theme', activeTitanTheme); localStorage.setItem(THEME_TITAN_KEY, activeTitanTheme); const ghost = document.getElementById('ghost-window-v910'); if(ghost) ghost.setAttribute('data-titan-theme', activeTitanTheme); const float = document.getElementById('titan-monaco-float'); if(float) float.setAttribute('data-titan-theme', activeTitanTheme); suggestionsBox.setAttribute('data-titan-theme', activeTitanTheme); document.getElementById('titan-about-card').setAttribute('data-titan-theme', activeTitanTheme); document.getElementById('titan-omni-bar').setAttribute('data-titan-theme', activeTitanTheme); }; const studioThemeSel = createEl('select', 'titan-select'); Object.keys(THEMES).forEach(key => { const opt = createEl('option', '', "S: " + THEMES[key].label, {value: key}); if(key === activeStudioTheme) opt.selected = true; studioThemeSel.appendChild(opt); }); studioThemeSel.onchange = (e) => { applyStudioTheme(e.target.value); }; themeRow.appendChild(titanThemeSel); themeRow.appendChild(studioThemeSel); infoPanel.appendChild(themeRow); const ramGauge = createEl('div', '', '', {id: 'titan-ram-gauge'}); const ramFill = createEl('div', '', '', {id: 'titan-ram-fill'}); ramGauge.appendChild(ramFill); infoPanel.appendChild(ramGauge); const bottomBar = createEl('div', '', '', {id: 'titan-bottom-bar'}); const btnAbout = createEl('button', 'titan-zen-btn', '', {title: LOCALES[currentLocale].about}); const qMark = createEl('span', '', '?', {style: 'font-weight:bold;font-size:14px'}); btnAbout.appendChild(qMark); btnAbout.onclick = () => toggleAbout(); const btnSidebar = createEl('button', 'titan-zen-btn', '', {'title': LOCALES[currentLocale].sidebar}); btnSidebar.appendChild(createIcon('↹')); btnSidebar.onclick = () => { zenSidebar = !zenSidebar; const sidebar = document.querySelector('.console-left-panel'); if(sidebar) { sidebar.classList.toggle('titan-sidebar-hidden', zenSidebar); triggerMonacoLayout(); } btnSidebar.classList.toggle('active', zenSidebar); }; const btnHeader = createEl('button', 'titan-zen-btn', '', {'title': LOCALES[currentLocale].header}); const headIcon = createIcon('expand_less'); btnHeader.appendChild(headIcon); btnHeader.onclick = () => { zenHeader = !zenHeader; const header = document.querySelector('.page-header'); if (header) { if (zenHeader) { header.classList.add('titan-header-hidden'); headIcon.textContent = 'expand_more'; } else { header.classList.remove('titan-header-hidden'); headIcon.textContent = 'expand_less'; } triggerMonacoLayout(); } }; const btnOutput = createEl('button', 'titan-zen-btn', '', {title: LOCALES[currentLocale].output}); btnOutput.appendChild(createIcon('chat_bubble_outline')); btnOutput.onclick = () => { zenOutput = !zenOutput; const output = document.querySelector('.output-container'); if(output) { output.classList.toggle('titan-output-hidden', zenOutput); window.dispatchEvent(new Event('resize')); } btnOutput.classList.toggle('active', zenOutput); }; const btnFloat = createEl('button', 'titan-zen-btn', '', {title: LOCALES[currentLocale].float}); btnFloat.appendChild(createIcon('open_in_new')); btnFloat.onclick = () => toggleMonacoFloat(btnFloat); const toggleBtn = createEl('div', '', '𓅭', {id: 'titan-main-btn'}); toggleBtn.onclick = () => { isHudOpen = !isHudOpen; if (isHudOpen) { toggleBtn.textContent = '𓅯'; const rect = hudContainer.getBoundingClientRect(); const screenHeight = window.innerHeight; infoPanel.style.top = ''; infoPanel.style.bottom = ''; infoPanel.style.left = ''; infoPanel.style.right = ''; infoPanel.style.right = (window.innerWidth - rect.right) + 'px'; if (rect.top < screenHeight / 2) infoPanel.style.top = (rect.bottom + 10) + 'px'; else infoPanel.style.bottom = (window.innerHeight - rect.top + 10) + 'px'; setTimeout(() => { toggleBtn.textContent = '𓅮'; infoPanel.classList.add('visible'); triggerGlitch(infoPanel); }, 50); } else { infoPanel.classList.remove('visible'); toggleBtn.textContent = '𓅯'; setTimeout(() => { toggleBtn.textContent = '𓅭'; }, 100); } }; bottomBar.appendChild(btnAbout); bottomBar.appendChild(btnSidebar); bottomBar.appendChild(btnHeader); bottomBar.appendChild(btnOutput); bottomBar.appendChild(btnFloat); bottomBar.appendChild(toggleBtn); hudContainer.appendChild(bottomBar); makeDraggable(hudContainer, bottomBar, (pos) => { localStorage.setItem(HUD_POS_KEY, JSON.stringify(pos)); }); const aboutOverlay = createEl('div', '', '', {id: 'titan-about-overlay'}); const aboutCard = createEl('div', '', '', {id: 'titan-about-card', 'data-titan-theme': activeTitanTheme}); const abHeader = createEl('div', 'titan-about-header'); const abTitle = createEl('span', 'titan-about-title', 'TITAN PROTOCOL v910'); const abClose = createEl('button', 'titan-zen-btn', '×'); abClose.onclick = () => { aboutOverlay.classList.remove('visible'); setTimeout(()=>aboutOverlay.style.display='none', 200); }; abHeader.appendChild(abTitle); abHeader.appendChild(abClose); const abScroll = createEl('div', 'titan-about-scroll'); const createSection = (title, content) => { const h2 = createEl('span', 'titan-wp-h2', title); const p = createEl('span', 'titan-wp-p', content); abScroll.appendChild(h2); abScroll.appendChild(p); }; createSection('1. ABSTRACT', 'Titan is the apex browser enhancement suite for Google AI Studio.'); createSection('2. OBSERVER ENGINE', 'Replaced legacy interval loops with MutationObserver for zero-latency, low-overhead DOM reaction.'); createSection('3. OMNI-BAR', 'Press Ctrl+K to access the command palette.'); createSection('4. VISUAL RAM', 'Real-time heap visualization.'); createSection('5. CRT HOLOLITH', 'Toggleable shader layer for maximum immersion.'); createSection('6. LOCAL BRIDGE', 'Connects to MALONE Mission Control to handle multiple concurrent projects.'); const abFooter = createEl('div', 'titan-about-footer'); abFooter.appendChild(document.createTextNode('Forged by Armando Cornaglia')); abFooter.appendChild(document.createElement('br')); abFooter.appendChild(document.createTextNode('"From the moment I understood the weakness of my flesh, it disgusted me."')); aboutCard.appendChild(abHeader); aboutCard.appendChild(abScroll); aboutCard.appendChild(abFooter); aboutOverlay.appendChild(aboutCard); document.body.appendChild(aboutOverlay); const omniBar = createEl('div', '', '', {id: 'titan-omni-bar', 'data-titan-theme': activeTitanTheme}); const omniInput = createEl('input', '', '', {id: 'titan-omni-input', placeholder: '> Execute Command'}); const omniResults = createEl('div', '', '', {id: 'titan-omni-results'}); omniInput.addEventListener('input', (e) => populateOmniResults(e.target.value)); omniInput.addEventListener('keydown', (e) => { if(e.key === 'Enter' && omniResults.firstChild) omniResults.firstChild.click(); if(e.key === 'Escape') toggleOmniBar(); }); omniBar.appendChild(omniInput); omniBar.appendChild(omniResults); document.body.appendChild(omniBar); const crtLayer = createEl('div', 'titan-crt-layer', '', {id: 'titan-crt-layer'}); }
        function triggerGlitch(element) { element.classList.remove('titan-glitch-active'); void element.offsetWidth; element.classList.add('titan-glitch-active'); }
        function getElementByXPath(path) { return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue; }
        function alignToTarget() { if (!isDocked) return; const win = document.getElementById('ghost-window-v910'); if (!xpathTarget || !xpathTarget.isConnected) { xpathTarget = getElementByXPath(TARGET_XPATH); if (xpathTarget) angularInput = xpathTarget.querySelector('textarea'); } if (xpathTarget && win) { const rect = xpathTarget.getBoundingClientRect(); if (rect.width > 0) { win.style.top = (rect.top - HEADER_HEIGHT) + 'px'; win.style.left = rect.left + 'px'; win.style.width = rect.width + 'px'; win.style.height = (Math.max(rect.height, 60) + HEADER_HEIGHT) + 'px'; win.style.bottom = 'auto'; win.style.resize = 'none'; } } }
        function executeSend(inputElement) { if (isSending || !angularInput) return; isSending = true; angularInput.value = inputElement.value; angularInput.dispatchEvent(new Event('input', { bubbles: true })); setTimeout(() => { let btn = document.querySelector('.send-button'); if (!btn) { const allBtns = Array.from(document.querySelectorAll('button')); btn = allBtns.find(b => { const t = (b.innerText + (b.getAttribute('aria-label')||"")).toLowerCase(); return (t.includes('send') || b.innerHTML.includes('path') || b.innerHTML.includes('arrow_up')) && !t.includes('stop'); }); } if (btn) { btn.click(); inputElement.value = ""; } setTimeout(() => { isSending = false; }, 1000); }, 50); }
        function createGhostWindow() { if (document.getElementById('ghost-window-v910')) return; xpathTarget = getElementByXPath(TARGET_XPATH); if (xpathTarget) angularInput = xpathTarget.querySelector('textarea'); const win = createEl('div', 'titan-glitch-active', '', {id: 'ghost-window-v910', 'data-titan-theme': activeTitanTheme}); const header = createEl('div', '', '', {id: 'ghost-header-v910'}); const titleSpan = createEl('span', 'titan-zalgo-text', LOCALES[currentLocale].link, {id: 'ghost-title-span'}); const gripper = createEl('div', 'ghost-gripper', '::', {title: 'Drag Handle'}); const dockBtn = createEl('button', '', LOCALES[currentLocale].dock, {id: 'ghost-dock-btn'}); dockBtn.onclick = () => { isDocked = !isDocked; dockBtn.textContent = isDocked ? LOCALES[currentLocale].dock : LOCALES[currentLocale].free; if(isDocked) { win.classList.remove('undocked'); alignToTarget(); win.style.maxWidth = ''; win.style.maxHeight = '200px'; } else { win.classList.add('undocked'); const rect = win.getBoundingClientRect(); win.style.left = rect.left + 'px'; win.style.top = rect.top + 'px'; win.style.bottom = 'auto'; win.style.right = 'auto'; win.style.width = '300px'; win.style.height = '200px'; } }; header.appendChild(titleSpan); header.appendChild(gripper); header.appendChild(dockBtn); win.appendChild(header); const input = createEl('textarea', '', '', {id: 'ghost-textarea-v910', placeholder: LOCALES[currentLocale].ready}); if (angularInput) input.value = angularInput.value; win.appendChild(input); const sendBtn = createEl('button', '', '➤', {id: 'ghost-send-action'}); sendBtn.onclick = () => executeSend(input); win.appendChild(sendBtn); document.body.appendChild(win); if (!isDocked) { win.style.top = '50%'; win.style.left = '50%'; win.style.transform = 'translate(-50%, -50%)'; } let isDragging = false; let offset = {x:0, y:0}; const startDrag = (e) => { isDragging = true; if(isDocked) { isDocked = false; dockBtn.textContent = LOCALES[currentLocale].free; win.classList.add('undocked'); win.style.maxWidth = 'calc(100vw - 20px)'; win.style.maxHeight = 'calc(100vh - 20px)'; } const rect = win.getBoundingClientRect(); offset.x = e.clientX - rect.left; offset.y = e.clientY - rect.top; window.addEventListener('mousemove', doDrag); window.addEventListener('mouseup', stopDrag); }; const doDrag = (e) => { if (!isDragging) return; win.style.transform = 'none'; win.style.left = (e.clientX - offset.x) + 'px'; win.style.top = (e.clientY - offset.y) + 'px'; win.style.bottom = 'auto'; win.style.right = 'auto'; }; const stopDrag = () => { isDragging = false; window.removeEventListener('mousemove', doDrag); window.removeEventListener('mouseup', stopDrag); }; gripper.addEventListener('mousedown', startDrag); input.addEventListener('keydown', (e) => { e.stopImmediatePropagation(); if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) executeSend(input); }); input.addEventListener('input', (e) => { e.stopImmediatePropagation(); if (angularInput) angularInput.value = input.value; }); alignToTarget(); }
        
        let steamrollHandle = null;
        function steamroll() { if (typeof requestIdleCallback === 'function') { if (steamrollHandle) cancelIdleCallback(steamrollHandle); steamrollHandle = requestIdleCallback((deadline) => { const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT); let node; let processed = 0; const MAX_NODES = 5; while(deadline.timeRemaining() > 0 && (node = walker.nextNode())) { if (node.tagName === 'MS-CMARK-NODE' && !node.hasAttribute('data-titan-fixed') && node.children.length > MAX_NODES) { const txt = node.innerText; while(node.firstChild) node.removeChild(node.firstChild); node.textContent = txt; node.style.whiteSpace = 'pre-wrap'; node.setAttribute('data-titan-fixed', 'true'); processed++; } } if (processed > 0) stats.flattened += processed; }, { timeout: 1000 }); } else { const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT); let node; let processed = 0; const MAX_NODES = 5; const BATCH_LIMIT = 50; while(node = walker.nextNode()) { if (processed >= BATCH_LIMIT) break; if (node.tagName === 'MS-CMARK-NODE' && !node.hasAttribute('data-titan-fixed') && node.children.length > MAX_NODES) { const txt = node.innerText; while(node.firstChild) node.removeChild(node.firstChild); node.textContent = txt; node.style.whiteSpace = 'pre-wrap'; node.setAttribute('data-titan-fixed', 'true'); processed++; } } if (processed > 0) stats.flattened += processed; } }
        function interceptChips() { document.querySelectorAll('button[data-test-id="suggestion-chip"]').forEach(btn => { if (btn.dataset.titanHooked) return; btn.dataset.titanHooked = "true"; stats.chipsHooked++; btn.addEventListener('click', (e) => { e.stopImmediatePropagation(); e.preventDefault(); const text = btn.innerText || btn.getAttribute('aria-label'); const ghostInput = document.getElementById('ghost-textarea-v910'); if (ghostInput) { ghostInput.value = text; ghostInput.focus(); if (angularInput) { angularInput.value = text; angularInput.dispatchEvent(new Event('input', { bubbles: true })); } } }, true); }); }
        function performPurge() { const ctn = document.querySelector('ms-autoscroll-container'); if (ctn) { Array.from(ctn.children).slice(0, -3).forEach(child => { if (child.style.contentVisibility !== 'hidden') { child.style.contentVisibility = 'hidden'; child.style.contain = 'strict'; child.style.containIntrinsicSize = '1px 50px'; child.querySelectorAll('img').forEach(img => { if(img.src) { img.src = ''; img.removeAttribute('srcset'); stats.mediaWiped++; } }); child.querySelectorAll('canvas').forEach(cvs => { cvs.width = 1; cvs.height = 1; }); child.innerHTML = ''; stats.purged++; } }); } }
        const observer = new MutationObserver((mutations) => { if (!document.getElementById('ghost-window-v910')) createGhostWindow(); if (isDocked) alignToTarget(); steamroll(); interceptChips(); injectZenControls(); }); window.titanObserver = observer;
        document.addEventListener('keydown', (e) => { if (e.ctrlKey && e.shiftKey && e.code === 'Space') { const ghost = document.getElementById('ghost-window-v910'); if(ghost) { if(ghost.style.display === 'none') ghost.style.display = 'flex'; else ghost.style.display = 'none'; } } if (e.ctrlKey && e.key === 'k') { e.preventDefault(); toggleOmniBar(); } if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); e.stopPropagation(); syncFile(); } });

        async function bootSequence() {
            const bootScreen = createEl('div', '', '', {id: 'titan-boot-screen'});
            const logo = createEl('div', 'titan-boot-logo', 'TITAN v910'); bootScreen.appendChild(logo);
            matrixDecrypt(logo, "TITAN v910.22"); 
            const createBootRow = (label, id) => { const row = createEl('div', 'titan-boot-row'); const text = createEl('span', '', label); const barCont = createEl('div', 'titan-boot-bar-container'); const bar = createEl('div', 'titan-boot-bar-fill', '', {id: id}); barCont.appendChild(bar); row.appendChild(text); row.appendChild(barCont); return row; };
            bootScreen.appendChild(createBootRow('NEURAL LINK', 'boot-bar-theme')); bootScreen.appendChild(createBootRow('LEXICON', 'boot-bar-font')); bootScreen.appendChild(createBootRow('GHOST SHELL', 'boot-bar-ui')); 
            bootScreen.appendChild(createBootRow('LOCAL BRIDGE', 'boot-bar-bridge')); 
            bootScreen.appendChild(createBootRow('LOGIC CORE', 'boot-bar-logic'));
            document.body.appendChild(bootScreen);
            const updateBar = (id, p) => { const el = document.getElementById(id); if(el) el.style.width = p + '%'; };
            const sleep = (ms) => new Promise(r => setTimeout(r, ms));
            await sleep(200);
            
            const coreStyle = createEl('style', '', CORE_CSS, {id: 'titan-core-v910'}); 
            document.head.appendChild(coreStyle);

            updateBar('boot-bar-theme', 100); await sleep(300);
            if (currentFont !== 'SF Mono') loadGoogleFont(currentFont);
            updateBar('boot-bar-font', 100); await sleep(300);
            initUI();
            updateBar('boot-bar-ui', 100); await sleep(300);
            
            // BRIDGE CHECK
            isBridgeOnline = await checkBridge();
            const bridgeBar = document.getElementById('boot-bar-bridge');
            if (bridgeBar) { bridgeBar.style.backgroundColor = isBridgeOnline ? '#0f0' : '#f00'; bridgeBar.style.width = '100%'; }
            await sleep(300);

            toggleSystem(true);
            updateBar('boot-bar-logic', 100); await sleep(500);
            bootScreen.style.opacity = '0'; setTimeout(() => bootScreen.remove(), 500);
        }

        bootSequence();

        window.titanCleanup = function() {
            observer.disconnect();
            clearInterval(window.titanInterval);
            document.getElementById('titan-hud-v910')?.remove();
            document.getElementById('ghost-window-v910')?.remove();
            document.getElementById('titan-styles-v910')?.remove();
            document.getElementById('titan-core-v910')?.remove();
            document.getElementById('titan-panel-v910')?.remove();
            document.getElementById('titan-monaco-float')?.remove();
            document.getElementById('titan-font-link')?.remove();
            document.getElementById('titan-boot-screen')?.remove();
            document.getElementById('titan-about-overlay')?.remove();
            document.getElementById('titan-omni-bar')?.remove();
            document.documentElement.removeAttribute('data-studio-theme');
            document.documentElement.classList.remove('titan-font-ui', 'titan-font-code', 'titan-sidebar-hidden', 'titan-header-hidden', 'titan-output-hidden', 'titan-crt-active');
            document.documentElement.style.colorScheme = '';
            document.body.style.colorScheme = '';
            console.log("♻️ TITAN v910 UNLOADED.");
        };

    } catch (e) { console.error("TITAN ERROR:", e); }
})();
