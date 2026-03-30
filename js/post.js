// post.js — loaded on every individual blog post page.
// Requires: marked.js loaded before this script in the <head>.
// Requires: window.POST_CONFIG = { contentPath: './content.md' } set inline in the post's <head>.

// ─── TRANSLATIONS (nav + post strings) ───────────────────────────────────────
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
        'back-to-blog':     '← Blog',
        'min-read':         'min read',
        'prev-post':        'Previous',
        'next-post':        'Next',
        'contact-prompt':   'Have a question or story to share?',
        'contact-cta':      'Get in touch',
        'error-msg':        'This post could not be loaded.',
        'error-link':       'Back to the blog',
    },
    th: {
        'nav-about':        'เกี่ยวกับเรา',
        'nav-blog':         'บล็อก',
        'lang-btn-label':   'EN',
        'lang-btn-aria':    'Switch to English',
        'theme-light-aria': 'เปลี่ยนเป็นโหมดสว่าง',
        'theme-dark-aria':  'เปลี่ยนเป็นโหมดมืด',
        'footer-links':     'ลิงค์ของเรา',
        'footer-about':     'เกี่ยวกับเรา',
        'footer-socials':   'โซเชียลมีเดีย',
        'footer-community': 'ชุมชนของเรา',
        'footer-copyright': 'สงวนลิขสิทธิ์',
        'footer-org':       'บริษัทในเครือ Sriwisa Group',
        'back-to-blog':     '← บล็อก',
        'min-read':         'นาทีโดยประมาณในการอ่าน',
        'prev-post':        'บทความก่อนหน้า',
        'next-post':        'บทความถัดไป',
        'contact-prompt':   'มีคำถามหรืออยากแชร์เรื่องราว?',
        'contact-cta':      'ติดต่อเรา',
        'error-msg':        'ไม่สามารถโหลดบทความนี้ได้',
        'error-link':       'กลับไปที่บล็อก',
    }
};

let currentLang = localStorage.getItem('lang') || 'en';

function t(key) {
    return translations[currentLang][key] ?? key;
}

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang][key] !== undefined) el.textContent = translations[lang][key];
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

// ─── NAV / FOOTER SHARED SETUP ────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ─── READING PROGRESS ─────────────────────────────────────────────────────────
const progressBar = document.createElement('div');
progressBar.className = 'reading-progress';
progressBar.setAttribute('role', 'progressbar');
progressBar.setAttribute('aria-hidden', 'true');
document.body.prepend(progressBar);

window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (total <= 0) return;
    progressBar.style.width = Math.min(100, (window.scrollY / total) * 100) + '%';
}, { passive: true });

// ─── FRONTMATTER PARSER ───────────────────────────────────────────────────────
// Parses simple YAML-style frontmatter (between --- delimiters).
// Handles: strings, arrays like [a, b, c], and numbers.
function parseFrontmatter(raw) {
    if (!raw.trimStart().startsWith('---')) return { meta: {}, body: raw };

    const start = raw.indexOf('---') + 3;
    const end   = raw.indexOf('\n---', start);
    if (end === -1) return { meta: {}, body: raw };

    const block = raw.slice(start, end);
    const body  = raw.slice(end + 4).trim();
    const meta  = {};

    block.split('\n').forEach(line => {
        const colon = line.indexOf(':');
        if (colon === -1) return;
        const key = line.slice(0, colon).trim();
        let val   = line.slice(colon + 1).trim();

        if (val.startsWith('[') && val.endsWith(']')) {
            val = val.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
        } else if (!isNaN(val) && val !== '') {
            val = Number(val);
        }

        meta[key] = val;
    });

    return { meta, body };
}

// ─── READ TIME ────────────────────────────────────────────────────────────────
function calcReadTime(text) {
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
}

// ─── DATE FORMAT ──────────────────────────────────────────────────────────────
function formatDate(dateStr, lang) {
    const locale = lang === 'th' ? 'th-TH' : 'en-US';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, {
        year: 'numeric', month: 'long', day: 'numeric'
    });
}

// ─── STRUCTURED DATA (schema.org/Article) ────────────────────────────────────
function injectStructuredData(meta, url) {
    const schema = {
        '@context':         'https://schema.org',
        '@type':            'Article',
        'headline':          meta.title || document.title,
        'datePublished':     meta.date  || '',
        'author': {
            '@type': 'Person',
            'name':  meta.author || 'RTCN'
        },
        'publisher': {
            '@type': 'Organization',
            'name':  'Roblox Thailand Community & Network',
            'logo': {
                '@type': 'ImageObject',
                'url':   'https://www.robloxthailand.com/RTCN_logo.webp'
            }
        },
        'url': url,
        ...(meta.cover ? { 'image': new URL(meta.cover, window.location.origin).href } : {})
    };

    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.textContent = JSON.stringify(schema);
    document.head.appendChild(el);
}

