/*
 * TITAN PROTOCOL v910.0.17
 * @name      Gemini Magos Prime Titan
 * @namespace Adeptus Mechanicus
 * @version   910.0.17 (Princept Ready)
 * @description DOM Observation, Experimental Local Sync Bridge, Floating Editor, Ghost Window, and Deep Memory Management
 * @author    Armando Cornaglia / 00face
 * @match     https://aistudio.google.com/*
 * @grant     none
 * @license   MIT
 * @Protocol Copy paste into your browsers Inspectors Console and strike return.
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
        console.log("%c𓂀 TITAN v910.17: TEMPORAL MATRIX ONLINE. OMNISSIAH GUIDE US.", "color: #00FACE; font-weight: bold; font-family: monospace;");

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
            'en': { label: 'English', cap: 'CAP:', font: 'FONT:', css: 'CSS', rst: 'RST', run: 'RUN', halt: 'HALT', clr: 'CLR', dock: '⚓ DOCKED', free: '🛸 FREE', link: '𓁗 TITAN LINK', sidebar: 'Toggle Sidebar', header: 'Toggle Header', output: 'Toggle Output', float: 'Float Editor', dock_editor: 'Dock Editor', about: 'Whitepaper', crt: 'CRT', export: 'Export Config', import: 'Import Config', omni: 'Omni-Bar (Ctrl+K)', bridge: 'BRIDGE:', online: 'ONLINE', offline: 'OFFLINE', ready: '> SYSTEM READY.' },
            'jp': { label: '日本語 (Tech)', cap: '容量:', font: '字体:', css: '編集', rst: '復元', run: '起動', halt: '停止', clr: '消去', dock: '⚓ 接続', free: '🛸 遊離', link: '𓁗 タイタン', sidebar: 'サイドバー', header: 'ヘッダー', output: 'ログ出力', float: 'エディタ浮動', dock_editor: 'エディタ接続', about: '文書', crt: 'CRT', export: '設定保存', import: '設定読込', omni: 'オムニバー', bridge: 'ブリッジ:', online: '接続', offline: '切断', ready: '> システム準備完了' },
            'la': { label: 'High Gothic', cap: 'CAPAX:', font: 'SCRIPT:', css: 'CODEX', rst: 'TABULA', run: 'AGERE', halt: 'SISTERE', clr: 'PURGARE', dock: '⚓ ANCORA', free: '🛸 LIBER', link: '𓁗 DEUS EST', sidebar: 'Latus', header: 'Caput', output: 'Vox', float: 'Elevare', dock_editor: 'Iungere', about: 'Codex', crt: 'SPECULUM', export: 'Exportare', import: 'Importare', omni: 'Omni', bridge: 'PONS:', online: 'APERTUS', offline: 'CLAUSUS', ready: '> SPIRITUS PARATUS.' },
            'bin': { label: 'Binary', cap: '0101:', font: '1010:', css: '0011', rst: '0000', run: '111', halt: '000', clr: '010', dock: '⚓ 1111', free: '🛸 0000', link: '𓁗 1001', sidebar: '101', header: '010', output: '110', float: '011', dock_editor: '100', about: '111', crt: '001', export: 'IO-W', import: 'IO-R', omni: 'CMD', bridge: '1010:', online: '1', offline: '0', ready: '> 1' },
            'de': { label: 'Deutsch', cap: 'KAP:', font: 'SCHRIFT:', css: 'CSS', rst: 'RST', run: 'START', halt: 'STOPP', clr: 'LEER', dock: '⚓ FEST', free: '🛸 FREI', link: '𓁗 TITAN', sidebar: 'Leiste', header: 'Kopf', output: 'Ausgabe', float: 'Fenster', dock_editor: 'Andocken', about: 'Papier', crt: 'Röhre', export: 'Export', import: 'Import', omni: 'Omni-Bar', bridge: 'BRÜCKE:', online: 'ONLINE', offline: 'OFFLINE', ready: '> BEREIT.' },
            'es': { label: 'Español', cap: 'LIM:', font: 'FUENTE:', css: 'CSS', rst: 'RST', run: 'INI', halt: 'PAR', clr: 'LIMP', dock: '⚓ FIJO', free: '🛸 LIBRE', link: '𓁗 ENLACE', sidebar: 'Barra', header: 'Cabeza', output: 'Salida', float: 'Flotar', dock_editor: 'Acoplar', about: 'Papel', crt: 'CRT', export: 'Exportar', import: 'Importar', omni: 'Omni-Barra', bridge: 'PUENTE:', online: 'EN LÍNEA', offline: 'FUERA', ready: '> LISTO.' },
            'ar': { label: 'العربية', cap: 'CAP:', font: 'FONT:', css: 'CSS', rst: 'RST', run: 'تشغيل', halt: 'توقف', clr: 'مسح', dock: '⚓ DOCKED', free: '🛸 FREE', link: '𓁗 TITAN LINK', sidebar: 'الشريط الجانبي', header: 'الرأس', output: 'المخرجات', float: 'عائم', dock_editor: 'تثبيت', about: 'عن', crt: 'CRT', export: 'تصدير', import: 'استيراد', omni: 'Omni', bridge: 'جسر:', online: 'متصل', offline: 'منقطع', ready: '> جاهز.' },
            'ru': { label: 'Русский', cap: 'ОЗУ:', font: 'ШРФТ:', css: 'CSS', rst: 'СБР', run: 'ПУСК', halt: 'СТОП', clr: 'ОЧСТ', dock: '⚓ ЗАКР', free: '🛸 СВОБ', link: '𓁗 TITAN', sidebar: 'Сайдбар', header: 'Хедер', output: 'Вывод', float: 'Открепить', dock_editor: 'Закрепить', about: 'Инфо', crt: 'CRT', export: 'Экспорт', import: 'Импорт', omni: 'Омни', bridge: 'МОСТ:', online: 'В СЕТИ', offline: 'ОТКЛ', ready: '> ГОТОВ.' },
            'zh': { label: '中文', cap: '容量:', font: '字体:', css: 'CSS', rst: '重置', run: '运行', halt: '停止', clr: '清除', dock: '⚓ 固定', free: '🛸 浮动', link: '𓁗 TITAN', sidebar: '侧边栏', header: '顶栏', output: '输出', float: '浮动', dock_editor: '固定', about: '关于', crt: 'CRT', export: '导出', import: '导入', omni: 'Omni', bridge: '桥接:', online: '在线', offline: '离线', ready: '> 就绪.' }
        };

        const FONTS_JSON = { "items": [ {"family": "Roboto"}, {"family": "Open Sans"}, {"family": "Lato"}, {"family": "Montserrat"}, {"family": "Oswald"}, {"family": "Roboto Condensed"}, {"family": "Source Sans Pro"}, {"family": "Raleway"}, {"family": "PT Sans"}, {"family": "Merriweather"}, {"family": "Roboto Slab"}, {"family": "Nunito"}, {"family": "Poppins"}, {"family": "Playfair Display"}, {"family": "Rubik"}, {"family": "Lora"}, {"family": "Mukta"}, {"family": "Nunito Sans"}, {"family": "Fira Sans"}, {"family": "Inter"}, {"family": "Work Sans"}, {"family": "Quicksand"}, {"family": "Barlow"}, {"family": "Inconsolata"}, {"family": "PT Serif"}, {"family": "Titillium Web"}, {"family": "Libre Franklin"}, {"family": "Josefin Sans"}, {"family": "Karla"}, {"family": "Arvo"}, {"family": "Libre Baskerville"}, {"family": "Pacifico"}, {"family": "Ubuntu"}, {"family": "Crimson Text"}, {"family": "Bitter"}, {"family": "Cabin"}, {"family": "DM Sans"}, {"family": "Fira Code"}, {"family": "JetBrains Mono"}, {"family": "IBM Plex Mono"}, {"family": "Space Mono"}, {"family": "Source Code Pro"}, {"family": "Ubuntu Mono"}, {"family": "Anonymous Pro"}, {"family": "Cousine"}, {"family": "VT323"}, {"family": "Press Start 2P"}, {"family": "Share Tech Mono"}, {"family": "Nova Mono"}, {"family": "Oxygen Mono"}, {"family": "Overpass Mono"}, {"family": "Red Hat Mono"}, {"family": "Syne Mono"}, {"family": "Major Mono Display"}, {"family": "Xanh Mono"}, {"family": "Courier Prime"}, {"family": "Sometype Mono"}, {"family": "Spline Sans Mono"}, {"family": "Sono"}, {"family": "Martian Mono"}, {"family": "Victor Mono"}, {"family": "Cascadia Code"}, {"family": "Manrope"}, {"family": "Urbanist"}, {"family": "Outfit"} ] };
        
        const THEMES = {
            'native-light': { label: 'Native Studio (Light)', vars: `` },
            'native-dark': { label: 'Native Studio (Dark)', vars: `` },
            'mechanicus': { label: 'Mechanicus', vars: `--t-bg: #0b1216; --t-surface: #101e26; --t-text: #00FACE; --t-border: #00FACE; --t-primary: #00FACE; --t-inv: invert(1); --t-btn-bg: #00FACE; --t-btn-text: #000;` },
            'necron': { label: 'Necron', vars: `--t-bg: #050505; --t-surface: #000000; --t-text: #00FF00; --t-border: #00FF00; --t-primary: #00FF00; --t-inv: none; --t-btn-bg: #00FF00; --t-btn-text: #000;` },
            'claude-light': { label: 'Claude (Light)', vars: `--t-bg: #FFFAF3; --t-surface: #F4EFE6; --t-text: #333333; --t-border: #E6DFD5; --t-primary: #DA7756; --t-inv: none; --t-btn-bg: #DA7756; --t-btn-text: #FFFFFF;` },
            'claude-dark': { label: 'Claude (Dark)', vars: `--t-bg: #191919; --t-surface: #222222; --t-text: #EDEDED; --t-border: #333333; --t-primary: #D97757; --t-inv: none; --t-btn-bg: #D97757; --t-btn-text: #FFFFFF;` },
            'perplexity-light': { label: 'Perplexity (Light)', vars: `--t-bg: #F9FAFB; --t-surface: #FFFFFF; --t-text: #111827; --t-border: #E5E7EB; --t-primary: #20B2AA; --t-inv: none; --t-btn-bg: #20B2AA; --t-btn-text: #FFFFFF;` },
            'perplexity-dark': { label: 'Perplexity (Dark)', vars: `--t-bg: #18181B; --t-surface: #27272A; --t-text: #F3F4F6; --t-border: #3F3F46; --t-primary: #25D3D3; --t-inv: none; --t-btn-bg: #25D3D3; --t-btn-text: #000;` },
            'chatgpt-light': { label: 'ChatGPT (Light)', vars: `--t-bg: #FFFFFF; --t-surface: #F7F7F8; --t-text: #343541; --t-border: #D9D9E3; --t-primary: #10A37F; --t-inv: none; --t-btn-bg: #10A37F; --t-btn-text: #FFFFFF;` },
            'chatgpt-dark': { label: 'ChatGPT (Dark)', vars: `--t-bg: #343541; --t-surface: #444654; --t-text: #ECECF1; --t-border: #565869; --t-primary: #19C37D; --t-inv: none; --t-btn-bg: #19C37D; --t-btn-text: #FFFFFF;` },
            'google-ai-light': { label: 'Google AI (Light)', vars: `--t-bg: #FFFFFF; --t-surface: #F8F9FA; --t-text: #1F1F1F; --t-border: #E0E3E7; --t-primary: #1A73E8; --t-inv: none; --t-btn-bg: #1A73E8; --t-btn-text: #FFFFFF;` },
            'google-ai-dark': { label: 'Google AI (Dark)', vars: `--t-bg: #1E1F20; --t-surface: #28292A; --t-text: #E3E3E3; --t-border: #444746; --t-primary: #8AB4F8; --t-inv: none; --t-btn-bg: #8AB4F8; --t-btn-text: #000;` },
            'gemini-light': { label: 'Gemini (Light)', vars: `--t-bg: #FFFFFF; --t-surface: #F0F4F9; --t-text: #1F1F1F; --t-border: #DDE3EA; --t-primary: #4889F4; --t-inv: none; --t-btn-bg: #1A73E8; --t-btn-text: #FFFFFF;` },
            'gemini-dark': { label: 'Gemini (Dark)', vars: `--t-bg: #131314; --t-surface: #1E1F20; --t-text: #E3E3E3; --t-border: #444746; --t-primary: #D96570; --t-inv: none; --t-btn-bg: #E3E3E3; --t-btn-text: #1F1F1F;` },
            'antigravity-light': { label: 'Antigravity (Light)', vars: `--t-bg: #FFFFFF; --t-surface: #F1F3F4; --t-text: #202124; --t-border: #DADCE0; --t-primary: #1A73E8; --t-inv: none; --t-btn-bg: #1A73E8; --t-btn-text: #FFFFFF;` },
            'antigravity-dark': { label: 'Antigravity (Dark)', vars: `--t-bg: #202124; --t-surface: #2D2E31; --t-text: #E8EAED; --t-border: #3C4043; --t-primary: #8AB4F8; --t-inv: none; --t-btn-bg: #8AB4F8; --t-btn-text: #202124;` },
            'vercel-light': { label: 'Vercel (Light)', vars: `--t-bg: #FFFFFF; --t-surface: #FAFAFA; --t-text: #000000; --t-border: #EAEAEA; --t-primary: #000000; --t-inv: none; --t-btn-bg: #000000; --t-btn-text: #FFFFFF;` },
            'vercel-dark': { label: 'Vercel (Dark)', vars: `--t-bg: #000000; --t-surface: #111111; --t-text: #FFFFFF; --t-border: #333333; --t-primary: #FFFFFF; --t-inv: none; --t-btn-bg: #FFFFFF; --t-btn-text: #000000;` },
            'copilot-light': { label: 'Copilot (Light)', vars: `--t-bg: #FFFFFF; --t-surface: #F6F8FA; --t-text: #24292F; --t-border: #D0D7DE; --t-primary: #0969DA; --t-inv: none; --t-btn-bg: #2DA44E; --t-btn-text: #FFFFFF;` },
            'copilot-dark': { label: 'Copilot (Dark)', vars: `--t-bg: #0D1117; --t-surface: #161B22; --t-text: #C9D1D9; --t-border: #30363D; --t-primary: #58A6FF; --t-inv: none; --t-btn-bg: #238636; --t-btn-text: #FFFFFF;` },
            'vscode-light': { label: 'VS Code (Light)', vars: `--t-bg: #FFFFFF; --t-surface: #F3F3F3; --t-text: #2C2C2C; --t-border: #E5E5E5; --t-primary: #007ACC; --t-inv: none; --t-btn-bg: #007ACC; --t-btn-text: #FFFFFF;` },
            'vscode-dark': { label: 'VS Code (Dark)', vars: `--t-bg: #1E1E1E; --t-surface: #252526; --t-text: #D4D4D4; --t-border: #3E3E42; --t-primary: #007ACC; --t-inv: none; --t-btn-bg: #0E639C; --t-btn-text: #FFFFFF;` },
            'windsurf-light': { label: 'Windsurf (Light)', vars: `--t-bg: #FFFFFF; --t-surface: #F3F4F6; --t-text: #111827; --t-border: #E2E8F0; --t-primary: #2563EB; --t-inv: none; --t-btn-bg: #2563EB; --t-btn-text: #FFFFFF;` },
            'windsurf-dark': { label: 'Windsurf (Dark)', vars: `--t-bg: #18181B; --t-surface: #27272A; --t-text: #F8FAFC; --t-border: #3F3F46; --t-primary: #3B82F6; --t-inv: none; --t-btn-bg: #3B82F6; --t-btn-text: #FFFFFF;` },
            'dracula-dark': { label: 'Dracula', vars: `--t-bg: #282A36; --t-surface: #44475A; --t-text: #F8F8F2; --t-border: #44475A; --t-primary: #FF79C6; --t-inv: none; --t-btn-bg: #FF79C6; --t-btn-text: #282A36;` },
            'tokyo-night': { label: 'Tokyo Night', vars: `--t-bg: #1A1B26; --t-surface: #24283B; --t-text: #C0CAF5; --t-border: #414868; --t-primary: #7AA2F7; --t-inv: none; --t-btn-bg: #7AA2F7; --t-btn-text: #1A1B26;` },
            'nord': { label: 'Nord', vars: `--t-bg: #2e3440; --t-surface: #3b4252; --t-text: #eceff4; --t-border: #88c0d0; --t-primary: #88c0d0; --t-inv: none; --t-btn-bg: #88c0d0; --t-btn-text: #2e3440;` },
            'synthwave': { label: 'Synthwave 84', vars: `--t-bg: #262335; --t-surface: #241B2F; --t-text: #FFFFFF; --t-border: #34294F; --t-primary: #FF7EDB; --t-inv: none; --t-btn-bg: #FF7EDB; --t-btn-text: #262335;` },
            'forest-night': { label: 'Forest Night', vars: `--t-bg: #122c1c; --t-surface: #193723; --t-text: #e2e8e4; --t-border: #84bd96; --t-primary: #84bd96; --t-inv: none; --t-btn-bg: #84bd96; --t-btn-text: #122c1c;` },
            'natural-beach': { label: 'Natural Beach', vars: `--t-bg: #fcf9f4; --t-surface: #ffffff; --t-text: #122c1c; --t-border: #75879d; --t-primary: #6c8aa3; --t-inv: none; --t-btn-bg: #6c8aa3; --t-btn-text: #fff;` }
        };

        const HOLIDAY_THEMES = [
            // Warhammer 40k Holy Days (Priority 1)
            { date: '10-27', name: 'Feast of the Emperor\'s Ascension', vars: `--t-bg: #111111; --t-surface: #1A1A1A; --t-text: #FFC72C; --t-border: #AA0000; --t-primary: #FFC72C; --t-btn-bg: #AA0000; --t-btn-text: #FFFFFF;` },
            { date: '12-25', name: 'Sanguinala (The Red Feast)', vars: `--t-bg: #1A1A1A; --t-surface: #292929; --t-text: #F0F0F0; --t-border: #990000; --t-primary: #990000; --t-btn-bg: #990000; --t-btn-text: #F0F0F0;` },
            { date: '01-01', name: 'Candlemas (40K)', vars: `--t-bg: #292929; --t-surface: #444444; --t-text: #D3D3D3; --t-border: #C0C0C0; --t-primary: #C0C0C0; --t-btn-bg: #D3D3D3; --t-btn-text: #292929;` },
            { date: '03-01', name: 'Festival of Saints', vars: `--t-bg: #292929; --t-surface: #444444; --t-text: #B8860B; --t-border: #6A0DAD; --t-primary: #6A0DAD; --t-btn-bg: #B8860B; --t-btn-text: #292929;` },
            { date: '08-15', name: 'The Burning of Sins', vars: `--t-bg: #111111; --t-surface: #1A1A1A; --t-text: #36454F; --t-border: #CC5500; --t-primary: #CC5500; --t-btn-bg: #36454F; --t-btn-text: #FFFFFF;` },
            
            // Major Global Holidays (Priority 2)
            { date: '10-31', name: 'Halloween (Old Terran)', vars: `--t-bg: #0A0A0A; --t-surface: #1A1A1A; --t-text: #FF7518; --t-border: #800000; --t-primary: #FF7518; --t-btn-bg: #800000; --t-btn-text: #FAFAFA;` },
            { date: '12-26', name: 'Boxing Day (Old Terran)', vars: `--t-bg: #005900; --t-surface: #007A00; --t-text: #C0C0C0; --t-border: #ADD8E6; --t-primary: #ADD8E6; --t-btn-bg: #C0C0C0; --t-btn-text: #005900;` },
            { date: '02-14', name: 'Valentine\'s Day (Old Terran)', vars: `--t-bg: #8B0000; --t-surface: #A00000; --t-text: #FAFAFA; --t-border: #FFC0CB; --t-primary: #FFC0CB; --t-btn-bg: #FFC0CB; --t-btn-text: #8B0000;` },
            { date: '04-01', name: 'April Fools\' Day (Old Terran)', vars: `--t-bg: #D22B2E; --t-surface: #E03B3E; --t-text: #FADF00; --t-border: #5F00A3; --t-primary: #5F00A3; --t-btn-bg: #FADF00; --t-btn-text: #D22B2E;` },
            { date: '05-01', name: 'Beltane (Pagan/Old Terran)', vars: `--t-bg: #228B22; --t-surface: #329B32; --t-text: #FF8C00; --t-border: #DC143C; --t-primary: #DC143C; --t-btn-bg: #FF8C00; --t-btn-text: #228B22;` },
            
            // Other Single Day Observances (Priority 3)
            { date: '09-01', name: 'Labor Day (Old Terran)', vars: `--t-bg: #708090; --t-surface: #8292A2; --t-text: #FFFFFF; --t-border: #8B0000; --t-primary: #8B0000; --t-btn-bg: #FFFFFF; --t-btn-text: #8B0000;` },
            { date: '11-05', name: 'Guy Fawkes Night (Old Terran)', vars: `--t-bg: #222222; --t-surface: #333333; --t-text: #FFCC00; --t-border: #00FFFF; --t-primary: #00FFFF; --t-btn-bg: #FFCC00; --t-btn-text: #222222;` },
        ];
        
        // --- 3. CORE UTILITY FUNCTIONS (MOVED UP FOR SCOPE FIX) ---

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
            const up = ['\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306', '\u0310', '\u0352', '\u0357', '\u0351', '\u0307', '\u0308', '\u030a'];
            const mid = ['\u0315', '\u031b', '\u0340', '\u0341', '\u0358', '\u0321', '\u0322', '\u0327', '\u0328', '\u0334', '\u0335'];
            const down = ['\u0316', '\u0317', '\u0318', '\u0319', '\u031c', '\u031d', '\u031e', '\u031f', '\u0320', '\u0324', '\u0325'];
            let str = ''; for(let i = 0; i < text.length; i++) { str += text[i]; if(Math.random() < intensity) { const num = Math.floor(Math.random() * 2) + 1; for(let j=0; j<num; j++) str += up[Math.floor(Math.random() * up.length)]; for(let j=0; j<num; j++) str += mid[Math.floor(Math.random() * mid.length)]; for(let j=0; j<num; j++) str += down[Math.floor(Math.random() * down.length)]; } } return str;
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
        
        function downloadBridgeFiles() {
            const HTML_CONTENT = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Titan Forge</title><style>body{margin:0;display:flex;height:100vh;background:#1e1e1e;color:#ccc;font-family:\'Segoe UI\',sans-serif;overflow:hidden;flex-direction:column;justify-content:center;align-items:center}h1{color:#00FACE}</style></head><body><h1>Titan Forge</h1><p>Sync Ready. Edit files in Titan to see changes here.</p></body></html>';
            const JS_CONTENT = "const http=require('http'),fs=require('fs'),path=require('path');const P=3000,R='./';const clients=[];let fsWait=false;try{fs.watch(R,(e,f)=>{if(f&&!f.startsWith('.')&&f!=='local-host.js'){if(fsWait)return;fsWait=setTimeout(()=>{fsWait=false},100);clients.forEach(r=>r.write('data:r\\\\n\\\\n'))}})}catch(e){console.log('Watch Error',e)}const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.txt':'text/plain','.ts':'text/plain'};http.createServer((q,s)=>{const h={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'OPTIONS, GET, POST','Access-Control-Allow-Headers':'Content-Type'};if(q.method==='OPTIONS'){s.writeHead(204,h);return s.end()}if(q.url==='/__live'){s.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Access-Control-Allow-Origin':'*','Connection':'keep-alive'});clients.push(s);return}if(q.url==='/api/files'&&q.method==='GET'){try{const l=fs.readdirSync(R).filter(f=>!f.startsWith('.')&&f!=='node_modules');h['Content-Type']='application/json';s.writeHead(200,h);s.end(JSON.stringify(l))}catch(e){s.writeHead(500,h);s.end(JSON.stringify({error:e.message}))}return}if(q.url.startsWith('/api/file?')&&q.method==='GET'){const p=new URLSearchParams(q.url.split('?')[1]).get('path');if(!p){s.writeHead(400,h);s.end('No path');return}const sp=path.join(__dirname,R,path.normalize(p).replace(/^(\\.\\.[\\\\/])+/,''));fs.readFile(sp,'utf8',(e,d)=>{if(e){s.writeHead(404,h);s.end('Not Found')}else{h['Content-Type']='text/plain';s.writeHead(200,h);s.end(d)}});return}if(q.url==='/api/save'&&q.method==='POST'){let b='';q.on('data',c=>b+=c);q.on('end',()=>{try{const{filePath:f,content:c}=JSON.parse(b);const sp=path.join(__dirname,R,path.normalize(f).replace(/^(\\.\\.[\\\\/])+/,''));fs.writeFile(sp,c,e=>{if(e){s.writeHead(500,h);s.end('Write Error')}else{s.writeHead(200,h);s.end('Saved');console.log('[SAVED] '+f)}})}catch(e){s.writeHead(400,h);s.end('Invalid JSON')}});return}let rp=q.url==='/'?'monaco.html':q.url.split('?')[0];const fp=path.join(__dirname,R,rp);const ext=path.extname(fp);if(M[ext])h['Content-Type']=M[ext];else h['Content-Type']='text/plain';fs.readFile(fp,(e,c)=>{if(e){s.writeHead(404,h);s.end('404 Not Found')}else{if(ext==='.html')c+='<script>new EventSource(\"/__live\").onmessage=()=>location.reload()<\\/script>';s.writeHead(200,h);s.end(c)}})}).listen(P,()=>console.log('\\n--- BRIDGE ONLINE ---\\nEditor: http://localhost:'+P));";

            downloadFile(JS_CONTENT, 'local-host.js', 'application/javascript');
            setTimeout(() => {
                downloadFile(HTML_CONTENT, 'monaco.html', 'text/html');
            }, 500); 
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
            const today = new Date();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            const todayStr = `${month}-${day}`;
            
            const fixedMatch = HOLIDAY_THEMES.find(h => h.date === todayStr);
            if (fixedMatch) {
                console.log(`%c𓂀 TITAN: Temporal Theme Engaged: ${fixedMatch.name}`, `color: ${fixedMatch.vars.match(/--t-primary: (#......)/)?.[1] || '#00FACE'}; font-weight: bold;`);
                return fixedMatch.vars;
            }
            
            // Check for floating/range holidays (currently approximated)
            if (month === '10' && day >= '31' || month === '11' && day === '01') { // Samhain (Oct 31 - Nov 1)
                return `--t-bg: #1A1A1A; --t-surface: #292929; --t-text: #F0F0F0; --t-border: #FF4500; --t-primary: #FF4500; --t-btn-bg: #FF4500; --t-btn-text: #1A1A1A;`;
            }
            if (month === '12' && day >= '20' && day <= '23') { // Yule (Dec 20 - 23)
                return `--t-bg: #006400; --t-surface: #007A00; --t-text: #FFD700; --t-border: #B22222; --t-primary: #B22222; --t-btn-bg: #FFD700; --t-btn-text: #006400;`;
            }
            if (month === '08' && day >= '01' && day <= '02') { // Lughnasadh (Aug 1 - 2)
                return `--t-bg: #8B4513; --t-surface: #A15A2A; --t-text: #F5DEB3; --t-border: #DAA520; --t-primary: #DAA520; --t-btn-bg: #DAA520; --t-btn-text: #8B4513;`;
            }

            return null;
        }

        // --- 4. CORE CSS DEFINITION (Must be after getSeasonalTheme) ---
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

        // --- 5. MAIN LOGIC AND EXECUTION ---

        // Function definitions go here (as they are already defined above the call site)

        // --- SYSTEM CONTROLS ---
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
                            } else {
                                currentRam = 0; 
                            }
                            
                            stats.ram = currentRam;
                            
                            if (currentRam > 0 && currentRam > memoryLimit) { performPurge(); }
                            
                            if (currentRam > 0 && currentRam > (memoryLimit * 0.5)) garbageCollectMonaco();
                            
                            updateHud('ACTIVE'); 
                        } catch (e) {
                            console.warn("Titan Sensor Failure (Memory Check):", e);
                            stats.ram = 0; 
                            updateHud('ACTIVE'); 
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
            console.log("%c𓂀 TITAN: CACHE FLUSHED.", "color: #00FACE;");
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

        async function syncFile() {
            const msg = document.getElementById('titan-msg');
            
            let code = "";
            const m = getMonaco();
            if (m && m.editor) {
                const editors = m.editor.getEditors();
                const models = m.editor.getModels();
                if(editors.length > 0) {
                    const focused = editors.find(e => e.hasTextFocus());
                    if (focused) {
                        code = focused.getValue();
                    } else {
                        const activeModel = models[models.length - 1];
                        if (activeModel) {
                            code = activeModel.getValue();
                        }
                    }
                }
            }
            
            if (!code) {
                const domCode = document.querySelector('.monaco-editor .view-lines');
                if(domCode) {
                    code = domCode.innerText; 
                }
            }

            if (!code) {
                if(msg) { msg.textContent = "NO CODE FOUND"; msg.style.color = "#f00"; }
                return;
            }

            if(msg) { msg.textContent = `SYNCING...`; }
            
            try {
                const res = await fetch(`${BRIDGE_URL}/api/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ filePath: targetFile, content: code })
                });

                if (res.ok) {
                    if(msg) {
                        msg.textContent = `WROTE > ${targetFile}`;
                        msg.style.color = "#0f0";
                        setTimeout(() => { msg.textContent = "SYSTEM READY"; msg.style.color = "#888"; }, 2000);
                    }
                } else {
                    throw new Error(await res.text());
                }
            } catch (e) {
                if(msg) { msg.textContent = "BRIDGE OFFLINE"; msg.style.color = "#f00"; }
            }
        }

        function toggleOmniBar() {
            const omni = document.getElementById('titan-omni-bar');
            const input = document.getElementById('titan-omni-input');
            if(omni.style.display === 'flex') { omni.style.display = 'none'; }
            else { omni.style.display = 'flex'; input.value = ''; input.focus(); populateOmniResults(''); }
        }
        
        function populateOmniResults(filter) {
            const list = document.getElementById('titan-omni-results');
            while(list.firstChild) list.removeChild(list.firstChild);
            const cmds = [
                { t: 'System: Run', a: () => toggleSystem(true) },
                { t: 'System: Halt', a: () => toggleSystem(false) },
                { t: 'System: Clear Cache', a: clearTitanCache },
                { t: 'Sync File (Ctrl+S)', a: syncFile }, 
                { t: 'Toggle CRT Mode', a: toggleCRT },
                { t: 'Toggle Sidebar', a: () => document.querySelectorAll('#titan-bottom-bar button')[1]?.click() },
                { t: 'Toggle Header', a: () => document.querySelectorAll('#titan-bottom-bar button')[2]?.click() },
                { t: 'Float Editor', a: () => document.querySelectorAll('#titan-bottom-bar button')[4]?.click() },
                { t: 'Export Config', a: exportConfig },
                { t: 'Import Config', a: importConfig },
                { t: 'Reset Titan', a: () => { if(confirm('Reset?')) { localStorage.clear(); location.reload(); } } }
            ];
            Object.keys(THEMES).forEach(k => cmds.push({ t: 'Theme: ' + THEMES[k].label, a: () => { activeStudioTheme = k; applyStudioTheme(k); }}));
            
            const matches = cmds.filter(c => c.t.toLowerCase().includes(filter.toLowerCase()));
            matches.forEach(m => {
                const item = createEl('div', 'titan-omni-item', m.t);
                item.onclick = () => { m.a(); toggleOmniBar(); };
                list.appendChild(item);
            });
        }

        function constrainBounds(element, left, top) {
            const rect = element.getBoundingClientRect(); const winWidth = window.innerWidth; const winHeight = window.innerHeight;
            const newLeft = Math.max(0, Math.min(left, winWidth - rect.width)); const newTop = Math.max(0, Math.min(top, winHeight - rect.height));
            return { left: newLeft, top: newTop };
        }

        function makeDraggable(element, handle, savePosCallback) {
            let isDragging = false; let startX, startY, initialLeft, initialTop;
            const onMouseDown = (e) => {
                if (['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A'].includes(e.target.tagName)) return;
                isDragging = true; startX = e.clientX; startY = e.clientY;
                const rect = element.getBoundingClientRect(); initialLeft = rect.left; initialTop = rect.top;
                element.style.bottom = 'auto'; element.style.right = 'auto'; element.style.left = initialLeft + 'px'; element.style.top = initialTop + 'px';
                window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp);
            };
            const onMouseMove = (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startX; const dy = e.clientY - startY;
                let newLeft = initialLeft + dx; let newTop = initialTop + dy;
                const constrained = constrainBounds(element, newLeft, newTop);
                element.style.left = constrained.left + 'px'; element.style.top = constrained.top + 'px';
            };
            const onMouseUp = () => {
                isDragging = false;
                if (savePosCallback) { const rect = element.getBoundingClientRect(); savePosCallback({ left: rect.left + 'px', top: rect.top + 'px' }); }
                window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp);
            };
            handle.addEventListener('mousedown', onMouseDown);
        }

        function toggleMonacoFloat(btn) {
            isEditorFloating = !isEditorFloating;
            const editorContainer = document.querySelector('.console-right-panel'); 
            
            if (!editorContainer) { console.warn("TITAN: Console Right panel not found."); return; }
            
            if (isEditorFloating) {
                const floatWin = createEl('div', 'titan-glitch-active', '', {id: 'titan-monaco-float', 'data-titan-theme': activeTitanTheme});
                const header = createEl('div', '', '', {id: 'titan-monaco-header'});
                const title = createEl('span', 'titan-zalgo-text', zalgoify("MONACO::FLOAT"));
                const closeBtn = createEl('button', 'titan-zen-btn'); closeBtn.appendChild(createIcon('close')); closeBtn.onclick = () => toggleMonacoFloat(btn);
                header.appendChild(title); header.appendChild(closeBtn); floatWin.appendChild(header);
                
                const body = createEl('div', '', '', {id: 'titan-monaco-body'}); floatWin.appendChild(body);
                makeDraggable(floatWin, header); floatWin.style.resize = 'both';
                
                const placeholder = createEl('div', '', '', {id: 'titan-editor-placeholder', style: 'display:none'});
                editorContainer.parentNode.insertBefore(placeholder, editorContainer);
                
                body.appendChild(editorContainer); document.body.appendChild(floatWin);
                
                setTimeout(() => triggerMonacoLayout(), 50); 
                btn.replaceChildren(createIcon('dock_to_bottom')); btn.title = LOCALES[currentLocale].dock_editor;
            } else {
                const floatWin = document.getElementById('titan-monaco-float'); const placeholder = document.getElementById('titan-editor-placeholder');
                
                if (floatWin && placeholder) { 
                    const editorContainer = floatWin.querySelector('.console-right-panel'); 
                    if (editorContainer) placeholder.parentNode.insertBefore(editorContainer, placeholder); 
                    placeholder.remove(); floatWin.remove(); 
                    setTimeout(() => triggerMonacoLayout(), 50); 
                }
                btn.replaceChildren(createIcon('open_in_new')); btn.title = LOCALES[currentLocale].float;
            }
        }
        
        function toggleAbout() {
            const modal = document.getElementById('titan-about-overlay');
            const card = document.getElementById('titan-about-card');
            if(modal) {
                if(modal.classList.contains('visible')) { modal.classList.remove('visible'); setTimeout(() => modal.style.display = 'none', 200); }
                else { modal.style.display = 'flex'; requestAnimationFrame(() => { modal.classList.add('visible'); card.classList.add('titan-glitch-active'); card.focus(); }); }
            }
        }

        function injectZenControls() {
            const btnContainer = document.querySelector('.button-container');
            if (!btnContainer || btnContainer.querySelector('.titan-zen-wrapper')) return;
            const wrapper = createEl('div', 'titan-zen-wrapper');
            const btnSidebar = createEl('button', 'ms-button-borderless ms-button-icon', '', {'ms-button': '', title: LOCALES[currentLocale].sidebar}); btnSidebar.appendChild(createIcon('↹'));
            btnSidebar.onclick = () => { zenSidebar = !zenSidebar; const sidebar = document.querySelector('.console-left-panel'); if(sidebar) { sidebar.classList.toggle('titan-sidebar-hidden', zenSidebar); triggerMonacoLayout(); } btnSidebar.classList.toggle('active', zenSidebar); };
            const btnHeader = createEl('button', 'ms-button-borderless ms-button-icon', '', {'ms-button': '', title: LOCALES[currentLocale].header}); const headIcon = createIcon('expand_less'); btnHeader.appendChild(headIcon);
            btnHeader.onclick = () => { zenHeader = !zenHeader; const header = document.querySelector('.page-header'); if (header) { if (zenHeader) { header.classList.add('titan-header-hidden'); headIcon.textContent = 'expand_more'; } else { header.classList.remove('titan-header-hidden'); headIcon.textContent = 'expand_less'; } triggerMonacoLayout(); } };
            wrapper.appendChild(btnSidebar); wrapper.appendChild(btnHeader); btnContainer.prepend(wrapper);
        }

        function updateText() {
            const t = LOCALES[currentLocale]; if(!t) return;
            const lblCap = document.getElementById('lbl-cap'); if(lblCap) lblCap.textContent = t.cap;
            
            const btnRun = document.getElementById('btn-run'); if(btnRun) btnRun.textContent = t.run;
            const btnHalt = document.getElementById('btn-halt'); if(btnHalt) btnHalt.textContent = t.halt;
            const btnClr = document.getElementById('btn-clr'); if(btnClr) btnClr.textContent = t.clr;
            
            const btnCss = document.getElementById('btn-css'); if(btnCss) btnCss.textContent = t.css;
            const btnRst = document.getElementById('btn-rst'); if(btnRst) btnRst.textContent = t.rst;
            const btnCrt = document.getElementById('btn-crt'); if(btnCrt) btnCrt.textContent = t.crt;
            
            const ghostTitle = document.getElementById('ghost-title-span'); if(ghostTitle) { ghostTitle.textContent = t.link; if(Math.random() > 0.7) ghostTitle.textContent = zalgoify(t.link, 0.3); }
            const ghostDock = document.getElementById('ghost-dock-btn'); if(ghostDock) ghostDock.textContent = isDocked ? t.dock : t.free;
            const ghostInput = document.getElementById('ghost-textarea-v910'); if(ghostInput) ghostInput.placeholder = t.ready;
            const bottomZenBtns = document.querySelectorAll('#titan-bottom-bar .titan-zen-btn');
            if(bottomZenBtns.length >= 5) { 
                bottomZenBtns[0].title = t.about; 
                bottomZenBtns[1].title = t.sidebar; 
                bottomZenBtns[2].title = t.header; 
                bottomZenBtns[3].title = t.output; 
                bottomZenBtns[4].title = isEditorFloating ? t.dock_editor : t.float; 
            }
        }

        function initUI() {
            applyStudioTheme(activeStudioTheme); updateFontScope();
            if(crtEnabled) document.documentElement.classList.add('titan-crt-active');
            
            const hudContainer = createEl('div', 'titan-glitch-active', '', {id: 'titan-hud-v910', 'data-titan-theme': activeTitanTheme});
            if (savedHudPos.left && savedHudPos.top) { hudContainer.style.left = savedHudPos.left; hudContainer.style.top = savedHudPos.top; } 
            else { hudContainer.style.bottom = '15px'; hudContainer.style.right = '15px'; }
            Object.assign(hudContainer.style, { position: 'fixed', zIndex: '2147483647', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0', pointerEvents: 'auto' });
            document.body.appendChild(hudContainer);

            const infoPanel = createEl('div', '', '', {id: 'titan-panel-v910', 'data-titan-theme': activeTitanTheme});
            document.body.appendChild(infoPanel);
            
            // --- ROW 1: LOCALE ---
            const localeRow = createEl('div', 'titan-row');
            localeRow.appendChild(createEl('span', '', 'LANG:'));
            const localeSel = createEl('select', 'titan-select');
            Object.keys(LOCALES).forEach(k => { const opt = createEl('option', '', LOCALES[k].label, {value: k}); if(k === currentLocale) opt.selected = true; localeSel.appendChild(opt); });
            localeSel.onchange = (e) => { currentLocale = e.target.value; localStorage.setItem(LOCALE_STORAGE_KEY, currentLocale); updateText(); };
            localeRow.appendChild(localeSel); infoPanel.appendChild(localeRow);

            // --- ROW 2: MEMORY ---
            const controls = createEl('div', 'titan-row');
            const memLabel = createEl('span', '', LOCALES[currentLocale].cap, {id: 'lbl-cap'}); controls.appendChild(memLabel);
            const memSelect = createEl('select', 'titan-select', '', {style: 'width:auto'});
            for (let i = 1; i <= 16; i++) { const val = i * 256; const opt = createEl('option', '', val + "MB", {value: val}); if (val === 512) opt.selected = true; memSelect.appendChild(opt); }
            memSelect.onchange = (e) => { memoryLimit = parseInt(e.target.value); }; controls.appendChild(memSelect);
            infoPanel.appendChild(controls);
            
            // --- ROW 3: TACTICAL CONTROLS (Run/Halt/Clear) ---
            const tacticalRow = createEl('div', 'titan-row', '', {style:'justify-content: space-between; gap: 5px;'});
            const btnRun = createEl('button', 'titan-select', LOCALES[currentLocale].run, {id:'btn-run', style:'flex:1; border-color:#0f0'});
            btnRun.onclick = () => toggleSystem(true);
            const btnHalt = createEl('button', 'titan-select', LOCALES[currentLocale].halt, {id:'btn-halt', style:'flex:1; border-color:#f90'});
            btnHalt.onclick = () => toggleSystem(false);
            const btnClr = createEl('button', 'titan-select', LOCALES[currentLocale].clr, {id:'btn-clr', style:'flex:1;'});
            btnClr.onclick = clearTitanCache;
            tacticalRow.appendChild(btnRun); tacticalRow.appendChild(btnHalt); tacticalRow.appendChild(btnClr);
            infoPanel.appendChild(tacticalRow);

            // --- ROW 4: CONFIG CONTROLS (CRT/CSS/RST) ---
            const configRow = createEl('div', 'titan-row', '', {style:'justify-content: space-between; gap: 5px;'});
            const btnCrt = createEl('button', 'titan-select', LOCALES[currentLocale].crt, {id: 'btn-crt', style:'flex:1'});
            if(crtEnabled) btnCrt.classList.add('glow');
            btnCrt.onclick = toggleCRT;
            const editBtn = createEl('button', 'titan-select', LOCALES[currentLocale].css, {id: 'btn-css', style:'flex:1'});
            const resetBtn = createEl('button', 'titan-select', LOCALES[currentLocale].rst, {id: 'btn-rst', style: 'flex:1; border-color:red'});
            configRow.appendChild(btnCrt); configRow.appendChild(editBtn); configRow.appendChild(resetBtn); 
            infoPanel.appendChild(configRow);

            // --- ROW 5: SYNC TARGET ---
            const syncRow = createEl('div', 'titan-row', '', {style: 'margin-top: 5px; border-top: 1px dashed var(--t-primary); padding-top: 5px;'});
            const syncLbl = createEl('span', '', 'titan-label'); syncLbl.textContent = "TARGET:";
            const syncInp = createEl('input', 'titan-input', '', {value: targetFile}); 
            syncInp.value = targetFile; 
            syncInp.onchange = (e) => { targetFile = e.target.value; localStorage.setItem(TARGET_FILE_KEY, targetFile); };
            syncRow.appendChild(syncLbl); syncRow.appendChild(syncInp);
            infoPanel.appendChild(syncRow);

            // --- ROW 6: SYNC BUTTON ---
            const syncBtnRow = createEl('div', 'titan-row');
            const btnSync = createEl('button', 'titan-zen-btn', 'SYNC TO LOCAL (CTRL+S)', {style: "width: 100%; border-radius: 4px;"}); 
            btnSync.onclick = syncFile;
            syncBtnRow.appendChild(btnSync);
            infoPanel.appendChild(syncBtnRow);

            // --- ROW 7: FONTS ---
            const fontRow = createEl('div', 'titan-row titan-font-wrapper');
            const fontInput = createEl('input', 'titan-input', '', {placeholder: 'Font (Enter)', value: currentFont});
            const checkUI = createEl('label', 'titan-checkbox-label');
            const inputUI = createEl('input', '', '', {type: 'checkbox', checked: fontScopeUI});
            inputUI.onchange = (e) => { fontScopeUI = e.target.checked; updateFontScope(); };
            checkUI.appendChild(inputUI); checkUI.appendChild(document.createTextNode("UI"));
            const checkCode = createEl('label', 'titan-checkbox-label');
            const inputCode = createEl('input', '', '', {type: 'checkbox', checked: fontScopeCode});
            inputCode.onchange = (e) => { fontScopeCode = e.target.checked; updateFontScope(); };
            checkCode.appendChild(inputCode); checkCode.appendChild(document.createTextNode("Code"));
            const suggestionsBox = createEl('div', '', '', {id: 'titan-font-suggestions', 'data-titan-theme': activeTitanTheme});
            fontInput.addEventListener('input', (e) => {
                const val = e.target.value.toLowerCase(); while (suggestionsBox.firstChild) { suggestionsBox.removeChild(suggestionsBox.firstChild); }
                if(val.length < 1) { suggestionsBox.style.display = 'none'; return; }
                const matches = FONTS_JSON.items.filter(f => f.family.toLowerCase().includes(val));
                if(matches.length > 0) {
                    matches.slice(0, 10).forEach(item => {
                        const div = createEl('div', 'titan-font-option', item.family);
                        div.onclick = () => { fontInput.value = item.family; loadGoogleFont(item.family); suggestionsBox.style.display = 'none'; };
                        suggestionsBox.appendChild(div);
                    });
                    suggestionsBox.style.display = 'flex';
                } else { suggestionsBox.style.display = 'none'; }
            });
            fontInput.addEventListener('blur', () => setTimeout(() => suggestionsBox.style.display = 'none', 200));
            fontInput.onkeydown = (e) => { if(e.key === 'Enter') { loadGoogleFont(fontInput.value); suggestionsBox.style.display = 'none'; }};
            fontRow.appendChild(fontInput); fontRow.appendChild(checkUI); fontRow.appendChild(checkCode); fontRow.appendChild(suggestionsBox); infoPanel.appendChild(fontRow);

            const cssEditor = createEl('textarea', '', '', {id: 'titan-css-editor', style: 'display:none', spellcheck: 'false'});
            let customCSS = localStorage.getItem(CSS_STORAGE_KEY) || ""; cssEditor.value = customCSS;
            const customStyle = createEl('style', '', customCSS, {id: 'titan-styles-v910'}); document.head.appendChild(customStyle);
            editBtn.onclick = () => { isEditingCss = !isEditingCss; cssEditor.style.display = isEditingCss ? 'block' : 'none'; };
            cssEditor.addEventListener('input', () => { customStyle.textContent = cssEditor.value; localStorage.setItem(CSS_STORAGE_KEY, cssEditor.value); });
            resetBtn.onclick = () => { if(confirm("Reset?")) { localStorage.clear(); location.reload(); } };
            window.titanStatsContainer = createEl('div'); infoPanel.appendChild(window.titanStatsContainer); infoPanel.appendChild(cssEditor);

            // --- THEMES ---
            const themeRow = createEl('div', 'titan-theme-row');
            const titanThemeSel = createEl('select', 'titan-select');
            Object.keys(THEMES).forEach(key => { if(!key.startsWith('native')) { const opt = createEl('option', '', "T: " + THEMES[key].label, {value: key}); if(key === activeTitanTheme) opt.selected = true; titanThemeSel.appendChild(opt); } });
            titanThemeSel.onchange = (e) => {
                activeTitanTheme = e.target.value; hudContainer.setAttribute('data-titan-theme', activeTitanTheme); infoPanel.setAttribute('data-titan-theme', activeTitanTheme); localStorage.setItem(THEME_TITAN_KEY, activeTitanTheme);
                const ghost = document.getElementById('ghost-window-v910'); if(ghost) ghost.setAttribute('data-titan-theme', activeTitanTheme);
                const float = document.getElementById('titan-monaco-float'); if(float) float.setAttribute('data-titan-theme', activeTitanTheme);
                suggestionsBox.setAttribute('data-titan-theme', activeTitanTheme);
                document.getElementById('titan-about-card').setAttribute('data-titan-theme', activeTitanTheme);
                document.getElementById('titan-omni-bar').setAttribute('data-titan-theme', activeTitanTheme);
            };
            const studioThemeSel = createEl('select', 'titan-select');
            Object.keys(THEMES).forEach(key => { const opt = createEl('option', '', "S: " + THEMES[key].label, {value: key}); if(key === activeStudioTheme) opt.selected = true; studioThemeSel.appendChild(opt); });
            studioThemeSel.onchange = (e) => { applyStudioTheme(e.target.value); };
            themeRow.appendChild(titanThemeSel); themeRow.appendChild(studioThemeSel); infoPanel.appendChild(themeRow);
            
            // RAM Gauge
            const ramGauge = createEl('div', '', '', {id: 'titan-ram-gauge'});
            const ramFill = createEl('div', '', '', {id: 'titan-ram-fill'});
            ramGauge.appendChild(ramFill); infoPanel.appendChild(ramGauge);

            // --- TACTICAL TOOLBAR ---
            const bottomBar = createEl('div', '', '', {id: 'titan-bottom-bar'});
            
            const btnAbout = createEl('button', 'titan-zen-btn', '', {title: LOCALES[currentLocale].about});
            const qMark = createEl('span', '', '?', {style: 'font-weight:bold;font-size:14px'});
            btnAbout.appendChild(qMark); btnAbout.onclick = () => toggleAbout();

            const btnSidebar = createEl('button', 'titan-zen-btn', '', {'title': LOCALES[currentLocale].sidebar}); btnSidebar.appendChild(createIcon('↹'));
            btnSidebar.onclick = () => { zenSidebar = !zenSidebar; const sidebar = document.querySelector('.console-left-panel'); if(sidebar) { sidebar.classList.toggle('titan-sidebar-hidden', zenSidebar); triggerMonacoLayout(); } btnSidebar.classList.toggle('active', zenSidebar); };
            const btnHeader = createEl('button', 'titan-zen-btn', '', {'title': LOCALES[currentLocale].header}); const headIcon = createIcon('expand_less'); btnHeader.appendChild(headIcon);
            btnHeader.onclick = () => { zenHeader = !zenHeader; const header = document.querySelector('.page-header'); if (header) { if (zenHeader) { header.classList.add('titan-header-hidden'); headIcon.textContent = 'expand_more'; } else { header.classList.remove('titan-header-hidden'); headIcon.textContent = 'expand_less'; } triggerMonacoLayout(); } };
            const btnOutput = createEl('button', 'titan-zen-btn', '', {title: LOCALES[currentLocale].output}); btnOutput.appendChild(createIcon('chat_bubble_outline'));
            btnOutput.onclick = () => { zenOutput = !zenOutput; const output = document.querySelector('.output-container'); if(output) { output.classList.toggle('titan-output-hidden', zenOutput); window.dispatchEvent(new Event('resize')); } btnOutput.classList.toggle('active', zenOutput); };
            const btnFloat = createEl('button', 'titan-zen-btn', '', {title: LOCALES[currentLocale].float}); btnFloat.appendChild(createIcon('open_in_new'));
            btnFloat.onclick = () => toggleMonacoFloat(btnFloat);

            const toggleBtn = createEl('div', '', '𓅭', {id: 'titan-main-btn'});
            toggleBtn.onclick = () => {
                isHudOpen = !isHudOpen;
                if (isHudOpen) { 
                    toggleBtn.textContent = '𓅯';
                    const rect = hudContainer.getBoundingClientRect(); const screenHeight = window.innerHeight;
                    infoPanel.style.top = ''; infoPanel.style.bottom = ''; infoPanel.style.left = ''; infoPanel.style.right = '';
                    infoPanel.style.right = (window.innerWidth - rect.right) + 'px';
                    if (rect.top < screenHeight / 2) infoPanel.style.top = (rect.bottom + 10) + 'px'; else infoPanel.style.bottom = (window.innerHeight - rect.top + 10) + 'px';
                    setTimeout(() => { toggleBtn.textContent = '𓅮'; infoPanel.classList.add('visible'); triggerGlitch(infoPanel); }, 50); 
                }
                else { infoPanel.classList.remove('visible'); toggleBtn.textContent = '𓅯'; setTimeout(() => { toggleBtn.textContent = '𓅭'; }, 100); }
            };
            bottomBar.appendChild(btnAbout); bottomBar.appendChild(btnSidebar); bottomBar.appendChild(btnHeader); bottomBar.appendChild(btnOutput); bottomBar.appendChild(btnFloat); bottomBar.appendChild(toggleBtn);
            hudContainer.appendChild(bottomBar);

            makeDraggable(hudContainer, bottomBar, (pos) => { localStorage.setItem(HUD_POS_KEY, JSON.stringify(pos)); });
            
            // ABOUT MODAL
            const aboutOverlay = createEl('div', '', '', {id: 'titan-about-overlay'});
            const aboutCard = createEl('div', '', '', {id: 'titan-about-card', 'data-titan-theme': activeTitanTheme});
            const abHeader = createEl('div', 'titan-about-header');
            const abTitle = createEl('span', 'titan-about-title', 'TITAN PROTOCOL v910');
            const abClose = createEl('button', 'titan-zen-btn', '×');
            abClose.onclick = () => { aboutOverlay.classList.remove('visible'); setTimeout(()=>aboutOverlay.style.display='none', 200); };
            abHeader.appendChild(abTitle); abHeader.appendChild(abClose);
            const abScroll = createEl('div', 'titan-about-scroll');
            const createSection = (title, content) => {
                const h2 = createEl('span', 'titan-wp-h2', title); const p = createEl('span', 'titan-wp-p', content);
                abScroll.appendChild(h2); abScroll.appendChild(p);
            };
            createSection('1. ABSTRACT', 'Titan is the apex browser enhancement suite for Google AI Studio.');
            createSection('2. OBSERVER ENGINE', 'Replaced legacy interval loops with MutationObserver for zero-latency, low-overhead DOM reaction.');
            createSection('3. OMNI-BAR', 'Press Ctrl+K to access the command palette.');
            createSection('4. VISUAL RAM', 'Real-time heap visualization.');
            createSection('5. CRT HOLOLITH', 'Toggleable shader layer for maximum immersion.');
            
            // LOCAL BRIDGE SECTION (USES DOWNLOAD LOGIC)
            createSection('6. LOCAL BRIDGE', 'To enable local file editing, download the MALONE bridge files below and place them in your project directory. You will need Node.js.');
            
            const downloadBtn = createEl('button', 'titan-select', 'DOWNLOAD MALONE BRIDGE FILES (JS + HTML)');
            downloadBtn.style.cssText = 'width: 100%; margin-top: 10px; background: var(--t-bg); color: var(--t-primary); border-color: var(--t-primary);';
            downloadBtn.onclick = downloadBridgeFiles;
            abScroll.appendChild(downloadBtn);

            createSection('', 'Then ignite the bridge with:');
            const simpleCmd = createEl('div', 'titan-wp-code');
            simpleCmd.textContent = "node local-host.cjs"; // Testing file extension as .cjs
            abScroll.appendChild(simpleCmd);

            const abFooter = createEl('div', 'titan-about-footer');
            abFooter.appendChild(document.createTextNode('Forged by Armando Cornaglia'));
            abFooter.appendChild(document.createElement('br'));
            abFooter.appendChild(document.createTextNode('"From the moment I understood the weakness of my flesh, it disgusted me."'));
            aboutCard.appendChild(abHeader); aboutCard.appendChild(abScroll); aboutCard.appendChild(abFooter);
            aboutOverlay.appendChild(aboutCard); document.body.appendChild(aboutOverlay);

            // OMNI BAR
            const omniBar = createEl('div', '', '', {id: 'titan-omni-bar', 'data-titan-theme': activeTitanTheme});
            const omniInput = createEl('input', '', '', {id: 'titan-omni-input', placeholder: '> Execute Command'});
            const omniResults = createEl('div', '', '', {id: 'titan-omni-results'});
            omniInput.addEventListener('input', (e) => populateOmniResults(e.target.value));
            omniInput.addEventListener('keydown', (e) => { 
                if(e.key === 'Enter' && omniResults.firstChild) omniResults.firstChild.click();
                if(e.key === 'Escape') toggleOmniBar();
            });
            omniBar.appendChild(omniInput); omniBar.appendChild(omniResults); document.body.appendChild(omniBar);

            // CRT Layer
            const crtLayer = createEl('div', 'titan-crt-layer', '', {id: 'titan-crt-layer'});
        }

        function triggerGlitch(element) { element.classList.remove('titan-glitch-active'); void element.offsetWidth; element.classList.add('titan-glitch-active'); }
        function getElementByXPath(path) { return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue; }
        function alignToTarget() { if (!isDocked) return; const win = document.getElementById('ghost-window-v910'); if (!xpathTarget || !xpathTarget.isConnected) { xpathTarget = getElementByXPath(TARGET_XPATH); if (xpathTarget) angularInput = xpathTarget.querySelector('textarea'); } if (xpathTarget && win) { const rect = xpathTarget.getBoundingClientRect(); if (rect.width > 0) { win.style.top = (rect.top - HEADER_HEIGHT) + 'px'; win.style.left = rect.left + 'px'; win.style.width = rect.width + 'px'; win.style.height = (Math.max(rect.height, 60) + HEADER_HEIGHT) + 'px'; win.style.bottom = 'auto'; win.style.resize = 'none'; } } }
        function executeSend(inputElement) { if (isSending || !angularInput) return; isSending = true; angularInput.value = inputElement.value; angularInput.dispatchEvent(new Event('input', { bubbles: true })); setTimeout(() => { let btn = document.querySelector('.send-button'); if (!btn) { const allBtns = Array.from(document.querySelectorAll('button')); btn = allBtns.find(b => { const t = (b.innerText + (b.getAttribute('aria-label')||"")).toLowerCase(); return (t.includes('send') || b.innerHTML.includes('path') || b.innerHTML.includes('arrow_up')) && !t.includes('stop'); }); } if (btn) { btn.click(); inputElement.value = ""; } setTimeout(() => { isSending = false; }, 1000); }, 50); }
        function createGhostWindow() { if (document.getElementById('ghost-window-v910')) return; xpathTarget = getElementByXPath(TARGET_XPATH); if (xpathTarget) angularInput = xpathTarget.querySelector('textarea'); const win = createEl('div', 'titan-glitch-active', '', {id: 'ghost-window-v910', 'data-titan-theme': activeTitanTheme}); const header = createEl('div', '', '', {id: 'ghost-header-v910'}); const titleSpan = createEl('span', 'titan-zalgo-text', LOCALES[currentLocale].link, {id: 'ghost-title-span'}); const gripper = createEl('div', 'ghost-gripper', '::', {title: 'Drag Handle'}); const dockBtn = createEl('button', '', LOCALES[currentLocale].dock, {id: 'ghost-dock-btn'}); dockBtn.onclick = () => { isDocked = !isDocked; dockBtn.textContent = isDocked ? LOCALES[currentLocale].dock : LOCALES[currentLocale].free; if(isDocked) { win.classList.remove('undocked'); alignToTarget(); win.style.maxWidth = ''; win.style.maxHeight = '200px'; } else { win.classList.add('undocked'); const rect = win.getBoundingClientRect(); win.style.left = rect.left + 'px'; win.style.top = rect.top + 'px'; win.style.bottom = 'auto'; win.style.right = 'auto'; win.style.width = '300px'; win.style.height = '200px'; } }; header.appendChild(titleSpan); header.appendChild(gripper); header.appendChild(dockBtn); win.appendChild(header); const input = createEl('textarea', '', '', {id: 'ghost-textarea-v910', placeholder: LOCALES[currentLocale].ready}); if (angularInput) input.value = angularInput.value; win.appendChild(input); const sendBtn = createEl('button', '', '➤', {id: 'ghost-send-action'}); sendBtn.onclick = () => executeSend(input); win.appendChild(sendBtn); document.body.appendChild(win); if (!isDocked) { win.style.top = '50%'; win.style.left = '50%'; win.style.transform = 'translate(-50%, -50%)'; } let isDragging = false; let offset = {x:0, y:0}; const startDrag = (e) => { isDragging = true; if(isDocked) { isDocked = false; dockBtn.textContent = LOCALES[currentLocale].free; win.classList.add('undocked'); win.style.maxWidth = 'calc(100vw - 20px)'; win.style.maxHeight = 'calc(100vh - 20px)'; } const rect = win.getBoundingClientRect(); offset.x = e.clientX - rect.left; offset.y = e.clientY - rect.top; window.addEventListener('mousemove', doDrag); window.addEventListener('mouseup', stopDrag); }; const doDrag = (e) => { if (!isDragging) return; win.style.transform = 'none'; win.style.left = (e.clientX - offset.x) + 'px'; win.style.top = (e.clientY - offset.y) + 'px'; win.style.bottom = 'auto'; win.style.right = 'auto'; }; const stopDrag = () => { isDragging = false; window.removeEventListener('mousemove', doDrag); window.removeEventListener('mouseup', stopDrag); }; gripper.addEventListener('mousedown', startDrag); input.addEventListener('keydown', (e) => { e.stopImmediatePropagation(); if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) executeSend(input); }); input.addEventListener('input', (e) => { e.stopImmediatePropagation(); if (angularInput) angularInput.value = input.value; }); alignToTarget(); }
        function updateHud(statusText) { 
            if (!isHudOpen || !window.titanStatsContainer) return; 
            while (window.titanStatsContainer.firstChild) window.titanStatsContainer.removeChild(window.titanStatsContainer.firstChild); 
            const isCritical = stats.ram > memoryLimit; 
            
            const ramPercent = stats.ram > 0 ? Math.min((stats.ram / memoryLimit) * 100, 100) : 0;
            const fill = document.getElementById('titan-ram-fill'); 
            if(fill) { 
                fill.style.width = ramPercent + '%'; 
                fill.style.backgroundColor = ramPercent > 90 ? '#ff0000' : (ramPercent > 70 ? '#ffff00' : 'var(--t-primary)'); 
            }
            
            const ghostStatus = document.getElementById('ghost-window-v910') ? (isDocked ? 'DOCKED' : 'FREE') : 'MISSING'; 
            const bridgeStatus = isBridgeOnline ? LOCALES[currentLocale].online : LOCALES[currentLocale].offline;
            const bridgeColor = isBridgeOnline ? '#0f0' : '#f00';
            
            const lines = [ 
                { t: LOCALES[currentLocale].bridge + " " + bridgeStatus, c: bridgeColor },
                { t: "RAM :: " + stats.ram + "MB / " + memoryLimit + "MB", c: isCritical ? '#fff' : null, b: isCritical ? '#f00' : null }, 
                { t: "STATUS :: " + statusText, c: null }, 
                { t: "FLATTENED :: " + stats.flattened, c: null }, 
                { t: "PURGED :: " + stats.purged, c: null }, 
                { t: "MEDIA :: " + stats.mediaWiped, c: "#f90" }, 
                { t: "CHIPS :: " + stats.chipsHooked, c: "#0f0" }, 
                { t: "WINDOW :: " + ghostStatus, c: null } 
            ]; 
            lines.forEach(obj => { const div = createEl('div', '', obj.t); if (obj.c) div.style.color = obj.c; if (obj.b) div.style.backgroundColor = obj.b; window.titanStatsContainer.appendChild(div); }); 
        }

        let steamrollHandle = null;

        function steamroll() {
            if (typeof requestIdleCallback === 'function') {
                if (steamrollHandle) cancelIdleCallback(steamrollHandle);
                
                steamrollHandle = requestIdleCallback((deadline) => {
                    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
                    let node;
                    let processed = 0;
                    const MAX_NODES = 5; 

                    while(deadline.timeRemaining() > 0 && (node = walker.nextNode())) {
                        if (node.tagName === 'MS-CMARK-NODE' && !node.hasAttribute('data-titan-fixed') && node.children.length > MAX_NODES) {
                            const txt = node.innerText;
                            while(node.firstChild) node.removeChild(node.firstChild);
                            node.textContent = txt;
                            node.style.whiteSpace = 'pre-wrap';
                            node.setAttribute('data-titan-fixed', 'true');
                            processed++;
                        }
                    }
                    if (processed > 0) stats.flattened += processed;
                }, { timeout: 1000 }); 
            } else {
                const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
                let node;
                let processed = 0;
                const MAX_NODES = 5;
                const BATCH_LIMIT = 50; 
                while(node = walker.nextNode()) { 
                    if (processed >= BATCH_LIMIT) break;
                    if (node.tagName === 'MS-CMARK-NODE' && !node.hasAttribute('data-titan-fixed') && node.children.length > MAX_NODES) { 
                        const txt = node.innerText;
                        while(node.firstChild) node.removeChild(node.firstChild);
                        node.textContent = txt;
                        node.style.whiteSpace = 'pre-wrap';
                        node.setAttribute('data-titan-fixed', 'true');
                        processed++;
                    } 
                }
                if (processed > 0) stats.flattened += processed;
            }
        }
        
        function interceptChips() { document.querySelectorAll('button[data-test-id="suggestion-chip"]').forEach(btn => { if (btn.dataset.titanHooked) return; btn.dataset.titanHooked = "true"; stats.chipsHooked++; btn.addEventListener('click', (e) => { e.stopImmediatePropagation(); e.preventDefault(); const text = btn.innerText || btn.getAttribute('aria-label'); const ghostInput = document.getElementById('ghost-textarea-v910'); if (ghostInput) { ghostInput.value = text; ghostInput.focus(); if (angularInput) { angularInput.value = text; angularInput.dispatchEvent(new Event('input', { bubbles: true })); } } }, true); }); }
        function performPurge() { const ctn = document.querySelector('ms-autoscroll-container'); if (ctn) { Array.from(ctn.children).slice(0, -3).forEach(child => { if (child.style.contentVisibility !== 'hidden') { child.style.contentVisibility = 'hidden'; child.style.contain = 'strict'; child.style.containIntrinsicSize = '1px 50px'; child.querySelectorAll('img').forEach(img => { if(img.src) { img.src = ''; img.removeAttribute('srcset'); stats.mediaWiped++; } }); child.querySelectorAll('canvas').forEach(cvs => { cvs.width = 1; cvs.height = 1; }); child.innerHTML = ''; stats.purged++; } }); } }
        
        // --- OBSERVER ENGINE ---
        const observer = new MutationObserver((mutations) => {
            if (!document.getElementById('ghost-window-v910')) createGhostWindow();
            if (isDocked) alignToTarget();
            steamroll();
            interceptChips();
            injectZenControls();
        });
        window.titanObserver = observer;

        document.addEventListener('keydown', (e) => { 
            if (e.ctrlKey && e.shiftKey && e.code === 'Space') { const ghost = document.getElementById('ghost-window-v910'); if(ghost) { if(ghost.style.display === 'none') ghost.style.display = 'flex'; else ghost.style.display = 'none'; } } 
            if (e.ctrlKey && e.key === 'k') { e.preventDefault(); toggleOmniBar(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); e.stopPropagation(); syncFile(); }
        });

        // --- 6. EXECUTE BOOT SEQUENCE ---
        async function bootSequence() {
            const bootScreen = createEl('div', '', '', {id: 'titan-boot-screen'});
            const logo = createEl('div', 'titan-boot-logo', 'TITAN v910'); bootScreen.appendChild(logo);
            matrixDecrypt(logo, "TITAN v910.17"); 
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
