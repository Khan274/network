const paymentMethods = {
    easypaisa: {
        name: 'Easypaisa',
        accountName: 'Muhammad Khizar',
        accountNumber: '03355403569',
        accountLabel: 'Mobile Number',
        color: '#00A651',
        logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="#00A651"/>
            <text x="50" y="58" text-anchor="middle" fill="white" font-size="24" font-weight="bold">EP</text>
        </svg>`
    },
    jazzcash: {
        name: 'JazzCash',
        accountName: 'Muhammad Khizar',
        accountNumber: '03355403569',
        accountLabel: 'Mobile Number',
        color: '#E4002B',
        logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="#E4002B"/>
            <text x="50" y="58" text-anchor="middle" fill="white" font-size="24" font-weight="bold">JC</text>
        </svg>`
    },
    bank: {
        name: 'Bank Transfer',
        accountName: 'Your Business Name',
        accountNumber: 'PK00XXXX0000000000000000',
        accountLabel: 'IBAN Number',
        color: '#1E3A8A',
        logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="#1E3A8A"/>
            <path d="M50 25L25 40V45H75V40L50 25Z" fill="white"/>
            <rect x="30" y="48" width="8" height="20" fill="white"/>
            <rect x="46" y="48" width="8" height="20" fill="white"/>
            <rect x="62" y="48" width="8" height="20" fill="white"/>
            <rect x="25" y="70" width="50" height="5" fill="white"/>
        </svg>`
    },
    crypto: {
        name: 'Crypto (USDT)',
        accountName: 'Binance / Bybit TRC20',
        accountNumber: 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        accountLabel: 'Wallet Address (TRC20)',
        color: '#F0B90B',
        logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="#F0B90B"/>
            <path d="M50 30L60 40L50 50L40 40L50 30Z" fill="white"/>
            <path d="M30 50L40 60L30 70L20 60L30 50Z" fill="white"/>
            <path d="M70 50L80 60L70 70L60 60L70 50Z" fill="white"/>
            <path d="M50 50L60 60L50 70L40 60L50 50Z" fill="white"/>
        </svg>`
    }
};

let selectedAmount = 0;
let selectedPackage = null;
let walletBalance = 0;

document.addEventListener('DOMContentLoaded', function() {
    initThemeToggle();
    initCursorGlow();
    initPackageSelection();
    initSidebar();
    simulateLoading();
});

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
    
    function closeSidebar() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

function initCursorGlow() {
    const cursorGlow = document.getElementById('cursorGlow');
    
    document.addEventListener('mousemove', function(e) {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });
}

function initPackageSelection() {
    const packageCards = document.querySelectorAll('.package-card:not(.custom)');
    
    packageCards.forEach(card => {
        card.addEventListener('click', function() {
            packageCards.forEach(c => c.classList.remove('selected'));
            document.querySelector('.package-card.custom')?.classList.remove('selected');
            
            this.classList.add('selected');
            selectedAmount = parseInt(this.dataset.amount);
            selectedPackage = this;
            
            document.getElementById('customAmount').value = '';
        });
    });
}

function simulateLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
    }, 500);
}

function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = start + (end - start) * easeOutQuart;
        
        element.textContent = formatNumber(current.toFixed(2));
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function formatNumber(num) {
    return parseFloat(num).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getStatusIcon(status) {
    const icons = {
        pending: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
        approved: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        rejected: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
    };
    return icons[status] || '';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function openPaymentModal(method) {
    if (selectedAmount < 100) {
        showToast('Please select an amount of at least PKR 400');
        return;
    }
    
    const overlay = document.getElementById('modalOverlay');
    const modal = document.getElementById('paymentModal');
    const paymentData = paymentMethods[method];
    
    document.getElementById('modalLogo').innerHTML = paymentData.logo;
    document.getElementById('modalTitle').textContent = paymentData.name;
    document.getElementById('selectedAmountDisplay').textContent = formatNumber(selectedAmount);
    document.getElementById('accountName').textContent = paymentData.accountName;
    document.getElementById('accountNumber').textContent = paymentData.accountNumber;
    document.getElementById('accountNumberLabel').textContent = paymentData.accountLabel;
    
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        closePaymentModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePaymentModal();
    }
});

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard!');
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

document.getElementById('refreshTransactions').addEventListener('click', function() {
    const btn = this;
    btn.disabled = true;
    btn.querySelector('svg').style.animation = 'spin 1s linear infinite';
    
    setTimeout(() => {
        loadTransactions();
        btn.disabled = false;
        btn.querySelector('svg').style.animation = '';
        showToast('Transactions refreshed!');
    }, 1000);
});

window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.copyToClipboard = copyToClipboard;
