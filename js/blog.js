// ─── TRANSLATIONS (nav + blog index strings) ─────────────────────────────────
// To add a new language: add an object here and update the toggle logic below.
const translations = {
    en: {
        'nav-about':        'About Us',
        'nav-blog':         'Blog',
        'lang-btn-label':   'TH',
        'lang-btn-aria':    'Switch to Thai',
        'theme-light-aria': 'Switch to light mode',
        'theme-dark-aria':  'Switch to dark mode',
        'footer-links':     'Our links',
        'footer-about':     'About Us',
        'footer-socials':   'Our Socials',
        'footer-community': 'Our Community',
        'footer-copyright': 'All rights reserved.',
        'footer-org':       'A subsidiary of Sriwisa Group.',
        'blog-subtitle':    'News, updates, and stories from the Thai Roblox community.',
        'tag-all':          'All',
        'no-results':       'No posts match this tag.',
        'min-read':         'min read',
    },
    th: {
        'nav-about':        'เกี่ยวกับเรา',
        'nav-blog':         'บล็อก',
        'lang-btn-label':   'EN',
        'lang-btn-aria':    'Switch to English',
        'theme-light-aria': 'เปลี่ยนเป็นโหมดสว่าง',
        'theme-dark-aria':  'เปลี่ยนเป็นโหมดมืด',
        'footer-links':     'ลิงก์ของเรา',
        'footer-about':     'เกี่ยวกับเรา',
        'footer-socials':   'โซเชียลมีเดีย',
        'footer-community': 'ชุมชนของเรา',
        'footer-copyright': 'สงวนลิขสิทธิ์',
        'footer-org':       'บริษัทในเครือ Sriwisa Group',
        'blog-subtitle':    'ข่าวสาร อัปเดต และเรื่องราวจากชุมชน Roblox ในประเทศไทย',
        'tag-all':          'ทั้งหมด',
        'no-results':       'ไม่พบโพสต์ที่ตรงกับแท็กนี้',
        'min-read':         'นาทีโดยประมาณในการอ่าน',
    }
};

let currentLang = localStorage.getItem('lang') || 'en';

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang][key] !== undefined) {
            el.textContent = translations[lang][key];
        }
    });

    const langBtn = document.getElementById('langToggle');
    if (langBtn) {
        langBtn.textContent = translations[lang]['lang-btn-label'];
        langBtn.setAttribute('aria-label', translations[lang]['lang-btn-aria']);
    }

    updateThemeLabel();
}

document.getElementById('langToggle')?.addEventListener('click', () => {
    applyLanguage(currentLang === 'en' ? 'th' : 'en');
});

// ─── THEME ────────────────────────────────────────────────────────────────────
function updateThemeLabel() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const key = document.documentElement.dataset.theme === 'dark' ? 'theme-light-aria' : 'theme-dark-aria';
    btn.setAttribute('aria-label', translations[currentLang][key]);
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
    updateThemeLabel();
}

document.getElementById('themeToggle')?.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

// ─── NAV SCROLL BORDER ────────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ─── FOOTER YEAR ─────────────────────────────────────────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ─── FORMAT DATE ─────────────────────────────────────────────────────────────
function formatDate(dateStr, lang) {
    const locale = lang === 'th' ? 'th-TH' : 'en-US';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

// ─── BUILD POST LIST ──────────────────────────────────────────────────────────
// posts is the array from posts.json. This function renders the <li> items
// and the tag filter buttons, then wires up the filtering logic.
function renderBlog(posts) {
    const list        = document.getElementById('postsList');
    const filtersEl   = document.getElementById('tagFilters');
    const noResults   = document.getElementById('noResults');

    if (!list || !filtersEl) return;

    // Collect all unique tags across all posts, preserving insertion order
    const allTags = [...new Set(posts.flatMap(p => p.tags))];

    // Render tag filter buttons
    const allBtn = document.createElement('button');
    allBtn.className = 'tag-btn';
    allBtn.setAttribute('aria-pressed', 'true');
    allBtn.dataset.tag = 'all';
    allBtn.dataset.i18n = 'tag-all';
    allBtn.textContent = translations[currentLang]['tag-all'];
    filtersEl.appendChild(allBtn);

    allTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'tag-btn';
        btn.setAttribute('aria-pressed', 'false');
        btn.dataset.tag = tag;
        btn.textContent = tag;
        filtersEl.appendChild(btn);
    });

    // Render post list items
    posts.forEach(post => {
        const li = document.createElement('li');
        li.className = 'post-item';
        // data-tags is space-separated for fast matching
        li.dataset.tags = post.tags.join(' ');

        const tagPills = post.tags
            .map(t => `<span class="post-tag-pill">${t}</span>`)
            .join('');

        li.innerHTML = `
            <time class="post-date" datetime="${post.date}">${formatDate(post.date, currentLang)}</time>
            <div class="post-body">
                <a href="${post.path}" class="post-link">${post.title}</a>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-footer-meta">
                    <span>${post.author}</span>
                    <span class="sep">·</span>
                    <span>${post.readTime} <span data-i18n="min-read">${translations[currentLang]['min-read']}</span></span>
                    <span class="sep">·</span>
                    <div class="post-tags">${tagPills}</div>
                </div>
            </div>
        `;
        list.appendChild(li);
    });

    // ─── TAG FILTERING ────────────────────────────────────────────────────────
    // Pure DOM show/hide — no re-renders, no network, instant.
    const items = list.querySelectorAll('.post-item');

    function filterByTag(tag) {
        let visibleCount = 0;

        items.forEach(item => {
            const match = tag === 'all' || item.dataset.tags.split(' ').includes(tag);
            item.hidden = !match;
            if (match) visibleCount++;
        });

        // Update button pressed state
        filtersEl.querySelectorAll('.tag-btn').forEach(btn => {
            btn.setAttribute('aria-pressed', btn.dataset.tag === tag ? 'true' : 'false');
        });

        if (noResults) noResults.hidden = visibleCount > 0;
    }

    filtersEl.addEventListener('click', e => {
        const btn = e.target.closest('.tag-btn');
        if (!btn) return;
        filterByTag(btn.dataset.tag);
    });
}

// ─── FETCH POSTS ─────────────────────────────────────────────────────────────
fetch('/blog/posts.json')
    .then(res => {
        if (!res.ok) throw new Error('Failed to load posts');
        return res.json();
    })
    .then(data => renderBlog(data.posts))
    .catch(() => {
        const list = document.getElementById('postsList');
        if (list) list.innerHTML = '<li class="no-results">Could not load posts. Please try again later.</li>';
    });

// ─── INIT ────────────────────────────────────────────────────────────────────
applyLanguage(currentLang);
updateThemeLabel();
