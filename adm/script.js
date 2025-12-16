/**
 * U-Network Admin Dashboard
 * FINAL PRODUCTION SCRIPT
 * Supabase Auth + Real Data + Real Charts + Live Updates
 */
/* ================= SAFE UI FALLBACKS ================= */
window.initTheme = window.initTheme || function () {};

window.toggleTheme = window.toggleTheme || function () {};

window.initSidebar = function () {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarClose = document.getElementById('sidebarClose');

    if (!menuToggle || !sidebar || !sidebarOverlay) return;

    // Open sidebar when clicking hamburger menu
    menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
        sidebarOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    // Close sidebar when clicking X button
    if (sidebarClose) {
        sidebarClose.addEventListener('click', function(e) {
            e.preventDefault();
            closeSidebar();
        });
    }

    // Close sidebar when clicking overlay (outside sidebar)
    sidebarOverlay.addEventListener('click', function(e) {
        e.preventDefault();
        closeSidebar();
    });

    function closeSidebar() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            sidebarOverlay.style.display = 'none';
        }, 300);
    }
};

window.initCursorGlow = window.initCursorGlow || function () {};

window.hideLoading = window.hideLoading || function () {
    const overlay = document.getElementById("loadingOverlay");
    if (!overlay) return;

    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";

    setTimeout(() => {
        overlay.style.display = "none";
    }, 200);
};

window.animateCounter = window.animateCounter || function (el, value) {
    if (!el) return;
    el.textContent = value;
};

/* ================= BASIC LINE CHART (FALLBACK) ================= */
window.drawLineChart = window.drawLineChart || function (canvas, labels, data, color) {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);

    if (!data.length) return;

    const padding = 30;
    const max = Math.max(...data, 1);
    const stepX = (w - padding * 2) / (data.length - 1 || 1);

    ctx.strokeStyle = color || "#4f46e5";
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((val, i) => {
        const x = padding + i * stepX;
        const y = h - padding - (val / max) * (h - padding * 2);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padding, 0, h);
    gradient.addColorStop(0, color + "33");
    gradient.addColorStop(1, color + "00");

    ctx.lineTo(w - padding, h - padding);
    ctx.lineTo(padding, h - padding);
    ctx.closePath();

    ctx.fillStyle = gradient;
    ctx.fill();

    // Points
    ctx.fillStyle = color;
    data.forEach((val, i) => {
        const x = padding + i * stepX;
        const y = h - padding - (val / max) * (h - padding * 2);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
};

/* =========================================================
   ADMIN ACCESS CONTROL
========================================================= */

const ALLOWED_ADMINS = [
    "admin@unetwork.com",
    "partner1@example.com",
    "partner2@example.com"
];

/* =========================================================
   SUPABASE CONFIG
========================================================= */
const SUPABASE_URL = "https://drvasafwzixcbiuuqxfa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydmFzYWZ3eml4Y2JpdXVxeGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjI3MzgsImV4cCI6MjA2ODgzODczOH0.WlHFd8vV31cQG8BUlmQPki3CJK6B4YFRfSYfnkveJQw";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* =========================================================
   PLAN PRICES
========================================================= */
const PLAN_PRICES = {
    "Starter Plan": 400,
    "Growth Plan": 560,
    "Elite Plan": 750
};

/* =========================================================
   USERS PAGE STATE
========================================================= */

let currentUsers = [];
let currentPage = 1;
let usersPerPage = 10;


/* =========================================================
   AUTH (REAL)
========================================================= */
async function handleLogin(e) {
    e.preventDefault();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorMessage = document.getElementById("errorMessage");

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    errorMessage.textContent = "";

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        errorMessage.textContent = "Invalid login credentials";
        return;
    }

    const userEmail = data.user.email.toLowerCase();

    // 🔐 ADMIN CHECK
    if (!ALLOWED_ADMINS.includes(userEmail)) {
        await supabaseClient.auth.signOut();
        errorMessage.textContent = "Access denied";
        return;
    }

    // ✅ Allowed admin → proceed
    window.location.href = "index.html";
}


async function checkAuth() {
    const { data: { session } } =
        await supabaseClient.auth.getSession();

    if (!session) {
        window.location.href = "login.html";
        return false;
    }

    const email = session.user.email.toLowerCase();

    if (!ALLOWED_ADMINS.includes(email)) {
        await supabaseClient.auth.signOut();
        window.location.href = "login.html";
        return false;
    }

    return true;
}

async function handleLogout() {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
}

/* =========================================================
   DASHBOARD INIT
========================================================= */
async function initDashboard() {
    if (!(await checkAuth())) return;

    initTheme();
    initSidebar();
    initCursorGlow();

    themeToggle?.addEventListener("click", toggleTheme);
    logoutBtn?.addEventListener("click", handleLogout);

    await loadDashboardData();
    await drawAllCharts();
    setupRealtime();

    hideLoading();
}

/* =========================================================
   SETTINGS PAGE INIT
========================================================= */
function initSettingsPage() {
    initTheme();
    initSidebar();
    initCursorGlow();

    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('settingsLogoutBtn')?.addEventListener('click', handleLogout);

    showLoading();
    loadSettingsData();
}


async function loadSettingsData() {
    try {
        // 1. Get logged-in user
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            console.error("Auth error:", authError);
            return;
        }

        // 2. Fetch profile using user.id
        const { data: profile, error } = await supabaseClient
            .from('adms')
            .select('name, email, phone')
            .eq('email', user.email)
            .single();

        if (error) {
            console.error("Profile fetch error:", error);
            return;
        }

        // 3. Update UI
        document.getElementById('adminName').textContent =
            profile.name || '—';

        document.getElementById('adminEmail').textContent =
            profile.email || user.email;

        document.getElementById('adminPhone').textContent =
            profile.phone || '—';

    } catch (err) {
        console.error("Settings load failed:", err);
    } finally {
        hideLoading();
    }
}

