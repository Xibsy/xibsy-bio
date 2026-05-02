// index.js — тёмная тема, анимация, форма

const topAppBar = document.getElementById('topAppBar');
const menuBtn = document.getElementById('menuBtn');
const topNav = document.getElementById('topNav');
const navLinks = topNav.querySelectorAll('a');
const sections = document.querySelectorAll('section[id]');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.material-symbols-rounded');

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
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
}

themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-theme');
    setTheme(isDark ? 'light' : 'dark');
});

// App bar shadow
function updateAppBarShadow() {
    if (window.scrollY > 20) topAppBar.classList.add('scrolled');
    else topAppBar.classList.remove('scrolled');
}
window.addEventListener('scroll', updateAppBarShadow);

// Mobile menu
menuBtn.addEventListener('click', () => {
    topNav.classList.toggle('open');
    const icon = menuBtn.querySelector('.material-symbols-rounded');
    icon.textContent = topNav.classList.contains('open') ? 'close' : 'menu';
});
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        topNav.classList.remove('open');
        if (menuBtn.querySelector('.material-symbols-rounded'))
            menuBtn.querySelector('.material-symbols-rounded').textContent = 'menu';
    });
});

// Active nav link on scroll
function updateActiveNavLink() {
    let current = '';
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height)
            current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
    if (window.scrollY < 200) {
        navLinks.forEach(l => l.classList.remove('active'));
        const heroLink = topNav.querySelector('a[href="#hero"]');
        if (heroLink) heroLink.classList.add('active');
    }
}
window.addEventListener('scroll', updateActiveNavLink);

// Intersection Observer для анимации появления
const observerOptions = { root: null, rootMargin: '0px 0px -60px 0px', threshold: 0.15 };
const appearObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            appearObserver.unobserve(entry.target);
        }
    });
}, observerOptions);
document.querySelectorAll('.animate-on-scroll').forEach(el => appearObserver.observe(el));

// Skill bars animation
const skillBars = document.querySelectorAll('.skill-card__bar-fill');
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target;
            const targetWidth = bar.getAttribute('data-width');
            if (targetWidth) bar.style.width = targetWidth + '%';
            skillObserver.unobserve(bar);
        }
    });
}, { threshold: 0.3 });
skillBars.forEach(bar => {
    bar.style.width = '0%';
    skillObserver.observe(bar);
});

// Form submit handler
window.handleSubmit = function(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span class="material-symbols-rounded">check_circle</span> Отправлено!';
    btn.style.backgroundColor = '#4CAF50';
    btn.style.color = '#fff';
    btn.disabled = true;
    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.backgroundColor = '';
        btn.style.color = '';
        btn.disabled = false;
        event.target.reset();
    }, 2500);
};

// init
initTheme();
updateAppBarShadow();
updateActiveNavLink();