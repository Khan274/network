const SUPABASE_URL = "https://drvasafwzixcbiuuqxfa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydmFzYWZ3eml4Y2JpdXVxeGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjI3MzgsImV4cCI6MjA2ODgzODczOH0.WlHFd8vV31cQG8BUlmQPki3CJK6B4YFRfSYfnkveJQw";

const DEMO_MODE = new URLSearchParams(window.location.search).get('demo') === 'true';

let supabaseClient = null;
if (typeof supabase !== 'undefined' && supabase.createClient) {
    const { createClient } = supabase;
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarClose = document.getElementById('sidebarClose');

    function openSidebar() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', openSidebar);
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }

    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
}

function initDropdowns() {
    const profileDropdown = document.getElementById('profileDropdown');
    const profileBtn = document.getElementById('profileBtn');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });
    }
}

function initCursorGlow() {
    const cursorGlow = document.querySelector('.cursor-glow');
    if (!cursorGlow) return;

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateGlow() {
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
        requestAnimationFrame(animateGlow);
    }

    animateGlow();
}

function animateCounter(element, target, duration = 1500) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeProgress);
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function initScrollAnimations() {
    const elements = document.querySelectorAll('[data-aos]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, parseInt(entry.target.dataset.aosDelay) || 0);
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
}

function drawEarningsChart(directEarnings, indirectEarnings) {
    const canvas = document.getElementById('earningsChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    const width = rect.width;
    const height = rect.height;
    const padding = 40;
    const barWidth = 60;
    const gap = 40;

    const maxValue = Math.max(directEarnings, indirectEarnings, 100);
    const scale = (height - padding * 2) / maxValue;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-tertiary');
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding + (height - padding * 2) * (i / 4);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }

    const centerX = width / 2;
    const bar1X = centerX - barWidth - gap / 2;
    const bar2X = centerX + gap / 2;

    const gradient1 = ctx.createLinearGradient(0, height - padding, 0, height - padding - directEarnings * scale);
    gradient1.addColorStop(0, '#007AFF');
    gradient1.addColorStop(1, '#5AC8FA');

    ctx.fillStyle = gradient1;
    ctx.beginPath();
    ctx.roundRect(bar1X, height - padding - directEarnings * scale, barWidth, directEarnings * scale, [8, 8, 0, 0]);
    ctx.fill();

    const gradient2 = ctx.createLinearGradient(0, height - padding, 0, height - padding - indirectEarnings * scale);
    gradient2.addColorStop(0, '#5856D6');
    gradient2.addColorStop(1, '#AF52DE');

    ctx.fillStyle = gradient2;
    ctx.beginPath();
    ctx.roundRect(bar2X, height - padding - indirectEarnings * scale, barWidth, indirectEarnings * scale, [8, 8, 0, 0]);
    ctx.fill();

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Direct', bar1X + barWidth / 2, height - 10);
    ctx.fillText('Team', bar2X + barWidth / 2, height - 10);
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

async function handleLogout() {
    if (DEMO_MODE) {
        window.location.href = 'sign-in.html';
        return;
    }
    try {
        if (supabaseClient) {
            await supabaseClient.auth.signOut();
        }
        window.location.href = 'sign-in.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function loadDemoData() {
    const demoData = {
        userPlan: "Growth Plan",
        walletBalance: 1250,
        totalEarnings: 3400,
        directCount: 8,
        indirectCount: 12,
        directEarnings: 2400,
        indirectEarnings: 1000
    };

    hideLoading();

    document.getElementById("plan-name").textContent = demoData.userPlan;
    document.getElementById("sidebar-plan").textContent = demoData.userPlan;

    const totalInvitesEl = document.getElementById("total-invites");
    if (totalInvitesEl) {
        animateCounter(totalInvitesEl, demoData.directCount + demoData.indirectCount);
    }

    const walletBalanceEl = document.getElementById("wallet-balance");
    if (walletBalanceEl) {
        const amountSpan = walletBalanceEl.querySelector('.amount');
        if (amountSpan) {
            animateCounter(amountSpan, demoData.walletBalance);
        }
    }

    const totalEarningsEl = document.getElementById("total-earnings");
    if (totalEarningsEl) {
        const amountSpan = totalEarningsEl.querySelector('.amount');
        if (amountSpan) {
            animateCounter(amountSpan, demoData.totalEarnings);
        }
    }

    const directElem = document.getElementById("direct-invites");
    if (directElem) directElem.textContent = `Direct: ${demoData.directCount}`;

    const indirectElem = document.getElementById("indirect-invites");
    if (indirectElem) indirectElem.textContent = `Team: ${demoData.indirectCount}`;

    const directEarningsValueEl = document.getElementById("direct-earnings-value");
    if (directEarningsValueEl) {
        directEarningsValueEl.textContent = `PKR ${demoData.directEarnings.toLocaleString()}`;
    }

    const indirectEarningsValueEl = document.getElementById("indirect-earnings-value");
    if (indirectEarningsValueEl) {
        indirectEarningsValueEl.textContent = `PKR ${demoData.indirectEarnings.toLocaleString()}`;
    }

    setTimeout(() => {
        drawEarningsChart(demoData.directEarnings, demoData.indirectEarnings);
    }, 500);

    window.addEventListener('resize', () => {
        drawEarningsChart(demoData.directEarnings, demoData.indirectEarnings);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    initTheme();
    initSidebar();
    initDropdowns();
    initCursorGlow();
    initScrollAnimations();

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    if (DEMO_MODE) {
        loadDemoData();
        return;
    }

    if (!supabaseClient) {
        console.error("Supabase client not initialized");
        loadDemoData();
        return;
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
        alert("Not logged in.");
        window.location.href = "sign-in.html";
        return;
    }

    const userId = user.id;

    const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("plan_name, referral_code, wallet_balance, total_earnings")
        //.eq("id", userId)
        .single();

    if (profileError || !profile) {
        console.error("Failed to load profile:", profileError);
        hideLoading();
        return;
    }

    const userPlan = profile.plan_name;
    const referralCode = profile.referral_code;

    const plans = {
        "Starter Plan": { price: 400, direct: 8, indirect: 1 },
        "Growth Plan": { price: 560, direct: 10, indirect: 2 },
        "Elite Plan": { price: 750, direct: 15, indirect: 4 },
    };

    const selectedPlan = plans[userPlan];
    if (!selectedPlan || !referralCode) {
        console.warn("Plan or referral code missing.");
        document.getElementById("plan-name").textContent = userPlan || "Not Set";
        document.getElementById("sidebar-plan").textContent = userPlan || "Not Set";
        hideLoading();
        return;
    }

    let directEarnings = 0;
    let indirectEarnings = 0;
    let directCount = 0;
    let indirectCount = 0;

    const { data: directReferrals, error: directError } = await supabaseClient
        .from("profiles")
        .select("id, referral_code, plan_name")
        .eq("referral_code_used", referralCode)
        .not("plan_name", "is", null);

    if (directError) {
        console.error("Failed to load direct referrals:", directError);
        hideLoading();
        return;
    }

    directCount = directReferrals.length;

    for (const direct of directReferrals) {
        const referredPlan = plans[direct.plan_name];
        if (referredPlan) {
            const earning = (referredPlan.price * selectedPlan.direct) / 100;
            directEarnings += earning;
        }
    }

    for (const direct of directReferrals) {
        const { data: indirects, error: indirectError } = await supabaseClient
            .from("profiles")
            .select("plan_name")
            .eq("referral_code_used", direct.referral_code)
            .not("plan_name", "is", null);

        if (indirectError) continue;

        for (const indirect of indirects) {
            const indirectPlan = plans[indirect.plan_name];
            if (indirectPlan) {
                const earning = (indirectPlan.price * selectedPlan.indirect) / 100;
                indirectEarnings += earning;
            }
        }

        indirectCount += indirects.length;
    }

    const totalEarnings = directEarnings + indirectEarnings;

    await supabaseClient
        .from("profiles")
        .update({ total_earnings: totalEarnings })
        .eq("id", userId);

    hideLoading();

    document.getElementById("plan-name").textContent = userPlan || "Not Set";
    document.getElementById("sidebar-plan").textContent = userPlan || "Not Set";

    const totalInvitesEl = document.getElementById("total-invites");
    if (totalInvitesEl) {
        animateCounter(totalInvitesEl, directCount + indirectCount);
    }

    const walletBalanceEl = document.getElementById("wallet-balance");
    if (walletBalanceEl) {
        const amountSpan = walletBalanceEl.querySelector('.amount');
        if (amountSpan) {
            animateCounter(amountSpan, profile.wallet_balance);
        } else {
            walletBalanceEl.textContent = `PKR ${profile.wallet_balance.toLocaleString()}`;
        }
    }

    const totalEarningsEl = document.getElementById("total-earnings");
    if (totalEarningsEl) {
        const amountSpan = totalEarningsEl.querySelector('.amount');
        if (amountSpan) {
            animateCounter(amountSpan, totalEarnings);
        } else {
            totalEarningsEl.textContent = `PKR ${totalEarnings.toLocaleString()}`;
        }
    }

    const directElem = document.getElementById("direct-invites");
    if (directElem) directElem.textContent = `Direct: ${directCount}`;

    const indirectElem = document.getElementById("indirect-invites");
    if (indirectElem) indirectElem.textContent = `Team: ${indirectCount}`;

    const directEarningsValueEl = document.getElementById("direct-earnings-value");
    if (directEarningsValueEl) {
        directEarningsValueEl.textContent = `PKR ${directEarnings.toLocaleString()}`;
    }

    const indirectEarningsValueEl = document.getElementById("indirect-earnings-value");
    if (indirectEarningsValueEl) {
        indirectEarningsValueEl.textContent = `PKR ${indirectEarnings.toLocaleString()}`;
    }

    setTimeout(() => {
        drawEarningsChart(directEarnings, indirectEarnings);
    }, 500);

    window.addEventListener('resize', () => {
        drawEarningsChart(directEarnings, indirectEarnings);
    });
});
