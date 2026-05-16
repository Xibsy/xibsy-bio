// index.js — тёмная тема, анимация, навигация

const topAppBar = document.getElementById('topAppBar');
const menuBtn   = document.getElementById('menuBtn');
const topNav    = document.getElementById('topNav');
const navLinks  = topNav.querySelectorAll('a');
const sections  = document.querySelectorAll('section[id]');
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = themeToggle.querySelector('.material-symbols-rounded');

// ─── ТЁМНАЯ ТЕМА ───────────────────────────────
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        themeIcon.textContent = 'light_mode';
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        themeIcon.textContent = 'dark_mode';
        localStorage.setItem('theme', 'light');
    }
}

function initTheme() {
    const savedTheme  = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
}

themeToggle.addEventListener('click', () => {
    setTheme(document.body.classList.contains('dark-theme') ? 'light' : 'dark');
});

// ─── APP BAR SHADOW ─────────────────────────────
function updateAppBarShadow() {
    topAppBar.classList.toggle('scrolled', window.scrollY > 20);
}
window.addEventListener('scroll', updateAppBarShadow, { passive: true });

// ─── MOBILE MENU ─────────────────────────────────
menuBtn.addEventListener('click', () => {
    topNav.classList.toggle('open');
    menuBtn.querySelector('.material-symbols-rounded').textContent =
        topNav.classList.contains('open') ? 'close' : 'menu';
});
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        topNav.classList.remove('open');
        menuBtn.querySelector('.material-symbols-rounded').textContent = 'menu';
    });
});

// ─── ACTIVE NAV LINK ─────────────────────────────
function updateActiveNavLink() {
    const scrollPos = window.scrollY + 120;
    let current = '';

    sections.forEach(section => {
        if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => link.classList.remove('active'));

    if (window.scrollY < 200) {
        const heroLink = topNav.querySelector('a[href="#hero"]');
        if (heroLink) heroLink.classList.add('active');
    } else if (current) {
        const activeLink = topNav.querySelector(`a[href="#${current}"]`);
        if (activeLink) activeLink.classList.add('active');
    }
}
window.addEventListener('scroll', updateActiveNavLink, { passive: true });

// ─── SCROLL ANIMATIONS ───────────────────────────
const appearObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            appearObserver.unobserve(entry.target);
        }
    });
}, { root: null, rootMargin: '0px 0px -60px 0px', threshold: 0.12 });

document.querySelectorAll('.animate-on-scroll').forEach(el => appearObserver.observe(el));

// ─── SKILL BARS ──────────────────────────────────
const skillBars = document.querySelectorAll('.skill-card__bar-fill');
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target;
            const target = bar.getAttribute('data-width');
            if (target) bar.style.width = target + '%';
            skillObserver.unobserve(bar);
        }
    });
}, { threshold: 0.3 });

skillBars.forEach(bar => {
    bar.style.width = '0%';
    skillObserver.observe(bar);
});

// ─── PROJECT CARD: touch support для мобильных ───
// На мобиле нет hover — тап переключает превью
document.querySelectorAll('.project-card').forEach(card => {
    let touched = false;
    card.addEventListener('click', (e) => {
        // Если клик по ссылке — не перехватываем
        if (e.target.closest('a, .project-link--wip')) return;

        // Только на тач-устройствах переключаем превью
        if (!window.matchMedia('(hover: none)').matches) return;

        touched = !touched;
        card.classList.toggle('touch-preview', touched);
    });
});

// Добавляем CSS для touch-preview
const touchStyle = document.createElement('style');
touchStyle.textContent = `
    .project-card.touch-preview .project-card__screenshot { opacity: 1; }
    .project-card.touch-preview .project-card__default    { opacity: 0; }
`;
document.head.appendChild(touchStyle);

// ─── INIT ─────────────────────────────────────────
initTheme();
updateAppBarShadow();
updateActiveNavLink();