function showLoading() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.remove("hidden");
}

function hideLoading() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.add("hidden");
}

/* =========================================================
   KPI DATA (REAL)
========================================================= */
async function loadDashboardData() {
    const { data, error } = await supabaseClient
        .from("profiles")
        .select("plan_name, created_at");

    if (error) return console.error(error);

    const totalUsers = data.length;
    const paid = data.filter(u => u.plan_name);

    const starter = paid.filter(u => u.plan_name === "Starter Plan").length;
    const growth  = paid.filter(u => u.plan_name === "Growth Plan").length;
    const elite   = paid.filter(u => u.plan_name === "Elite Plan").length;

    const allTimeProfit =
        starter * 400 + growth * 560 + elite * 750;

    const now = new Date();
    const monthlyProfit = paid
        .filter(u => {
            const d = new Date(u.created_at);
            return d.getMonth() === now.getMonth() &&
                   d.getFullYear() === now.getFullYear();
        })
        .reduce((sum, u) => sum + PLAN_PRICES[u.plan_name], 0);

    animateCounter(document.getElementById("totalUsers"), totalUsers);
    animateCounter(document.getElementById("usersWithPackages"), paid.length);
    animateCounter(document.getElementById("starterCount"), starter);
    animateCounter(document.getElementById("growthCount"), growth);
    animateCounter(document.getElementById("eliteCount"), elite);
    animateCounter(document.getElementById("allTimeProfit"), allTimeProfit);
    animateCounter(document.getElementById("monthlyProfit"), monthlyProfit);
}

/* =========================================================
   CHART DATA HELPERS
========================================================= */
async function fetchProfiles() {
    const { data } = await supabaseClient
        .from("profiles")
        .select("plan_name, created_at");
    return data || [];
}

function groupByDay(profiles, days) {
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        map[key] = { users: 0, revenue: 0 };
    }

    profiles.forEach(p => {
        const key = p.created_at.slice(0, 10);
        if (map[key]) {
            map[key].users++;
            if (p.plan_name) {
                map[key].revenue += PLAN_PRICES[p.plan_name];
            }
        }
    });

    return map;
}

/* =========================================================
   USERS PAGE INIT (REAL)
========================================================= */
async function initUsersPage() {
    if (!(await checkAuth())) return;

    initTheme();
    initSidebar();
    initCursorGlow();

    themeToggle?.addEventListener("click", toggleTheme);
    logoutBtn?.addEventListener("click", handleLogout);

    await loadUsers();
    hideLoading();
}

