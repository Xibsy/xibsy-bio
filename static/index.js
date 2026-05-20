document.addEventListener('DOMContentLoaded', () => {

    // ══════════════════════════════════════════════════════════════════════════
    // 📁 ПУТИ К МЕДИАФАЙЛАМ НА ТВОЕМ СЕРВЕРЕ
    // ══════════════════════════════════════════════════════════════════════════
    const DEFAULT_AUDIO_URL      = "static/track.mp3";
    const DEFAULT_BACKGROUND_URL = "static/background.webm";

    let extractedRgbCache = null;

    // ─── СМЕНА ТЕМЫ ───
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon   = themeToggle ? themeToggle.querySelector('.material-symbols-rounded') : null;

    function setTheme(theme) {
        if (!themeIcon) return;
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            themeIcon.textContent = 'light_mode';
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            themeIcon.textContent = 'dark_mode';
            localStorage.setItem('theme', 'light');
        }
        if (extractedRgbCache) {
            applyDynamicMaterialPalette(extractedRgbCache);
        }
    }

    function initTheme() {
        const savedTheme  = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme((savedTheme === 'dark' || (!savedTheme && prefersDark)) ? 'dark' : 'light');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            setTheme(document.body.classList.contains('dark-theme') ? 'light' : 'dark');
        });
    }

    // ─── ДВИЖОК СМЕНЫ ФОНА ───
    const fullscreenBg = document.getElementById('fullscreenBg');

    function initBg() {
        if (!fullscreenBg || !DEFAULT_BACKGROUND_URL || DEFAULT_BACKGROUND_URL.trim() === "") return;

        document.body.classList.add('has-custom-bg');
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
        const lowerUrl = DEFAULT_BACKGROUND_URL.toLowerCase();
        const isVideo = videoExtensions.some(ext => lowerUrl.endsWith(ext) || lowerUrl.includes(ext + '?'));

        if (isVideo) {
            fullscreenBg.innerHTML = `
                <video autoplay loop muted playsinline class="fullscreen-bg-video">
                    <source src="${DEFAULT_BACKGROUND_URL}" type="video/${getFileExtension(lowerUrl)}">
                </video>
            `;
        } else {
            fullscreenBg.style.backgroundImage = `url('${DEFAULT_BACKGROUND_URL}')`;
        }
    }

    function getFileExtension(url) {
        const cleanUrl = url.split('?')[0];
        return cleanUrl.substring(cleanUrl.lastIndexOf('.') + 1);
    }

    // ─── ЭКСТРАКТОР ЦВЕТОВ (CANVAS API) ───
    function extractColorFromImage(imgElement) {
        if (!imgElement) return;
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 16; canvas.height = 16;
            ctx.drawImage(imgElement, 0, 0, 16, 16);

            const imgData = ctx.getImageData(0, 0, 16, 16).data;
            let r = 0, g = 0, b = 0, count = 0;

            for (let i = 0; i < imgData.length; i += 4) {
                const max = Math.max(imgData[i], imgData[i+1], imgData[i+2]);
                const min = Math.min(imgData[i], imgData[i+1], imgData[i+2]);
                if (max - min < 20 || max > 235 || min < 20) continue;
                r += imgData[i]; g += imgData[i+1]; b += imgData[i+2]; count++;
            }

            if (count === 0) {
                for (let i = 0; i < imgData.length; i += 4) {
                    r += imgData[i]; g += imgData[i+1]; b += imgData[i+2];
                }
                count = imgData.length / 4;
            }

            extractedRgbCache = { r: Math.round(r/count), g: Math.round(g/count), b: Math.round(b/count) };
            applyDynamicMaterialPalette(extractedRgbCache);
        } catch (e) {
            console.log("Локальный запуск (CORS): Цвета подбираются из дефолтных токенов темы.");
        }
    }

    const trackCoverEl = document.getElementById('trackCover');
    if (trackCoverEl) {
        trackCoverEl.onload = function() { extractColorFromImage(trackCoverEl); };
    }

    const avatarImgEl = document.getElementById('avatarImg');
    if (avatarImgEl) {
        if (avatarImgEl.complete) { extractColorFromImage(avatarImgEl); }
        else { avatarImgEl.onload = function() { extractColorFromImage(avatarImgEl); }; }
    }

    function applyDynamicMaterialPalette(rgb) {
        let r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) { h = s = 0; }
        else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
            else if (max === g) h = (b - r) / d + 2;
            else h = (r - g) / d + 4;
            h /= 6;
        }

        h = Math.round(h * 360); s = Math.round(s * 100);
        s = Math.max(35, Math.min(s, 65));
        const isDark = document.body.classList.contains('dark-theme');

        if (isDark) {
            document.documentElement.style.setProperty('--md-primary', `hsl(${h}, ${s}%, 75%)`);
            document.documentElement.style.setProperty('--md-primary-container', `hsl(${h}, ${s}%, 22%)`);
            document.documentElement.style.setProperty('--md-on-primary', `hsl(${h}, ${s}%, 15%)`);
        } else {
            document.documentElement.style.setProperty('--md-primary', `hsl(${h}, ${s}%, 38%)`);
            document.documentElement.style.setProperty('--md-primary-container', `hsl(${h}, ${s}%, 92%)`);
            document.documentElement.style.setProperty('--md-on-primary', `#FFFFFF`);
        }
    }

    // ─── ПАРСЕР ТЕГОВ АУДИОФАЙЛА ───
    const audioElement = document.getElementById('audio-track');
    const trackTitleEl = document.getElementById('trackTitle');
    const trackAuthorEl= document.getElementById('trackAuthor');
    const defaultIconEl= document.getElementById('default-disc-icon');

    async function loadAudioAndParseMetadata() {
        if (!audioElement || !DEFAULT_AUDIO_URL) return;
        audioElement.src = DEFAULT_AUDIO_URL;

        try {
            const response = await fetch(DEFAULT_AUDIO_URL);
            const buffer = await response.arrayBuffer();
            const view = new DataView(buffer);

            if (view.getUint8(0) === 0x49 && view.getUint8(1) === 0x44 && view.getUint8(2) === 0x33) {
                const version = view.getUint8(3);
                const tagSize = ((view.getUint8(6) & 0x7F) << 21) | ((view.getUint8(7) & 0x7F) << 14) | ((view.getUint8(8) & 0x7F) << 7) | (view.getUint8(9) & 0x7F);
                let offset = 10;
                let parsedTitle = '', parsedArtist = '', parsedCoverUrl = '';

                while (offset < tagSize + 10 && offset < buffer.byteLength) {
                    let frameID = '';
                    for (let i = 0; i < 4; i++) frameID += String.fromCharCode(view.getUint8(offset + i));
                    if (frameID === '\x00\x00\x00\x00' || !/[A-Z0-9]{4}/.test(frameID)) break;

                    let frameSize = (version === 4)
                        ? ((view.getUint8(offset + 4) & 0x7F) << 21) | ((view.getUint8(offset + 5) & 0x7F) << 14) | ((view.getUint8(offset + 6) & 0x7F) << 7) | (view.getUint8(offset + 7) & 0x7F)
                        : view.getUint32(offset + 4);

                    if (frameSize <= 0 || offset + 10 + frameSize > buffer.byteLength) break;
                    const dataOffset = offset + 10;

                    if (frameID === 'TIT2') parsedTitle = decodeID3Text(buffer, dataOffset, frameSize);
                    else if (frameID === 'TPE1') parsedArtist = decodeID3Text(buffer, dataOffset, frameSize);
                    else if (frameID === 'APIC') parsedCoverUrl = decodeID3APIC(buffer, dataOffset, frameSize);

                    offset += 10 + frameSize;
                }

                if (trackTitleEl) trackTitleEl.textContent = parsedTitle || "Неизвестный трек";
                if (trackAuthorEl) trackAuthorEl.textContent = parsedArtist || "Локальный исполнитель";

                if (parsedCoverUrl && trackCoverEl && defaultIconEl) {
                    trackCoverEl.src = parsedCoverUrl;
                    trackCoverEl.style.display = 'block';
                    defaultIconEl.style.display = 'none';
                } else fallbackMetadata();
            } else fallbackMetadata();
        } catch (e) { fallbackMetadata(); }
    }

    function decodeID3Text(buffer, offset, size) {
        if (size <= 1) return "";
        const encoding = new DataView(buffer).getUint8(offset);
        const data = new Uint8Array(buffer, offset + 1, size - 1);
        let text = new TextDecoder(encoding === 1 || encoding === 2 ? 'utf-16' : (encoding === 3 ? 'utf-8' : 'windows-1251')).decode(data).replace(/\0/g, '').trim();
        if (text.charCodeAt(0) === 0xFEFF || text.charCodeAt(0) === 0xFFFE) text = text.substring(1);
        return text;
    }

    function decodeID3APIC(buffer, offset, size) {
        const view = new DataView(buffer);
        let curr = offset + 1;
        while (view.getUint8(curr) !== 0 && curr < offset + size) curr++;
        curr += 2;
        while (view.getUint8(curr) !== 0 && curr < offset + size) curr++;
        curr++;
        const imgSize = size - (curr - offset);
        return imgSize <= 0 ? '' : URL.createObjectURL(new Blob([new Uint8Array(buffer, curr, imgSize)], { type: 'image/jpeg' }));
    }

    function fallbackMetadata() {
        const filename = DEFAULT_AUDIO_URL.substring(DEFAULT_AUDIO_URL.lastIndexOf('/') + 1).replace('.mp3', '');
        if (trackTitleEl) trackTitleEl.textContent = filename.split('-')[1]?.trim() || filename;
        if (trackAuthorEl) trackAuthorEl.textContent = filename.split('-')[0]?.trim() || "Локальный файл";
        if (trackCoverEl) trackCoverEl.style.display = 'none';
        if (defaultIconEl) defaultIconEl.style.display = 'inline-flex';
        extractColorFromImage(avatarImgEl);
    }

    // ─── ТАБЫ И СКИЛЛЫ ───
    const tabs = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');
    const skillBars = document.querySelectorAll('.skill-bar-fill');

    function animateSkills() {
        skillBars.forEach(bar => {
            const targetWidth = bar.getAttribute('data-width');
            if (targetWidth) bar.style.width = targetWidth + '%';
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const targetPane = document.getElementById(tab.dataset.tab);
            if (targetPane) targetPane.classList.add('active');

            if (tab.dataset.tab === 'info') setTimeout(animateSkills, 50);
            else skillBars.forEach(b => b.style.width = '0%');
        });
    });

    setTimeout(animateSkills, 300);

    // ─── ПЛЕЕР И АНИМАЦИИ СИНХРОНИЗАЦИИ ───
    const playerSection = document.querySelector('.music-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const progressBarFlat = document.getElementById('progress-bar-flat');
    const progressBarWave = document.getElementById('progress-bar-wave');
    const progressThumb = document.getElementById('progress-thumb');
    const progressContainer = document.getElementById('progress-container');
    const timeDisplay = document.getElementById('time-display');
    const discIcon = document.querySelector('.disc-icon');

    function setPlaybackAnimations(run) {
        const state = run ? 'running' : 'paused';
        if (trackCoverEl) trackCoverEl.style.animationPlayState = state;
        if (discIcon) discIcon.style.animationPlayState = state;
    }

    setPlaybackAnimations(false);

    if (playPauseBtn && audioElement) {
        playPauseBtn.addEventListener('click', () => {
            if (audioElement.paused) {
                audioElement.play().catch(() => {});
                if (playIcon) playIcon.textContent = 'pause';
                if (playerSection) playerSection.classList.add('is-playing');
                setPlaybackAnimations(true);
            } else {
                audioElement.pause();
                if (playIcon) playIcon.textContent = 'play_arrow';
                if (playerSection) playerSection.classList.remove('is-playing');
                setPlaybackAnimations(false);
            }
        });
    }

    if (audioElement) {
        audioElement.addEventListener('timeupdate', () => {
            if (!isDragging && progressBarFlat && progressBarWave && progressThumb) {
                const percent = (audioElement.currentTime / audioElement.duration) * 100;
                progressBarFlat.style.width = `${percent}%`;
                progressBarWave.style.width = `${percent}%`;
                progressThumb.style.left = `${percent}%`;
            }
            if (timeDisplay) {
                const mins = Math.floor(audioElement.currentTime / 60);
                const secs = Math.floor(audioElement.currentTime % 60);
                timeDisplay.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
            }
        });

        audioElement.addEventListener('ended', () => {
            if (playIcon) playIcon.textContent = 'play_arrow';
            if (playerSection) playerSection.classList.remove('is-playing');
            if (progressBarFlat) progressBarFlat.style.width = '0%';
            if (progressBarWave) progressBarWave.style.width = '0%';
            if (progressThumb) progressThumb.style.left = '0%';
            setPlaybackAnimations(false);
        });
    }

    // Скраббинг ползунка
    let isDragging = false;

    function handleScrubbing(e) {
        if (!progressContainer || !audioElement || !audioElement.duration) return;
        const rect = progressContainer.getBoundingClientRect();
        let clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
        let offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = (offsetX / rect.width) * 100;

        if (progressBarFlat) progressBarFlat.style.width = `${percent}%`;
        if (progressBarWave) progressBarWave.style.width = `${percent}%`;
        if (progressThumb) progressThumb.style.left = `${percent}%`;
        audioElement.currentTime = (offsetX / rect.width) * audioElement.duration;
    }

    if (progressContainer) {
        progressContainer.addEventListener('mousedown', (e) => { isDragging = true; progressContainer.classList.add('is-dragging'); handleScrubbing(e); });
        window.addEventListener('mousemove', (e) => { if (isDragging) handleScrubbing(e); });
        window.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; progressContainer.classList.remove('is-dragging'); } });
        progressContainer.addEventListener('touchstart', (e) => { isDragging = true; progressContainer.classList.add('is-dragging'); handleScrubbing(e); }, { passive: true });
        window.addEventListener('touchmove', (e) => { if (isDragging) handleScrubbing(e); }, { passive: true });
        window.addEventListener('touchend', () => { if (isDragging) { isDragging = false; progressContainer.classList.remove('is-dragging'); } });
    }

    // Touch превью проектов на телефонах
    document.querySelectorAll('.project-card').forEach(card => {
        let touched = false;
        card.addEventListener('click', (e) => {
            if (e.target.closest('a, .project-link--wip')) return;
            if (!window.matchMedia('(hover: none)').matches) return;
            touched = !touched;
            card.classList.toggle('touch-preview', touched);
        });
    });

    // Безопасная инициализация
    initTheme();
    initBg();
    loadAudioAndParseMetadata();
});