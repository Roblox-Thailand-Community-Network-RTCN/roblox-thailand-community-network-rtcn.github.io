// DevEx Calculator
// Rates effective September 5, 2025

const RATE_STANDARD = 0.0038;  // $0.0038 per Robux
const RATE_ADULT    = 0.0054;  // $0.0054 per Robux (18+ US players)

const amountInput = document.getElementById('amount-input');
const unitSelect  = document.getElementById('unit-select');
const convertBtn  = document.getElementById('convert-btn');
const outputLabel = document.getElementById('output-label');
const outputValue = document.getElementById('output-value');
const adultCheck  = document.getElementById('adult-rate-check');
const banner      = document.getElementById('currency-banner');
const xeSelect    = document.getElementById('xe-currency-select');
const xeLink      = document.getElementById('xe-link');

// ---- Helpers ----

// Strip non-numeric characters (except decimal) and add thousands commas
function formatWithCommas(str) {
    const clean = str.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.slice(0, 2).join(clean.includes('.') ? '.' : '');
}

function parseAmount(str) {
    return parseFloat(str.replace(/,/g, '')) || 0;
}

function getRate() {
    return adultCheck.checked ? RATE_ADULT : RATE_STANDARD;
}

// ---- Core calculation ----

function calculate() {
    const raw  = parseAmount(amountInput.value);
    const unit = unitSelect.value;
    const rate = getRate();

    if (!raw || raw <= 0) {
        outputValue.textContent = '—';
        banner.hidden = true;
        return;
    }

    if (unit === 'robux') {
        const usd = raw * rate;
        outputLabel.textContent = 'USD';
        outputValue.textContent = '$' + usd.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        showBanner(usd);
    } else {
        const robux = Math.round(raw / rate);
        outputLabel.textContent = 'Robux';
        outputValue.textContent = robux.toLocaleString('en-US');
        banner.hidden = true;
    }
}

// ---- Currency banner ----

function showBanner(usdAmount) {
    banner.hidden = false;
    updateXeLink(usdAmount);
}

function updateXeLink(usdAmount) {
    const to     = xeSelect.value;
    const amount = usdAmount.toFixed(2);
    xeLink.href  = `https://www.xe.com/currencyconverter/convert/?Amount=${amount}&From=USD&To=${to}`;
}

// Pull the current USD amount from the output and refresh the xe link
function refreshXeLink() {
    const text = outputValue.textContent;
    if (banner.hidden || text === '—') return;
    const usd = parseFloat(text.replace(/[$,]/g, ''));
    if (!isNaN(usd)) updateXeLink(usd);
}

// ---- Event listeners ----

amountInput.addEventListener('input', () => {
    const before    = amountInput.selectionStart;
    const raw       = amountInput.value;
    const formatted = formatWithCommas(raw);
    amountInput.value = formatted;
    // Keep the caret in a sensible spot after commas are inserted/removed
    const diff = formatted.length - raw.length;
    const next = Math.max(0, before + diff);
    amountInput.setSelectionRange(next, next);
    calculate();
});

amountInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') calculate();
});

unitSelect.addEventListener('change', () => {
    outputLabel.textContent = unitSelect.value === 'robux' ? 'USD' : 'Robux';
    if (unitSelect.value === 'usd') banner.hidden = true;
    calculate();
});

// convertBtn.addEventListener('click', calculate);

adultCheck.addEventListener('change', calculate);

xeSelect.addEventListener('change', refreshXeLink);