// ─── RENDER POST ──────────────────────────────────────────────────────────────
function renderPost(meta, html, readTime, allPosts) {
    const root = document.getElementById('post-root');
    if (!root) return;

    // Prev / next post (posts.json is newest-first, so prev = older, next = newer)
    const currentPath = window.location.pathname.replace(/\/?$/, '/');
    const idx  = allPosts.findIndex(p => p.path === currentPath);
    const prev = allPosts[idx + 1] || null; // older
    const next = allPosts[idx - 1] || null; // newer

    const tagPills = (meta.tags || [])
        .map(tag => `<span class="post-header-tag">${tag}</span>`)
        .join('');

    const prevNextHtml = (prev || next) ? `
        <nav class="post-nav" aria-label="Post navigation">
            ${prev ? `
                <a href="${prev.path}" class="post-nav-link prev">
                    <span class="post-nav-label">${t('prev-post')}</span>
                    <span class="post-nav-title">${prev.title}</span>
                </a>` : '<div></div>'}
            ${next ? `
                <a href="${next.path}" class="post-nav-link next">
                    <span class="post-nav-label">${t('next-post')}</span>
                    <span class="post-nav-title">${next.title}</span>
                </a>` : '<div></div>'}
        </nav>` : '';

    const coverHtml = meta.cover
        ? `<img src="${meta.cover}" alt="${meta.title || ''}" class="post-cover" loading="eager" decoding="async">`
        : '';

    root.innerHTML = `
        <div class="post-page container">
            <a href="/blog/" class="post-back" aria-label="${t('back-to-blog')}">${t('back-to-blog')}</a>

            <header class="post-header">
                ${tagPills ? `<div class="post-header-tags" aria-label="Post tags">${tagPills}</div>` : ''}
                <h1 class="post-title">${meta.title || 'Untitled'}</h1>

                <div class="post-byline">
                    <div class="post-byline-text">
                        <span class="post-author-name">${meta.author || 'RTCN'}</span>
                        ${meta.authorRole ? `<span class="post-author-role">${meta.authorRole}</span>` : ''}
                    </div>
                </div>

                <div class="post-meta-row">
                    <time datetime="${meta.date || ''}">${meta.date ? formatDate(meta.date, currentLang) : ''}</time>
                    <span class="sep">·</span>
                    <span>${readTime} ${t('min-read')}</span>
                </div>
            </header>

            ${coverHtml}

            <article class="prose" id="post-content">
                ${html}
            </article>

            ${prevNextHtml}

            <div class="post-contact">
                <p>${t('contact-prompt')}</p>
                <a href="/#connect">${t('contact-cta')} →</a>
            </div>
        </div>
    `;

    // Update the document title from frontmatter (overrides the shell's <title>)
    if (meta.title) {
        document.title = `${meta.title} | RTCN Blog`;
    }

    // Inject Article structured data
    injectStructuredData(meta, window.location.href);

    // Make all external links in prose open in new tab safely
    root.querySelectorAll('.prose a[href^="http"]').forEach(a => {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
    });
}

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────
function showSkeleton() {
    const root = document.getElementById('post-root');
    if (!root) return;
    root.innerHTML = `
        <div class="post-page container">
            <div class="post-loading" aria-busy="true" aria-label="Loading post">
                <div class="skeleton" style="height:14px; width:60px;"></div>
                <div class="skeleton" style="height:12px; width:80px; margin-top:2rem;"></div>
                <div class="skeleton" style="height:40px; width:90%;"></div>
                <div class="skeleton" style="height:40px; width:70%;"></div>
                <div class="skeleton" style="height:12px; width:200px; margin-top:0.5rem;"></div>
                <div class="skeleton" style="height:260px; width:100%; margin-top:2rem; border-radius:12px;"></div>
                <div style="margin-top:2.5rem; display:flex; flex-direction:column; gap:0.6rem;">
                    <div class="skeleton" style="height:14px; width:100%;"></div>
                    <div class="skeleton" style="height:14px; width:95%;"></div>
                    <div class="skeleton" style="height:14px; width:88%;"></div>
                    <div class="skeleton" style="height:14px; width:92%;"></div>
                </div>
            </div>
        </div>
    `;
}

function showError() {
    const root = document.getElementById('post-root');
    if (!root) return;
    root.innerHTML = `
        <div class="post-page container">
            <div class="post-error">
                <p>${t('error-msg')}</p>
                <a href="/blog/">${t('error-link')} →</a>
            </div>
        </div>
    `;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
// Fetch the markdown and the posts registry in parallel for performance.
async function init() {
    const config = window.POST_CONFIG;
    if (!config?.contentPath) {
        showError();
        return;
    }

    showSkeleton();

    try {
        const [mdRes, postsRes] = await Promise.all([
            fetch(config.contentPath),
            fetch('/blog/posts.json')
        ]);

        if (!mdRes.ok) throw new Error('Markdown not found');

        const raw      = await mdRes.text();
        const posts    = postsRes.ok ? (await postsRes.json()).posts : [];
        const { meta, body } = parseFrontmatter(raw);
        const readTime = calcReadTime(body);
        const html     = marked.parse(body);

        renderPost(meta, html, readTime, posts);
    } catch {
        showError();
    }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
applyLanguage(currentLang);
updateThemeLabel();
init();
