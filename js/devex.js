// DevEx Calculator
// Rates effective September 5, 2025 (18+ rate: June 8, 2026)

const RATE_STANDARD = 0.0038;   // $0.0038 per Robux
const RATE_ADULT    = 0.0054;   // $0.0054 per Robux (18+ US players)
const THB_PER_USD   = 35;       // Minimum reference rate for Thai display

// DOM refs
const amountInput  = document.getElementById('amount-input');
const unitSelect   = document.getElementById('unit-select');
const outputLabel  = document.getElementById('output-label');
const outputValue  = document.getElementById('output-value');
const adultCheck   = document.getElementById('adult-rate-check');
const adultToggle  = document.querySelector('.rate-toggle');
const banner       = document.getElementById('currency-banner');
const xeSelect     = document.getElementById('xe-currency-select');
const xeLink       = document.getElementById('xe-link');
const xeOpenText   = document.getElementById('xe-open-text');
const bannerText   = document.getElementById('banner-text');
const langBtn      = document.getElementById('lang-toggle');
const pageTitle    = document.querySelector('.devex-title');
const pageSubtitle = document.querySelector('.devex-subtitle');
const toggleLabel  = document.querySelector('.toggle-label');
const toggleDesc   = document.querySelector('.toggle-desc');

// Language strings
const strings = {
    en: {
        title:       'DevEx Calculator',
        subtitle:    "A calculator for Roblox's Developer Exchange rates as of June 2026.",
        toggleLabel: '18+ US player rate',
        toggleDesc:  '$0.0054 per Robux — a 42% increase over the standard rate',
        bannerText:  'See this price in your currency',
        xeOpen:      'Open',
        langBtn:     'ภาษาไทย',
        placeholder: '30,000',
    },
    th: {
        title:       'คำนวณ DevEx',
        subtitle:    'เครื่องคำนวณอัตรา Developer Exchange ของ Roblox ณ มิถุนายน 2026',
        toggleLabel: 'อัตราผู้ใช้ 18+ ในสหรัฐฯ',
        toggleDesc:  '$0.0054 ต่อ Robux — เพิ่มขึ้น 42% จากอัตรามาตรฐาน',
        bannerText:  'ดูราคานี้ในสกุลเงินของคุณ',
        xeOpen:      'เปิด',
        langBtn:     'English',
        placeholder: '30,000',
    },
};

// Language state
function detectThai() {
    return (navigator.language || '').toLowerCase().startsWith('th');
}

let currentLang = localStorage.getItem('devex-lang') || (detectThai() ? 'th' : 'en');

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('devex-lang', lang);

    const s = strings[lang];
    pageTitle.textContent          = s.title;
    pageSubtitle.textContent       = s.subtitle;
    toggleLabel.textContent        = s.toggleLabel;
    toggleDesc.textContent         = s.toggleDesc;
    bannerText.textContent         = s.bannerText;
    xeOpenText.textContent         = s.xeOpen;
    langBtn.textContent            = s.langBtn;
    amountInput.placeholder        = s.placeholder;
    document.documentElement.lang  = lang;

    calculate();
}

langBtn.addEventListener('click', () => {
    applyLanguage(currentLang === 'en' ? 'th' : 'en');
});

// Helpers
function formatWithCommas(str) {
    const clean = str.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    parts[0]    = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.slice(0, 2).join(clean.includes('.') ? '.' : '');
}

function parseAmount(str) {
    return parseFloat(str.replace(/,/g, '')) || 0;
}

function getRate() {
    return adultCheck.checked ? RATE_ADULT : RATE_STANDARD;
}

// Disable 18+ toggle when converting USD → Robux
function syncAdultToggle() {
    const isUSD = unitSelect.value === 'usd';
    adultCheck.disabled = isUSD;
    adultToggle.classList.toggle('is-disabled', isUSD);
    if (isUSD) adultCheck.checked = false;
}

// Core calculation
function calculate() {
    const raw    = parseAmount(amountInput.value);
    const unit   = unitSelect.value;
    const rate   = getRate();
    const isThai = currentLang === 'th';

    if (!raw || raw <= 0) {
        outputValue.textContent = '—';
        outputLabel.textContent = isThai ? 'THB' : 'USD';
        banner.hidden = true;
        return;
    }

    if (unit === 'robux') {
        const usd = raw * rate;

        if (isThai) {
            // Convert directly to THB — no XE banner needed since they have their currency
            const thb = usd * THB_PER_USD;
            outputLabel.textContent = 'THB';
            outputValue.textContent = '฿' + thb.toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
            banner.hidden = true;
        } else {
            outputLabel.textContent = 'USD';
            outputValue.textContent = '$' + usd.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
            showBanner(usd);
        }
    } else {
        // USD (or any amount) → Robux
        const robux = Math.round(raw / rate);
        outputLabel.textContent = 'Robux';
        outputValue.textContent = robux.toLocaleString('en-US');
        banner.hidden = true;
    }
}

// Currency banner
function showBanner(usdAmount) {
    banner.hidden = false;
    updateXeLink(usdAmount);
}

function updateXeLink(usdAmount) {
    const to     = xeSelect.value;
    const amount = usdAmount.toFixed(2);
    xeLink.href  = `https://www.xe.com/currencyconverter/convert/?Amount=${amount}&From=USD&To=${to}`;
}

function refreshXeLink() {
    if (banner.hidden) return;
    const usd = parseFloat(outputValue.textContent.replace(/[$,]/g, ''));
    if (!isNaN(usd)) updateXeLink(usd);
}

// URL parameters
// ?amount=100000  →  prefill amount
// ?USrate=true    →  enable 18+ rate (only when unit is Robux)
function applyURLParams() {
    const params = new URLSearchParams(window.location.search);
    const amount = params.get('amount');
    const usRate = params.get('USrate');

    if (amount) {
        const num = parseFloat(amount.replace(/,/g, ''));
        if (!isNaN(num) && num > 0) {
            amountInput.value = formatWithCommas(String(num));
        }
    }

    if (usRate === 'true' && unitSelect.value === 'robux') {
        adultCheck.checked = true;
    }

    if (amount) calculate();
}

// Event listeners
amountInput.addEventListener('input', () => {
    const before    = amountInput.selectionStart;
    const raw       = amountInput.value;
    const formatted = formatWithCommas(raw);
    amountInput.value = formatted;
    const diff = formatted.length - raw.length;
    amountInput.setSelectionRange(Math.max(0, before + diff), Math.max(0, before + diff));
    calculate();
});

amountInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') calculate();
});

unitSelect.addEventListener('change', () => {
    syncAdultToggle();
    calculate();
});

adultCheck.addEventListener('change', calculate);
xeSelect.addEventListener('change', refreshXeLink);

// Init
syncAdultToggle();
applyLanguage(currentLang);
applyURLParams();