/* =========================================================
   REAL CHARTS
========================================================= */
async function drawUserGrowthChart(days) {
    const grouped = groupByDay(await fetchProfiles(), days);
    drawLineChart(
        document.getElementById("userGrowthChart"),
        Object.keys(grouped),
        Object.values(grouped).map(v => v.users),
        "#007AFF"
    );
}

async function drawRevenueChart(days) {
    const grouped = groupByDay(await fetchProfiles(), days);
    drawLineChart(
        document.getElementById("revenueChart"),
        Object.keys(grouped),
        Object.values(grouped).map(v => v.revenue),
        "#5856D6"
    );
}

async function drawActiveUsersChart(days) {
    const grouped = groupByDay(await fetchProfiles(), days);
    drawLineChart(
        document.getElementById("activeUsersChart"),
        Object.keys(grouped),
        Object.values(grouped).map(v => Math.max(1, v.users)),
        "#00C7BE"
    );
}

async function drawAllCharts() {
    await drawUserGrowthChart(userGrowthRange.value);
    await drawRevenueChart(revenueRange.value);
    await drawActiveUsersChart(activeUsersRange.value);
}

/* =========================================================
   LIVE UPDATES (SUPABASE REALTIME)
========================================================= */
function setupRealtime() {
    supabaseClient
        .channel("profiles-live")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "profiles" },
            async () => {
                await loadDashboardData();
                await drawAllCharts();
                if (document.getElementById("usersTableBody")) loadUsers();
            }
        )
        .subscribe();
}

/* =========================================================
   USERS PAGE (REAL)
========================================================= */
async function loadUsers() {
    const { data, error } = await supabaseClient
        .from("profiles")
        .select("id, name, email, plan_name, created_at")
        .order("created_at", { ascending: false });

    if (error) return console.error(error);

    currentUsers = data;
    currentPage = 1;
    renderUsersTable();
}

/* =========================================================
   USERS TABLE RENDERING (REAL)
========================================================= */

function renderUsersTable() {
    const tbody = document.getElementById("usersTableBody");
    const noUsersMessage = document.getElementById("noUsersMessage");
    const usersCount = document.getElementById("usersCount");

    if (!tbody) return;

    if (usersCount) {
        usersCount.textContent = currentUsers.length;
    }

    if (currentUsers.length === 0) {
        tbody.innerHTML = "";
        if (noUsersMessage) noUsersMessage.style.display = "block";
        return;
    }

    if (noUsersMessage) noUsersMessage.style.display = "none";

    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const pageUsers = currentUsers.slice(startIndex, endIndex);

    tbody.innerHTML = pageUsers.map((user, index) => {
        const date = new Date(user.created_at);
        const dateStr = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });

        const timeStr = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });

        const planClass = user.plan_name
            ? user.plan_name.toLowerCase().replace(" plan", "")
            : "none";

        const planText = user.plan_name || "No Plan";

        return `
            <tr>
                <td>${startIndex + index + 1}</td>
                <td>${user.name || "-"}</td>
                <td>${user.email}</td>
                <td>
                    <span class="plan-badge ${planClass}">
                        ${planText}
                    </span>
                </td>
                <td>${dateStr}</td>
                <td>${timeStr}</td>
            </tr>
        `;
    }).join("");

    renderPagination();
}

/* =========================================================
   USERS PAGINATION
========================================================= */

function renderPagination() {
    const container = document.getElementById("pagination");
    if (!container) return;

    const totalPages = Math.ceil(currentUsers.length / usersPerPage);
    container.innerHTML = "";

    if (totalPages <= 1) return;

    const createBtn = (label, page, disabled = false, active = false) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.className = "pagination-btn";

        if (active) btn.classList.add("active");
        if (disabled) btn.disabled = true;

        btn.addEventListener("click", () => {
            currentPage = page;
            renderUsersTable();
        });

        return btn;
    };

    container.appendChild(
        createBtn("‹", Math.max(1, currentPage - 1), currentPage === 1)
    );

    for (let i = 1; i <= totalPages; i++) {
        container.appendChild(
            createBtn(i, i, false, i === currentPage)
        );
    }

    container.appendChild(
        createBtn("›", Math.min(totalPages, currentPage + 1), currentPage === totalPages)
    );
}